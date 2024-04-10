"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rpc_sense_objects_fn = exports.rpc_description_fn = exports.parse_sense_bsc = exports.parse_graphql_senses = exports.SenseMaker = exports.QUERIES = exports.everyone_guard = exports.signer_guard = exports.launch = exports.Guard_Sense_Binder = exports.MAX_SENSE_COUNT = void 0;
const bcs_1 = require("@mysten/bcs");
const protocol_1 = require("./protocol");
const util_1 = require("./util");
exports.MAX_SENSE_COUNT = 16;
var Guard_Sense_Binder;
(function (Guard_Sense_Binder) {
    Guard_Sense_Binder[Guard_Sense_Binder["AND"] = 0] = "AND";
    Guard_Sense_Binder[Guard_Sense_Binder["OR"] = 1] = "OR";
})(Guard_Sense_Binder || (exports.Guard_Sense_Binder = Guard_Sense_Binder = {}));
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
    add_param(type, param) {
        const bcs = new bcs_1.BCS((0, bcs_1.getSuiMoveConfig)());
        switch (type) {
            case protocol_1.ValueType.TYPE_STATIC_address:
                this.data.push(bcs.ser(bcs_1.BCS.U8, type).toBytes());
                this.data.push(bcs.ser(bcs_1.BCS.ADDRESS, param).toBytes());
                this.type_validator.push(type);
                break;
            case protocol_1.ValueType.TYPE_STATIC_bool:
                this.data.push(bcs.ser(bcs_1.BCS.U8, type).toBytes());
                this.data.push(bcs.ser(bcs_1.BCS.BOOL, param).toBytes());
                this.type_validator.push(type);
                break;
            case protocol_1.ValueType.TYPE_STATIC_u8:
                this.data.push(bcs.ser(bcs_1.BCS.U8, type).toBytes());
                this.data.push(bcs.ser(bcs_1.BCS.U8, param).toBytes());
                this.type_validator.push(type);
                break;
            case protocol_1.ValueType.TYPE_STATIC_u64:
                this.data.push(bcs.ser(bcs_1.BCS.U8, type).toBytes());
                this.data.push(bcs.ser(bcs_1.BCS.U64, param).toBytes());
                this.type_validator.push(type);
                break;
            case protocol_1.ValueType.TYPE_STATIC_vec_u8:
                this.data.push(bcs.ser(bcs_1.BCS.U8, type).toBytes());
                this.data.push(bcs.ser(bcs_1.BCS.STRING, param).toBytes());
                this.type_validator.push(type);
                // this.data[this.data.length-1].forEach((item : number) => console.log(item))
                break;
            case protocol_1.ContextType.TYPE_CONTEXT_SIGNER:
                this.data.push(bcs.ser(bcs_1.BCS.U8, type).toBytes());
                this.type_validator.push(protocol_1.ValueType.TYPE_STATIC_address);
                break;
            case protocol_1.ContextType.TYPE_CONTEXT_CURRENT_CLOCK:
                this.data.push(bcs.ser(bcs_1.BCS.U8, type).toBytes());
                this.type_validator.push(protocol_1.ValueType.TYPE_STATIC_u64);
                break;
            case protocol_1.ContextType.TYPE_CONTEXT_CURRENT_PROGRESS:
                this.data.push(bcs.ser(bcs_1.BCS.U8, type).toBytes());
                this.type_validator.push(protocol_1.ValueType.TYPE_STATIC_address);
                break;
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
    // query_index: index(from 0) of array QUERIES 
    add_query(object_address, module, query_name) {
        let query_index = this.query_index(module, query_name);
        if (!object_address || query_index == -1) {
            return false;
        }
        let offset = this.type_validator.length - exports.QUERIES[query_index][3].length;
        if (offset < 0) {
            return false;
        }
        let types = this.type_validator.slice(offset);
        if (!(0, util_1.array_equal)(types, exports.QUERIES[query_index][3])) { // type validate 
            return false;
        }
        const bcs = new bcs_1.BCS((0, bcs_1.getSuiMoveConfig)());
        this.data.push(bcs.ser(bcs_1.BCS.U8, protocol_1.OperatorType.TYPE_DYNAMIC_QUERY).toBytes()); // TYPE
        this.data.push(bcs.ser(bcs_1.BCS.ADDRESS, object_address).toBytes()); // object address
        this.data.push(bcs.ser(bcs_1.BCS.U8, exports.QUERIES[query_index][2]).toBytes()); // cmd
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
        const bcs = new bcs_1.BCS((0, bcs_1.getSuiMoveConfig)());
        this.data.push(bcs.ser(bcs_1.BCS.U8, type).toBytes()); // TYPE     
        this.type_validator.splice(this.type_validator.length - 2); // delete type stack   
        this.type_validator.push(protocol_1.ValueType.TYPE_STATIC_bool); // add bool to type stack
        return true;
    }
    make(bNotAfterSense = false, binder = Guard_Sense_Binder.AND) {
        //console.log(this.type_validator);
        //this.data.forEach((value:Uint8Array) => console.log(value));
        if (this.type_validator.length != 1 || this.type_validator[0] != protocol_1.ValueType.TYPE_STATIC_bool) {
            // console.log(this.type_validator)
            return false;
        } // ERROR
        let input = (0, util_1.concatenate)(Uint8Array, ...this.data);
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
function parse_graphql_senses(senses) {
    let objects = [];
    senses.forEach((s) => {
        let res = parse_sense_bsc(Uint8Array.from(s.input.bytes));
        if (res) {
            objects = objects.concat(res);
        }
    });
    return (0, util_1.array_unique)(objects);
}
exports.parse_graphql_senses = parse_graphql_senses;
// parse guard senses input bytes of a guard, return [objectids] for 'query_cmd' 
function parse_sense_bsc(chain_sense_bsc) {
    var arr = [].slice.call(chain_sense_bsc.reverse());
    const bcs = new bcs_1.BCS((0, bcs_1.getSuiMoveConfig)());
    var result = [];
    while (arr.length > 0) {
        var type = arr.shift();
        // console.log(type);
        switch (type) {
            case protocol_1.ContextType.TYPE_CONTEXT_SIGNER:
            case protocol_1.ContextType.TYPE_CONTEXT_CURRENT_CLOCK:
            case protocol_1.ContextType.TYPE_CONTEXT_CURRENT_PROGRESS:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_HAS_SUBSTRING:
            case protocol_1.OperatorType.TYPE_LOGIC_ALWAYS_TRUE:
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
                let { value, length } = (0, util_1.ulebDecode)(Uint8Array.from(arr));
                arr.splice(0, value + length);
                break;
            case protocol_1.OperatorType.TYPE_DYNAMIC_QUERY:
                result.push('0x' + bcs.de(bcs_1.BCS.ADDRESS, Uint8Array.from(arr)).toString());
                arr.splice(0, 33); // address + cmd
                break;
            default:
                console.error('parse_sense_bsc:undefined');
                console.log(type);
                console.log(arr);
                return false; // error
        }
    }
    return result;
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
            for (let i = 0; i < c.fields.senses.length; i++) {
                let sense = c.fields.senses[i];
                if (sense.type == ((0, protocol_1.OBJECTS_TYPE_PREFIX)()[index] + 'Sense')) { // ...::guard::Sense    
                    let res = parse_sense_bsc(Uint8Array.from(sense.fields.input.fields.bytes));
                    if (res) {
                        let ids = res;
                        param.data = param.data.concat(ids); // DONT array_unique senses                  
                    }
                }
            }
        }
    }
};
exports.rpc_sense_objects_fn = rpc_sense_objects_fn;
