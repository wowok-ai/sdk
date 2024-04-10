"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.change_permission = exports.deposit = exports.claim = exports.reward_lock_guards = exports.reward_set_description = exports.allow_repeat_claim = exports.reward_remove_guard = exports.reward_add_guard = exports.MAX_PORTIONS_COUNT = exports.reward_expand_time = exports.reward_refund = exports.destroy = exports.launch = exports.reward = void 0;
const bcs_1 = require("@mysten/bcs");
const protocol_1 = require("./protocol");
const util_1 = require("./util");
function reward(reward_type, txb, permission, description, minutes_duration, passport) {
    if (!(0, protocol_1.IsValidObjects)([permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(reward_type))
        return false;
    if (!(0, protocol_1.IsValidDesription)(description))
        return false;
    if (!(0, protocol_1.IsValidUint)(minutes_duration))
        return false;
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('new_with_passport'),
            arguments: [passport, txb.pure(description), txb.pure(minutes_duration, bcs_1.BCS.U64),
                txb.object(protocol_1.CLOCK_OBJECT), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [reward_type]
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('new'),
            arguments: [txb.pure(description), txb.pure(minutes_duration, bcs_1.BCS.U64),
                txb.object(protocol_1.CLOCK_OBJECT), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [reward_type]
        });
    }
}
exports.reward = reward;
function launch(reward_type, txb, reward) {
    if (!(0, protocol_1.IsValidObjects)([reward]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(reward_type))
        return false;
    return txb.moveCall({
        target: protocol_1.PROTOCOL.RewardFn('create'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, reward)],
        typeArguments: [reward_type]
    });
}
exports.launch = launch;
function destroy(reward_type, txb, reward) {
    if (!(0, protocol_1.IsValidObjects)([reward]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(reward_type))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.RewardFn('destroy'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, reward)],
    });
    return true;
}
exports.destroy = destroy;
function reward_refund(reward_type, txb, reward, permission, passport) {
    if (!(0, protocol_1.IsValidObjects)([reward, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(reward_type))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('refund_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, reward), txb.object(protocol_1.CLOCK_OBJECT), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [reward_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('refund'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, reward), txb.object(protocol_1.CLOCK_OBJECT), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [reward_type]
        });
    }
    return true;
}
exports.reward_refund = reward_refund;
function reward_expand_time(reward_type, txb, reward, permission, minutes_expand, passport) {
    if (!(0, protocol_1.IsValidObjects)([reward, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(reward_type))
        return false;
    if (!(0, protocol_1.IsValidUint)(minutes_expand))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('time_expand_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, reward), txb.pure(minutes_expand, bcs_1.BCS.U64), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [reward_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('time_expand'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, reward), txb.pure(minutes_expand, bcs_1.BCS.U64), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [reward_type]
        });
    }
    return true;
}
exports.reward_expand_time = reward_expand_time;
exports.MAX_PORTIONS_COUNT = 255;
function reward_add_guard(reward_type, txb, reward, permission, gurads, passport) {
    if (!(0, protocol_1.IsValidObjects)([reward, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(reward_type))
        return false;
    if (!gurads)
        return false;
    let bValid = true;
    gurads.forEach((v) => {
        if (!(0, protocol_1.IsValidUint)(v.portions) || v.portions > exports.MAX_PORTIONS_COUNT)
            bValid = false;
        if (!(0, protocol_1.IsValidObjects)([v.guard]))
            bValid = false;
    });
    if (!bValid)
        return false;
    if (passport) {
        gurads.forEach((guard) => txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('guard_add_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, reward), (0, protocol_1.TXB_OBJECT)(txb, guard.guard), txb.pure(guard.portions, bcs_1.BCS.U8), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [reward_type]
        }));
    }
    else {
        gurads.forEach((guard) => txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('guard_add'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, reward), (0, protocol_1.TXB_OBJECT)(txb, guard.guard), txb.pure(guard.portions, bcs_1.BCS.U8), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [reward_type]
        }));
    }
    return true;
}
exports.reward_add_guard = reward_add_guard;
function reward_remove_guard(reward_type, txb, reward, permission, guards, removeall, passport) {
    if (!(0, protocol_1.IsValidObjects)([reward, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(reward_type))
        return false;
    if (!removeall && !guards)
        return false;
    if (guards && !(0, protocol_1.IsValidArray)(guards, protocol_1.IsValidAddress))
        return false;
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.RewardFn('guard_remove_all_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, reward), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [reward_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.RewardFn('guard_remove_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, reward), txb.pure((0, util_1.array_unique)(guards), 'vector<address>'), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [reward_type]
            });
        }
    }
    else {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.RewardFn('guard_remove_all'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, reward), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [reward_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.RewardFn('guard_remove'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, reward), txb.pure(guards, 'vector<address>'), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [reward_type]
            });
        }
    }
    return true;
}
exports.reward_remove_guard = reward_remove_guard;
function allow_repeat_claim(reward_type, txb, reward, permission, allow_repeat_claim, passport) {
    if (!(0, protocol_1.IsValidObjects)([reward, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(reward_type))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('allow_repeat_claim_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, reward), (0, protocol_1.TXB_OBJECT)(txb, permission), txb.pure(allow_repeat_claim, bcs_1.BCS.BOOL)],
            typeArguments: [reward_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('allow_repeat_claim'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, reward), (0, protocol_1.TXB_OBJECT)(txb, permission), txb.pure(allow_repeat_claim, bcs_1.BCS.BOOL)],
            typeArguments: [reward_type]
        });
    }
    return true;
}
exports.allow_repeat_claim = allow_repeat_claim;
function reward_set_description(reward_type, txb, reward, permission, description, passport) {
    if (!(0, protocol_1.IsValidObjects)([reward, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(reward_type))
        return false;
    if (!(0, protocol_1.IsValidDesription)(description))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('description_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, reward), txb.pure(description), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [reward_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('description_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, reward), txb.pure(description), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [reward_type]
        });
    }
    return true;
}
exports.reward_set_description = reward_set_description;
function reward_lock_guards(reward_type, txb, reward, permission, passport) {
    if (!(0, protocol_1.IsValidObjects)([reward, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(reward_type))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('guard_lock_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, reward), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [reward_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('guard_lock'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, reward), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [reward_type]
        });
    }
    return true;
}
exports.reward_lock_guards = reward_lock_guards;
function claim(reward_type, txb, reward, passport) {
    if (!(0, protocol_1.IsValidObjects)([reward]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(reward_type))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('claim_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, reward), txb.object(protocol_1.CLOCK_OBJECT)],
            typeArguments: [reward_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RewardFn('claim'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, reward), txb.object(protocol_1.CLOCK_OBJECT)],
            typeArguments: [reward_type]
        });
    }
    return true;
}
exports.claim = claim;
function deposit(reward_type, txb, reward, rewards) {
    if (!(0, protocol_1.IsValidObjects)([reward]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(reward_type))
        return false;
    if (!rewards && !(0, protocol_1.IsValidObjects)(rewards))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.RewardFn('deposit'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, reward), txb.makeMoveVec({ objects: (0, util_1.array_unique)(rewards) })],
        typeArguments: [reward_type]
    });
    return true;
}
exports.deposit = deposit;
function change_permission(reward_type, txb, reward, old_permission, new_permission) {
    if (!(0, protocol_1.IsValidObjects)([reward, old_permission, new_permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(reward_type))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.RewardFn('permission_set'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, reward), (0, protocol_1.TXB_OBJECT)(txb, old_permission), (0, protocol_1.TXB_OBJECT)(txb, new_permission)],
        typeArguments: [reward_type]
    });
    return true;
}
exports.change_permission = change_permission;
