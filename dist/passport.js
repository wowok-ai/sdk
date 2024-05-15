import { Inputs } from '@mysten/sui.js/transactions';
import { Protocol, ContextType, OperatorType, ValueType } from './protocol';
import { parse_object_type, array_unique, Bcs, ulebDecode, IsValidAddress, IsValidArray } from './utils';
import { BCS } from '@mysten/bcs';
import { ERROR, Errors } from './exception';
export class GuardParser {
    guard_list = [];
    protocol;
    constructor(protocol) { this.protocol = protocol; }
    guardlist = () => { return this.guard_list; };
    static CreateAsync = async (protocol, guards) => {
        if (!IsValidArray(guards, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'guards');
        }
        let guard_list = array_unique(guards);
        const me = new GuardParser(protocol);
        let res = await protocol.Query_Raw(guards);
        res.forEach((r) => {
            let c = r.data?.content;
            if (!c)
                return;
            let index = protocol.WOWOK_OBJECTS_TYPE().findIndex(v => v.includes('guard::Guard') && v == c.type);
            if (index == -1)
                return;
            let info = { id: c.fields.id.id, query_list: [], variable_or_future_list: [] };
            me.parse_future(info, c.fields.variables);
            if (c.fields.input.type == (protocol.Package() + '::bcs::BCS')) {
                me.parse_bcs(info, Uint8Array.from(c.fields.input.fields.bytes));
            }
            me.guard_list.push(info);
        });
        return me;
    };
    parse_future = (info, variables) => {
        variables.forEach((v) => {
            if (v.type == (this.protocol.Package() + '::guard::Variable')) {
                if (v.fields.type == OperatorType.TYPE_FUTURE_QUERY || v.fields.type == ContextType.TYPE_CONTEXT_FUTURE_ID) {
                    info.variable_or_future_list.push({ identifier: v.fields.identifier, type: v.fields.type,
                        value_or_witness: '0x' + Bcs.getInstance().de(BCS.ADDRESS, Uint8Array.from(v.fields.value)) });
                }
            }
        });
    };
    parse_bcs = (info, chain_bytes) => {
        var arr = [].slice.call(chain_bytes.reverse());
        while (arr.length > 0) {
            var type = arr.shift();
            // console.log(type);
            switch (type) {
                case ContextType.TYPE_CONTEXT_SIGNER:
                case ContextType.TYPE_CONTEXT_CLOCK:
                case OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER:
                case OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER_EQUAL:
                case OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER:
                case OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER_EQUAL:
                case OperatorType.TYPE_LOGIC_OPERATOR_U128_EQUAL:
                case OperatorType.TYPE_LOGIC_OPERATOR_EQUAL:
                case OperatorType.TYPE_LOGIC_OPERATOR_HAS_SUBSTRING:
                case OperatorType.TYPE_LOGIC_ALWAYS_TRUE:
                case OperatorType.TYPE_LOGIC_NOT:
                case OperatorType.TYPE_LOGIC_AND:
                case OperatorType.TYPE_LOGIC_OR:
                    break;
                case ContextType.TYPE_CONTEXT_FUTURE_ID:
                case OperatorType.TYPE_FUTURE_QUERY:
                    var identifer = arr.splice(0, 1);
                    let i = info.variable_or_future_list.find(f => f.identifier == identifer[0]);
                    if (!i) {
                        ERROR(Errors.Fail, 'futrue_list not found');
                    }
                    if (type == OperatorType.TYPE_FUTURE_QUERY) {
                        info.query_list.push({ identifier: identifer[0], type: type, witness: i.value_or_witness }); // query list item
                        arr.splice(0, 1); // cmd
                    }
                    break;
                case ContextType.TYPE_CONTEXT_address:
                case ContextType.TYPE_CONTEXT_bool:
                case ContextType.TYPE_CONTEXT_u8:
                case ContextType.TYPE_CONTEXT_u64:
                case ContextType.TYPE_CONTEXT_vec_u8:
                case ValueType.TYPE_STATIC_bool:
                case ValueType.TYPE_STATIC_u8:
                    arr.splice(0, 1); // identifier
                    break;
                case OperatorType.TYPE_QUERY_FROM_CONTEXT:
                    arr.splice(0, 2); // identifer + cmd
                    break;
                case ValueType.TYPE_STATIC_address:
                    arr.splice(0, 32);
                    break;
                case ValueType.TYPE_STATIC_u64:
                    arr.splice(0, 8);
                    break;
                case ValueType.TYPE_STATIC_u128:
                    arr.splice(0, 16);
                    break;
                case ValueType.TYPE_STATIC_vec_u8:
                    let { value, length } = ulebDecode(Uint8Array.from(arr));
                    arr.splice(0, value + length);
                    break;
                case OperatorType.TYPE_QUERY:
                    info.query_list.push('0x' + Bcs.getInstance().de(BCS.ADDRESS, Uint8Array.from(arr)).toString());
                    arr.splice(0, 33); // address + cmd
                    break;
                default:
                    ERROR(Errors.Fail, 'parse_bcs types');
            }
        }
    };
    done = async (fill) => {
        let objects = [];
        this.guard_list.forEach((g) => {
            g.variable_or_future_list.forEach((f) => {
                let r = fill?.find(i => i.identifier == f.identifier && g.id == i.guard);
                if (!r && !f.futrue) {
                    ERROR(Errors.InvalidParam, 'fill');
                }
                if (r)
                    f.futrue = r.future;
                objects.push(f.futrue);
            });
            g.query_list = g.query_list.map((q) => {
                if (typeof (q) === "string") {
                    objects.push(q);
                    return q;
                }
                else {
                    let r = g.variable_or_future_list.find(f => f.identifier == q.identifier && f.type == q.type && f.value_or_witness == q.witness);
                    if (!r || !r.futrue) {
                        ERROR(Errors.Fail, 'query witness not match');
                    }
                    objects.push(r.futrue);
                    return r.futrue;
                }
            });
        });
        // objects info
        let res = await this.protocol.Query_Raw(array_unique(objects), { showType: true });
        let query = [];
        let witness = [];
        this.guard_list.forEach(g => {
            g.query_list.forEach(q => {
                let r = res.find(r => r.data?.objectId == q);
                if (!r) {
                    ERROR(Errors.Fail, 'query object not match');
                }
                let object = this.object_query(r.data);
                if (!object) {
                    ERROR(Errors.Fail, 'object fail');
                }
                query.push(object);
            });
            g.variable_or_future_list.forEach(f => {
                let r = res.find(r => r.data?.objectId == f.futrue);
                if (!r) {
                    ERROR(Errors.Fail, 'query future not match');
                }
                let object = this.object_query(r.data, 'witness');
                witness.push(object);
            });
        });
        return { query: query, witness: witness };
    };
    object_query = (data, method = 'guard_query') => {
        for (let k = 0; k < this.protocol.WOWOK_OBJECTS_TYPE().length; k++) {
            if (data.type.includes(this.protocol.WOWOK_OBJECTS_TYPE()[k])) { // type: pack::m::Object<...>
                return { target: this.protocol.WOWOK_OBJECTS_PREFIX_TYPE()[k] + method,
                    object: Inputs.SharedObjectRef({
                        objectId: data.objectId,
                        mutable: false,
                        initialSharedVersion: data.version,
                    }),
                    types: parse_object_type(data.type),
                    id: data.objectId, };
            }
        }
    };
}
export class Passport {
    static MAX_GUARD_COUNT = 8;
    passport;
    protocol;
    get_object() { return this.passport; }
    // return passport object used
    constructor(protocol, guards, query) {
        if (!guards || guards.length > Passport.MAX_GUARD_COUNT) {
            ERROR(Errors.InvalidParam, 'guards');
        }
        if (!Protocol.IsValidObjects(guards)) {
            ERROR(Errors.IsValidObjects, 'guards');
        }
        this.protocol = protocol;
        let txb = protocol.CurrentSession();
        this.passport = txb.moveCall({
            target: protocol.PassportFn('new'),
            arguments: []
        });
        // add others guards, if any
        guards.forEach((guard) => {
            txb.moveCall({
                target: protocol.PassportFn('guard_add'),
                arguments: [this.passport, Protocol.TXB_OBJECT(txb, guard)]
            });
        });
        // witness
        query?.witness.forEach((w) => {
            txb.moveCall({
                target: w.target,
                arguments: [this.passport, txb.object(w.object)],
                typeArguments: w.types,
            });
        });
        // rules: 'verify' & 'query' in turns；'verify' at final end.
        query?.query.forEach((q) => {
            let [type, address] = txb.moveCall({
                target: protocol.PassportFn('passport_verify'),
                arguments: [this.passport, txb.object(Protocol.CLOCK_OBJECT)]
            });
            txb.moveCall({
                target: q.target,
                arguments: [txb.object(q.object), this.passport, type, address],
                typeArguments: q.types,
            });
        });
        txb.moveCall({
            target: protocol.PassportFn('passport_verify'),
            arguments: [this.passport, txb.object(Protocol.CLOCK_OBJECT)]
        });
    }
    destroy() {
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.PassportFn('destroy'),
            arguments: [this.passport]
        });
    }
    freeze() {
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.PassportFn('freezen'),
            arguments: [this.passport]
        });
    }
}
