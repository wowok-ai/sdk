"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.change_owner = exports.remove_admin = exports.add_admin = exports.set_description = exports.remove_entity = exports.remove_index = exports.add_or_modify = exports.set_guard = exports.add_entity = exports.launch = exports.permission = exports.PermissionIndex = exports.MAX_PERMISSION_INDEX_COUNT = exports.MAX_ENTITY_COUNT = exports.MAX_ADMIN_COUNT = void 0;
const bcs_1 = require("@mysten/bcs");
const protocol_1 = require("./protocol");
const util_1 = require("./util");
exports.MAX_ADMIN_COUNT = 64;
exports.MAX_ENTITY_COUNT = 1024;
exports.MAX_PERMISSION_INDEX_COUNT = 512;
var PermissionIndex;
(function (PermissionIndex) {
    PermissionIndex[PermissionIndex["repository"] = 100] = "repository";
    PermissionIndex[PermissionIndex["repository_set_description_set"] = 101] = "repository_set_description_set";
    PermissionIndex[PermissionIndex["repository_set_policy_mode"] = 102] = "repository_set_policy_mode";
    PermissionIndex[PermissionIndex["repository_add_policies"] = 106] = "repository_add_policies";
    PermissionIndex[PermissionIndex["repository_remove_policies"] = 107] = "repository_remove_policies";
    PermissionIndex[PermissionIndex["repository_set_policy_description"] = 109] = "repository_set_policy_description";
    PermissionIndex[PermissionIndex["repository_set_policy_permission"] = 110] = "repository_set_policy_permission";
    PermissionIndex[PermissionIndex["vote"] = 150] = "vote";
    PermissionIndex[PermissionIndex["vote_set_description"] = 151] = "vote_set_description";
    PermissionIndex[PermissionIndex["vote_set_reference"] = 152] = "vote_set_reference";
    PermissionIndex[PermissionIndex["vote_add_guard"] = 153] = "vote_add_guard";
    PermissionIndex[PermissionIndex["vote_remove_guard"] = 154] = "vote_remove_guard";
    PermissionIndex[PermissionIndex["vote_add_option"] = 155] = "vote_add_option";
    PermissionIndex[PermissionIndex["vote_remove_option"] = 156] = "vote_remove_option";
    PermissionIndex[PermissionIndex["vote_set_max_choice_count"] = 157] = "vote_set_max_choice_count";
    PermissionIndex[PermissionIndex["vote_open_voting"] = 158] = "vote_open_voting";
    PermissionIndex[PermissionIndex["vote_lock_deadline"] = 159] = "vote_lock_deadline";
    PermissionIndex[PermissionIndex["vote_expand_deadline"] = 160] = "vote_expand_deadline";
    PermissionIndex[PermissionIndex["vote_lock_guard"] = 161] = "vote_lock_guard";
    PermissionIndex[PermissionIndex["service"] = 200] = "service";
    PermissionIndex[PermissionIndex["service_set_description"] = 201] = "service_set_description";
    PermissionIndex[PermissionIndex["service_set_price"] = 202] = "service_set_price";
    PermissionIndex[PermissionIndex["service_set_stock"] = 203] = "service_set_stock";
    PermissionIndex[PermissionIndex["service_add_stock"] = 203] = "service_add_stock";
    PermissionIndex[PermissionIndex["service_reduce_stock"] = 203] = "service_reduce_stock";
    PermissionIndex[PermissionIndex["service_set_payee"] = 205] = "service_set_payee";
    PermissionIndex[PermissionIndex["service_repository_add"] = 206] = "service_repository_add";
    PermissionIndex[PermissionIndex["service_repository_remove"] = 207] = "service_repository_remove";
    PermissionIndex[PermissionIndex["service_add_withdraw_guards"] = 208] = "service_add_withdraw_guards";
    PermissionIndex[PermissionIndex["service_remove_withdraw_guards"] = 209] = "service_remove_withdraw_guards";
    PermissionIndex[PermissionIndex["service_add_refund_guards"] = 210] = "service_add_refund_guards";
    PermissionIndex[PermissionIndex["service_remove_refund_guards"] = 211] = "service_remove_refund_guards";
    PermissionIndex[PermissionIndex["service_add_sales"] = 212] = "service_add_sales";
    PermissionIndex[PermissionIndex["service_remove_sales"] = 213] = "service_remove_sales";
    PermissionIndex[PermissionIndex["service_discount_transfer"] = 214] = "service_discount_transfer";
    PermissionIndex[PermissionIndex["service_withdraw"] = 216] = "service_withdraw";
    PermissionIndex[PermissionIndex["service_set_buy_guard"] = 217] = "service_set_buy_guard";
    PermissionIndex[PermissionIndex["service_set_machine"] = 218] = "service_set_machine";
    PermissionIndex[PermissionIndex["service_set_endpoint"] = 219] = "service_set_endpoint";
    PermissionIndex[PermissionIndex["service_publish"] = 220] = "service_publish";
    PermissionIndex[PermissionIndex["service_clone"] = 221] = "service_clone";
    PermissionIndex[PermissionIndex["service_set_customer_required"] = 222] = "service_set_customer_required";
    PermissionIndex[PermissionIndex["service_remove_customer_required"] = 222] = "service_remove_customer_required";
    PermissionIndex[PermissionIndex["service_change_required_pubkey"] = 222] = "service_change_required_pubkey";
    PermissionIndex[PermissionIndex["service_change_order_required_pubkey"] = 224] = "service_change_order_required_pubkey";
    PermissionIndex[PermissionIndex["service_pause"] = 225] = "service_pause";
    PermissionIndex[PermissionIndex["reward"] = 240] = "reward";
    PermissionIndex[PermissionIndex["reward_refund"] = 241] = "reward_refund";
    PermissionIndex[PermissionIndex["reward_expand_time"] = 242] = "reward_expand_time";
    PermissionIndex[PermissionIndex["reward_add_guard"] = 243] = "reward_add_guard";
    PermissionIndex[PermissionIndex["reward_remove_guard"] = 244] = "reward_remove_guard";
    PermissionIndex[PermissionIndex["reward_set_description"] = 245] = "reward_set_description";
    PermissionIndex[PermissionIndex["reward_lock_guards"] = 246] = "reward_lock_guards";
    PermissionIndex[PermissionIndex["demand"] = 260] = "demand";
    PermissionIndex[PermissionIndex["demand_refund"] = 261] = "demand_refund";
    PermissionIndex[PermissionIndex["demand_expand_time"] = 262] = "demand_expand_time";
    PermissionIndex[PermissionIndex["demand_set_guard"] = 263] = "demand_set_guard";
    PermissionIndex[PermissionIndex["demand_set_description"] = 264] = "demand_set_description";
    PermissionIndex[PermissionIndex["demand_yes"] = 265] = "demand_yes";
    PermissionIndex[PermissionIndex["machine"] = 600] = "machine";
    PermissionIndex[PermissionIndex["machine_set_description"] = 601] = "machine_set_description";
    PermissionIndex[PermissionIndex["machine_add_repository"] = 602] = "machine_add_repository";
    PermissionIndex[PermissionIndex["machine_remove_repository"] = 603] = "machine_remove_repository";
    PermissionIndex[PermissionIndex["machine_clone"] = 604] = "machine_clone";
    PermissionIndex[PermissionIndex["machine_add_node"] = 606] = "machine_add_node";
    PermissionIndex[PermissionIndex["machine_add_node2"] = 606] = "machine_add_node2";
    PermissionIndex[PermissionIndex["machine_remove_node"] = 607] = "machine_remove_node";
    PermissionIndex[PermissionIndex["machine_set_endpoint"] = 608] = "machine_set_endpoint";
    PermissionIndex[PermissionIndex["machine_pause"] = 609] = "machine_pause";
    PermissionIndex[PermissionIndex["machine_publish"] = 610] = "machine_publish";
    PermissionIndex[PermissionIndex["progress"] = 650] = "progress";
    PermissionIndex[PermissionIndex["progress_set_namedOperator"] = 651] = "progress_set_namedOperator";
    PermissionIndex[PermissionIndex["progress_bind_task"] = 652] = "progress_bind_task";
    PermissionIndex[PermissionIndex["progress_set_context_repository"] = 653] = "progress_set_context_repository";
    PermissionIndex[PermissionIndex["progress_unhold"] = 654] = "progress_unhold";
})(PermissionIndex || (exports.PermissionIndex = PermissionIndex = {}));
function permission(txb, description) {
    return txb.moveCall({
        target: protocol_1.PROTOCOL.PermissionFn('new'),
        arguments: [txb.pure((0, protocol_1.description_data)(description))]
    });
}
exports.permission = permission;
function launch(txb, permission) {
    return txb.moveCall({
        target: protocol_1.PROTOCOL.PermissionFn('create'),
        arguments: [permission]
    });
}
exports.launch = launch;
function add_entity(txb, permission, entities) {
    let guards = [];
    for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];
        let indexes = [];
        for (let j = 0; j < entity.permissions.length; j++) {
            let index = entity.permissions[j];
            if (index?.guard) {
                guards.push({ who: entity.who, index: index.index, guard: index.guard });
            }
            if (!indexes.includes(index.index)) {
                indexes.push(index.index);
            }
        }
        if (indexes.length > 0) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.PermissionFn('add_batch'),
                arguments: [permission, txb.pure(entity.who, bcs_1.BCS.ADDRESS), txb.pure(indexes, 'vector<u64>')]
            });
        }
    }
    // set guards
    guards.forEach(({ who, index, guard }) => {
        txb.moveCall({
            target: protocol_1.PROTOCOL.PermissionFn('guard_set'),
            arguments: [permission, txb.pure(who, bcs_1.BCS.ADDRESS), txb.pure(index, bcs_1.BCS.U64), (0, protocol_1.TXB_OBJECT)(txb, guard)]
        });
    });
}
exports.add_entity = add_entity;
// guard: undefine to set none
function set_guard(txb, permission, who, index, guard) {
    if (guard) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.PermissionFn('guard_set'),
            arguments: [permission, txb.pure(who, bcs_1.BCS.ADDRESS), txb.pure(index, bcs_1.BCS.U64), (0, protocol_1.TXB_OBJECT)(txb, guard)]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.PermissionFn('guard_none'),
            arguments: [permission, txb.pure(who, bcs_1.BCS.ADDRESS), txb.pure(index, bcs_1.BCS.U64)]
        });
    }
}
exports.set_guard = set_guard;
function add_or_modify(txb, permission, who, index, modifyIfOldExist, guard) {
    if (guard) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.PermissionFn('add_or_modify'),
            arguments: [permission, txb.pure(who, bcs_1.BCS.ADDRESS), txb.pure(index, bcs_1.BCS.U64), (0, protocol_1.TXB_OBJECT)(txb, guard), txb.pure(modifyIfOldExist, bcs_1.BCS.BOOL)]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.PermissionFn('add_or_modify'),
            arguments: [permission, txb.pure(who, bcs_1.BCS.ADDRESS), txb.pure(index, bcs_1.BCS.U64), txb.pure([], bcs_1.BCS.U8), txb.pure(modifyIfOldExist, bcs_1.BCS.BOOL)]
        });
    }
}
exports.add_or_modify = add_or_modify;
function remove_index(txb, permission, who, index) {
    if (index) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.PermissionFn('remove_index'),
            arguments: [permission, txb.pure(who, bcs_1.BCS.ADDRESS), txb.pure(index, 'vector<u64>')]
        });
    }
}
exports.remove_index = remove_index;
function remove_entity(txb, permission, who) {
    if (who) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.PermissionFn('remove'),
            arguments: [permission, txb.pure(who, 'vector<address>')]
        });
    }
}
exports.remove_entity = remove_entity;
function set_description(txb, permission, description) {
    txb.moveCall({
        target: protocol_1.PROTOCOL.PermissionFn('description_set'),
        arguments: [permission, txb.pure((0, protocol_1.description_data)(description))]
    });
}
exports.set_description = set_description;
function add_admin(txb, permission, admin) {
    let n = (0, util_1.array_unique)(admin);
    txb.moveCall({
        target: protocol_1.PROTOCOL.PermissionFn('admin_add_batch'),
        arguments: [permission, txb.pure(n, 'vector<address>')]
    });
}
exports.add_admin = add_admin;
function remove_admin(txb, permission, admin, removeall) {
    if (removeall) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.PermissionFn('admins_clear'),
            arguments: [permission]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.PermissionFn('admin_remove_batch'),
            arguments: [permission, txb.pure(admin, 'vector<address>')]
        });
    }
}
exports.remove_admin = remove_admin;
function change_owner(txb, permission, new_owner) {
    txb.moveCall({
        target: protocol_1.PROTOCOL.PermissionFn('builder_set'),
        arguments: [permission, txb.pure(new_owner, bcs_1.BCS.ADDRESS)]
    });
}
exports.change_owner = change_owner;
