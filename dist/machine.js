"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.change_permission = exports.machine_publish = exports.machine_pause = exports.machine_set_endpoint = exports.machine_clone = exports.machine_remove_repository = exports.machine_add_repository = exports.machine_set_description = exports.launch = exports.destroy = exports.machine = exports.machine_remove_node = exports.machine_add_node2 = exports.machine_add_node = exports.namedOperator_ORDER_PAYER = exports.INITIAL_NODE_NAME = void 0;
const bcs_1 = require("@mysten/bcs");
const protocol_1 = require("./protocol");
const utils_1 = require("./utils");
const permission_1 = require("./permission");
exports.INITIAL_NODE_NAME = '';
exports.namedOperator_ORDER_PAYER = 'order payer';
// create new nodes for machine
function machine_add_node(txb, machine, permission, nodes, passport) {
    if (!(0, protocol_1.IsValidObjects)([machine, permission]))
        return false;
    let bValid = true;
    nodes.forEach((node) => {
        if (!(0, protocol_1.IsValidDesription)(node.description) || !(0, protocol_1.IsValidName)(node.name)) {
            bValid = false;
        }
        node.pairs.forEach((p) => {
            if (!(0, protocol_1.IsValidName_AllowEmpty)(p.prior_node)) {
                bValid = false;
            }
            if (p?.threshold && !(0, protocol_1.IsValidInt)(p.threshold)) {
                bValid = false;
            }
            p.forwards.forEach((f) => {
                if (!(0, protocol_1.IsValidName)(f.name)) {
                    bValid = false;
                }
                if (f?.namedOperator && !(0, protocol_1.IsValidName_AllowEmpty)(f?.namedOperator)) {
                    bValid = false;
                }
                if (f?.permission && !(0, permission_1.IsValidPermissionIndex)(f?.permission)) {
                    bValid = false;
                }
                if (!f?.permission && !f?.namedOperator) {
                    bValid = false;
                }
                if (f?.weight && !(0, protocol_1.IsValidUint)(f.weight)) {
                    bValid = false;
                }
            });
        });
    });
    if (!bValid)
        return false;
    let new_nodes = [];
    nodes.forEach((node) => {
        let n = txb.moveCall({
            target: protocol_1.PROTOCOL.NodeFn('new'),
            arguments: [txb.pure(node.name), txb.pure(node.description)]
        });
        node.pairs.forEach((pair) => {
            let threshold = pair?.threshold ? txb.pure(utils_1.BCS_CONVERT.ser_option_u64(pair.threshold)) : (0, protocol_1.OptionNone)(txb);
            pair.forwards.forEach((forward) => {
                let weight = forward?.weight ? forward.weight : 1;
                let perm = forward?.permission ? txb.pure(utils_1.BCS_CONVERT.ser_option_u64(forward.permission)) : (0, protocol_1.OptionNone)(txb);
                let namedOperator = forward?.namedOperator ? txb.pure(forward.namedOperator) : txb.pure('');
                let f;
                if (forward?.guard) {
                    f = txb.moveCall({
                        target: protocol_1.PROTOCOL.NodeFn('forward'),
                        arguments: [namedOperator, txb.pure(weight), txb.object((0, protocol_1.TXB_OBJECT)(txb, forward.guard)), perm]
                    });
                }
                else {
                    f = txb.moveCall({
                        target: protocol_1.PROTOCOL.NodeFn('forward2'),
                        arguments: [namedOperator, txb.pure(weight), perm]
                    });
                }
                txb.moveCall({
                    target: protocol_1.PROTOCOL.NodeFn('forward_add'),
                    arguments: [n, txb.pure(pair.prior_node), txb.pure(forward.name), threshold, f]
                });
            });
        });
        new_nodes.push(n);
    });
    return machine_add_node2(txb, machine, permission, new_nodes, passport);
}
exports.machine_add_node = machine_add_node;
// move MachineNodeObject to the machine from signer-owned MachineNode object 
function machine_add_node2(txb, machine, permission, nodes, passport) {
    if (!(0, protocol_1.IsValidObjects)([machine, permission]))
        return false;
    if (!nodes)
        return false;
    let n = [];
    (0, utils_1.array_unique)(nodes).forEach((v) => {
        n.push((0, protocol_1.TXB_OBJECT)(txb, v));
    });
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('node_add_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, machine), txb.makeMoveVec({ objects: n }), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('node_add'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, machine), txb.makeMoveVec({ objects: n }), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    return true;
}
exports.machine_add_node2 = machine_add_node2;
// move MachineNodeObject from machine to signer-owned MachineNode object 
function machine_remove_node(txb, machine, permission, nodes_name, bTransferMyself = false, passport) {
    if (!(0, protocol_1.IsValidObjects)([machine, permission]))
        return false;
    if (!nodes_name || !(0, protocol_1.IsValidArray)(nodes_name, protocol_1.IsValidName))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('node_remove_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, machine), txb.pure(utils_1.BCS_CONVERT.ser_vector_string(nodes_name)),
                txb.pure(bTransferMyself, bcs_1.BCS.BOOL), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('node_remove'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, machine), txb.pure(utils_1.BCS_CONVERT.ser_vector_string(nodes_name)), txb.pure(bTransferMyself, bcs_1.BCS.BOOL), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    return true;
}
exports.machine_remove_node = machine_remove_node;
function machine(txb, permission, description, endpoint, passport) {
    if (!(0, protocol_1.IsValidObjects)([permission]))
        return false;
    if (!(0, protocol_1.IsValidDesription)(description))
        return false;
    if (endpoint && !(0, protocol_1.IsValidEndpoint)(endpoint))
        return false;
    let ep = endpoint ? txb.pure(utils_1.BCS_CONVERT.ser_option_string(endpoint)) : (0, protocol_1.OptionNone)(txb);
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('new_with_passport'),
            arguments: [passport, txb.pure(description), ep, (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('new'),
            arguments: [txb.pure(description), ep, (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
}
exports.machine = machine;
function destroy(txb, machine) {
    if (!(0, protocol_1.IsValidObjects)([machine]))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.MachineFn('destroy'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, machine)],
    });
    return true;
}
exports.destroy = destroy;
function launch(txb, machine) {
    if (!(0, protocol_1.IsValidObjects)([machine]))
        return false;
    return txb.moveCall({
        target: protocol_1.PROTOCOL.MachineFn('create'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, machine)],
    });
}
exports.launch = launch;
function machine_set_description(txb, machine, permission, description, passport) {
    if (!(0, protocol_1.IsValidObjects)([machine, permission]))
        return false;
    if (!(0, protocol_1.IsValidDesription)(description))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('description_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, machine), txb.pure(description), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('description_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, machine), txb.pure(description), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    return true;
}
exports.machine_set_description = machine_set_description;
function machine_add_repository(txb, machine, permission, repository, passport) {
    if (!(0, protocol_1.IsValidObjects)([machine, permission, repository]))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('repository_add_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, repository), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('repository_add'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, repository), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    return true;
}
exports.machine_add_repository = machine_add_repository;
function machine_remove_repository(txb, machine, permission, repositories, removeall, passport) {
    if (!(0, protocol_1.IsValidObjects)([machine, permission]))
        return false;
    if (!removeall && !repositories)
        return false;
    if (!(0, protocol_1.IsValidArray)(repositories, protocol_1.IsValidAddress))
        return false;
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.MachineFn('repository_remove_all_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, machine)],
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.MachineFn('repository_remove_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, machine), txb.pure(repositories, 'vector<address>'), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            });
        }
    }
    else {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.MachineFn('repository_remove_all'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.MachineFn('repository_remove'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, machine), txb.pure(repositories, 'vector<address>'), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            });
        }
    }
    return true;
}
exports.machine_remove_repository = machine_remove_repository;
function machine_clone(txb, machine, permission, passport) {
    if (!(0, protocol_1.IsValidObjects)([machine, permission]))
        return false;
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('clone_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('clone'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
}
exports.machine_clone = machine_clone;
function machine_set_endpoint(txb, machine, permission, endpoint, passport) {
    if (!(0, protocol_1.IsValidObjects)([machine, permission]))
        return false;
    if (endpoint && !(0, protocol_1.IsValidEndpoint)(endpoint))
        return false;
    let ep = endpoint ? txb.pure(utils_1.BCS_CONVERT.ser_option_string(endpoint)) : (0, protocol_1.OptionNone)(txb);
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('endpoint_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, machine), ep, (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('endpoint_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, machine), ep, (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    return true;
}
exports.machine_set_endpoint = machine_set_endpoint;
function machine_pause(txb, machine, permission, bPaused, passport) {
    if (!(0, protocol_1.IsValidObjects)([machine, permission]))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('pause_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, machine), txb.pure(bPaused), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('pause'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, machine), txb.pure(bPaused), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    return true;
}
exports.machine_pause = machine_pause;
function machine_publish(txb, machine, permission, passport) {
    if (!(0, protocol_1.IsValidObjects)([machine, permission]))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('publish_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('publish'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    return true;
}
exports.machine_publish = machine_publish;
function change_permission(txb, machine, old_permission, new_permission) {
    if (!(0, protocol_1.IsValidObjects)([machine, old_permission, new_permission]))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.MachineFn('permission_set'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, old_permission), (0, protocol_1.TXB_OBJECT)(txb, new_permission)],
        typeArguments: []
    });
    return true;
}
exports.change_permission = change_permission;
