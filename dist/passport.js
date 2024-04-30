import { Inputs } from '@mysten/sui.js/transactions';
import { Protocol, ContextType, OperatorType, ValueType, } from './protocol';
import { parse_object_type, array_unique, Bcs, ulebDecode } from './utils';
import { Guard } from './guard';
import { BCS } from '@mysten/bcs';
import { ERROR, Errors } from './exception';
export class GuardParser {
    // from guards: get objects to fill FUTURE value by singer 
    static guard_futures = async (protocol, guards) => {
        let futrue_objects = guards.map((value) => {
            return { objectid: value, callback: GuardParser.rpc_sense_objects_fn, parser: GuardParser.parse_futures, data: [] };
        });
        await protocol.Query(futrue_objects); // future objects
        let future_objects_result = [];
        futrue_objects.forEach((futrue) => {
            futrue.data.forEach((f) => {
                if (future_objects_result.findIndex((v) => { return v.guardid == f.guardid && v.identifier == f.identifier; }) == -1) {
                    future_objects_result.push(f);
                }
            });
        });
        return future_objects_result;
    };
    // parse  guard futures into result, WITH future variable READY.
    static parse_futures(result, guardid, chain_sense_bsc, variable) {
        var arr = [].slice.call(chain_sense_bsc.reverse());
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
                    break;
                case ContextType.TYPE_CONTEXT_FUTURE_ID: // MACHINE-ID
                case OperatorType.TYPE_FUTURE_QUERY:
                    var identifer = arr.splice(0, 1);
                    if (type == OperatorType.TYPE_FUTURE_QUERY) {
                        arr.splice(0, 1); // cmd
                    }
                    if (!variable || variable?.get(identifer[0])?.type != type)
                        return false;
                    let witness = Guard.get_variable_witness(variable, identifer[0], type);
                    if (!witness)
                        return false;
                    result.push({ guardid: guardid, identifier: identifer[0], type: type, value: '',
                        witness: '0x' + Bcs.getInstance().de(BCS.ADDRESS, Uint8Array.from(witness)) });
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
                    arr.splice(0, 33); // address + cmd
                    break;
                default:
                    console.error('parse_sense_bsc:undefined');
                    console.log(type);
                    console.log(arr);
                    return false; // error
            }
        }
        return true;
    }
    // from guards: get objects to 'guard_query' on chain , with future variables had filled.
    // passport verify for some guards, MUST be in ONE pxb:
    // 0. construct Guard_Query_Objects(passport_quries) from queries for guards of objects
    // 1. create passport
    // 2. add all guards / guards future variables
    // 3. verify passport
    // 4. ops using passport(guard set on object)
    // 5. ops using passport(guard set on object)
    // 6. destroy passport
    static guard_queries = async (protocol, guards, futures) => {
        let sense_objects = guards.map((value) => {
            let v = new Map();
            futures?.forEach((f) => {
                if (f.guardid == value) {
                    Guard.add_future_variable(v, f.identifier, f.type, f.witness.slice(0), f?.value ? f.value.slice(0) : undefined, true);
                }
            });
            return { objectid: value, callback: GuardParser.rpc_sense_objects_fn, parser: GuardParser.parse_sense_bsc, data: [], variables: futures ? v : undefined };
        });
        await protocol.Query(sense_objects); // objects need quering in guards
        let sense_objects_result = [];
        sense_objects.forEach((value) => {
            sense_objects_result = sense_objects_result.concat(value.data);
        });
        sense_objects_result = array_unique(sense_objects_result); // objects in guards
        let queries = sense_objects_result.map((value) => {
            return { objectid: value, callback: GuardParser.rpc_query_cmd_fn, data: [] };
        });
        await protocol.Query(queries, { 'showType': true }); // queries for passport verifing
        let res = [];
        sense_objects.forEach((guard) => {
            res = res.concat(guard.data.map((object) => {
                let data = queries.filter((v) => {
                    return v.objectid == object;
                });
                if (!data) {
                    console.error('error find data');
                    console.log(queries);
                    console.log(object);
                    return;
                }
                return data[0].data;
            }));
        });
        return res;
    };
    // parse guard senses input bytes of a guard, return [objectids] for 'query_cmd' 
    static parse_sense_bsc(result, guardid, chain_sense_bsc, variable) {
        var arr = [].slice.call(chain_sense_bsc.reverse());
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
                    break;
                case ContextType.TYPE_CONTEXT_FUTURE_ID: // MACHINE-ID
                    var v = arr.splice(0, 1);
                    if (!variable || variable?.get(v[0])?.type != type)
                        return false;
                    break;
                case ContextType.TYPE_CONTEXT_address:
                case ContextType.TYPE_CONTEXT_bool:
                case ContextType.TYPE_CONTEXT_u8:
                case ContextType.TYPE_CONTEXT_u64:
                case ContextType.TYPE_CONTEXT_vec_u8:
                    arr.splice(0, 1); // identifier
                    break;
                case ValueType.TYPE_STATIC_address:
                    //console.log('0x' + bcs.de(BCS.ADDRESS,  Uint8Array.from(array)).toString());
                    arr.splice(0, 32);
                    break;
                case ValueType.TYPE_STATIC_bool:
                case ValueType.TYPE_STATIC_u8:
                    arr.splice(0, 1);
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
                    result.push('0x' + Bcs.getInstance().de(BCS.ADDRESS, Uint8Array.from(arr)).toString());
                    arr.splice(0, 33); // address + cmd
                    break;
                case OperatorType.TYPE_QUERY_FROM_CONTEXT:
                case OperatorType.TYPE_FUTURE_QUERY:
                    var identifer = arr.splice(0, 1);
                    if (variable) {
                        let v = Guard.get_variable_value(variable, identifer[0], type);
                        if (v) {
                            result.push('0x' + Bcs.getInstance().de(BCS.ADDRESS, Uint8Array.from(v)).toString());
                            arr.splice(0, 1); // splice cmd  
                            break;
                        }
                    }
                    ;
                    return false;
                default:
                    console.error('parse_sense_bsc:undefined');
                    console.log(type);
                    console.log(arr);
                    return false; // error
            }
        }
        return true;
    }
    // callback  to  parse guard's object-queries into Guard_Query_Object[]
    static rpc_sense_objects_fn = (protocol, response, param, option) => {
        if (!response.error) {
            let c = response?.data?.content;
            let index = protocol.WOWOK_OBJECTS_TYPE().findIndex(v => v.includes('guard::Guard') && v == c.type);
            if (index >= 0 && c.fields.id.id == param.objectid) { // GUARD OBJECT
                if (!param?.variables) {
                    let v = new Map();
                    for (let i = 0; i < c.fields.variables.length; i++) {
                        let variable = c.fields.variables[i];
                        let bret;
                        if (variable.type == (protocol.WOWOK_OBJECTS_PREFIX_TYPE()[index] + 'Variable')) { // ...::guard::Variable
                            if (variable.fields.type == OperatorType.TYPE_FUTURE_QUERY || variable.fields.type == ContextType.TYPE_CONTEXT_FUTURE_ID) {
                                bret = Guard.add_future_variable(v, variable.fields.identifier, variable.fields.type, variable.fields?.value ? Uint8Array.from(variable.fields.value) : undefined, undefined, false);
                            }
                            else {
                                bret = Guard.add_variable(v, variable.fields.identifier, variable.fields.type, variable.fields?.value ? Uint8Array.from(variable.fields.value) : undefined, false);
                            }
                            if (!bret) {
                                console.log('rpc_sense_objects_fn add_variable error');
                                console.log(variable);
                                return;
                            }
                        }
                    }
                    param.variables = v;
                }
                for (let i = 0; i < c.fields.senses.length; i++) {
                    let sense = c.fields.senses[i];
                    if (sense.type == (protocol.WOWOK_OBJECTS_PREFIX_TYPE()[index] + 'Sense')) { // ...::guard::Sense    
                        let result = [];
                        if (param?.parser && param.parser(result, param.objectid, Uint8Array.from(sense.fields.input.fields.bytes), param.variables)) {
                            param.data = param.data.concat(result); // DONT array_unique senses                  
                        }
                    }
                }
            }
        }
    };
    // construct Guard_Query_Object of wowok objects for passport verify
    static rpc_query_cmd_fn = (protocol, response, param, option) => {
        if (!response.error && response.data?.objectId == param.objectid && response.data?.type) {
            for (let k = 0; k < protocol.WOWOK_OBJECTS_TYPE().length; k++) {
                if (response?.data?.type.includes(protocol.WOWOK_OBJECTS_TYPE()[k])) { // type: pack::m::Object<...>
                    param.data = { target: protocol.WOWOK_OBJECTS_PREFIX_TYPE()[k] + 'guard_query',
                        object: Inputs.SharedObjectRef({
                            objectId: response.data.objectId,
                            mutable: false,
                            initialSharedVersion: response.data.version,
                        }),
                        types: parse_object_type(response?.data?.type),
                        id: param.objectid, };
                }
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
    constructor(protocol, guards, guard_queries, future_values) {
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
        let result = new Map();
        future_values?.forEach((v) => {
            if (result.has(v.guardid)) {
                result.get(v.guardid)?.identifier.push(v.identifier);
                result.get(v.guardid)?.real_address.push(v.value);
            }
            else {
                result.set(v.guardid, { identifier: [v.identifier], real_address: [v.value] });
            }
        });
        result.forEach((v, k) => {
            txb.moveCall({
                target: protocol.PassportFn('futures_set'),
                arguments: [this.passport, txb.pure(Bcs.getInstance().ser_address(k)), txb.pure(Bcs.getInstance().ser_vector_u8(v.identifier)),
                    txb.pure(v.real_address, 'vector<address>')]
            });
        });
        // rules: 'verify' & 'query' in turns；'verify' at final end.
        for (let i = 0; i < guard_queries.length; i++) {
            let res = txb.moveCall({
                target: protocol.PassportFn('passport_verify'),
                arguments: [this.passport, txb.object(Protocol.CLOCK_OBJECT),]
            });
            txb.moveCall({
                target: guard_queries[i].target,
                arguments: [txb.object(guard_queries[i].object), this.passport, res],
                typeArguments: guard_queries[i].types,
            });
        }
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
