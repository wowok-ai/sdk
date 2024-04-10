"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.change_permission = exports.present = exports.deposit = exports.demand_yes = exports.demand_set_description = exports.demand_set_guard = exports.demand_expand_time = exports.demand_refund = exports.destroy = exports.launch = exports.demand = exports.MAX_PRESENTERS_COUNT = exports.MAX_EARNEST_COUNT = void 0;
const bcs_1 = require("@mysten/bcs");
const protocol_1 = require("./protocol");
exports.MAX_EARNEST_COUNT = 200;
exports.MAX_PRESENTERS_COUNT = 200;
function demand(earnest_type, txb, permission, description, earnest, passport) {
    if (!(0, protocol_1.IsValidObjects)([permission, earnest]))
        return false;
    if (!(0, protocol_1.IsValidDesription)(description) || !(0, protocol_1.IsValidArgType)(earnest_type))
        return false;
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('new_with_passport'),
            arguments: [passport, txb.pure(description), earnest, (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [earnest_type],
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('new'),
            arguments: [txb.pure(description), earnest, (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [earnest_type],
        });
    }
}
exports.demand = demand;
function launch(earnest_type, txb, demand) {
    if (!(0, protocol_1.IsValidObjects)([demand]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(earnest_type))
        return false;
    return txb.moveCall({
        target: protocol_1.PROTOCOL.DemandFn('create'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, demand)],
        typeArguments: [earnest_type],
    });
}
exports.launch = launch;
function destroy(earnest_type, txb, demand) {
    if (!(0, protocol_1.IsValidObjects)([demand]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(earnest_type))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.DemandFn('destroy'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, demand)],
        typeArguments: [earnest_type]
    });
    return true;
}
exports.destroy = destroy;
function demand_refund(earnest_type, txb, demand, permission, passport) {
    if (!(0, protocol_1.IsValidObjects)([demand, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(earnest_type))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('refund_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, demand), txb.object(protocol_1.CLOCK_OBJECT), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [earnest_type],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('refund'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, demand), txb.object(protocol_1.CLOCK_OBJECT), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [earnest_type],
        });
    }
    return true;
}
exports.demand_refund = demand_refund;
function demand_expand_time(earnest_type, txb, demand, permission, minutes_duration, passport) {
    if (!(0, protocol_1.IsValidObjects)([demand, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(earnest_type))
        return false;
    if (!(0, protocol_1.IsValidUint)(minutes_duration))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('time_expand_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, demand), txb.pure(minutes_duration, bcs_1.BCS.U64), txb.object(protocol_1.CLOCK_OBJECT), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [earnest_type],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('time_expand'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, demand), txb.pure(minutes_duration, bcs_1.BCS.U64), txb.object(protocol_1.CLOCK_OBJECT), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [earnest_type],
        });
    }
    return true;
}
exports.demand_expand_time = demand_expand_time;
function demand_set_guard(earnest_type, txb, demand, permission, guard, passport) {
    if (!(0, protocol_1.IsValidObjects)([demand, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(earnest_type))
        return false;
    if (passport) {
        if (guard) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.DemandFn('guard_set_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, demand), (0, protocol_1.TXB_OBJECT)(txb, guard), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [earnest_type],
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.DemandFn('guard_none_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, demand), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [earnest_type],
            });
        }
    }
    else {
        if (guard) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.DemandFn('guard_set'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, demand), (0, protocol_1.TXB_OBJECT)(txb, guard), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [earnest_type],
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.DemandFn('guard_none'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, demand), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [earnest_type],
            });
        }
    }
    return true;
}
exports.demand_set_guard = demand_set_guard;
function demand_set_description(earnest_type, txb, demand, permission, description, passport) {
    if (!(0, protocol_1.IsValidObjects)([demand, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(earnest_type))
        return false;
    if (!(0, protocol_1.IsValidDesription)(description))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('description_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, demand), txb.pure(description), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [earnest_type],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('description_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, demand), txb.pure(description), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [earnest_type],
        });
    }
    return true;
}
exports.demand_set_description = demand_set_description;
function demand_yes(earnest_type, txb, demand, permission, service, passport) {
    if (!(0, protocol_1.IsValidObjects)([demand, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(earnest_type))
        return false;
    if (!(0, protocol_1.IsValidAddress)(service))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('yes_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, demand), txb.pure(service, bcs_1.BCS.ADDRESS), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [earnest_type],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('yes'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, demand), txb.pure(service, bcs_1.BCS.ADDRESS), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [earnest_type],
        });
    }
    return true;
}
exports.demand_yes = demand_yes;
function deposit(earnest_type, txb, demand, earnest) {
    if (!(0, protocol_1.IsValidObjects)([demand, earnest]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(earnest_type))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.DemandFn('deposit'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, demand), (0, protocol_1.TXB_OBJECT)(txb, earnest)],
        typeArguments: [earnest_type],
    });
    return true;
}
exports.deposit = deposit;
function present(earnest_type, service_type, txb, demand, service, tips, passport) {
    if (!(0, protocol_1.IsValidObjects)([demand, service]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(earnest_type))
        return false;
    if (!(0, protocol_1.IsValidDesription)(tips))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('present_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, demand), (0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(tips, bcs_1.BCS.STRING),],
            typeArguments: [earnest_type, service_type],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('present'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, demand), (0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(tips, bcs_1.BCS.STRING),],
            typeArguments: [earnest_type, service_type],
        });
    }
    return true;
}
exports.present = present;
function change_permission(earnest_type, txb, demand, old_permission, new_permission) {
    if (!(0, protocol_1.IsValidObjects)([demand, old_permission, new_permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(earnest_type))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.DemandFn('permission_set'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, demand), (0, protocol_1.TXB_OBJECT)(txb, old_permission), (0, protocol_1.TXB_OBJECT)(txb, new_permission)],
        typeArguments: [earnest_type]
    });
    return true;
}
exports.change_permission = change_permission;
