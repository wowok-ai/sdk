"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.change_permission = exports.machine_publish = exports.machine_pause = exports.machine_set_endpoint = exports.machine_clone = exports.machine_remove_repository = exports.machine_add_repository = exports.machine_set_description = exports.launch = exports.destroy = exports.machine = exports.machine_remove_node = exports.machine_add_node2 = exports.machine_add_node = exports.is_valid_name = exports.INITIAL_NODE_NAME = void 0;
const bcs_1 = require("@mysten/bcs");
const protocol_1 = require("./protocol");
const util_1 = require("./util");
exports.INITIAL_NODE_NAME = '';
// node & forward & forward permission string length validation
function is_valid_name(name) { return name.length > 0 && name.length < 33; }
exports.is_valid_name = is_valid_name;
// 创建新的node加入到machine
function machine_add_node(txb, machine, permission, nodes, passport) {
    let new_nodes = [];
    nodes.forEach((node) => {
        let n = txb.moveCall({
            target: protocol_1.PROTOCOL.NodeFn('new'),
            arguments: [txb.pure((0, protocol_1.name_data)(node.name)), txb.pure((0, protocol_1.description_data)(node.description))]
        });
        node.pairs.forEach((pair) => {
            pair.forwards.forEach((forward) => {
                if (!forward?.namedOperator && !forward?.permission) {
                    return;
                }
                let weight = txb.pure(1);
                if (forward?.weight && forward.weight > 0) {
                    weight = txb.pure(forward.weight);
                }
                let per = txb.pure([], bcs_1.BCS.U8);
                if (forward?.permission) {
                    per = txb.pure(util_1.BCS_CONVERT.ser_option_u64(forward.permission));
                }
                ;
                let namedOperator = txb.pure('');
                if (forward?.namedOperator) {
                    namedOperator = txb.pure(forward.namedOperator);
                }
                ;
                let f;
                if (forward?.guard_address) {
                    f = txb.moveCall({
                        target: protocol_1.PROTOCOL.NodeFn('forward'),
                        arguments: [namedOperator, weight, txb.object(forward.guard_address), per]
                    });
                }
                else {
                    f = txb.moveCall({
                        target: protocol_1.PROTOCOL.NodeFn('forward2'),
                        arguments: [namedOperator, weight, per]
                    });
                }
                txb.moveCall({
                    target: protocol_1.PROTOCOL.NodeFn('forward_add'),
                    arguments: [n, txb.pure(pair.prior_node), txb.pure((0, protocol_1.name_data)(forward.name)),
                        txb.pure(util_1.BCS_CONVERT.ser_option_u64(pair.threshold)), f]
                });
            });
        });
        new_nodes.push(n);
    });
    machine_add_node2(txb, machine, permission, new_nodes, passport);
}
exports.machine_add_node = machine_add_node;
// 把个人拥有的node加入到machine
function machine_add_node2(txb, machine, permission, nodes, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('node_add_with_passport'),
            arguments: [passport, machine, txb.makeMoveVec({ objects: nodes }), permission]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('node_add'),
            arguments: [machine, txb.makeMoveVec({ objects: nodes }), permission]
        });
    }
}
exports.machine_add_node2 = machine_add_node2;
// 从machine把node移动到个人地址
function machine_remove_node(txb, machine, permission, nodes_name, receive_address, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('node_remove_with_passport'),
            arguments: [passport, machine, txb.pure(util_1.BCS_CONVERT.ser_vector_string(nodes_name)), permission],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('node_remove'),
            arguments: [machine, txb.pure(util_1.BCS_CONVERT.ser_vector_string(nodes_name)), permission],
        });
    }
}
exports.machine_remove_node = machine_remove_node;
function machine(txb, permission, description, endpoint_url, passport) {
    if (endpoint_url && endpoint_url.length > protocol_1.MAX_ENDPOINT_LENGTH)
        return undefined;
    let endpoint = endpoint_url ? txb.pure(util_1.BCS_CONVERT.ser_option_string(endpoint_url)) : txb.pure([], bcs_1.BCS.U8);
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('new_with_passport'),
            arguments: [passport, txb.pure((0, protocol_1.description_data)(description)), endpoint, permission],
        });
    }
    else {
        //console.log(endpoint)
        return txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('new'),
            arguments: [txb.pure((0, protocol_1.description_data)(description)), endpoint, permission],
        });
    }
}
exports.machine = machine;
function destroy(txb, machine) {
    return txb.moveCall({
        target: protocol_1.PROTOCOL.MachineFn('destroy'),
        arguments: [machine],
    });
}
exports.destroy = destroy;
function launch(txb, machine) {
    return txb.moveCall({
        target: protocol_1.PROTOCOL.MachineFn('create'),
        arguments: [machine],
    });
}
exports.launch = launch;
function machine_set_description(txb, machine, permission, description, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('description_set_with_passport'),
            arguments: [passport, machine, txb.pure((0, protocol_1.description_data)(description)), permission],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('description_set'),
            arguments: [machine, txb.pure((0, protocol_1.description_data)(description)), permission],
        });
    }
}
exports.machine_set_description = machine_set_description;
function machine_add_repository(txb, machine, permission, repository, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('repository_add_with_passport'),
            arguments: [passport, machine, repository, permission],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('repository_add'),
            arguments: [machine, repository, permission],
        });
    }
}
exports.machine_add_repository = machine_add_repository;
function machine_remove_repository(txb, machine, permission, repositories, removeall, passport) {
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.MachineFn('repository_remove_all_with_passport'),
                arguments: [passport, machine, permission],
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.MachineFn('repository_remove_with_passport'),
                arguments: [passport, machine, txb.pure(repositories, 'vector<address>'), permission],
            });
        }
    }
    else {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.MachineFn('repository_remove_all'),
                arguments: [machine, permission],
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.MachineFn('repository_remove'),
                arguments: [machine, txb.pure(repositories, 'vector<address>'), permission],
            });
        }
    }
}
exports.machine_remove_repository = machine_remove_repository;
function machine_clone(txb, machine, permission, passport) {
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('clone_with_passport'),
            arguments: [passport, machine, permission],
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('clone'),
            arguments: [machine, permission],
        });
    }
}
exports.machine_clone = machine_clone;
function machine_set_endpoint(txb, machine, permission, endpoint_url, passport) {
    if (endpoint_url && endpoint_url.length > protocol_1.MAX_ENDPOINT_LENGTH)
        return undefined;
    let endpoint = endpoint_url ? txb.pure(util_1.BCS_CONVERT.ser_option_string(endpoint_url)) : txb.pure([], bcs_1.BCS.U8);
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('endpoint_set_with_passport'),
            arguments: [passport, machine, endpoint, permission],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('endpoint_set'),
            arguments: [machine, endpoint, permission],
        });
    }
}
exports.machine_set_endpoint = machine_set_endpoint;
function machine_pause(txb, machine, permission, bPaused, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('pause_with_passport'),
            arguments: [passport, machine, txb.pure(bPaused), permission],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('pause'),
            arguments: [machine, txb.pure(bPaused), permission],
        });
    }
}
exports.machine_pause = machine_pause;
function machine_publish(txb, machine, permission, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('publish_with_passport'),
            arguments: [passport, machine, permission],
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.MachineFn('publish'),
            arguments: [machine, permission],
        });
    }
}
exports.machine_publish = machine_publish;
function change_permission(txb, machine, old_permission, new_permission) {
    txb.moveCall({
        target: protocol_1.PROTOCOL.MachineFn('permission_set'),
        arguments: [machine, old_permission, new_permission],
        typeArguments: []
    });
}
exports.change_permission = change_permission;
