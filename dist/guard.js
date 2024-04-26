import { BCS } from '@mysten/bcs';
import { MODULES, ContextType, ValueType, OperatorType } from './protocol.js';
import { concatenate, array_equal } from './utils.js';
import { IsValidDesription, BCS_CONVERT, IsValidInt, IsValidAddress } from './utils.js';
import { ERROR, Errors } from './exception.js';
export var Guard_Sense_Binder;
(function (Guard_Sense_Binder) {
    Guard_Sense_Binder[Guard_Sense_Binder["AND"] = 0] = "AND";
    Guard_Sense_Binder[Guard_Sense_Binder["OR"] = 1] = "OR";
})(Guard_Sense_Binder || (Guard_Sense_Binder = {}));
export class Guard {
    static MAX_SENSE_COUNT = 16;
    static IsValidGuardVirableType = (type) => {
        if (type == OperatorType.TYPE_FUTURE_QUERY || type == ContextType.TYPE_CONTEXT_FUTURE_ID || type == OperatorType.TYPE_QUERY_FROM_CONTEXT ||
            type == ContextType.TYPE_CONTEXT_bool || type == ContextType.TYPE_CONTEXT_address || type == ContextType.TYPE_CONTEXT_u64 ||
            type == ContextType.TYPE_CONTEXT_u8 || type == ContextType.TYPE_CONTEXT_vec_u8) {
            return true;
        }
        ;
        return false;
    };
    static IsValidIndentifier = (identifier) => {
        if (!IsValidInt(identifier) || identifier > 255)
            return false;
        return true;
    };
    static get_variable_value(variables, identifier, type) {
        if (variables.has(identifier)) {
            let v = variables.get(identifier);
            if (v?.value && v.type == type) {
                return v.value;
            }
        }
        return false;
    }
    static get_variable_witness(variables, identifier, type) {
        if (variables.has(identifier)) {
            let v = variables.get(identifier);
            if (v?.witness && v.type == type) {
                return v.witness;
            }
        }
        return false;
    }
    static add_future_variable(variables, identifier, type, witness, value, bNeedSerialize = true) {
        if (!Guard.IsValidIndentifier(identifier))
            return false;
        if (!Guard.IsValidGuardVirableType(type))
            return false;
        if (!witness && !value)
            return false;
        switch (type) {
            case OperatorType.TYPE_FUTURE_QUERY:
            case ContextType.TYPE_CONTEXT_FUTURE_ID:
                if (variables.has(identifier)) {
                    let v = variables.get(identifier);
                    if (bNeedSerialize) {
                        v.value = value ? BCS_CONVERT.ser_address(value) : undefined;
                        v.witness = witness ? BCS_CONVERT.ser_address(witness) : undefined;
                    }
                    else {
                        v.value = value ? value : undefined;
                        v.witness = witness ? witness : undefined;
                    }
                }
                else {
                    if (bNeedSerialize) {
                        variables.set(identifier, { type: type, value: value ? BCS_CONVERT.ser_address(value) : undefined, witness: witness ? BCS_CONVERT.ser_address(witness) : undefined });
                    }
                    else {
                        variables.set(identifier, { type: type, value: value ? value : undefined, witness: witness ? witness : undefined });
                    }
                }
                return true;
        }
        return false;
    }
    static add_variable(variables, identifier, type, value, bNeedSerialize = true) {
        if (!Guard.IsValidIndentifier(identifier))
            return false;
        if (!Guard.IsValidGuardVirableType(type))
            return false;
        if (!value)
            return false;
        switch (type) {
            case ContextType.TYPE_CONTEXT_bool:
                bNeedSerialize ? variables.set(identifier, { type: type, value: BCS_CONVERT.ser_bool(value) }) :
                    variables.set(identifier, { type: type, value: value });
                return true;
            case ContextType.TYPE_CONTEXT_address:
            case OperatorType.TYPE_QUERY_FROM_CONTEXT:
                bNeedSerialize ? variables.set(identifier, { type: type, value: BCS_CONVERT.ser_address(value) }) :
                    variables.set(identifier, { type: type, value: value });
                return true;
            case ContextType.TYPE_CONTEXT_u64:
                bNeedSerialize ? variables.set(identifier, { type: type, value: BCS_CONVERT.ser_u64(value) }) :
                    variables.set(identifier, { type: type, value: value });
                return true;
            case ContextType.TYPE_CONTEXT_u8:
                bNeedSerialize ? variables.set(identifier, { type: type, value: BCS_CONVERT.ser_u8(value) }) :
                    variables.set(identifier, { type: type, value: value });
                return true;
            case ContextType.TYPE_CONTEXT_vec_u8:
                bNeedSerialize ? variables.set(identifier, { type: type, value: BCS_CONVERT.ser_string(value) }) :
                    variables.set(identifier, { type: type, value: value });
                return true;
        }
        return false;
    }
    static launch(protocol, creation) {
        if (!IsValidDesription(creation.description)) {
            ERROR(Errors.IsValidDesription);
        }
        if (creation.senses.length == 0 || creation.senses.length > Guard.MAX_SENSE_COUNT) {
            ERROR(Errors.InvalidParam, 'creation.senses');
        }
        let bValid = true;
        creation.senses.forEach((v) => {
            if (!v.input || v.input.length == 0)
                bValid = false;
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'creation.senses');
        }
        creation?.variables?.forEach((v, k) => {
            if (!Guard.IsValidIndentifier(k))
                bValid = false;
            if (!Guard.IsValidGuardVirableType(v.type))
                bValid = false;
            if (!v.value && !v.witness)
                bValid = false;
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'creation.variables');
        }
        let txb = protocol.CurrentSession();
        let guard = txb.moveCall({
            target: protocol.GuardFn('new'),
            arguments: [txb.pure(creation.description, BCS.STRING)],
        });
        creation.senses.forEach((sense) => {
            txb.moveCall({
                target: protocol.GuardFn('sense_add'),
                arguments: [guard, txb.pure([].slice.call(sense.input)),
                    txb.pure(sense.notAfterSense, BCS.BOOL),
                    txb.pure(sense.binder, BCS.U8),
                ]
            });
        });
        creation?.variables?.forEach((v, k) => {
            if (v.type == OperatorType.TYPE_FUTURE_QUERY || v.type == ContextType.TYPE_CONTEXT_FUTURE_ID) {
                if (!v.witness) {
                    ERROR(Errors.InvalidParam, 'creation.variables.type');
                }
                txb.moveCall({
                    target: protocol.GuardFn("variable_add"),
                    arguments: [guard, txb.pure(k, BCS.U8), txb.pure(v.type, BCS.U8), txb.pure([].slice.call(v.witness)), txb.pure(true, BCS.BOOL)]
                });
            }
            else {
                if (!v.value) {
                    ERROR(Errors.InvalidParam, 'creation.variables.type');
                }
                txb.moveCall({
                    target: protocol.GuardFn("variable_add"),
                    arguments: [guard, txb.pure(k, BCS.U8), txb.pure(v.type, BCS.U8), txb.pure([].slice.call(v.value)), txb.pure(true, BCS.BOOL)]
                });
            }
        });
        return txb.moveCall({
            target: protocol.GuardFn("create"),
            arguments: [guard]
        });
    }
    static signer_guard(protocol) {
        return protocol.CurrentSession().moveCall({
            target: protocol.GuardFn('signer_guard'),
            arguments: []
        });
    }
    static everyone_guard(protocol) {
        return protocol.CurrentSession().moveCall({
            target: protocol.GuardFn('everyone_guard'),
            arguments: []
        });
    }
    static QUERIES = [
        // module, 'name', 'id', [input], output
        [MODULES.permission, 'builder', 1, [], ValueType.TYPE_STATIC_address],
        [MODULES.permission, 'is_admin', 2, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
        [MODULES.permission, 'has_rights', 3, [ValueType.TYPE_STATIC_address, ValueType.TYPE_STATIC_u64], ValueType.TYPE_STATIC_bool],
        [MODULES.permission, 'contains_address', 4, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
        [MODULES.permission, 'contains_index', 5, [ValueType.TYPE_STATIC_address, ValueType.TYPE_STATIC_u64], ValueType.TYPE_STATIC_bool],
        [MODULES.permission, 'contains_guard', 6, [ValueType.TYPE_STATIC_address, ValueType.TYPE_STATIC_u64], ValueType.TYPE_STATIC_bool],
        [MODULES.permission, 'contains_guard', 7, [ValueType.TYPE_STATIC_address, ValueType.TYPE_STATIC_u64], ValueType.TYPE_STATIC_address],
        [MODULES.permission, 'entity_count', 8, [], ValueType.TYPE_STATIC_u64],
        [MODULES.permission, 'admin_count', 9, [], ValueType.TYPE_STATIC_u64],
        [MODULES.repository, 'permission', 1, [], ValueType.TYPE_STATIC_address],
        [MODULES.repository, 'policy_contains', 2, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_bool],
        [MODULES.repository, 'policy_has_permission_index', 3, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_bool],
        [MODULES.repository, 'policy_permission_index', 4, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_u64],
        [MODULES.repository, 'policy_value_type', 5, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_u8],
        [MODULES.repository, 'contains_id', 6, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
        [MODULES.repository, 'contains_value', 7, [ValueType.TYPE_STATIC_address, ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_bool],
        [MODULES.repository, 'value_without_type', 8, [ValueType.TYPE_STATIC_address, ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_vec_u8],
        [MODULES.repository, 'value', 9, [ValueType.TYPE_STATIC_address, ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_vec_u8],
        [MODULES.repository, 'type', 10, [], ValueType.TYPE_STATIC_u8],
        [MODULES.repository, 'policy_mode', 11, [], ValueType.TYPE_STATIC_u8],
        [MODULES.machine, 'permission', 1, [], ValueType.TYPE_STATIC_address],
        [MODULES.machine, 'has_paused', 2, [], ValueType.TYPE_STATIC_bool],
        [MODULES.machine, 'has_published', 3, [], ValueType.TYPE_STATIC_bool],
        [MODULES.machine, 'consensus_repositories_contains', 5, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
        [MODULES.machine, 'has_endpoint', 6, [], ValueType.TYPE_STATIC_bool],
        [MODULES.machine, 'endpoint', 7, [], ValueType.TYPE_STATIC_vec_u8],
        [MODULES.progress, 'machine', 1, [], ValueType.TYPE_STATIC_address],
        [MODULES.progress, 'current', 2, [], ValueType.TYPE_STATIC_vec_u8],
        [MODULES.progress, 'has_parent', 3, [], ValueType.TYPE_STATIC_bool],
        [MODULES.progress, 'parent', 4, [], ValueType.TYPE_STATIC_address],
        [MODULES.progress, 'has_task', 5, [], ValueType.TYPE_STATIC_bool],
        [MODULES.progress, 'task', 6, [], ValueType.TYPE_STATIC_address],
        [MODULES.progress, 'has_namedOperator', 7, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_bool],
        [MODULES.progress, 'namedOperator_contains', 8, [ValueType.TYPE_STATIC_vec_u8, ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
        [MODULES.progress, 'has_context_repository', 9, [], ValueType.TYPE_STATIC_bool],
        [MODULES.progress, 'context_repository', 10, [], ValueType.TYPE_STATIC_address],
        [MODULES.demand, 'permission', 1, [], ValueType.TYPE_STATIC_address],
        [MODULES.demand, 'has_time_expire', 2, [], ValueType.TYPE_STATIC_bool],
        [MODULES.demand, 'time_expire', 3, [], ValueType.TYPE_STATIC_u64],
        [MODULES.demand, 'earnest_count', 4, [], ValueType.TYPE_STATIC_u64],
        [MODULES.demand, 'has_guard', 5, [], ValueType.TYPE_STATIC_bool],
        [MODULES.demand, 'guard', 6, [], ValueType.TYPE_STATIC_address],
        [MODULES.demand, 'has_yes', 7, [], ValueType.TYPE_STATIC_bool],
        [MODULES.demand, 'yes', 8, [], ValueType.TYPE_STATIC_address],
        [MODULES.demand, 'presenters_count', 9, [], ValueType.TYPE_STATIC_u64],
        [MODULES.demand, 'has_presenter', 10, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
        [MODULES.demand, 'persenter', 11, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_address],
        [MODULES.order, 'amount', 1, [], ValueType.TYPE_STATIC_u64],
        [MODULES.order, 'payer', 2, [], ValueType.TYPE_STATIC_address],
        [MODULES.order, 'service', 3, [], ValueType.TYPE_STATIC_address],
        [MODULES.order, 'has_progress', 4, [], ValueType.TYPE_STATIC_bool],
        [MODULES.order, 'progress', 5, [], ValueType.TYPE_STATIC_address],
        [MODULES.order, 'has_requred_info', 6, [], ValueType.TYPE_STATIC_bool],
        [MODULES.order, 'requred_info_service_pubkey', 7, [], ValueType.TYPE_STATIC_vec_u8],
        [MODULES.order, 'requred_info_customer_pubkey', 8, [], ValueType.TYPE_STATIC_vec_u8],
        [MODULES.order, 'requred_info_info', 9, [], ValueType.TYPE_STATIC_vec_vec_u8],
        [MODULES.order, 'has_discount', 10, [], ValueType.TYPE_STATIC_bool],
        [MODULES.order, 'discount', 11, [], ValueType.TYPE_STATIC_address],
        [MODULES.order, 'balance', 12, [], ValueType.TYPE_STATIC_u64],
        [MODULES.order, 'bRefunded', 13, [], ValueType.TYPE_STATIC_u8],
        [MODULES.order, 'bWithdrawed', 14, [], ValueType.TYPE_STATIC_u8],
        [MODULES.service, 'permission', 1, [], ValueType.TYPE_STATIC_address],
        [MODULES.service, 'payee', 2, [], ValueType.TYPE_STATIC_address],
        [MODULES.service, 'has_buy_guard', 3, [], ValueType.TYPE_STATIC_bool],
        [MODULES.service, 'buy_guard', 4, [], ValueType.TYPE_STATIC_address],
        [MODULES.service, 'repository_contains', 5, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
        [MODULES.service, 'has_withdraw_guard', 6, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
        [MODULES.service, 'withdraw_guard_percent', 7, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_u64],
        [MODULES.service, 'has_refund_guard', 8, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
        [MODULES.service, 'refund_guard_percent', 9, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_u64],
        [MODULES.service, 'has_sale', 10, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_bool],
        [MODULES.service, 'sale_price', 11, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_u64],
        [MODULES.service, 'sale_stock', 12, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_u64],
        [MODULES.service, 'has_machine', 13, [], ValueType.TYPE_STATIC_bool],
        [MODULES.service, 'machine', 14, [], ValueType.TYPE_STATIC_address],
        [MODULES.service, 'bPaused', 15, [], ValueType.TYPE_STATIC_bool],
        [MODULES.service, 'bPublished', 16, [], ValueType.TYPE_STATIC_bool],
        [MODULES.service, 'has_required', 17, [], ValueType.TYPE_STATIC_bool],
        [MODULES.service, 'requrired_pubkey', 18, [], ValueType.TYPE_STATIC_vec_u8],
        [MODULES.service, 'requrired_info', 19, [], ValueType.TYPE_STATIC_vec_vec_u8],
        [MODULES.reward, 'permission', 1, [], ValueType.TYPE_STATIC_address],
        [MODULES.reward, 'rewards_count_remain', 2, [], ValueType.TYPE_STATIC_u64],
        [MODULES.reward, 'rewards_count_supplied', 3, [], ValueType.TYPE_STATIC_u64],
        [MODULES.reward, 'guard_count', 4, [], ValueType.TYPE_STATIC_u64],
        [MODULES.reward, 'has_guard', 5, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
        [MODULES.reward, 'guard_portions', 6, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_u64],
        [MODULES.reward, 'time_expire', 7, [], ValueType.TYPE_STATIC_u64],
        [MODULES.reward, 'has_claimed', 8, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
        [MODULES.reward, 'claimed', 9, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_u64],
        [MODULES.reward, 'has_claimed_count', 10, [], ValueType.TYPE_STATIC_u64],
        [MODULES.reward, 'is_sponsor', 11, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
        [MODULES.reward, 'sponsor', 12, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_u64],
        [MODULES.reward, 'sponsor_count', 13, [], ValueType.TYPE_STATIC_u64],
        [MODULES.reward, 'bAllowRepeatClaim', 14, [], ValueType.TYPE_STATIC_bool],
        [MODULES.vote, 'permission', 1, [], ValueType.TYPE_STATIC_address],
        [MODULES.vote, 'bOptions_locked_for_voting', 2, [], ValueType.TYPE_STATIC_bool],
        [MODULES.vote, 'bdeadline_locked', 3, [], ValueType.TYPE_STATIC_bool],
        [MODULES.vote, 'bLockedGuard', 4, [], ValueType.TYPE_STATIC_bool],
        [MODULES.vote, 'max_choice_count', 5, [], ValueType.TYPE_STATIC_u8],
        [MODULES.vote, 'deadline', 6, [], ValueType.TYPE_STATIC_u64],
        [MODULES.vote, 'has_reference', 7, [], ValueType.TYPE_STATIC_bool],
        [MODULES.vote, 'reference', 8, [], ValueType.TYPE_STATIC_address],
        [MODULES.vote, 'has_guard', 9, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
        [MODULES.vote, 'guard', 10, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_u64],
        [MODULES.vote, 'voted', 11, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
        [MODULES.vote, 'voted_weight', 12, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_u64],
        [MODULES.vote, 'has_agree', 13, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_bool],
        [MODULES.vote, 'agree_has_object', 14, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_bool],
        [MODULES.vote, 'agree_object', 15, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_address],
        [MODULES.vote, 'agree_count', 16, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_u64],
        [MODULES.vote, 'agree_votes', 17, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_u64],
        [MODULES.vote, 'voted_count', 18, [], ValueType.TYPE_STATIC_u64],
        [MODULES.vote, 'top1_name_by_count', 19, [], ValueType.TYPE_STATIC_vec_u8],
        [MODULES.vote, 'top1_count', 20, [], ValueType.TYPE_STATIC_u64],
        [MODULES.vote, 'top1_name_by_votes', 21, [], ValueType.TYPE_STATIC_vec_u8],
        [MODULES.vote, 'top1_votes', 22, [], ValueType.TYPE_STATIC_u64],
    ];
}
/*
export const graphql_query_objects = (protocol: Protocol, nodes:any) : Guard_Query_Object[] => {
    let ret:Guard_Query_Object[] = [];
    nodes.forEach((node:any) => {
        for (let k = 0; k < protocol.WOWOK_OBJECTS_TYPE().length; k++) {
            if (node?.asMoveObject?.contents?.type?.repr?.includes(protocol.WOWOK_OBJECTS_TYPE()[k]) ) { // type: pack::m::Object<...>
                ret.push({ target:protocol.WOWOK_OBJECTS_PREFIX_TYPE()[k] + 'guard_query' as FnCallType,
                    object:Inputs.SharedObjectRef({
                        objectId: node.address,
                        mutable: false,
                        initialSharedVersion: node.version,
                    }) as TransactionObjectInput,
                    types:parse_object_type(node.asMoveObject.contents.type.repr as string),
                    id: node.address,
                } as Guard_Query_Object);
            }
        }
    })
    return ret
} */
export class SenseMaker {
    data = [];
    type_validator = [];
    constructor() { }
    // serialize const & data
    add_param(type, param, variable) {
        switch (type) {
            case ValueType.TYPE_STATIC_address:
                if (!param)
                    return false;
                this.data.push(BCS_CONVERT.ser_u8(type));
                this.data.push(BCS_CONVERT.ser_address(param));
                this.type_validator.push(type);
                break;
            case ValueType.TYPE_STATIC_bool:
                if (!param)
                    return false;
                this.data.push(BCS_CONVERT.ser_u8(type));
                this.data.push(BCS_CONVERT.ser_bool(param));
                this.type_validator.push(type);
                break;
            case ValueType.TYPE_STATIC_u8:
                if (!param)
                    return false;
                this.data.push(BCS_CONVERT.ser_u8(type));
                this.data.push(BCS_CONVERT.ser_u8(param));
                this.type_validator.push(type);
                break;
            case ValueType.TYPE_STATIC_u64:
                if (!param)
                    return false;
                this.data.push(BCS_CONVERT.ser_u8(type));
                this.data.push(BCS_CONVERT.ser_u64(param));
                this.type_validator.push(type);
                break;
            case ValueType.TYPE_STATIC_vec_u8:
                if (!param)
                    return false;
                this.data.push(BCS_CONVERT.ser_u8(type));
                this.data.push(BCS_CONVERT.ser_string(param));
                this.type_validator.push(type);
                // this.data[this.data.length-1].forEach((item : number) => console.log(item))
                break;
            case ContextType.TYPE_CONTEXT_SIGNER:
                this.data.push(BCS_CONVERT.ser_u8(type));
                this.type_validator.push(ValueType.TYPE_STATIC_address);
                break;
            case ContextType.TYPE_CONTEXT_CLOCK:
                this.data.push(BCS_CONVERT.ser_u8(type));
                this.type_validator.push(ValueType.TYPE_STATIC_u64);
                break;
            case ContextType.TYPE_CONTEXT_bool:
            case ContextType.TYPE_CONTEXT_u8:
            case ContextType.TYPE_CONTEXT_u64:
            case ContextType.TYPE_CONTEXT_vec_u8:
            case ContextType.TYPE_CONTEXT_address:
            case ContextType.TYPE_CONTEXT_FUTURE_ID:
                if (!variable || !param)
                    return false;
                if (typeof (param) != 'number')
                    return false;
                if (!IsValidInt(param) || param > 255)
                    return false;
                var v = variable.get(param);
                if (v?.type == type) {
                    this.data.push(BCS_CONVERT.ser_u8(type));
                    this.data.push(BCS_CONVERT.ser_u8(param));
                    if (type == ContextType.TYPE_CONTEXT_bool) {
                        this.type_validator.push(ValueType.TYPE_STATIC_bool);
                    }
                    else if (type == ContextType.TYPE_CONTEXT_u8) {
                        this.type_validator.push(ValueType.TYPE_STATIC_u8);
                    }
                    else if (type == ContextType.TYPE_CONTEXT_u64) {
                        this.type_validator.push(ValueType.TYPE_STATIC_u64);
                    }
                    else if (type == ContextType.TYPE_CONTEXT_vec_u8) {
                        this.type_validator.push(ValueType.TYPE_STATIC_vec_u8);
                    }
                    else if (type == ContextType.TYPE_CONTEXT_address) {
                        this.type_validator.push(ValueType.TYPE_STATIC_address);
                    }
                    else if (type == ContextType.TYPE_CONTEXT_FUTURE_ID) {
                        this.type_validator.push(ValueType.TYPE_STATIC_address);
                    }
                    break;
                }
                ;
                return false;
            default:
                return false;
        }
        ;
        return true;
    }
    static query_index(module, query_name) {
        for (let i = 0; i < Guard.QUERIES.length; i++) {
            if (Guard.QUERIES[i][0] == module && Guard.QUERIES[i][1] == query_name) {
                return i;
            }
        }
        return -1;
    }
    add_future_query(identifier, module, query_name, variable) {
        let query_index = SenseMaker.query_index(module, query_name);
        if (!Guard.IsValidIndentifier(identifier) || query_index == -1)
            return false;
        if (module != MODULES.order && module != MODULES.progress)
            return false;
        if (!variable || variable.get(identifier)?.type != OperatorType.TYPE_FUTURE_QUERY)
            return false;
        let offset = this.type_validator.length - Guard.QUERIES[query_index][3].length;
        if (offset < 0) {
            return false;
        }
        let types = this.type_validator.slice(offset);
        if (!array_equal(types, Guard.QUERIES[query_index][3])) { // type validate 
            return false;
        }
        this.data.push(BCS_CONVERT.ser_u8(OperatorType.TYPE_FUTURE_QUERY)); // TYPE
        this.data.push(BCS_CONVERT.ser_u8(identifier)); // variable identifier
        this.data.push(BCS_CONVERT.ser_u8(Guard.QUERIES[query_index][2])); // cmd
        this.type_validator.splice(offset, Guard.QUERIES[query_index][3].length); // delete type stack
        this.type_validator.push(Guard.QUERIES[query_index][4]); // add the return value type to type stack
        // console.log(this.type_validator)
        return true;
    }
    // object_address_from: string for static address; number as identifier  for variable
    add_query(module, query_name, object_address_from) {
        let query_index = SenseMaker.query_index(module, query_name); // query_index: index(from 0) of array Guard.QUERIES 
        if (query_index == -1)
            return false;
        if (typeof (object_address_from) == 'number') {
            if (!Guard.IsValidIndentifier(object_address_from))
                return false;
        }
        else {
            if (!IsValidAddress(object_address_from))
                return false;
        }
        let offset = this.type_validator.length - Guard.QUERIES[query_index][3].length;
        if (offset < 0) {
            return false;
        }
        let types = this.type_validator.slice(offset);
        if (!array_equal(types, Guard.QUERIES[query_index][3])) { // type validate 
            return false;
        }
        if (typeof (object_address_from) == 'string') {
            this.data.push(BCS_CONVERT.ser_u8(OperatorType.TYPE_QUERY)); // TYPE
            this.data.push(BCS_CONVERT.ser_address(object_address_from)); // object address            
        }
        else {
            this.data.push(BCS_CONVERT.ser_u8(OperatorType.TYPE_QUERY_FROM_CONTEXT)); // TYPE
            this.data.push(BCS_CONVERT.ser_u8(object_address_from)); // object identifer in variables
        }
        this.data.push(BCS_CONVERT.ser_u8(Guard.QUERIES[query_index][2])); // cmd
        this.type_validator.splice(offset, Guard.QUERIES[query_index][3].length); // delete type stack
        this.type_validator.push(Guard.QUERIES[query_index][4]); // add the return value type to type stack
        // console.log(this.type_validator)
        return true;
    }
    add_logic(type) {
        switch (type) {
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER_EQUAL:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER_EQUAL:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_EQUAL:
                if (this.type_validator.length < 2) {
                    return false;
                }
                if (!SenseMaker.match_u128(this.type_validator[this.type_validator.length - 1])) {
                    return false;
                }
                if (!SenseMaker.match_u128(this.type_validator[this.type_validator.length - 2])) {
                    return false;
                }
                break;
            case OperatorType.TYPE_LOGIC_OPERATOR_EQUAL:
            case OperatorType.TYPE_LOGIC_OPERATOR_HAS_SUBSTRING:
                if (this.type_validator.length < 2) {
                    return false;
                }
                break;
            default:
                return false;
        }
        this.data.push(BCS_CONVERT.ser_u8(type)); // TYPE     
        this.type_validator.splice(this.type_validator.length - 2); // delete type stack   
        this.type_validator.push(ValueType.TYPE_STATIC_bool); // add bool to type stack
        return true;
    }
    make(bNotAfterSense = false, binder = Guard_Sense_Binder.AND) {
        //console.log(this.type_validator);
        //this.data.forEach((value:Uint8Array) => console.log(value));
        if (this.type_validator.length != 1 || this.type_validator[0] != ValueType.TYPE_STATIC_bool) {
            console.log(this.type_validator);
            return false;
        } // ERROR
        let input = concatenate(Uint8Array, ...this.data);
        const sense = { input: input, notAfterSense: bNotAfterSense, binder: binder };
        return sense;
    }
    static match_u128(type) {
        if (type == ValueType.TYPE_STATIC_u8 ||
            type == ValueType.TYPE_STATIC_u64 ||
            type == ValueType.TYPE_STATIC_u128) {
            return true;
        }
        return false;
    }
}
