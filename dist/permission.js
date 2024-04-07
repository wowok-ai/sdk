"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.change_owner = exports.remove_admin = exports.add_admin = exports.set_description = exports.remove_entity = exports.remove_index = exports.set_guard = exports.add_entity = exports.destroy = exports.launch = exports.permission = exports.IsValidPermissionIndex = exports.IsValidUserDefinedIndex = exports.PermissionIndex = exports.MAX_PERMISSION_INDEX_COUNT = exports.MAX_ENTITY_COUNT = exports.MAX_ADMIN_COUNT = void 0;
const bcs_1 = require("@mysten/bcs");
const protocol_1 = require("./protocol");
const util_1 = require("./util");
exports.MAX_ADMIN_COUNT = 64;
exports.MAX_ENTITY_COUNT = 2000;
exports.MAX_PERMISSION_INDEX_COUNT = 200;
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
    PermissionIndex[PermissionIndex["user_defined_start"] = 10000] = "user_defined_start";
})(PermissionIndex || (exports.PermissionIndex = PermissionIndex = {}));
const IsValidUserDefinedIndex = (index) => {
    return index >= PermissionIndex.user_defined_start && (0, protocol_1.IsValidUint)(index);
};
exports.IsValidUserDefinedIndex = IsValidUserDefinedIndex;
const IsValidPermissionIndex = (index) => {
    //console.log(index)
    if (Object.values(PermissionIndex).includes(index)) {
        return true;
    }
    //console.log(Object.keys(PermissionIndex))
    return (0, exports.IsValidUserDefinedIndex)(index);
};
exports.IsValidPermissionIndex = IsValidPermissionIndex;
function permission(txb, description) {
    if (!(0, protocol_1.IsValidDesription)(description))
        return false;
    return txb.moveCall({
        target: protocol_1.PROTOCOL.PermissionFn('new'),
        arguments: [txb.pure(description)]
    });
}
exports.permission = permission;
function launch(txb, permission) {
    if (!(0, protocol_1.IsValidObjects)([permission]))
        return false;
    return txb.moveCall({
        target: protocol_1.PROTOCOL.PermissionFn('create'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, permission)]
    });
}
exports.launch = launch;
function destroy(txb, permission) {
    if (!(0, protocol_1.IsValidObjects)([permission]))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.PermissionFn('destroy'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, permission)],
    });
    return true;
}
exports.destroy = destroy;
function add_entity(txb, permission, entities) {
    if (!(0, protocol_1.IsValidObjects)([permission]))
        return false;
    if (!entities)
        return false;
    let bValid = true;
    let e = entities.forEach((v) => {
        if (!(0, protocol_1.IsValidAddress)(v.entity_address))
            bValid = false;
        v.permissions.forEach((p) => {
            if (!(0, exports.IsValidPermissionIndex)(p.index))
                bValid = false;
            if (p?.guard && !(0, protocol_1.IsValidObjects)([p.guard]))
                bValid = false;
        });
    });
    if (!bValid)
        return false;
    let guards = [];
    for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];
        let indexes = [];
        for (let j = 0; j < entity.permissions.length; j++) {
            let index = entity.permissions[j];
            if (!(0, exports.IsValidPermissionIndex)(index.index)) {
                continue;
            }
            if (!indexes.includes(index.index)) {
                indexes.push(index.index);
                if (index?.guard) {
                    guards.push({ entity_address: entity.entity_address, index: index.index, guard: index.guard });
                }
            }
        }
        if (indexes.length > 0) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.PermissionFn('add_batch'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, permission), txb.pure(entity.entity_address, bcs_1.BCS.ADDRESS), txb.pure(indexes, 'vector<u64>')]
            });
        }
    }
    // set guards
    guards.forEach(({ entity_address, index, guard }) => {
        txb.moveCall({
            target: protocol_1.PROTOCOL.PermissionFn('guard_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, permission), txb.pure(entity_address, bcs_1.BCS.ADDRESS), txb.pure(index, bcs_1.BCS.U64), (0, protocol_1.TXB_OBJECT)(txb, guard)]
        });
    });
    return true;
}
exports.add_entity = add_entity;
// guard: undefine to set none
function set_guard(txb, permission, entity_address, index, guard) {
    if (!(0, protocol_1.IsValidObjects)([permission]))
        return false;
    if (!(0, protocol_1.IsValidAddress)(entity_address) || !(0, exports.IsValidPermissionIndex)(index))
        return false;
    if (guard) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.PermissionFn('guard_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, permission), txb.pure(entity_address, bcs_1.BCS.ADDRESS), txb.pure(index, bcs_1.BCS.U64), (0, protocol_1.TXB_OBJECT)(txb, guard)]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.PermissionFn('guard_none'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, permission), txb.pure(entity_address, bcs_1.BCS.ADDRESS), txb.pure(index, bcs_1.BCS.U64)]
        });
    }
    return true;
}
exports.set_guard = set_guard;
function remove_index(txb, permission, entity_address, index) {
    if (!(0, protocol_1.IsValidObjects)([permission]))
        return false;
    if (!(0, protocol_1.IsValidAddress)(entity_address))
        return false;
    if (!index || !((0, protocol_1.IsValidArray)(index, exports.IsValidPermissionIndex)))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.PermissionFn('remove_index'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, permission), txb.pure(entity_address, bcs_1.BCS.ADDRESS), txb.pure((0, util_1.array_unique)(index), 'vector<u64>')]
    });
    return true;
}
exports.remove_index = remove_index;
function remove_entity(txb, permission, entity_address) {
    if (!(0, protocol_1.IsValidObjects)([permission]))
        return false;
    if (!entity_address || !(0, protocol_1.IsValidArray)(entity_address, protocol_1.IsValidAddress))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.PermissionFn('remove'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, permission), txb.pure((0, util_1.array_unique)(entity_address), 'vector<address>')]
    });
    return true;
}
exports.remove_entity = remove_entity;
function set_description(txb, permission, description) {
    if (!(0, protocol_1.IsValidObjects)([permission]))
        return false;
    if (!(0, protocol_1.IsValidDesription)(description))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.PermissionFn('description_set'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, permission), txb.pure(description)]
    });
    return true;
}
exports.set_description = set_description;
function add_admin(txb, permission, admin) {
    if (!(0, protocol_1.IsValidObjects)([permission]))
        return false;
    if (!admin || !(0, protocol_1.IsValidArray)(admin, protocol_1.IsValidAddress))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.PermissionFn('admin_add_batch'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, permission), txb.pure((0, util_1.array_unique)(admin), 'vector<address>')]
    });
    return true;
}
exports.add_admin = add_admin;
function remove_admin(txb, permission, admin, removeall) {
    if (!(0, protocol_1.IsValidObjects)([permission]))
        return false;
    if (!removeall && !admin)
        return false;
    if (!(0, protocol_1.IsValidArray)(admin, protocol_1.IsValidAddress))
        return false;
    if (removeall) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.PermissionFn('admins_clear'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    else if (admin) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.PermissionFn('admin_remove_batch'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, permission), txb.pure((0, util_1.array_unique)(admin), 'vector<address>')]
        });
    }
    return true;
}
exports.remove_admin = remove_admin;
function change_owner(txb, permission, new_owner) {
    if (!(0, protocol_1.IsValidObjects)([permission]))
        return false;
    if (!(0, protocol_1.IsValidAddress)(new_owner))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.PermissionFn('builder_set'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, permission), txb.pure(new_owner, bcs_1.BCS.ADDRESS)]
    });
    return true;
}
exports.change_owner = change_owner;
