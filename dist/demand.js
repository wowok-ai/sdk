"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.change_permission = exports.present = exports.deposit = exports.demand_yes = exports.demand_set_description = exports.demand_set_guard = exports.demand_expand_time = exports.demand_refund = exports.destroy = exports.launch = exports.demand = exports.MAX_PRESENTERS_COUNT = exports.MAX_EARNEST_COUNT = void 0;
const bcs_1 = require("@mysten/bcs");
const protocol_1 = require("./protocol");
exports.MAX_EARNEST_COUNT = 200;
exports.MAX_PRESENTERS_COUNT = 200;
function demand(earnest_type, txb, permission, description, earnest, passport) {
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('new_with_passport'),
            arguments: [passport, txb.pure((0, protocol_1.description_data)(description)), earnest, permission],
            typeArguments: [earnest_type],
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('new'),
            arguments: [txb.pure((0, protocol_1.description_data)(description)), earnest, permission],
            typeArguments: [earnest_type],
        });
    }
}
exports.demand = demand;
function launch(earnest_type, txb, demand) {
    return txb.moveCall({
        target: protocol_1.PROTOCOL.DemandFn('create'),
        arguments: [demand],
        typeArguments: [earnest_type],
    });
}
exports.launch = launch;
function destroy(earnest_type, txb, demand) {
    return txb.moveCall({
        target: protocol_1.PROTOCOL.DemandFn('destroy'),
        arguments: [demand],
        typeArguments: [earnest_type]
    });
}
exports.destroy = destroy;
function demand_refund(earnest_type, txb, demand, permission, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('refund_with_passport'),
            arguments: [passport, demand, txb.object(protocol_1.CLOCK_OBJECT), permission],
            typeArguments: [earnest_type],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('refund'),
            arguments: [demand, txb.object(protocol_1.CLOCK_OBJECT), permission],
            typeArguments: [earnest_type],
        });
    }
}
exports.demand_refund = demand_refund;
function demand_expand_time(earnest_type, txb, demand, permission, minutes_duration, passport) {
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('time_expand_with_passport'),
            arguments: [passport, demand, txb.pure(minutes_duration, bcs_1.BCS.U64), txb.object(protocol_1.CLOCK_OBJECT), permission],
            typeArguments: [earnest_type],
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('time_expand'),
            arguments: [demand, txb.pure(minutes_duration, bcs_1.BCS.U64), txb.object(protocol_1.CLOCK_OBJECT), permission],
            typeArguments: [earnest_type],
        });
    }
}
exports.demand_expand_time = demand_expand_time;
function demand_set_guard(earnest_type, txb, demand, permission, guard, passport) {
    if (passport) {
        if (guard) {
            return txb.moveCall({
                target: protocol_1.PROTOCOL.DemandFn('guard_set_with_passport'),
                arguments: [passport, demand, guard, permission],
                typeArguments: [earnest_type],
            });
        }
        else {
            return txb.moveCall({
                target: protocol_1.PROTOCOL.DemandFn('guard_none_with_passport'),
                arguments: [passport, demand, permission],
                typeArguments: [earnest_type],
            });
        }
    }
    else {
        if (guard) {
            return txb.moveCall({
                target: protocol_1.PROTOCOL.DemandFn('guard_set'),
                arguments: [demand, guard, permission],
                typeArguments: [earnest_type],
            });
        }
        else {
            return txb.moveCall({
                target: protocol_1.PROTOCOL.DemandFn('guard_none'),
                arguments: [demand, permission],
                typeArguments: [earnest_type],
            });
        }
    }
}
exports.demand_set_guard = demand_set_guard;
function demand_set_description(earnest_type, txb, demand, permission, description, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('description_set_with_passport'),
            arguments: [passport, demand, txb.pure((0, protocol_1.description_data)(description)), permission],
            typeArguments: [earnest_type],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('description_set'),
            arguments: [demand, txb.pure((0, protocol_1.description_data)(description)), permission],
            typeArguments: [earnest_type],
        });
    }
}
exports.demand_set_description = demand_set_description;
function demand_yes(earnest_type, txb, demand, permission, service, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('yes_with_passport'),
            arguments: [passport, demand, txb.pure(service, bcs_1.BCS.ADDRESS), permission],
            typeArguments: [earnest_type],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('yes'),
            arguments: [demand, txb.pure(service, bcs_1.BCS.ADDRESS), permission],
            typeArguments: [earnest_type],
        });
    }
}
exports.demand_yes = demand_yes;
function deposit(earnest_type, txb, demand, earnest) {
    return txb.moveCall({
        target: protocol_1.PROTOCOL.DemandFn('deposit'),
        arguments: [demand, txb.makeMoveVec({ objects: earnest })],
        typeArguments: [earnest_type],
    });
}
exports.deposit = deposit;
function present(earnest_type, service_type, txb, demand, service, tips, passport) {
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('present_with_passport'),
            arguments: [passport, demand, service, txb.pure((0, protocol_1.description_data)(tips)),],
            typeArguments: [earnest_type, service_type],
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.DemandFn('present'),
            arguments: [demand, service, txb.pure((0, protocol_1.description_data)(tips)),],
            typeArguments: [earnest_type, service_type],
        });
    }
}
exports.present = present;
function change_permission(earnest_type, txb, demand, old_permission, new_permission) {
    txb.moveCall({
        target: protocol_1.PROTOCOL.DemandFn('permission_set'),
        arguments: [demand, old_permission, new_permission],
        typeArguments: [earnest_type]
    });
}
exports.change_permission = change_permission;
