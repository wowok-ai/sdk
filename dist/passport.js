import { Inputs } from '@mysten/sui.js/transactions';
import { Protocol, ContextType, OperatorType, ValueType } from './protocol';
import { parse_object_type, array_unique, Bcs, ulebDecode, IsValidAddress, IsValidArray } from './utils';
import { BCS } from '@mysten/bcs';
import { ERROR, Errors } from './exception';
export class GuardParser {
    guard_list = [];
    protocol;
    guards;
    index = 0;
    get_index() { return this.index++; }
    constructor(protocol, guards) {
        this.protocol = protocol;
        this.guards = guards.map(g => protocol.CurrentSession().object(g));
    }
    guardlist = () => { return this.guard_list; };
    static CreateAsync = async (protocol, guards) => {
        if (!IsValidArray(guards, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'guards');
        }
        let guard_list = array_unique(guards);
        const me = new GuardParser(protocol, guards);
        let res = await protocol.Query_Raw(guard_list);
        res.forEach((r) => {
            let c = r.data?.content;
            if (!c)
                return;
            let index = protocol.WOWOK_OBJECTS_TYPE().findIndex(v => { return v.includes('guard::Guard') && v == c.type; });
            if (index == -1)
                return;
            let info = { id: c.fields.id.id, query_list: [], variable: [], input_witness: [] };
            me.parse_variable(info, c.fields.variables);
            if (c.fields.input.type == (protocol.Package() + '::bcs::BCS')) {
                me.parse_bcs(info, Uint8Array.from(c.fields.input.fields.bytes));
            }
            me.guard_list.push(info);
        });
        return me;
    };
    parse_variable = (info, variables) => {
        variables.forEach((v) => {
            if (v.type == (this.protocol.Package() + '::guard::Variable')) {
                // ValueType.TYPE_ADDRESS: Query_Cmd maybe used the address, so save it for using
                if (v.fields.type == ContextType.TYPE_WITNESS_ID || v.fields.type == ValueType.TYPE_ADDRESS) {
                    info.variable.push({ identifier: v.fields.identifier, index: this.get_index(), type: v.fields.type,
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
                case ContextType.TYPE_SIGNER:
                case ContextType.TYPE_CLOCK:
                case OperatorType.TYPE_LOGIC_AS_U256_GREATER:
                case OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL:
                case OperatorType.TYPE_LOGIC_AS_U256_LESSER:
                case OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL:
                case OperatorType.TYPE_LOGIC_AS_U256_EQUAL:
                case OperatorType.TYPE_LOGIC_EQUAL:
                case OperatorType.TYPE_LOGIC_HAS_SUBSTRING:
                case OperatorType.TYPE_LOGIC_ALWAYS_TRUE:
                case OperatorType.TYPE_LOGIC_NOT:
                case OperatorType.TYPE_LOGIC_AND:
                case OperatorType.TYPE_LOGIC_OR:
                    break;
                case ContextType.TYPE_VARIABLE:
                    arr.splice(0, 1); // identifier of variable
                    break;
                case ContextType.TYPE_WITNESS_ID: // add to variable 
                    let addr = '0x' + Bcs.getInstance().de(BCS.ADDRESS, Uint8Array.from(arr)).toString();
                    arr.splice(0, 32); // address     
                    info.input_witness.push({ index: this.get_index(), type: ContextType.TYPE_WITNESS_ID, value_or_witness: addr });
                    break;
                case ValueType.TYPE_BOOL:
                case ValueType.TYPE_U8:
                    arr.splice(0, 1); // identifier
                    break;
                case ValueType.TYPE_ADDRESS:
                    arr.splice(0, 32);
                    break;
                case ValueType.TYPE_U64:
                    arr.splice(0, 8);
                    break;
                case ValueType.TYPE_U128:
                    arr.splice(0, 16);
                    break;
                case ValueType.TYPE_U256:
                    arr.splice(0, 32);
                    break;
                case ValueType.TYPE_VEC_U8:
                    let { value, length } = ulebDecode(Uint8Array.from(arr));
                    arr.splice(0, value + length);
                    break;
                case OperatorType.TYPE_QUERY:
                    let type = arr.splice(0, 1);
                    if (type[0] == ValueType.TYPE_ADDRESS || type[0] == ContextType.TYPE_WITNESS_ID) {
                        let addr = '0x' + Bcs.getInstance().de(BCS.ADDRESS, Uint8Array.from(arr)).toString();
                        arr.splice(0, 33); // address + cmd              
                        if (type[0] == ValueType.TYPE_ADDRESS) {
                            info.query_list.push(addr);
                        }
                        else if (type[0] == ContextType.TYPE_WITNESS_ID) {
                            info.query_list.push({ index: this.get_index(), type: type[0], value_or_witness: addr });
                        }
                    }
                    else if (type[0] == ContextType.TYPE_VARIABLE) {
                        let identifer = arr.splice(0, 2); // key + cmd
                        let variable = info.variable.find((v) => (v.identifier == identifer[0]) &&
                            ((v.type == ValueType.TYPE_ADDRESS) || (v.type == ContextType.TYPE_WITNESS_ID)));
                        if (!variable) {
                            ERROR(Errors.Fail, 'indentifier not in  variable');
                        }
                        if (variable?.type == ValueType.TYPE_ADDRESS) {
                            info.query_list.push(variable.value_or_witness);
                        }
                        else if (variable?.type == ContextType.TYPE_WITNESS_ID) {
                            info.query_list.push({ identifier: identifer[0], type: variable.type, value_or_witness: variable.value_or_witness, index: this.get_index() });
                        }
                    }
                    else {
                        ERROR(Errors.Fail, 'variable type invalid');
                    }
                    break;
                default:
                    ERROR(Errors.Fail, 'parse_bcs types');
            }
        }
    };
    get_object(guardid, info, fill) {
        let r = fill?.find(i => guardid == i.guard && i.index == info.index);
        if (!r || !r.future) {
            if (!info.future) {
                ERROR(Errors.InvalidParam, 'index invalid for fill');
            }
        }
        else {
            info.future = r.future;
        }
        return info.future;
    }
    done = async (fill) => {
        let objects = [];
        this.guard_list.forEach((g) => {
            g.variable.filter(v => v.type == ContextType.TYPE_WITNESS_ID).forEach((q) => {
                objects.push(this.get_object(g.id, q, fill));
            });
            let list = g.query_list.map((q) => {
                if (typeof (q) === "string") {
                    objects.push(q);
                    return q;
                }
                else {
                    let r = this.get_object(g.id, q, fill);
                    objects.push(r);
                    return r;
                }
            });
            g.query_list = list;
            g.input_witness.forEach((q) => {
                objects.push(this.get_object(g.id, q, fill));
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
                    ERROR(Errors.Fail, 'query object fail');
                }
                query.push(object);
            });
            res.forEach(q => {
                let r1 = g.variable.find(v => v.future == q.data?.objectId);
                let r2 = g.input_witness.find(v => v.future == q.data?.objectId);
                // not match r1 || r2 means query-cmd, not witness-cmd
                if (r1 || r2) {
                    let object = this.object_query(q.data, 'witness');
                    if (!object) {
                        ERROR(Errors.Fail, 'witness object fail');
                    }
                    witness.push(object);
                }
            });
        });
        return { guard: this.guards, query: query, witness: witness };
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
    constructor(protocol, query) {
        if (!query.guard || query.guard.length > Passport.MAX_GUARD_COUNT) {
            ERROR(Errors.InvalidParam, 'guards');
        }
        if (!Protocol.IsValidObjects(query.guard)) {
            ERROR(Errors.IsValidObjects, 'guards');
        }
        this.protocol = protocol;
        let txb = protocol.CurrentSession();
        this.passport = txb.moveCall({
            target: protocol.PassportFn('new'),
            arguments: []
        });
        // add others guards, if any
        query.guard.forEach((g) => {
            txb.moveCall({
                target: protocol.PassportFn('guard_add'),
                arguments: [this.passport, Protocol.TXB_OBJECT(txb, g)]
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
            let address = txb.moveCall({
                target: protocol.PassportFn('passport_verify'),
                arguments: [this.passport, txb.object(Protocol.CLOCK_OBJECT)]
            });
            txb.moveCall({
                target: q.target,
                arguments: [txb.object(q.object), this.passport, address],
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
