import { TransactionBlock, Inputs, type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS } from '@mysten/bcs';
import { FnCallType, Data_Type, PROTOCOL, description_data} from './protocol';
import { PassportObject, verify,  } from './passport'
import { PermissionIndex, PermissionObject } from './permission'
import { BCS_CONVERT } from './util';

export const MAX_POLICY_COUNT = 1024;
export const MAX_KEY_LENGTH = 128;
export const MAX_VALUE_LENGTH = 204800;

export enum Repository_Policy_Mode {
    POLICY_MODE_FREE = 0,
    POLICY_MODE_STRICT = 1,
}
export type Repository_Policy = {
    name:string;
    description: string;
    value_type: Data_Type;
    permission?: number; // PermissionIndex like, must be geater than 10000
}
export type Repository_Policy_Data = {
    name: string;
    data: Repository_Value[];
    value_type?: Data_Type;
}
export type Repository_Value = {
    address: string; // UID: address or objectid
    value: Uint8Array;
}

export type RepositoryAddress = TransactionResult;
export type RepositoryObject = TransactionResult;

export function repository(txb:TransactionBlock, permission:PermissionObject, 
    description:string, policy_mode: Repository_Policy_Mode, passport?:PassportObject) : RepositoryObject {
    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.RepositoryFn('new_with_passport') as FnCallType,
            arguments:[passport, txb.pure(description_data(description)), txb.pure(policy_mode, BCS.U8), permission],
        })
    } else {
        return txb.moveCall({
            target:PROTOCOL.RepositoryFn('new') as FnCallType,
            arguments:[txb.pure(description_data(description)), txb.pure(policy_mode, BCS.U8), permission],
        })
    }
}

export function launch(txb:TransactionBlock, repository:RepositoryObject) : RepositoryAddress {
    return txb.moveCall({
        target:PROTOCOL.RepositoryFn('create') as FnCallType,
        arguments:[repository],
    })    
}
export function destroy(txb:TransactionBlock, repository:RepositoryObject) {
    return txb.moveCall({
        target:PROTOCOL.RepositoryFn('destroy') as FnCallType,
        arguments: [repository],
    })   
}
export function add_data(txb:TransactionBlock, repository:RepositoryObject, permission:PermissionObject, data:Repository_Policy_Data) {
    if (data?.value_type) {
        data.data.forEach((d) => txb.moveCall({
            target:PROTOCOL.RepositoryFn('add') as FnCallType,
            arguments:[repository, 
                txb.pure(d.address, BCS.ADDRESS),
                txb.pure(data.name), 
                txb.pure(data.value_type, BCS.U8),
                txb.pure([...d.value], 'vector<u8>'),
                permission,
            ],
        }))            
    } else {
        data.data.forEach((d) => txb.moveCall({
            target:PROTOCOL.RepositoryFn('add_typed_data') as FnCallType,
            arguments:[repository, 
                txb.pure(d.address, BCS.ADDRESS),
                txb.pure(data.name), 
                txb.pure([...d.value], 'vector<u8>'),
                permission,
            ],
        }))   
    }
}

export function remove(txb:TransactionBlock, repository:RepositoryObject, permission:PermissionObject, address:string, name:string) {
    txb.moveCall({
        target:PROTOCOL.RepositoryFn('remove') as FnCallType,
        arguments:[repository, 
            txb.pure(address, BCS.ADDRESS),
            txb.pure(name), 
            permission,
        ],
    })    
}
// add or modify the old 
export function repository_add_policies(txb:TransactionBlock, repository:RepositoryObject, permission:PermissionObject, policies:Repository_Policy[], passport?:PassportObject) {
    policies.forEach((policy) => {
        let permission_index = policy?.permission ? txb.pure(BCS_CONVERT.ser_option_u64(policy.permission)) : txb.pure([0], BCS.U8);
        if (passport) {
            txb.moveCall({
                target:PROTOCOL.RepositoryFn('policy_add_with_passport') as FnCallType,
                arguments:[passport, repository, 
                    txb.pure(policy.name), 
                    txb.pure(description_data(policy.description)),
                    permission_index, txb.pure(policy.value_type, BCS.U8),
                    permission]
            })              
        } else {
            txb.moveCall({
                target:PROTOCOL.RepositoryFn('policy_add') as FnCallType,
                arguments:[repository, 
                    txb.pure(policy.name), 
                    txb.pure(description_data(policy.description)),
                    permission_index, txb.pure(policy.value_type, BCS.U8),
                    permission]
            })  
        }
    });    
}

