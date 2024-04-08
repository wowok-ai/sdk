import { TransactionBlock, Inputs, type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS } from '@mysten/bcs';
import { FnCallType, PROTOCOL, ValueType, IsValidDesription, IsValidAddress, IsValidArray, OptionNone, 
    RepositoryObject, RepositoryAddress, PermissionObject, TXB_OBJECT, PassportObject, IsValidObjects,
    IsValidInt} from './protocol';
import { IsValidPermissionIndex, PermissionIndexType  } from './permission'
import { BCS_CONVERT, array_unique } from './util';

export const MAX_POLICY_COUNT = 1000;
export const MAX_KEY_LENGTH = 128;
export const MAX_VALUE_LENGTH = 204800;

export const IsValidKey = (key:string) : boolean => {
    return key.length <= MAX_KEY_LENGTH && key.length != 0;
}
export const IsValidValue = (value:Uint8Array) : boolean => {
    return value.length < MAX_VALUE_LENGTH;
}

export enum Repository_Policy_Mode {
    POLICY_MODE_FREE = 0,
    POLICY_MODE_STRICT = 1,
}
export type Repository_Policy = {
    key:string;
    description: string;
    value_type: ValueType;
    permission?: PermissionIndexType; // PermissionIndex like, must be geater than 10000
}
export type Repository_Policy_Data = {
    key: string;
    data: Repository_Value[];
    value_type?: ValueType;
}
export type Repository_Value = {
    address: string; // UID: address or objectid
    bcsBytes: Uint8Array;
}

export function repository(txb:TransactionBlock, permission:PermissionObject, description:string, 
    policy_mode: Repository_Policy_Mode, passport?:PassportObject) : RepositoryObject | boolean {
    if (!IsValidObjects([permission])) return false;
    if (!IsValidDesription(description)) return false;

    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.RepositoryFn('new_with_passport') as FnCallType,
            arguments:[passport, txb.pure(description), txb.pure(policy_mode, BCS.U8), TXB_OBJECT(txb, permission)],
        })
    } else {
        return txb.moveCall({
            target:PROTOCOL.RepositoryFn('new') as FnCallType,
            arguments:[txb.pure(description), txb.pure(policy_mode, BCS.U8), TXB_OBJECT(txb, permission)],
        })
    }
    return true;
}

export function launch(txb:TransactionBlock, repository:RepositoryObject) : RepositoryAddress | boolean {
    if (!IsValidObjects([repository])) return false;
    return txb.moveCall({
        target:PROTOCOL.RepositoryFn('create') as FnCallType,
        arguments:[TXB_OBJECT(txb, repository)],
    })    
}
export function destroy(txb:TransactionBlock, repository:RepositoryObject) : boolean {
    if (!IsValidObjects([repository])) return false;
    txb.moveCall({
        target:PROTOCOL.RepositoryFn('destroy') as FnCallType,
        arguments: [TXB_OBJECT(txb, repository)],
    })   
    return true
}

export function add_data(txb:TransactionBlock, repository:RepositoryObject, permission:PermissionObject, data:Repository_Policy_Data) : boolean {
    if (!IsValidObjects([repository, permission])) return false;
    if (!IsValidKey(data.key)) return false; 
    let bValid = true;
    data.data.forEach((value) => {
        if (!IsValidAddress(value.address)) bValid = false;
        if (!IsValidValue(value.bcsBytes)) bValid = false; 
    });
    if (!bValid) return false;

    if (data?.value_type) {
        data.data.forEach((d) => txb.moveCall({
            target:PROTOCOL.RepositoryFn('add') as FnCallType,
            arguments:[TXB_OBJECT(txb, repository), 
                txb.pure(d.address, BCS.ADDRESS),
                txb.pure(data.key), 
                txb.pure(data.value_type, BCS.U8),
                txb.pure([...d.bcsBytes], 'vector<u8>'),
                TXB_OBJECT(txb, permission),
            ],
        }))       
    } else {
        data.data.forEach((d) => txb.moveCall({
            target:PROTOCOL.RepositoryFn('add_typed_data') as FnCallType,
            arguments:[TXB_OBJECT(txb, repository), 
                txb.pure(d.address, BCS.ADDRESS),
                txb.pure(data.key), 
                txb.pure([...d.bcsBytes], 'vector<u8>'),
                TXB_OBJECT(txb, permission),
            ],
        }))   
    }
    return true;
}

export function remove(txb:TransactionBlock, repository:RepositoryObject, permission:PermissionObject, address:string, key:string) : boolean {
    if (!IsValidObjects([repository, permission])) return false;
    if (!IsValidKey(key) || !IsValidAddress(address)) return false;

    txb.moveCall({
        target:PROTOCOL.RepositoryFn('remove') as FnCallType,
        arguments:[TXB_OBJECT(txb, repository), 
            txb.pure(address, BCS.ADDRESS),
            txb.pure(key), 
            TXB_OBJECT(txb, permission),
        ],
    })  
    return true  
}
// add or modify the old 
export function repository_add_policies(txb:TransactionBlock, repository:RepositoryObject, permission:PermissionObject, 
    policies:Repository_Policy[], passport?:PassportObject) : boolean {
    if (!IsValidObjects([repository, permission])) return false;
    if (!policies) return false;

    let bValid = true;
    policies.forEach((p) => {
        if (!IsValidDesription(p.description) || !IsValidKey(p.key)) {
            bValid = false
        }
    });
    if (!bValid) return false;

    policies.forEach((policy) => {
        let permission_index = policy?.permission ? txb.pure(BCS_CONVERT.ser_option_u64(policy.permission)) : txb.pure([0], BCS.U8);
        if (passport) {
            txb.moveCall({
                target:PROTOCOL.RepositoryFn('policy_add_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, repository), 
                    txb.pure(policy.key), 
                    txb.pure(policy.description),
                    permission_index, txb.pure(policy.value_type, BCS.U8),
                    TXB_OBJECT(txb, permission)]
            })              
        } else {
            txb.moveCall({
                target:PROTOCOL.RepositoryFn('policy_add') as FnCallType,
                arguments:[TXB_OBJECT(txb, repository), 
                    txb.pure(policy.key), 
                    txb.pure(policy.description),
                    permission_index, txb.pure(policy.value_type, BCS.U8),
                    TXB_OBJECT(txb, permission)]
            })  
        }
    });    
    return true;
}

