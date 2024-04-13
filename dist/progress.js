"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hold = exports.next = exports.progress_parent = exports.progress_unhold = exports.progress_set_context_repository = exports.progress_bind_task = exports.progress_set_namedOperator = exports.destroy = exports.launch_as_child = exports.launch = exports.progress = exports.MAX_NAMED_OPERATOR_COUNT = void 0;
const bcs_1 = require("@mysten/bcs");
const protocol_1 = require("./protocol");
const utils_1 = require("./utils");
exports.MAX_NAMED_OPERATOR_COUNT = 100;
function progress(txb, machine, permission, passport) {
    if (!(0, protocol_1.IsValidObjects)([machine, permission]))
        return false;
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.ProgressFn('new_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.ProgressFn('new'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
}
exports.progress = progress;
function launch(txb, progress) {
    if (!(0, protocol_1.IsValidObjects)([progress]))
        return false;
    return txb.moveCall({
        target: protocol_1.PROTOCOL.ProgressFn('create'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, progress)],
    });
}
exports.launch = launch;
function launch_as_child(txb, progress, parent, parent_next) {
    if (!(0, protocol_1.IsValidObjects)([progress, parent]))
        return false;
    if (!IsValidProgressNext(parent_next))
        return false;
    return txb.moveCall({
        target: protocol_1.PROTOCOL.ProgressFn('create_as_child'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, progress), (0, protocol_1.TXB_OBJECT)(txb, parent), txb.pure(parent_next.next_node_name), txb.pure(parent_next.forward)],
    });
}
exports.launch_as_child = launch_as_child;
function destroy(txb, progress) {
    if (!(0, protocol_1.IsValidObjects)([progress]))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.ProgressFn('destroy'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, progress)],
    });
    return true;
}
exports.destroy = destroy;
function progress_set_namedOperator(txb, machine, permission, progress, name, addresses, passport) {
    if (!(0, protocol_1.IsValidObjects)([machine, permission, progress]))
        return false;
    if (!(0, protocol_1.IsValidName)(name))
        return false;
    if (!addresses || addresses.length > exports.MAX_NAMED_OPERATOR_COUNT)
        return false;
    if (!(0, protocol_1.IsValidArray)(addresses, protocol_1.IsValidAddress))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ProgressFn('namedOperator_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, progress), txb.pure(name), txb.pure((0, utils_1.array_unique)(addresses), 'vector<address>'),
                (0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ProgressFn('namedOperator_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, progress), txb.pure(name), txb.pure((0, utils_1.array_unique)(addresses), 'vector<address>'),
                (0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    return true;
}
exports.progress_set_namedOperator = progress_set_namedOperator;
function progress_bind_task(txb, machine, permission, progress, task_address, passport) {
    if (!(0, protocol_1.IsValidObjects)([machine, permission, progress]))
        return false;
    if (!(0, protocol_1.IsValidAddress)(task_address))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ProgressFn('task_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, progress), txb.pure(task_address, bcs_1.BCS.ADDRESS), (0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ProgressFn('task_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, progress), txb.pure(task_address, bcs_1.BCS.ADDRESS), (0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    return true;
}
exports.progress_bind_task = progress_bind_task;
function progress_set_context_repository(txb, machine, permission, progress, repository, passport) {
    if (!(0, protocol_1.IsValidObjects)([machine, permission, progress]))
        return false;
    if (passport) {
        if (repository) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ProgressFn('context_repository_set_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, progress), (0, protocol_1.TXB_OBJECT)(txb, repository), (0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ProgressFn('context_repository_none_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, progress), (0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            });
        }
    }
    else {
        if (repository) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ProgressFn('context_repository_set'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, progress), (0, protocol_1.TXB_OBJECT)(txb, repository), (0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ProgressFn('context_repository_none'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, progress), (0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            });
        }
    }
    return true;
}
exports.progress_set_context_repository = progress_set_context_repository;
function progress_unhold(txb, machine, permission, progress, next, passport) {
    if (!(0, protocol_1.IsValidObjects)([machine, permission, progress]))
        return false;
    if (!IsValidProgressNext(next))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ProgressFn('unhold_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, progress), (0, protocol_1.TXB_OBJECT)(txb, machine), txb.pure(next.next_node_name), txb.pure(next.forward), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ProgressFn('unhold'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, progress), (0, protocol_1.TXB_OBJECT)(txb, machine), txb.pure(next.next_node_name), txb.pure(next.forward), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    return true;
}
exports.progress_unhold = progress_unhold;
function progress_parent(txb, machine, permission, progress, parent_progress, passport) {
    if (!(0, protocol_1.IsValidObjects)([machine, permission, progress]))
        return false;
    if (parent_progress && (!(0, protocol_1.IsValidAddress)(parent_progress.parent_progress_id) || !(0, protocol_1.IsValidInt)(parent_progress.parent_session_id)))
        return false;
    if (passport) {
        if (parent_progress) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ProgressFn('parent_set_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, progress), (0, protocol_1.TXB_OBJECT)(txb, machine), txb.pure(parent_progress.parent_progress_id, bcs_1.BCS.ADDRESS),
                    txb.pure(parent_progress.parent_session_id, bcs_1.BCS.U64), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ProgressFn('parent_none_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, progress), (0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            });
        }
    }
    else {
        if (parent_progress) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ProgressFn('parent_set'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, progress), (0, protocol_1.TXB_OBJECT)(txb, machine), txb.pure(parent_progress.parent_progress_id, bcs_1.BCS.ADDRESS),
                    txb.pure(parent_progress.parent_session_id, bcs_1.BCS.U64), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ProgressFn('parent_none'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, progress), (0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            });
        }
    }
    return true;
}
exports.progress_parent = progress_parent;
function IsValidProgressNext(next) {
    return (0, protocol_1.IsValidName)(next.forward) && (0, protocol_1.IsValidName)(next.next_node_name);
}
function next(txb, machine, permission, progress, next, deliverables_address, sub_progress_id, passport) {
    if (!(0, protocol_1.IsValidObjects)([machine, permission, progress]))
        return false;
    if (!IsValidProgressNext(next))
        return false;
    if (deliverables_address && !(0, protocol_1.IsValidAddress)(deliverables_address))
        return false;
    if (sub_progress_id && !(0, protocol_1.IsValidAddress)(sub_progress_id))
        return false;
    let diliverable = deliverables_address ? txb.pure(utils_1.BCS_CONVERT.ser_option_address(deliverables_address)) : (0, protocol_1.OptionNone)(txb);
    let sub = sub_progress_id ? txb.pure(utils_1.BCS_CONVERT.ser_option_address(sub_progress_id)) : (0, protocol_1.OptionNone)(txb);
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ProgressFn('next_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, progress), (0, protocol_1.TXB_OBJECT)(txb, machine), txb.pure(next.next_node_name, bcs_1.BCS.STRING),
                txb.pure(next.forward, bcs_1.BCS.STRING), diliverable, sub, (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ProgressFn('next'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, progress), (0, protocol_1.TXB_OBJECT)(txb, machine), txb.pure(next.next_node_name, bcs_1.BCS.STRING),
                txb.pure(next.forward, bcs_1.BCS.STRING), diliverable, sub, (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    return true;
}
exports.next = next;
function hold(txb, machine, permission, progress, next, hold) {
    if (!(0, protocol_1.IsValidObjects)([machine, permission, progress]))
        return false;
    if (!IsValidProgressNext(next))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.ProgressFn('hold'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, progress), (0, protocol_1.TXB_OBJECT)(txb, machine), txb.pure(next.next_node_name),
            txb.pure(next.forward), txb.pure(hold, bcs_1.BCS.BOOL), (0, protocol_1.TXB_OBJECT)(txb, permission)],
    });
    return true;
}
exports.hold = hold;