export function repository_remove_policies(txb:TransactionBlock, repository:RepositoryObject, permission:PermissionObject, policy_names:string[], removeall?:boolean, passport?:PassportObject) {
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.RepositoryFn('policy_remove_all_with_passport') as FnCallType,
                arguments:[passport, repository, permission]
            })          
        } else {
            policy_names.forEach((name) => {
                txb.moveCall({
                    target:PROTOCOL.RepositoryFn('policy_remove_with_passport') as FnCallType,
                    arguments:[passport, repository, txb.pure(name), permission]
                })                
            })
        }
    } else {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.RepositoryFn('policy_remove_all') as FnCallType,
                arguments:[repository, permission]
            })          
        } else {
            policy_names.forEach((name) => {
                txb.moveCall({
                    target:PROTOCOL.RepositoryFn('policy_remove') as FnCallType,
                    arguments:[repository, txb.pure(name), permission]
                })                
            })
        }
    }
}
// PermissionIndex.repository_description_set
export function repository_set_description(txb:TransactionBlock, repository:RepositoryObject, permission:PermissionObject, description:string, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.RepositoryFn('description_set_with_passport') as FnCallType,
            arguments:[passport, repository, txb.pure(description_data(description)), permission]
        }) 
    } else {
        txb.moveCall({
            target:PROTOCOL.RepositoryFn('description_set') as FnCallType,
            arguments:[repository, txb.pure(description_data(description)), permission]
        }) 
    }        
}

export function repository_set_policy_mode(txb:TransactionBlock, repository: RepositoryObject, permission:PermissionObject, policy_mode:Repository_Policy_Mode, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.RepositoryFn('policy_mode_set_with_passport') as FnCallType,
            arguments:[passport, repository, txb.pure(policy_mode), permission]
        })  
    } else {
        txb.moveCall({
            target:PROTOCOL.RepositoryFn('policy_mode_set') as FnCallType,
            arguments:[repository, txb.pure(policy_mode), permission]
        })  
    }     
}

export function repository_set_policy_description(txb:TransactionBlock, repository: RepositoryObject, permission:PermissionObject, description:string, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.RepositoryFn('description_set_with_passport') as FnCallType,
            arguments:[passport, repository, txb.pure(description_data(description)), permission]
        })   
    } else {
        txb.moveCall({
            target:PROTOCOL.RepositoryFn('description_set') as FnCallType,
            arguments:[repository, txb.pure(description_data(description)), permission]
        })   
    } 
}

export function repository_set_policy_permission(txb:TransactionBlock, repository: RepositoryObject, permission:PermissionObject, permission_index:number, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.RepositoryFn('policy_mode_set_with_passport') as FnCallType,
            arguments:[passport, repository, txb.pure(permission_index, BCS.U64), permission]
        })   
    } else {
        txb.moveCall({
            target:PROTOCOL.RepositoryFn('policy_mode_set') as FnCallType,
            arguments:[repository, txb.pure(permission_index, BCS.U64), permission]
        })   
    }     
}

export function change_permission(txb:TransactionBlock, repository:RepositoryObject, old_permission:PermissionObject, new_permission:PermissionObject) {
    txb.moveCall({
        target:PROTOCOL.RepositoryFn('permission_set') as FnCallType,
        arguments: [repository, old_permission, new_permission],
        typeArguments:[]            
    })    
}


