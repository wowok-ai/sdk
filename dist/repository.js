import { BCS } from '@mysten/bcs';
import { Protocol } from './protocol';
import { Permission } from './permission';
import { Bcs, array_unique, IsValidDesription, IsValidAddress, IsValidArray, OptionNone, } from './utils';
import { ERROR, Errors } from './exception';
export var Repository_Policy_Mode;
(function (Repository_Policy_Mode) {
    Repository_Policy_Mode[Repository_Policy_Mode["POLICY_MODE_FREE"] = 0] = "POLICY_MODE_FREE";
    Repository_Policy_Mode[Repository_Policy_Mode["POLICY_MODE_STRICT"] = 1] = "POLICY_MODE_STRICT";
})(Repository_Policy_Mode || (Repository_Policy_Mode = {}));
export class Repository {
    permission;
    object;
    protocol;
    get_object() { return this.object; }
    constructor(protocol, permission) {
        this.protocol = protocol;
        this.permission = permission;
        this.object = '';
    }
    static From(protocol, permission, object) {
        let r = new Repository(protocol, permission);
        r.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), object);
        return r;
    }
    static New(protocol, permission, description, policy_mode, passport) {
        if (!Protocol.IsValidObjects([permission])) {
            ERROR(Errors.IsValidObjects, 'permission');
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        let r = new Repository(protocol, permission);
        let txb = protocol.CurrentSession();
        if (passport) {
            r.object = txb.moveCall({
                target: protocol.RepositoryFn('new_with_passport'),
                arguments: [passport, txb.pure(description), txb.pure(policy_mode, BCS.U8), Protocol.TXB_OBJECT(txb, permission)],
            });
        }
        else {
            r.object = txb.moveCall({
                target: protocol.RepositoryFn('new'),
                arguments: [txb.pure(description), txb.pure(policy_mode, BCS.U8), Protocol.TXB_OBJECT(txb, permission)],
            });
        }
        return r;
    }
    launch() {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target: this.protocol.RepositoryFn('create'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
        });
    }
    destroy() {
        if (!Protocol.IsValidObjects([this.object]))
            return false;
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.RepositoryFn('destroy'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
        });
    }
    /* move to: Entity.mark
        mark(like:'like' | 'unlike', resource:Resource)  {
            if (!Protocol.IsValidObjects([this.object])) return false;
            let txb = this.protocol.CurrentSession();
            txb.moveCall({
                target:this.protocol.RepositoryFn(like) as FnCallType,
                arguments: [Protocol.TXB_OBJECT(txb, resource.get_object()), Protocol.TXB_OBJECT(txb, this.object)],
            })
        }
    */
    add_data(data) {
        if (!Repository.IsValidName(data.key)) {
            ERROR(Errors.IsValidName);
        }
        let bValid = true;
        data.data.forEach((value) => {
            if (!IsValidAddress(value.address))
                bValid = false;
            if (!Repository.IsValidValue(value.bcsBytes))
                bValid = false;
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam);
        }
        let txb = this.protocol.CurrentSession();
        if (data?.value_type) {
            data.data.forEach((d) => txb.moveCall({
                target: this.protocol.RepositoryFn('add'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object),
                    txb.pure(d.address, BCS.ADDRESS),
                    txb.pure(data.key),
                    txb.pure(data.value_type, BCS.U8),
                    txb.pure([...d.bcsBytes], 'vector<u8>'),
                    Protocol.TXB_OBJECT(txb, this.permission),
                ],
            }));
        }
        else {
            data.data.forEach((d) => txb.moveCall({
                target: this.protocol.RepositoryFn('add_typed_data'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object),
                    txb.pure(d.address, BCS.ADDRESS),
                    txb.pure(data.key),
                    txb.pure([...d.bcsBytes], 'vector<u8>'),
                    Protocol.TXB_OBJECT(txb, this.permission),
                ],
            }));
        }
    }
    remove(address, key) {
        if (!Repository.IsValidName(key)) {
            ERROR(Errors.IsValidName);
        }
        if (!IsValidAddress(address)) {
            ERROR(Errors.IsValidAddress);
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.RepositoryFn('remove'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object),
                txb.pure(address, BCS.ADDRESS),
                txb.pure(key),
                Protocol.TXB_OBJECT(txb, this.permission),
            ],
        });
    }
    add_reference(references, passport) {
        if (!references) {
            ERROR(Errors.InvalidParam, 'references');
        }
        if (!IsValidArray(references, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'references');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.RepositoryFn('reference_add_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object),
                    txb.pure(array_unique(references), 'vector<address>'),
                    Protocol.TXB_OBJECT(txb, this.permission)]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.RepositoryFn('reference_add'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object),
                    txb.pure(array_unique(references), 'vector<address>'),
                    Protocol.TXB_OBJECT(txb, this.permission)]
            });
        }
    }
    remove_reference(references, removeall, passport) {
        if (!references) {
            ERROR(Errors.InvalidParam, 'references');
        }
        if (!IsValidArray(references, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'references');
        }
        let txb = this.protocol.CurrentSession();
        if (removeall) {
            if (passport) {
                txb.moveCall({
                    target: this.protocol.RepositoryFn('reference_removeall_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object),
                        Protocol.TXB_OBJECT(txb, this.permission)]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.RepositoryFn('reference_removeall'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object),
                        Protocol.TXB_OBJECT(txb, this.permission)]
                });
            }
        }
        else {
            if (passport) {
                txb.moveCall({
                    target: this.protocol.RepositoryFn('reference_remove_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object),
                        txb.pure(array_unique(references), 'vector<address>'),
                        Protocol.TXB_OBJECT(txb, this.permission)]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.RepositoryFn('reference_remove'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object),
                        txb.pure(array_unique(references), 'vector<address>'),
                        Protocol.TXB_OBJECT(txb, this.permission)]
                });
            }
        }
    }
    // add or modify the old 
    add_policies(policies, passport) {
        if (!policies) {
            ERROR(Errors.InvalidParam, 'policies');
        }
        let bValid = true;
        policies.forEach((p) => {
            if (!IsValidDesription(p.description) || !Repository.IsValidName(p.key)) {
                bValid = false;
            }
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'policies');
        }
        let txb = this.protocol.CurrentSession();
        policies.forEach((policy) => {
            let permission_index = policy?.permission ? txb.pure(Bcs.getInstance().ser_option_u64(policy.permission)) : OptionNone(txb);
            if (passport) {
                txb.moveCall({
                    target: this.protocol.RepositoryFn('policy_add_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object),
                        txb.pure(policy.key),
                        txb.pure(policy.description),
                        permission_index, txb.pure(policy.value_type, BCS.U8),
                        Protocol.TXB_OBJECT(txb, this.permission)]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.RepositoryFn('policy_add'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object),
                        txb.pure(policy.key),
                        txb.pure(policy.description),
                        permission_index, txb.pure(policy.value_type, BCS.U8),
                        Protocol.TXB_OBJECT(txb, this.permission)]
                });
            }
        });
    }
    remove_policies(policy_keys, removeall, passport) {
        if (!removeall && !policy_keys) {
            ERROR(Errors.AllInvalid, 'policy_keys & removeall');
        }
        if (policy_keys && !IsValidArray(policy_keys, Repository.IsValidName)) {
            ERROR(Errors.InvalidParam, 'policy_keys');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (removeall) {
                txb.moveCall({
                    target: this.protocol.RepositoryFn('policy_remove_all_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.RepositoryFn('policy_remove_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object),
                        txb.pure(Bcs.getInstance().ser_vector_string(array_unique(policy_keys))),
                        Protocol.TXB_OBJECT(txb, this.permission)]
                });
            }
        }
        else {
            if (removeall) {
                txb.moveCall({
                    target: this.protocol.RepositoryFn('policy_remove_all'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.RepositoryFn('policy_remove'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object),
                        txb.pure(Bcs.getInstance().ser_vector_string(array_unique(policy_keys))),
                        Protocol.TXB_OBJECT(txb, this.permission)]
                });
            }
        }
    }
    // PermissionIndex.description_set
    set_description(description, passport) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.RepositoryFn('description_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(description), Protocol.TXB_OBJECT(txb, this.permission)]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.RepositoryFn('description_set'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(description), Protocol.TXB_OBJECT(txb, this.permission)]
            });
        }
    }
    set_policy_mode(policy_mode, passport) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.RepositoryFn('policy_mode_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(policy_mode), Protocol.TXB_OBJECT(txb, this.permission)]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.RepositoryFn('policy_mode_set'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(policy_mode), Protocol.TXB_OBJECT(txb, this.permission)]
            });
        }
    }
    set_policy_description(policy, description, passport) {
        if (!Repository.IsValidName(policy)) {
            ERROR(Errors.IsValidName, 'policy');
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.RepositoryFn('policy_description_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(policy), txb.pure(description),
                    Protocol.TXB_OBJECT(txb, this.permission)]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.RepositoryFn('policy_description_set'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(policy), txb.pure(description),
                    Protocol.TXB_OBJECT(txb, this.permission)]
            });
        }
    }
    set_policy_permission(policy, permission_index, passport) {
        if (!Repository.IsValidName(policy)) {
            ERROR(Errors.IsValidName, 'policy');
        }
        let txb = this.protocol.CurrentSession();
        let index = OptionNone(txb);
        if (permission_index) {
            if (!Permission.IsValidPermissionIndex(permission_index)) {
                ERROR(Errors.IsValidPermissionIndex);
            }
            index = txb.pure(Bcs.getInstance().ser_option_u64(permission_index));
        }
        if (passport) {
            txb.moveCall({
                target: this.protocol.RepositoryFn('policy_permission_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), index, Protocol.TXB_OBJECT(txb, this.permission)]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.RepositoryFn('policy_permission_set'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), index, Protocol.TXB_OBJECT(txb, this.permission)]
            });
        }
    }
    change_permission(new_permission) {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects);
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.RepositoryFn('permission_set'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission), Protocol.TXB_OBJECT(txb, new_permission)],
            typeArguments: []
        });
        this.permission = new_permission;
    }
    static MAX_POLICY_COUNT = 1000;
    static MAX_KEY_LENGTH = 128;
    static MAX_VALUE_LENGTH = 204800;
    static IsValidName = (key) => {
        return key.length <= Repository.MAX_KEY_LENGTH && key.length != 0;
    };
    static IsValidValue = (value) => {
        return value.length < Repository.MAX_VALUE_LENGTH;
    };
}
