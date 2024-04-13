"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.change_permission = exports.repository_set_policy_permission = exports.repository_set_policy_description = exports.repository_set_policy_mode = exports.repository_set_description = exports.repository_remove_policies = exports.repository_add_policies = exports.remove = exports.add_data = exports.destroy = exports.launch = exports.repository = exports.Repository_Policy_Mode = exports.IsValidValue = exports.IsValidKey = exports.MAX_VALUE_LENGTH = exports.MAX_KEY_LENGTH = exports.MAX_POLICY_COUNT = void 0;
const bcs_1 = require("@mysten/bcs");
const protocol_1 = require("./protocol");
const permission_1 = require("./permission");
const utils_1 = require("./utils");
exports.MAX_POLICY_COUNT = 1000;
exports.MAX_KEY_LENGTH = 128;
exports.MAX_VALUE_LENGTH = 204800;
const IsValidKey = (key) => {
    return key.length <= exports.MAX_KEY_LENGTH && key.length != 0;
};
exports.IsValidKey = IsValidKey;
const IsValidValue = (value) => {
    return value.length < exports.MAX_VALUE_LENGTH;
};
exports.IsValidValue = IsValidValue;
var Repository_Policy_Mode;
(function (Repository_Policy_Mode) {
    Repository_Policy_Mode[Repository_Policy_Mode["POLICY_MODE_FREE"] = 0] = "POLICY_MODE_FREE";
    Repository_Policy_Mode[Repository_Policy_Mode["POLICY_MODE_STRICT"] = 1] = "POLICY_MODE_STRICT";
})(Repository_Policy_Mode || (exports.Repository_Policy_Mode = Repository_Policy_Mode = {}));
function repository(txb, permission, description, policy_mode, passport) {
    if (!(0, protocol_1.IsValidObjects)([permission]))
        return false;
    if (!(0, protocol_1.IsValidDesription)(description))
        return false;
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('new_with_passport'),
            arguments: [passport, txb.pure(description), txb.pure(policy_mode, bcs_1.BCS.U8), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('new'),
            arguments: [txb.pure(description), txb.pure(policy_mode, bcs_1.BCS.U8), (0, protocol_1.TXB_OBJECT)(txb, permission)],
        });
    }
    return true;
}
exports.repository = repository;
function launch(txb, repository) {
    if (!(0, protocol_1.IsValidObjects)([repository]))
        return false;
    return txb.moveCall({
        target: protocol_1.PROTOCOL.RepositoryFn('create'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, repository)],
    });
}
exports.launch = launch;
function destroy(txb, repository) {
    if (!(0, protocol_1.IsValidObjects)([repository]))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.RepositoryFn('destroy'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, repository)],
    });
    return true;
}
exports.destroy = destroy;
function add_data(txb, repository, permission, data) {
    if (!(0, protocol_1.IsValidObjects)([repository, permission]))
        return false;
    if (!(0, exports.IsValidKey)(data.key))
        return false;
    let bValid = true;
    data.data.forEach((value) => {
        if (!(0, protocol_1.IsValidAddress)(value.address))
            bValid = false;
        if (!(0, exports.IsValidValue)(value.bcsBytes))
            bValid = false;
    });
    if (!bValid)
        return false;
    if (data?.value_type) {
        data.data.forEach((d) => txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('add'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, repository),
                txb.pure(d.address, bcs_1.BCS.ADDRESS),
                txb.pure(data.key),
                txb.pure(data.value_type, bcs_1.BCS.U8),
                txb.pure([...d.bcsBytes], 'vector<u8>'),
                (0, protocol_1.TXB_OBJECT)(txb, permission),
            ],
        }));
    }
    else {
        data.data.forEach((d) => txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('add_typed_data'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, repository),
                txb.pure(d.address, bcs_1.BCS.ADDRESS),
                txb.pure(data.key),
                txb.pure([...d.bcsBytes], 'vector<u8>'),
                (0, protocol_1.TXB_OBJECT)(txb, permission),
            ],
        }));
    }
    return true;
}
exports.add_data = add_data;
function remove(txb, repository, permission, address, key) {
    if (!(0, protocol_1.IsValidObjects)([repository, permission]))
        return false;
    if (!(0, exports.IsValidKey)(key) || !(0, protocol_1.IsValidAddress)(address))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.RepositoryFn('remove'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, repository),
            txb.pure(address, bcs_1.BCS.ADDRESS),
            txb.pure(key),
            (0, protocol_1.TXB_OBJECT)(txb, permission),
        ],
    });
    return true;
}
exports.remove = remove;
// add or modify the old 
function repository_add_policies(txb, repository, permission, policies, passport) {
    if (!(0, protocol_1.IsValidObjects)([repository, permission]))
        return false;
    if (!policies)
        return false;
    let bValid = true;
    policies.forEach((p) => {
        if (!(0, protocol_1.IsValidDesription)(p.description) || !(0, exports.IsValidKey)(p.key)) {
            bValid = false;
        }
    });
    if (!bValid)
        return false;
    policies.forEach((policy) => {
        let permission_index = policy?.permission ? txb.pure(utils_1.BCS_CONVERT.ser_option_u64(policy.permission)) : txb.pure([0], bcs_1.BCS.U8);
        if (passport) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.RepositoryFn('policy_add_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, repository),
                    txb.pure(policy.key),
                    txb.pure(policy.description),
                    permission_index, txb.pure(policy.value_type, bcs_1.BCS.U8),
                    (0, protocol_1.TXB_OBJECT)(txb, permission)]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.RepositoryFn('policy_add'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, repository),
                    txb.pure(policy.key),
                    txb.pure(policy.description),
                    permission_index, txb.pure(policy.value_type, bcs_1.BCS.U8),
                    (0, protocol_1.TXB_OBJECT)(txb, permission)]
            });
        }
    });
    return true;
}
exports.repository_add_policies = repository_add_policies;
function repository_remove_policies(txb, repository, permission, policy_keys, removeall, passport) {
    if (!(0, protocol_1.IsValidObjects)([repository, permission]))
        return false;
    if (!removeall && !policy_keys)
        return false;
    if (policy_keys && !(0, protocol_1.IsValidArray)(policy_keys, exports.IsValidKey))
        return false;
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.RepositoryFn('policy_remove_all_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, repository), (0, protocol_1.TXB_OBJECT)(txb, permission)]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.RepositoryFn('policy_remove_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, repository), txb.pure(utils_1.BCS_CONVERT.ser_vector_string((0, utils_1.array_unique)(policy_keys))), (0, protocol_1.TXB_OBJECT)(txb, permission)]
            });
        }
    }
    else {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.RepositoryFn('policy_remove_all'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, repository), (0, protocol_1.TXB_OBJECT)(txb, permission)]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.RepositoryFn('policy_remove'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, repository), txb.pure(utils_1.BCS_CONVERT.ser_vector_string((0, utils_1.array_unique)(policy_keys))), (0, protocol_1.TXB_OBJECT)(txb, permission)]
            });
        }
    }
    return true;
}
exports.repository_remove_policies = repository_remove_policies;
// PermissionIndex.repository_description_set
function repository_set_description(txb, repository, permission, description, passport) {
    if (!(0, protocol_1.IsValidObjects)([repository, permission]))
        return false;
    if (!(0, protocol_1.IsValidDesription)(description))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('description_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, repository), txb.pure(description), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('description_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, repository), txb.pure(description), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    return true;
}
exports.repository_set_description = repository_set_description;
function repository_set_policy_mode(txb, repository, permission, policy_mode, passport) {
    if (!(0, protocol_1.IsValidObjects)([repository, permission]))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('policy_mode_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, repository), txb.pure(policy_mode), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('policy_mode_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, repository), txb.pure(policy_mode), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    return true;
}
exports.repository_set_policy_mode = repository_set_policy_mode;
function repository_set_policy_description(txb, repository, permission, policy, description, passport) {
    if (!(0, protocol_1.IsValidObjects)([repository, permission]))
        return false;
    if (!(0, exports.IsValidKey)(policy) || !(0, protocol_1.IsValidDesription)(description))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('policy_description_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, repository), txb.pure(policy), txb.pure(description), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('policy_description_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, repository), txb.pure(policy), txb.pure(description), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    return true;
}
exports.repository_set_policy_description = repository_set_policy_description;
function repository_set_policy_permission(txb, repository, permission, policy, permission_index, passport) {
    if (!(0, protocol_1.IsValidObjects)([repository, permission]))
        return false;
    if (!(0, exports.IsValidKey)(policy))
        return false;
    let index = (0, protocol_1.OptionNone)(txb);
    if (permission_index) {
        if (!(0, permission_1.IsValidPermissionIndex)(permission_index))
            return false;
        index = txb.pure(utils_1.BCS_CONVERT.ser_option_u64(permission_index));
    }
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('policy_permission_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, repository), index, (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.RepositoryFn('policy_permission_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, repository), index, (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    return true;
}
exports.repository_set_policy_permission = repository_set_policy_permission;
function change_permission(txb, repository, old_permission, new_permission) {
    if (!(0, protocol_1.IsValidObjects)([repository, old_permission, new_permission]))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.RepositoryFn('permission_set'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, repository), (0, protocol_1.TXB_OBJECT)(txb, old_permission), (0, protocol_1.TXB_OBJECT)(txb, new_permission)],
        typeArguments: []
    });
}
exports.change_permission = change_permission;
