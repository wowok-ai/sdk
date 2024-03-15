"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.change_permission = exports.repository_set_policy_permission = exports.repository_set_policy_description = exports.repository_set_policy_mode = exports.repository_set_description = exports.repository_remove_policies = exports.repository_add_policies = exports.remove = exports.add_data = exports.destroy = exports.launch = exports.repository = exports.Repository_Policy_Mode = exports.MAX_POLICY_COUNT = void 0;
const bcs_1 = require("@mysten/bcs");
const protocol_1 = require("./protocol");
exports.MAX_POLICY_COUNT = 128;
var Repository_Policy_Mode;
(function (Repository_Policy_Mode) {
    Repository_Policy_Mode[Repository_Policy_Mode["POLICY_MODE_FREE"] = 0] = "POLICY_MODE_FREE";
    Repository_Policy_Mode[Repository_Policy_Mode["POLICY_MODE_STRICT"] = 1] = "POLICY_MODE_STRICT";
})(Repository_Policy_Mode || (exports.Repository_Policy_Mode = Repository_Policy_Mode = {}));
function repository(txb, permission, description, policy_mode, passport) {
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('new_with_passport'),
            arguments: [passport, txb.pure((0, protocol_1.description_data)(description)), txb.pure(policy_mode, bcs_1.BCS.U8), permission],
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('new'),
            arguments: [txb.pure((0, protocol_1.description_data)(description)), txb.pure(policy_mode, bcs_1.BCS.U8), permission],
        });
    }
}
exports.repository = repository;
function launch(txb, repository) {
    return txb.moveCall({
        target: protocol_1.PROTOCOL.RepositoryFn('create'),
        arguments: [repository],
    });
}
exports.launch = launch;
function destroy(txb, repository) {
    return txb.moveCall({
        target: protocol_1.PROTOCOL.RepositoryFn('destroy'),
        arguments: [repository],
    });
}
exports.destroy = destroy;
function add_data(txb, repository, permission, data) {
    if (data?.value_type) {
        data.data.forEach((d) => txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('add'),
            arguments: [repository,
                txb.pure(d.address, bcs_1.BCS.ADDRESS),
                txb.pure((0, protocol_1.name_data)(data.name)),
                txb.pure(data.value_type, bcs_1.BCS.U8),
                txb.pure(d.value, 'vector<u8>'),
                permission,
            ],
        }));
    }
    else {
        data.data.forEach((d) => txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('add_typed_data'),
            arguments: [repository,
                txb.pure(d.address, bcs_1.BCS.ADDRESS),
                txb.pure((0, protocol_1.name_data)(data.name)),
                txb.pure(d.value, 'vector<u8>'),
                permission,
            ],
        }));
    }
}
exports.add_data = add_data;
function remove(txb, repository, permission, address, name) {
    txb.moveCall({
        target: protocol_1.PROTOCOL.RepositoryFn('remove'),
        arguments: [repository,
            txb.pure(address, bcs_1.BCS.ADDRESS),
            txb.pure((0, protocol_1.name_data)(name)),
            permission,
        ],
    });
}
exports.remove = remove;
// add or modify the old 
function repository_add_policies(txb, repository, permission, policies, passport) {
    policies.forEach((policy) => {
        let permission_index = policy?.permission ? txb.pure(policy.permission, bcs_1.BCS.U64) : txb.pure([0], bcs_1.BCS.U8);
        if (passport) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.RepositoryFn('policy_add_with_passport'),
                arguments: [passport, repository,
                    txb.pure((0, protocol_1.name_data)(policy.name)),
                    txb.pure((0, protocol_1.description_data)(policy.description)),
                    permission_index, txb.pure(policy.value_type, bcs_1.BCS.U8)]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.RepositoryFn('policy_add'),
                arguments: [repository,
                    txb.pure((0, protocol_1.name_data)(policy.name)),
                    txb.pure((0, protocol_1.description_data)(policy.description)),
                    permission_index, txb.pure(policy.value_type, bcs_1.BCS.U8)]
            });
        }
    });
}
exports.repository_add_policies = repository_add_policies;
function repository_remove_policies(txb, repository, permission, policy_names, removeall, passport) {
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.RepositoryFn('policy_remove_all_with_passport'),
                arguments: [passport, repository, permission]
            });
        }
        else {
            policy_names.forEach((name) => {
                txb.moveCall({
                    target: protocol_1.PROTOCOL.RepositoryFn('policy_remove_with_passport'),
                    arguments: [passport, repository, txb.pure((0, protocol_1.name_data)(name)), permission]
                });
            });
        }
    }
    else {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.RepositoryFn('policy_remove_all'),
                arguments: [repository, permission]
            });
        }
        else {
            policy_names.forEach((name) => {
                txb.moveCall({
                    target: protocol_1.PROTOCOL.RepositoryFn('policy_remove'),
                    arguments: [repository, txb.pure((0, protocol_1.name_data)(name)), permission]
                });
            });
        }
    }
}
exports.repository_remove_policies = repository_remove_policies;
// PermissionIndex.repository_description_set
function repository_set_description(txb, repository, permission, description, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('description_set_with_passport'),
            arguments: [passport, repository, txb.pure((0, protocol_1.description_data)(description)), permission]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('description_set'),
            arguments: [repository, txb.pure((0, protocol_1.description_data)(description)), permission]
        });
    }
}
exports.repository_set_description = repository_set_description;
function repository_set_policy_mode(txb, repository, permission, policy_mode, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('policy_mode_set_with_passport'),
            arguments: [passport, repository, txb.pure(policy_mode), permission]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('policy_mode_set'),
            arguments: [repository, txb.pure(policy_mode), permission]
        });
    }
}
exports.repository_set_policy_mode = repository_set_policy_mode;
function repository_set_policy_description(txb, repository, permission, description, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('description_set_with_passport'),
            arguments: [passport, repository, txb.pure((0, protocol_1.description_data)(description)), permission]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('description_set'),
            arguments: [repository, txb.pure((0, protocol_1.description_data)(description)), permission]
        });
    }
}
exports.repository_set_policy_description = repository_set_policy_description;
function repository_set_policy_permission(txb, repository, permission, permission_index, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('policy_mode_set_with_passport'),
            arguments: [passport, repository, txb.pure(permission_index, bcs_1.BCS.U64), permission]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('policy_mode_set'),
            arguments: [repository, txb.pure(permission_index, bcs_1.BCS.U64), permission]
        });
    }
}
exports.repository_set_policy_permission = repository_set_policy_permission;
function change_permission(txb, repository, old_permission, new_permission) {
    txb.moveCall({
        target: protocol_1.PROTOCOL.RepositoryFn('permission_set'),
        arguments: [repository, old_permission, new_permission],
        typeArguments: []
    });
}
exports.change_permission = change_permission;
