"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.change_permission = exports.deposit = exports.claim = exports.reward_lock_guards = exports.reward_set_description = exports.reward_remove_guard = exports.reward_add_guard = exports.reward_expand_time = exports.reward_refund = exports.destroy = exports.launch = exports.reward = void 0;
const bcs_1 = require("@mysten/bcs");
const protocol_1 = require("./protocol");
function reward(reward_type, txb, permission, description, minutes_duration, passport) {
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('new_with_passport'),
            arguments: [passport, txb.pure((0, protocol_1.description_data)(description)), txb.pure(minutes_duration, bcs_1.BCS.U64),
                txb.object(protocol_1.CLOCK_OBJECT), permission],
            typeArguments: [reward_type]
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('new'),
            arguments: [txb.pure((0, protocol_1.description_data)(description)), txb.pure(minutes_duration, bcs_1.BCS.U64),
                txb.object(protocol_1.CLOCK_OBJECT), permission],
            typeArguments: [reward_type]
        });
    }
}
exports.reward = reward;
function launch(reward_type, txb, reward) {
    return txb.moveCall({
        target: protocol_1.PROTOCOL.RewardFn('create'),
        arguments: [reward],
        typeArguments: [reward_type]
    });
}
exports.launch = launch;
function destroy(reward_type, txb, reward) {
    return txb.moveCall({
        target: protocol_1.PROTOCOL.RewardFn('destroy'),
        arguments: [reward],
    });
}
exports.destroy = destroy;
function reward_refund(reward_type, txb, reward, permission, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('refund_with_passport'),
            arguments: [passport, reward, txb.object(protocol_1.CLOCK_OBJECT), permission],
            typeArguments: [reward_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('refund'),
            arguments: [reward, txb.object(protocol_1.CLOCK_OBJECT), permission],
            typeArguments: [reward_type]
        });
    }
}
exports.reward_refund = reward_refund;
function reward_expand_time(reward_type, txb, reward, permission, minutes_expand, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('time_expand_with_passport'),
            arguments: [passport, reward, txb.pure(minutes_expand, bcs_1.BCS.U64), permission],
            typeArguments: [reward_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('time_expand'),
            arguments: [reward, txb.pure(minutes_expand, bcs_1.BCS.U64), permission],
            typeArguments: [reward_type]
        });
    }
}
exports.reward_expand_time = reward_expand_time;
function reward_add_guard(reward_type, txb, reward, permission, gurads, passport) {
    if (passport) {
        gurads.forEach((guard) => txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('guard_add_with_passport'),
            arguments: [passport, reward, guard.guard, txb.pure(guard.portions, bcs_1.BCS.U64), permission],
            typeArguments: [reward_type]
        }));
    }
    else {
        gurads.forEach((guard) => txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('guard_add'),
            arguments: [reward, guard.guard, txb.pure(guard.portions, bcs_1.BCS.U64), permission],
            typeArguments: [reward_type]
        }));
    }
}
exports.reward_add_guard = reward_add_guard;
function reward_remove_guard(reward_type, txb, reward, permission, guards, removeall, passport) {
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.RewardFn('guard_remove_all_with_passport'),
                arguments: [passport, reward, permission],
                typeArguments: [reward_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.RewardFn('guard_remove_with_passport'),
                arguments: [passport, reward, txb.pure(guards, 'vector<address>'), permission],
                typeArguments: [reward_type]
            });
        }
    }
    else {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.RewardFn('guard_remove_all'),
                arguments: [reward, permission],
                typeArguments: [reward_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.RewardFn('guard_remove'),
                arguments: [reward, txb.pure(guards, 'vector<address>'), permission],
                typeArguments: [reward_type]
            });
        }
    }
}
exports.reward_remove_guard = reward_remove_guard;
function reward_set_description(reward_type, txb, reward, permission, description, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('description_set_with_passport'),
            arguments: [passport, reward, txb.pure((0, protocol_1.description_data)(description)), permission],
            typeArguments: [reward_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('description_set'),
            arguments: [reward, txb.pure((0, protocol_1.description_data)(description)), permission],
            typeArguments: [reward_type]
        });
    }
}
exports.reward_set_description = reward_set_description;
function reward_lock_guards(reward_type, txb, reward, permission, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('guard_lock_with_passport'),
            arguments: [passport, reward, permission],
            typeArguments: [reward_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('guard_lock'),
            arguments: [reward, permission],
            typeArguments: [reward_type]
        });
    }
}
exports.reward_lock_guards = reward_lock_guards;
function claim(reward_type, txb, reward, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('claim_with_passport'),
            arguments: [passport, reward, txb.object(protocol_1.CLOCK_OBJECT)],
            typeArguments: [reward_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('claim_with_passport'),
            arguments: [reward, txb.object(protocol_1.CLOCK_OBJECT)],
            typeArguments: [reward_type]
        });
    }
}
exports.claim = claim;
function deposit(reward_type, txb, reward, reward_objects) {
    txb.moveCall({
        target: protocol_1.PROTOCOL.RewardFn('deposit'),
        arguments: [reward, txb.makeMoveVec({ objects: reward_objects })],
        typeArguments: [reward_type]
    });
}
exports.deposit = deposit;
function change_permission(reward_type, txb, reward, old_permission, new_permission) {
    txb.moveCall({
        target: protocol_1.PROTOCOL.RewardFn('permission_set'),
        arguments: [reward, old_permission, new_permission],
        typeArguments: [reward_type]
    });
}
exports.change_permission = change_permission;
