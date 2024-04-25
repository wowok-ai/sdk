"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rpc_sense_objects_fn = exports.rpc_description_fn = exports.parse_sense_bsc = exports.parse_futures = exports.parse_graphql_senses = exports.SenseMaker = exports.QUERIES = exports.everyone_guard = exports.signer_guard = exports.launch = exports.add_variable = exports.add_future_variable = exports.get_variable_witness = exports.get_variable_value = exports.IsValidIndentifier = exports.IsValidGuardVirableType = exports.Guard_Sense_Binder = exports.MAX_SENSE_COUNT = void 0;
const bcs_1 = require("@mysten/bcs");
const protocol_1 = require("./protocol");
const utils_1 = require("./utils");
const utils_2 = require("./utils");
exports.MAX_SENSE_COUNT = 16;
var Guard_Sense_Binder;
(function (Guard_Sense_Binder) {
    Guard_Sense_Binder[Guard_Sense_Binder["AND"] = 0] = "AND";
    Guard_Sense_Binder[Guard_Sense_Binder["OR"] = 1] = "OR";
})(Guard_Sense_Binder || (exports.Guard_Sense_Binder = Guard_Sense_Binder = {}));
const IsValidGuardVirableType = (type) => {
    if (type == protocol_1.OperatorType.TYPE_FUTURE_QUERY || type == protocol_1.ContextType.TYPE_CONTEXT_FUTURE_ID || type == protocol_1.OperatorType.TYPE_QUERY_FROM_CONTEXT ||
        type == protocol_1.ContextType.TYPE_CONTEXT_bool || type == protocol_1.ContextType.TYPE_CONTEXT_address || type == protocol_1.ContextType.TYPE_CONTEXT_u64 ||
        type == protocol_1.ContextType.TYPE_CONTEXT_u8 || type == protocol_1.ContextType.TYPE_CONTEXT_vec_u8) {
        return true;
    }
    ;
    return false;
};
exports.IsValidGuardVirableType = IsValidGuardVirableType;
const IsValidIndentifier = (identifier) => {
    if (!(0, protocol_1.IsValidInt)(identifier) || identifier > 255)
        return false;
    return true;
};
exports.IsValidIndentifier = IsValidIndentifier;
/*
// called by de-guard or passport
export function set_futrue_value(variables:VariableType, identifier:number, type:OperatorType | ContextType, value?:any) : boolean {
    if (!IsValidIndentifier(identifier)) return false;
    if (!IsValidGuardVirableType(type)) return false;
    let v = variables.get(identifier);
    if (v) {
        v.value = BCS_CONVERT.ser_address(value);
        return true;
    }
    return false;
} */
function get_variable_value(variables, identifier, type) {
    if (variables.has(identifier)) {
        let v = variables.get(identifier);
        if (v?.value && v.type == type) {
            return v.value;
        }
    }
    return false;
}
exports.get_variable_value = get_variable_value;
function get_variable_witness(variables, identifier, type) {
    if (variables.has(identifier)) {
        let v = variables.get(identifier);
        if (v?.witness && v.type == type) {
            return v.witness;
        }
    }
    return false;
}
exports.get_variable_witness = get_variable_witness;
function add_future_variable(variables, identifier, type, witness, value, bNeedSerialize = true) {
    if (!(0, exports.IsValidIndentifier)(identifier))
        return false;
    if (!(0, exports.IsValidGuardVirableType)(type))
        return false;
    if (!witness && !value)
        return false;
    switch (type) {
        case protocol_1.OperatorType.TYPE_FUTURE_QUERY:
        case protocol_1.ContextType.TYPE_CONTEXT_FUTURE_ID:
            if (variables.has(identifier)) {
                let v = variables.get(identifier);
                if (bNeedSerialize) {
                    v.value = value ? utils_2.BCS_CONVERT.ser_address(value) : undefined;
                    v.witness = witness ? utils_2.BCS_CONVERT.ser_address(witness) : undefined;
                }
                else {
                    v.value = value ? value : undefined;
                    v.witness = witness ? witness : undefined;
                }
            }
            else {
                if (bNeedSerialize) {
                    variables.set(identifier, { type: type, value: value ? utils_2.BCS_CONVERT.ser_address(value) : undefined, witness: witness ? utils_2.BCS_CONVERT.ser_address(witness) : undefined });
                }
                else {
                    variables.set(identifier, { type: type, value: value ? value : undefined, witness: witness ? witness : undefined });
                }
            }
            return true;
    }
    return false;
}
exports.add_future_variable = add_future_variable;
function add_variable(variables, identifier, type, value, bNeedSerialize = true) {
    if (!(0, exports.IsValidIndentifier)(identifier))
        return false;
    if (!(0, exports.IsValidGuardVirableType)(type))
        return false;
    if (!value)
        return false;
    switch (type) {
        case protocol_1.ContextType.TYPE_CONTEXT_bool:
            bNeedSerialize ? variables.set(identifier, { type: type, value: utils_2.BCS_CONVERT.ser_bool(value) }) :
                variables.set(identifier, { type: type, value: value });
            return true;
        case protocol_1.ContextType.TYPE_CONTEXT_address:
        case protocol_1.OperatorType.TYPE_QUERY_FROM_CONTEXT:
            bNeedSerialize ? variables.set(identifier, { type: type, value: utils_2.BCS_CONVERT.ser_address(value) }) :
                variables.set(identifier, { type: type, value: value });
            return true;
        case protocol_1.ContextType.TYPE_CONTEXT_u64:
            bNeedSerialize ? variables.set(identifier, { type: type, value: utils_2.BCS_CONVERT.ser_u64(value) }) :
                variables.set(identifier, { type: type, value: value });
            return true;
        case protocol_1.ContextType.TYPE_CONTEXT_u8:
            bNeedSerialize ? variables.set(identifier, { type: type, value: utils_2.BCS_CONVERT.ser_u8(value) }) :
                variables.set(identifier, { type: type, value: value });
            return true;
        case protocol_1.ContextType.TYPE_CONTEXT_vec_u8:
            bNeedSerialize ? variables.set(identifier, { type: type, value: utils_2.BCS_CONVERT.ser_string(value) }) :
                variables.set(identifier, { type: type, value: value });
            return true;
    }
    return false;
}
exports.add_variable = add_variable;
function launch(txb, creation) {
    if (!(0, protocol_1.IsValidDesription)(creation.description))
        return false;
    if (!creation.senses)
        return false;
    let bValid = true;
    creation.senses.forEach((v) => {
        if (!v.input || v.input.length == 0)
            bValid = false;
    });
    creation?.variables?.forEach((v, k) => {
        if (!(0, exports.IsValidIndentifier)(k))
            bValid = false;
        if (!(0, exports.IsValidGuardVirableType)(v.type))
            bValid = false;
        if (!v.value && !v.witness)
            bValid = false;
    });
    if (!bValid)
        return false;
    let guard = txb.moveCall({
        target: protocol_1.PROTOCOL.GuardFn('new'),
        arguments: [txb.pure(creation.description, bcs_1.BCS.STRING)],
    });
    creation.senses.forEach((sense) => {
        txb.moveCall({
            target: protocol_1.PROTOCOL.GuardFn('sense_add'),
            arguments: [guard, txb.pure([].slice.call(sense.input)),
                txb.pure(sense.notAfterSense, bcs_1.BCS.BOOL),
                txb.pure(sense.binder, bcs_1.BCS.U8),
            ]
        });
    });
    creation?.variables?.forEach((v, k) => {
        if (v.type == protocol_1.OperatorType.TYPE_FUTURE_QUERY || v.type == protocol_1.ContextType.TYPE_CONTEXT_FUTURE_ID) {
            if (!v.witness)
                return false;
            txb.moveCall({
                target: protocol_1.PROTOCOL.GuardFn("variable_add"),
                arguments: [guard, txb.pure(k, bcs_1.BCS.U8), txb.pure(v.type, bcs_1.BCS.U8), txb.pure([].slice.call(v.witness)), txb.pure(true, bcs_1.BCS.BOOL)]
            });
        }
        else {
            if (!v.value)
                return false;
            txb.moveCall({
                target: protocol_1.PROTOCOL.GuardFn("variable_add"),
                arguments: [guard, txb.pure(k, bcs_1.BCS.U8), txb.pure(v.type, bcs_1.BCS.U8), txb.pure([].slice.call(v.value)), txb.pure(true, bcs_1.BCS.BOOL)]
            });
        }
    });
    return txb.moveCall({
        target: protocol_1.PROTOCOL.GuardFn("create"),
        arguments: [guard]
    });
}
exports.launch = launch;
function signer_guard(txb) {
    return txb.moveCall({
        target: protocol_1.PROTOCOL.GuardFn('signer_guard'),
        arguments: []
    });
}
exports.signer_guard = signer_guard;
function everyone_guard(txb) {
    return txb.moveCall({
        target: protocol_1.PROTOCOL.GuardFn('everyone_guard'),
        arguments: []
    });
}
exports.everyone_guard = everyone_guard;
exports.QUERIES = [
    // module, 'name', 'id', [input], output
    [protocol_1.MODULES.permission, 'builder', 1, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.permission, 'is_admin', 2, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.permission, 'has_rights', 3, [protocol_1.ValueType.TYPE_STATIC_address, protocol_1.ValueType.TYPE_STATIC_u64], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.permission, 'contains_address', 4, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.permission, 'contains_index', 5, [protocol_1.ValueType.TYPE_STATIC_address, protocol_1.ValueType.TYPE_STATIC_u64], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.permission, 'contains_guard', 6, [protocol_1.ValueType.TYPE_STATIC_address, protocol_1.ValueType.TYPE_STATIC_u64], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.permission, 'contains_guard', 7, [protocol_1.ValueType.TYPE_STATIC_address, protocol_1.ValueType.TYPE_STATIC_u64], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.permission, 'entity_count', 8, [], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.permission, 'admin_count', 9, [], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.repository, 'permission', 1, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.repository, 'policy_contains', 2, [protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.repository, 'policy_has_permission_index', 3, [protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.repository, 'policy_permission_index', 4, [protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.repository, 'policy_value_type', 5, [protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_u8],
    [protocol_1.MODULES.repository, 'contains_id', 6, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.repository, 'contains_value', 7, [protocol_1.ValueType.TYPE_STATIC_address, protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.repository, 'value_without_type', 8, [protocol_1.ValueType.TYPE_STATIC_address, protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_vec_u8],
    [protocol_1.MODULES.repository, 'value', 9, [protocol_1.ValueType.TYPE_STATIC_address, protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_vec_u8],
    [protocol_1.MODULES.repository, 'type', 10, [], protocol_1.ValueType.TYPE_STATIC_u8],
    [protocol_1.MODULES.repository, 'policy_mode', 11, [], protocol_1.ValueType.TYPE_STATIC_u8],
    [protocol_1.MODULES.machine, 'permission', 1, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.machine, 'has_paused', 2, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.machine, 'has_published', 3, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.machine, 'consensus_repositories_contains', 5, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.machine, 'has_endpoint', 6, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.machine, 'endpoint', 7, [], protocol_1.ValueType.TYPE_STATIC_vec_u8],
    [protocol_1.MODULES.progress, 'machine', 1, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.progress, 'current', 2, [], protocol_1.ValueType.TYPE_STATIC_vec_u8],
    [protocol_1.MODULES.progress, 'has_parent', 3, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.progress, 'parent', 4, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.progress, 'has_task', 5, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.progress, 'task', 6, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.progress, 'has_namedOperator', 7, [protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.progress, 'namedOperator_contains', 8, [protocol_1.ValueType.TYPE_STATIC_vec_u8, protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.progress, 'has_context_repository', 9, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.progress, 'context_repository', 10, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.demand, 'permission', 1, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.demand, 'has_time_expire', 2, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.demand, 'time_expire', 3, [], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.demand, 'earnest_count', 4, [], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.demand, 'has_guard', 5, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.demand, 'guard', 6, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.demand, 'has_yes', 7, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.demand, 'yes', 8, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.demand, 'presenters_count', 9, [], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.demand, 'has_presenter', 10, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.demand, 'persenter', 11, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.order, 'amount', 1, [], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.order, 'payer', 2, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.order, 'service', 3, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.order, 'has_progress', 4, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.order, 'progress', 5, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.order, 'has_requred_info', 6, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.order, 'requred_info_service_pubkey', 7, [], protocol_1.ValueType.TYPE_STATIC_vec_u8],
    [protocol_1.MODULES.order, 'requred_info_customer_pubkey', 8, [], protocol_1.ValueType.TYPE_STATIC_vec_u8],
    [protocol_1.MODULES.order, 'requred_info_info', 9, [], protocol_1.ValueType.TYPE_STATIC_vec_vec_u8],
    [protocol_1.MODULES.order, 'has_discount', 10, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.order, 'discount', 11, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.order, 'balance', 12, [], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.order, 'bRefunded', 13, [], protocol_1.ValueType.TYPE_STATIC_u8],
    [protocol_1.MODULES.order, 'bWithdrawed', 14, [], protocol_1.ValueType.TYPE_STATIC_u8],
    [protocol_1.MODULES.service, 'permission', 1, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.service, 'payee', 2, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.service, 'has_buy_guard', 3, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.service, 'buy_guard', 4, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.service, 'repository_contains', 5, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.service, 'has_withdraw_guard', 6, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.service, 'withdraw_guard_percent', 7, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.service, 'has_refund_guard', 8, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.service, 'refund_guard_percent', 9, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.service, 'has_sale', 10, [protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.service, 'sale_price', 11, [protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.service, 'sale_stock', 12, [protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.service, 'has_machine', 13, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.service, 'machine', 14, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.service, 'bPaused', 15, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.service, 'bPublished', 16, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.service, 'has_required', 17, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.service, 'requrired_pubkey', 18, [], protocol_1.ValueType.TYPE_STATIC_vec_u8],
    [protocol_1.MODULES.service, 'requrired_info', 19, [], protocol_1.ValueType.TYPE_STATIC_vec_vec_u8],
    [protocol_1.MODULES.reward, 'permission', 1, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.reward, 'rewards_count_remain', 2, [], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.reward, 'rewards_count_supplied', 3, [], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.reward, 'guard_count', 4, [], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.reward, 'has_guard', 5, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.reward, 'guard_portions', 6, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.reward, 'time_expire', 7, [], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.reward, 'has_claimed', 8, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.reward, 'claimed', 9, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.reward, 'has_claimed_count', 10, [], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.reward, 'is_sponsor', 11, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.reward, 'sponsor', 12, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.reward, 'sponsor_count', 13, [], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.reward, 'bAllowRepeatClaim', 14, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.vote, 'permission', 1, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.vote, 'bOptions_locked_for_voting', 2, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.vote, 'bdeadline_locked', 3, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.vote, 'bLockedGuard', 4, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.vote, 'max_choice_count', 5, [], protocol_1.ValueType.TYPE_STATIC_u8],
    [protocol_1.MODULES.vote, 'deadline', 6, [], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.vote, 'has_reference', 7, [], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.vote, 'reference', 8, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.vote, 'has_guard', 9, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.vote, 'guard', 10, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.vote, 'voted', 11, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.vote, 'voted_weight', 12, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.vote, 'has_agree', 13, [protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.vote, 'agree_has_object', 14, [protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.vote, 'agree_object', 15, [protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.vote, 'agree_count', 16, [protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.vote, 'agree_votes', 17, [protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.vote, 'voted_count', 18, [], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.vote, 'top1_name_by_count', 19, [], protocol_1.ValueType.TYPE_STATIC_vec_u8],
    [protocol_1.MODULES.vote, 'top1_count', 20, [], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.vote, 'top1_name_by_votes', 21, [], protocol_1.ValueType.TYPE_STATIC_vec_u8],
    [protocol_1.MODULES.vote, 'top1_votes', 22, [], protocol_1.ValueType.TYPE_STATIC_u64],
];
class SenseMaker {
    data = [];
    type_validator = [];
    constructor() { }
    // serialize const & data
    add_param(type, param, variable) {
        switch (type) {
            case protocol_1.ValueType.TYPE_STATIC_address:
                if (!param)
                    return false;
                this.data.push(utils_2.BCS_CONVERT.ser_u8(type));
                this.data.push(utils_2.BCS_CONVERT.ser_address(param));
                this.type_validator.push(type);
                break;
            case protocol_1.ValueType.TYPE_STATIC_bool:
                if (!param)
                    return false;
                this.data.push(utils_2.BCS_CONVERT.ser_u8(type));
                this.data.push(utils_2.BCS_CONVERT.ser_bool(param));
                this.type_validator.push(type);
                break;
            case protocol_1.ValueType.TYPE_STATIC_u8:
                if (!param)
                    return false;
                this.data.push(utils_2.BCS_CONVERT.ser_u8(type));
                this.data.push(utils_2.BCS_CONVERT.ser_u8(param));
                this.type_validator.push(type);
                break;
            case protocol_1.ValueType.TYPE_STATIC_u64:
                if (!param)
                    return false;
                this.data.push(utils_2.BCS_CONVERT.ser_u8(type));
                this.data.push(utils_2.BCS_CONVERT.ser_u64(param));
                this.type_validator.push(type);
                break;
            case protocol_1.ValueType.TYPE_STATIC_vec_u8:
                if (!param)
                    return false;
                this.data.push(utils_2.BCS_CONVERT.ser_u8(type));
                this.data.push(utils_2.BCS_CONVERT.ser_string(param));
                this.type_validator.push(type);
                // this.data[this.data.length-1].forEach((item : number) => console.log(item))
                break;
            case protocol_1.ContextType.TYPE_CONTEXT_SIGNER:
                this.data.push(utils_2.BCS_CONVERT.ser_u8(type));
                this.type_validator.push(protocol_1.ValueType.TYPE_STATIC_address);
                break;
            case protocol_1.ContextType.TYPE_CONTEXT_CLOCK:
                this.data.push(utils_2.BCS_CONVERT.ser_u8(type));
                this.type_validator.push(protocol_1.ValueType.TYPE_STATIC_u64);
                break;
            case protocol_1.ContextType.TYPE_CONTEXT_bool:
            case protocol_1.ContextType.TYPE_CONTEXT_u8:
            case protocol_1.ContextType.TYPE_CONTEXT_u64:
            case protocol_1.ContextType.TYPE_CONTEXT_vec_u8:
            case protocol_1.ContextType.TYPE_CONTEXT_address:
            case protocol_1.ContextType.TYPE_CONTEXT_FUTURE_ID:
                if (!variable || !param)
                    return false;
                if (typeof (param) != 'number')
                    return false;
                if (!(0, protocol_1.IsValidInt)(param) || param > 255)
                    return false;
                var v = variable.get(param);
                if (v?.type == type) {
                    this.data.push(utils_2.BCS_CONVERT.ser_u8(type));
                    this.data.push(utils_2.BCS_CONVERT.ser_u8(param));
                    if (type == protocol_1.ContextType.TYPE_CONTEXT_bool) {
                        this.type_validator.push(protocol_1.ValueType.TYPE_STATIC_bool);
                    }
                    else if (type == protocol_1.ContextType.TYPE_CONTEXT_u8) {
                        this.type_validator.push(protocol_1.ValueType.TYPE_STATIC_u8);
                    }
                    else if (type == protocol_1.ContextType.TYPE_CONTEXT_u64) {
                        this.type_validator.push(protocol_1.ValueType.TYPE_STATIC_u64);
                    }
                    else if (type == protocol_1.ContextType.TYPE_CONTEXT_vec_u8) {
                        this.type_validator.push(protocol_1.ValueType.TYPE_STATIC_vec_u8);
                    }
                    else if (type == protocol_1.ContextType.TYPE_CONTEXT_address) {
                        this.type_validator.push(protocol_1.ValueType.TYPE_STATIC_address);
                    }
                    else if (type == protocol_1.ContextType.TYPE_CONTEXT_FUTURE_ID) {
                        this.type_validator.push(protocol_1.ValueType.TYPE_STATIC_address);
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
    query_index(module, query_name) {
        for (let i = 0; i < exports.QUERIES.length; i++) {
            if (exports.QUERIES[i][0] == module && exports.QUERIES[i][1] == query_name) {
                return i;
            }
        }
        return -1;
    }
    add_future_query(identifier, module, query_name, variable) {
        let query_index = this.query_index(module, query_name);
        if (!(0, exports.IsValidIndentifier)(identifier) || query_index == -1)
            return false;
        if (module != protocol_1.MODULES.order && module != protocol_1.MODULES.progress)
            return false;
        if (!variable || variable.get(identifier)?.type != protocol_1.OperatorType.TYPE_FUTURE_QUERY)
            return false;
        let offset = this.type_validator.length - exports.QUERIES[query_index][3].length;
        if (offset < 0) {
            return false;
        }
        let types = this.type_validator.slice(offset);
        if (!(0, utils_1.array_equal)(types, exports.QUERIES[query_index][3])) { // type validate 
            return false;
        }
        this.data.push(utils_2.BCS_CONVERT.ser_u8(protocol_1.OperatorType.TYPE_FUTURE_QUERY)); // TYPE
        this.data.push(utils_2.BCS_CONVERT.ser_u8(identifier)); // variable identifier
        this.data.push(utils_2.BCS_CONVERT.ser_u8(exports.QUERIES[query_index][2])); // cmd
        this.type_validator.splice(offset, exports.QUERIES[query_index][3].length); // delete type stack
        this.type_validator.push(exports.QUERIES[query_index][4]); // add the return value type to type stack
        // console.log(this.type_validator)
        return true;
    }
    // object_address_from: string for static address; number as identifier  for variable
    add_query(module, query_name, object_address_from) {
        let query_index = this.query_index(module, query_name); // query_index: index(from 0) of array QUERIES 
        if (query_index == -1)
            return false;
        if (typeof (object_address_from) == 'number') {
            if (!(0, exports.IsValidIndentifier)(object_address_from))
                return false;
        }
        else {
            if (!(0, protocol_1.IsValidAddress)(object_address_from))
                return false;
        }
        let offset = this.type_validator.length - exports.QUERIES[query_index][3].length;
        if (offset < 0) {
            return false;
        }
        let types = this.type_validator.slice(offset);
        if (!(0, utils_1.array_equal)(types, exports.QUERIES[query_index][3])) { // type validate 
            return false;
        }
        if (typeof (object_address_from) == 'string') {
            this.data.push(utils_2.BCS_CONVERT.ser_u8(protocol_1.OperatorType.TYPE_QUERY)); // TYPE
            this.data.push(utils_2.BCS_CONVERT.ser_address(object_address_from)); // object address            
        }
        else {
            this.data.push(utils_2.BCS_CONVERT.ser_u8(protocol_1.OperatorType.TYPE_QUERY_FROM_CONTEXT)); // TYPE
            this.data.push(utils_2.BCS_CONVERT.ser_u8(object_address_from)); // object identifer in variables
        }
        this.data.push(utils_2.BCS_CONVERT.ser_u8(exports.QUERIES[query_index][2])); // cmd
        this.type_validator.splice(offset, exports.QUERIES[query_index][3].length); // delete type stack
        this.type_validator.push(exports.QUERIES[query_index][4]); // add the return value type to type stack
        // console.log(this.type_validator)
        return true;
    }
    add_logic(type) {
        switch (type) {
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_EQUAL:
                if (this.type_validator.length < 2) {
                    return false;
                }
                if (!match_u128(this.type_validator[this.type_validator.length - 1])) {
                    return false;
                }
                if (!match_u128(this.type_validator[this.type_validator.length - 2])) {
                    return false;
                }
                break;
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_HAS_SUBSTRING:
                if (this.type_validator.length < 2) {
                    return false;
                }
                break;
            default:
                return false;
        }
        this.data.push(utils_2.BCS_CONVERT.ser_u8(type)); // TYPE     
        this.type_validator.splice(this.type_validator.length - 2); // delete type stack   
        this.type_validator.push(protocol_1.ValueType.TYPE_STATIC_bool); // add bool to type stack
        return true;
    }
    make(bNotAfterSense = false, binder = Guard_Sense_Binder.AND) {
        //console.log(this.type_validator);
        //this.data.forEach((value:Uint8Array) => console.log(value));
        if (this.type_validator.length != 1 || this.type_validator[0] != protocol_1.ValueType.TYPE_STATIC_bool) {
            console.log(this.type_validator);
            return false;
        } // ERROR
        let input = (0, utils_1.concatenate)(Uint8Array, ...this.data);
        const sense = { input: input, notAfterSense: bNotAfterSense, binder: binder };
        return sense;
    }
}
exports.SenseMaker = SenseMaker;
function match_u128(type) {
    if (type == protocol_1.ValueType.TYPE_STATIC_u8 ||
        type == protocol_1.ValueType.TYPE_STATIC_u64 ||
        type == protocol_1.ValueType.TYPE_STATIC_u128) {
        return true;
    }
    return false;
}
function parse_graphql_senses(guardid, senses) {
    let objects = [];
    senses.forEach((s) => {
        let res = parse_sense_bsc(objects, guardid, Uint8Array.from(s.input.bytes));
    });
    return objects;
}
exports.parse_graphql_senses = parse_graphql_senses;
function parse_futures(result, guardid, chain_sense_bsc, variable) {
    var arr = [].slice.call(chain_sense_bsc.reverse());
    while (arr.length > 0) {
        var type = arr.shift();
        // console.log(type);
        switch (type) {
            case protocol_1.ContextType.TYPE_CONTEXT_SIGNER:
            case protocol_1.ContextType.TYPE_CONTEXT_CLOCK:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_HAS_SUBSTRING:
            case protocol_1.OperatorType.TYPE_LOGIC_ALWAYS_TRUE:
                break;
            case protocol_1.ContextType.TYPE_CONTEXT_FUTURE_ID: // MACHINE-ID
            case protocol_1.OperatorType.TYPE_FUTURE_QUERY:
                var identifer = arr.splice(0, 1);
                if (type == protocol_1.OperatorType.TYPE_FUTURE_QUERY) {
                    arr.splice(0, 1); // cmd
                }
                if (!variable || variable?.get(identifer[0])?.type != type)
                    return false;
                let witness = get_variable_witness(variable, identifer[0], type);
                if (!witness)
                    return false;
                result.push({ guardid: guardid, identifier: identifer[0], type: type,
                    witness: '0x' + utils_2.BCS_CONVERT.de(bcs_1.BCS.ADDRESS, Uint8Array.from(witness)) });
                break;
            case protocol_1.ContextType.TYPE_CONTEXT_address:
            case protocol_1.ContextType.TYPE_CONTEXT_bool:
            case protocol_1.ContextType.TYPE_CONTEXT_u8:
            case protocol_1.ContextType.TYPE_CONTEXT_u64:
            case protocol_1.ContextType.TYPE_CONTEXT_vec_u8:
            case protocol_1.ValueType.TYPE_STATIC_bool:
            case protocol_1.ValueType.TYPE_STATIC_u8:
                arr.splice(0, 1); // identifier
                break;
            case protocol_1.OperatorType.TYPE_QUERY_FROM_CONTEXT:
                arr.splice(0, 2); // identifer + cmd
            case protocol_1.ValueType.TYPE_STATIC_address:
                arr.splice(0, 32);
                break;
            case protocol_1.ValueType.TYPE_STATIC_u64:
                arr.splice(0, 8);
                break;
            case protocol_1.ValueType.TYPE_STATIC_u128:
                arr.splice(0, 16);
                break;
            case protocol_1.ValueType.TYPE_STATIC_vec_u8:
                let { value, length } = (0, utils_1.ulebDecode)(Uint8Array.from(arr));
                arr.splice(0, value + length);
                break;
            case protocol_1.OperatorType.TYPE_QUERY:
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
exports.parse_futures = parse_futures;
// parse guard senses input bytes of a guard, return [objectids] for 'query_cmd' 
function parse_sense_bsc(result, guardid, chain_sense_bsc, variable) {
    var arr = [].slice.call(chain_sense_bsc.reverse());
    while (arr.length > 0) {
        var type = arr.shift();
        // console.log(type);
        switch (type) {
            case protocol_1.ContextType.TYPE_CONTEXT_SIGNER:
            case protocol_1.ContextType.TYPE_CONTEXT_CLOCK:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_HAS_SUBSTRING:
            case protocol_1.OperatorType.TYPE_LOGIC_ALWAYS_TRUE:
                break;
            case protocol_1.ContextType.TYPE_CONTEXT_FUTURE_ID: // MACHINE-ID
                var v = arr.splice(0, 1);
                if (!variable || variable?.get(v[0])?.type != type)
                    return false;
                break;
            case protocol_1.ContextType.TYPE_CONTEXT_address:
            case protocol_1.ContextType.TYPE_CONTEXT_bool:
            case protocol_1.ContextType.TYPE_CONTEXT_u8:
            case protocol_1.ContextType.TYPE_CONTEXT_u64:
            case protocol_1.ContextType.TYPE_CONTEXT_vec_u8:
                arr.splice(0, 1); // identifier
                break;
            case protocol_1.ValueType.TYPE_STATIC_address:
                //console.log('0x' + bcs.de(BCS.ADDRESS,  Uint8Array.from(array)).toString());
                arr.splice(0, 32);
                break;
            case protocol_1.ValueType.TYPE_STATIC_bool:
            case protocol_1.ValueType.TYPE_STATIC_u8:
                arr.splice(0, 1);
                break;
            case protocol_1.ValueType.TYPE_STATIC_u64:
                arr.splice(0, 8);
                break;
            case protocol_1.ValueType.TYPE_STATIC_u128:
                arr.splice(0, 16);
                break;
            case protocol_1.ValueType.TYPE_STATIC_vec_u8:
                let { value, length } = (0, utils_1.ulebDecode)(Uint8Array.from(arr));
                arr.splice(0, value + length);
                break;
            case protocol_1.OperatorType.TYPE_QUERY:
                result.push('0x' + utils_2.BCS_CONVERT.de(bcs_1.BCS.ADDRESS, Uint8Array.from(arr)).toString());
                arr.splice(0, 33); // address + cmd
                break;
            case protocol_1.OperatorType.TYPE_QUERY_FROM_CONTEXT:
            case protocol_1.OperatorType.TYPE_FUTURE_QUERY:
                var identifer = arr.splice(0, 1);
                if (variable) {
                    let v = get_variable_value(variable, identifer[0], type);
                    if (v) {
                        result.push('0x' + utils_2.BCS_CONVERT.de(bcs_1.BCS.ADDRESS, Uint8Array.from(v)).toString());
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
exports.parse_sense_bsc = parse_sense_bsc;
const rpc_description_fn = (response, param, option) => {
    if (!response.error) {
        let c = response?.data?.content;
        if ((0, protocol_1.OBJECTS_TYPE)().find((v) => (v == c.type)) && c.fields.id.id == param.objectid) { // GUARD OBJECT
            let description = c.fields.description;
            if (!param.data.includes(description)) {
                param.data.push(description);
            }
        }
    }
};
exports.rpc_description_fn = rpc_description_fn;
const rpc_sense_objects_fn = (response, param, option) => {
    if (!response.error) {
        let c = response?.data?.content;
        let index = (0, protocol_1.OBJECTS_TYPE)().findIndex(v => v.includes('guard::Guard') && v == c.type);
        if (index >= 0 && c.fields.id.id == param.objectid) { // GUARD OBJECT
            if (!param?.variables) {
                let v = new Map();
                for (let i = 0; i < c.fields.variables.length; i++) {
                    let variable = c.fields.variables[i];
                    let bret;
                    if (variable.type == ((0, protocol_1.OBJECTS_TYPE_PREFIX)()[index] + 'Variable')) { // ...::guard::Variable
                        if (variable.fields.type == protocol_1.OperatorType.TYPE_FUTURE_QUERY || variable.fields.type == protocol_1.ContextType.TYPE_CONTEXT_FUTURE_ID) {
                            bret = add_future_variable(v, variable.fields.identifier, variable.fields.type, variable.fields?.value ? Uint8Array.from(variable.fields.value) : undefined, undefined, false);
                        }
                        else {
                            bret = add_variable(v, variable.fields.identifier, variable.fields.type, variable.fields?.value ? Uint8Array.from(variable.fields.value) : undefined, false);
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
                if (sense.type == ((0, protocol_1.OBJECTS_TYPE_PREFIX)()[index] + 'Sense')) { // ...::guard::Sense    
                    let result = [];
                    if (param?.parser && param.parser(result, param.objectid, Uint8Array.from(sense.fields.input.fields.bytes), param.variables)) {
                        param.data = param.data.concat(result); // DONT array_unique senses                  
                    }
                }
            }
        }
    }
};
exports.rpc_sense_objects_fn = rpc_sense_objects_fn;
