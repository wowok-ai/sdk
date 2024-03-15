"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hold = exports.next = exports.progress_unhold = exports.progress_set_context_repository = exports.progress_bind_task = exports.progress_set_namedOperator = exports.destroy = exports.launch_as_child = exports.launch = exports.progress = exports.MAX_NAMED_OPERATOR_COUNT = void 0;
const bcs_1 = require("@mysten/bcs");
const protocol_1 = require("./protocol");
exports.MAX_NAMED_OPERATOR_COUNT = 64;
function progress(txb, machine, permission, passport) {
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.ProgressFn('new_with_passport'),
            arguments: [passport, machine, permission],
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.ProgressFn('new'),
            arguments: [machine, permission],
        });
    }
}
exports.progress = progress;
function launch(txb, progress) {
    return txb.moveCall({
        target: protocol_1.PROTOCOL.ProgressFn('create'),
        arguments: [progress],
    });
}
exports.launch = launch;
function launch_as_child(txb, progress, parent, parent_next) {
    return txb.moveCall({
        target: protocol_1.PROTOCOL.ProgressFn('create_as_child'),
        arguments: [progress, parent, txb.pure(parent_next.next_node_name), txb.pure((0, protocol_1.name_data)(parent_next.forward))],
    });
}
exports.launch_as_child = launch_as_child;
function destroy(txb, progress) {
    return txb.moveCall({
        target: protocol_1.PROTOCOL.ProgressFn('destroy'),
        arguments: [progress],
    });
}
exports.destroy = destroy;
function progress_set_namedOperator(txb, machine, permission, progress, name, addresses, passport) {
    if (addresses.length == 0 || name.length == 0 || addresses.length > exports.MAX_NAMED_OPERATOR_COUNT)
        return undefined;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ProgressFn('namedOperator_set_with_passport'),
            arguments: [passport, progress, txb.pure((0, protocol_1.name_data)(name)), txb.pure(addresses, 'vector<address>'),
                machine, permission],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ProgressFn('namedOperator_set'),
            arguments: [progress, txb.pure((0, protocol_1.name_data)(name)), txb.pure(addresses, 'vector<address>'),
                machine, permission],
        });
    }
}
exports.progress_set_namedOperator = progress_set_namedOperator;
function progress_bind_task(txb, machine, permission, progress, task_address, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ProgressFn('task_set_with_passport'),
            arguments: [passport, progress, txb.pure(task_address, bcs_1.BCS.ADDRESS), machine, permission],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ProgressFn('task_set'),
            arguments: [progress, txb.pure(task_address, bcs_1.BCS.ADDRESS), machine, permission],
        });
    }
}
exports.progress_bind_task = progress_bind_task;
function progress_set_context_repository(txb, machine, permission, progress, repository, passport) {
    if (passport) {
        if (repository) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ProgressFn('context_repository_set_with_passport'),
                arguments: [passport, progress, repository, machine, permission],
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ProgressFn('context_repository_none_with_passport'),
                arguments: [passport, progress, machine, permission],
            });
        }
    }
    else {
        if (repository) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ProgressFn('context_repository_set'),
                arguments: [progress, repository, machine, permission],
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ProgressFn('context_repository_none'),
                arguments: [progress, machine, permission],
            });
        }
    }
}
exports.progress_set_context_repository = progress_set_context_repository;
function progress_unhold(txb, machine, permission, progress, next) {
    txb.moveCall({
        target: protocol_1.PROTOCOL.ProgressFn('unhold'),
        arguments: [progress, machine, txb.pure(next.next_node_name), txb.pure((0, protocol_1.name_data)(next.forward)), permission],
    });
}
exports.progress_unhold = progress_unhold;
function next(txb, machine, permission, progress, next, deliverables_address, passport) {
    let diliverable = txb.pure([], bcs_1.BCS.U8);
    if (deliverables_address) {
        diliverable = txb.pure(deliverables_address, bcs_1.BCS.ADDRESS);
    }
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ProgressFn('run_with_passport'),
            arguments: [passport, progress, machine, txb.pure(next.next_node_name),
                txb.pure((0, protocol_1.name_data)(next.forward)), diliverable, permission],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ProgressFn('run'),
            arguments: [progress, machine, txb.pure(next.next_node_name),
                txb.pure((0, protocol_1.name_data)(next.forward)), diliverable, permission],
        });
    }
}
exports.next = next;
function hold(txb, machine, permission, progress, next, hold) {
    txb.moveCall({
        target: protocol_1.PROTOCOL.ProgressFn('hold'),
        arguments: [progress, machine, txb.pure(next.next_node_name),
            txb.pure((0, protocol_1.name_data)(next.forward)), txb.pure(hold, bcs_1.BCS.BOOL), permission],
    });
}
exports.hold = hold;