export function repository_remove_policies(txb:TransactionBlock, repository:RepositoryObject, permission:PermissionObject, 
    policy_keys:string[], removeall?:boolean, passport?:PassportObject) : boolean {
    if (!IsValidObjects([repository, permission])) return false;
    if (!removeall && !policy_keys) return false;
    if (policy_keys && !IsValidArray(policy_keys, IsValidKey)) return false;

    if (passport) {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.RepositoryFn('policy_remove_all_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, repository), TXB_OBJECT(txb, permission)]
            })          
        } else {
            txb.moveCall({
                target:PROTOCOL.RepositoryFn('policy_remove_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, repository), txb.pure(BCS_CONVERT.ser_vector_string(array_unique(policy_keys))), TXB_OBJECT(txb, permission)]
            })                
        }
    } else {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.RepositoryFn('policy_remove_all') as FnCallType,
                arguments:[TXB_OBJECT(txb, repository), TXB_OBJECT(txb, permission)]
            })          
        } else {
            txb.moveCall({
                target:PROTOCOL.RepositoryFn('policy_remove') as FnCallType,
                arguments:[TXB_OBJECT(txb, repository), txb.pure(BCS_CONVERT.ser_vector_string(array_unique(policy_keys))), TXB_OBJECT(txb, permission)]
            })                
        }
    }
    return true;
}
// PermissionIndex.repository_description_set
export function repository_set_description(txb:TransactionBlock, repository:RepositoryObject, permission:PermissionObject, 
    description:string, passport?:PassportObject) : boolean {
    if (!IsValidObjects([repository, permission])) return false;
    if (!IsValidDesription(description)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.RepositoryFn('description_set_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, repository), txb.pure(description), TXB_OBJECT(txb, permission)]
        }) 
    } else {
        txb.moveCall({
            target:PROTOCOL.RepositoryFn('description_set') as FnCallType,
            arguments:[TXB_OBJECT(txb, repository), txb.pure(description), TXB_OBJECT(txb, permission)]
        }) 
    }        
    return true
}

export function repository_set_policy_mode(txb:TransactionBlock, repository: RepositoryObject, permission:PermissionObject,
    policy_mode:Repository_Policy_Mode, passport?:PassportObject) : boolean {
    if (!IsValidObjects([repository, permission])) return false;
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.RepositoryFn('policy_mode_set_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, repository), txb.pure(policy_mode), TXB_OBJECT(txb, permission)]
        })  
    } else {
        txb.moveCall({
            target:PROTOCOL.RepositoryFn('policy_mode_set') as FnCallType,
            arguments:[TXB_OBJECT(txb, repository), txb.pure(policy_mode), TXB_OBJECT(txb, permission)]
        })  
    }  
    return true
}

export function repository_set_policy_description(txb:TransactionBlock, repository: RepositoryObject, permission:PermissionObject, 
    policy:string, description:string, passport?:PassportObject) : boolean {
    if (!IsValidObjects([repository, permission])) return false;
    if (!IsValidKey(policy) || !IsValidDesription(description)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.RepositoryFn('policy_description_set_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, repository), txb.pure(policy), txb.pure(description), TXB_OBJECT(txb, permission)]
        })   
    } else {
        txb.moveCall({
            target:PROTOCOL.RepositoryFn('policy_description_set') as FnCallType,
            arguments:[TXB_OBJECT(txb, repository), txb.pure(policy), txb.pure(description), TXB_OBJECT(txb, permission)]
        })   
    } 
    return true;
}

export function repository_set_policy_permission(txb:TransactionBlock, repository: RepositoryObject, permission:PermissionObject, 
    policy:string, permission_index?:number, passport?:PassportObject) : boolean {
    if (!IsValidObjects([repository, permission])) return false;
    if (!IsValidKey(policy)) return false;

    let index = OptionNone(txb);
    if (permission_index) {
        if(!IsValidPermissionIndex(permission_index)) return false;
        index = txb.pure(BCS_CONVERT.ser_option_u64(permission_index));
    }

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.RepositoryFn('policy_permission_set_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, repository), index, TXB_OBJECT(txb, permission)]
        })   
    } else {
        txb.moveCall({
            target:PROTOCOL.RepositoryFn('policy_permission_set') as FnCallType,
            arguments:[TXB_OBJECT(txb, repository), index, TXB_OBJECT(txb, permission)]
        })   
    }     
    return true
}

export function change_permission(txb:TransactionBlock, repository:RepositoryObject, old_permission:PermissionObject, new_permission:PermissionObject) {
    if (!IsValidObjects([repository, old_permission, new_permission])) return false;
    txb.moveCall({
        target:PROTOCOL.RepositoryFn('permission_set') as FnCallType,
        arguments: [TXB_OBJECT(txb, repository), TXB_OBJECT(txb, old_permission), TXB_OBJECT(txb, new_permission)],
        typeArguments:[]            
    })    
}


