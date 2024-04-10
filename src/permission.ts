import { TransactionBlock, Inputs, type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS } from '@mysten/bcs';
import { FnCallType, PROTOCOL, TxbObject, PermissionObject, PermissionAddress, TXB_OBJECT, IsValidDesription, 
    IsValidObjects, IsValidAddress, IsValidArray, GuardObject, IsValidUint} from './protocol';
import { array_unique } from './utils';


export const MAX_ADMIN_COUNT = 64;
export const MAX_ENTITY_COUNT = 2000;
export const MAX_PERMISSION_INDEX_COUNT = 200;

export enum PermissionIndex {
    repository = 100,
    repository_set_description_set = 101,
    repository_set_policy_mode = 102,
    repository_add_policies = 106,
    repository_remove_policies = 107,
    repository_set_policy_description = 109,
    repository_set_policy_permission = 110,
    vote = 150,
    vote_set_description = 151,
    vote_set_reference = 152, 
    vote_add_guard = 153,
    vote_remove_guard = 154,
    vote_add_option = 155,
    vote_remove_option = 156,
    vote_set_max_choice_count = 157,
    vote_open_voting = 158,
    vote_lock_deadline = 159,
    vote_expand_deadline = 160,
    vote_lock_guard = 161,
    service = 200,
    service_set_description = 201,
    service_set_price = 202,
    service_set_stock = 203,
    service_add_stock = 203,
    service_reduce_stock = 203,
    service_set_payee = 205,
    service_repository_add = 206,
    service_repository_remove = 207,
    service_add_withdraw_guards = 208,
    service_remove_withdraw_guards  = 209,
    service_add_refund_guards = 210,
    service_remove_refund_guards = 211,
    service_add_sales = 212,
    service_remove_sales = 213,
    service_discount_transfer = 214,
    service_withdraw = 216,
    service_set_buy_guard = 217,
    service_set_machine = 218,
    service_set_endpoint = 219,
    service_publish = 220,
    service_clone = 221,
    service_set_customer_required = 222,
    service_remove_customer_required = 222,
    service_change_required_pubkey = 222,
    service_change_order_required_pubkey = 224,
    service_pause = 225,
    reward = 240,
    reward_refund = 241,
    reward_expand_time = 242,
    reward_add_guard = 243,
    reward_remove_guard = 244,
    reward_set_description = 245,
    reward_lock_guards = 246,
    demand = 260,
    demand_refund = 261,
    demand_expand_time = 262,
    demand_set_guard = 263,
    demand_set_description = 264,
    demand_yes = 265,
    machine = 600,
    machine_set_description = 601,
    machine_add_repository = 602,
    machine_remove_repository = 603,
    machine_clone =  604,
    machine_add_node = 606,
    machine_add_node2 = 606,
    machine_remove_node = 607,
    machine_set_endpoint = 608,
    machine_pause = 609,
    machine_publish = 610,
    progress = 650,
    progress_set_namedOperator = 651,
    progress_bind_task = 652,
    progress_set_context_repository = 653,
    progress_unhold = 654,
    user_defined_start = 10000,
}

export type PermissionIndexType = PermissionIndex | number;
export const IsValidUserDefinedIndex = (index:number) : boolean => { 
    return index >= PermissionIndex.user_defined_start && IsValidUint(index)
}
export const IsValidPermissionIndex = (index:PermissionIndexType) : boolean => {
    //console.log(index)
    if (Object.values(PermissionIndex).includes(index)) {
        return true
    }
    //console.log(Object.keys(PermissionIndex))
    return IsValidUserDefinedIndex(index);
}

export type Permission_Index = {
    index: PermissionIndexType;
    guard?: TxbObject;
}

export type Permission_Entity = {
    entity_address:string;
    permissions:Permission_Index[];
}

export function permission(txb:TransactionBlock, description:string) : PermissionObject | boolean {
    if (!IsValidDesription(description)) return false;

    return txb.moveCall({
        target: PROTOCOL.PermissionFn('new') as FnCallType,
        arguments: [txb.pure(description)]
    });
}

export function launch(txb:TransactionBlock, permission:PermissionObject) : PermissionAddress | boolean {
    if (!IsValidObjects([permission])) return false;
    return txb.moveCall({ // address returned
        target:PROTOCOL.PermissionFn('create')  as FnCallType,
        arguments:[ TXB_OBJECT(txb, permission) ]        
    })
}
export function destroy(txb:TransactionBlock, permission:PermissionObject) : boolean {
    if (!IsValidObjects([permission])) return false;
    txb.moveCall({
        target:PROTOCOL.PermissionFn('destroy') as FnCallType,
        arguments: [TXB_OBJECT(txb, permission)],
    })   
    return true
}
export function add_entity(txb:TransactionBlock, permission:PermissionObject, entities:Permission_Entity[]) : boolean {
    if (!IsValidObjects([permission])) return false;
    if (!entities) return false;

    let bValid = true;
    let e = entities.forEach((v) => {
        if (!IsValidAddress(v.entity_address)) bValid = false;
        v.permissions.forEach((p) => {
            if (!IsValidPermissionIndex(p.index)) bValid = false;
            if (p?.guard && !IsValidObjects([p.guard])) bValid = false;
        })
    });
    if (!bValid) return false;

    let guards:any[]  = [];
    for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];
        let indexes :number[] = [];

        for (let j = 0; j <  entity.permissions.length; j++) {
            let index = entity.permissions[j];
            if (!IsValidPermissionIndex(index.index)) {
                continue;
            }
            
            if (!indexes.includes(index.index))   {
                indexes.push(index.index);
                if (index?.guard) {
                    guards.push({entity_address:entity.entity_address, index:index.index, guard:index.guard});
                }
            }      
        }    
        if (indexes.length > 0) {
            txb.moveCall({
                target:PROTOCOL.PermissionFn('add_batch') as FnCallType,
                arguments:[TXB_OBJECT(txb, permission), txb.pure(entity.entity_address, BCS.ADDRESS), txb.pure(indexes, 'vector<u64>')]
            })            
        }
    } 
    // set guards
    guards.forEach(({entity_address, index, guard}) => {
        txb.moveCall({
            target:PROTOCOL.PermissionFn('guard_set') as FnCallType,
            arguments:[ TXB_OBJECT(txb, permission), txb.pure(entity_address, BCS.ADDRESS), txb.pure(index, BCS.U64), TXB_OBJECT(txb, guard)]
        })
    })

    return true;
}

// guard: undefine to set none
export function set_guard(txb:TransactionBlock, permission:PermissionObject, entity_address:string, 
    index:PermissionIndexType, guard?:GuardObject) : boolean {
    if (!IsValidObjects([permission])) return false;
    if (!IsValidAddress(entity_address) || !IsValidPermissionIndex(index)) return false;

    if (guard) {
        txb.moveCall({
            target:PROTOCOL.PermissionFn('guard_set') as FnCallType,
            arguments:[TXB_OBJECT(txb, permission), txb.pure(entity_address, BCS.ADDRESS), txb.pure(index, BCS.U64), TXB_OBJECT(txb, guard)]
        })    
    } else {
        txb.moveCall({
            target:PROTOCOL.PermissionFn('guard_none') as FnCallType,
            arguments:[TXB_OBJECT(txb, permission), txb.pure(entity_address, BCS.ADDRESS), txb.pure(index, BCS.U64)]
        })       
    }
    return true;
}

export function remove_index(txb:TransactionBlock, permission:PermissionObject, entity_address:string, 
    index:PermissionIndexType[]) : boolean {
    if (!IsValidObjects([permission])) return false;
    if (!IsValidAddress(entity_address)) return false;
    if (!index || !(IsValidArray(index, IsValidPermissionIndex))) return false;

    txb.moveCall({
        target:PROTOCOL.PermissionFn('remove_index') as FnCallType,
        arguments:[TXB_OBJECT(txb, permission), txb.pure(entity_address, BCS.ADDRESS), txb.pure(array_unique(index), 'vector<u64>')]
    })            
    return true;
}
export function remove_entity(txb:TransactionBlock, permission:PermissionObject, entity_address:string[]) : boolean {
    if (!IsValidObjects([permission])) return false;
    if (!entity_address || !IsValidArray(entity_address, IsValidAddress)) return false;

    txb.moveCall({
        target:PROTOCOL.PermissionFn('remove') as FnCallType,
        arguments:[TXB_OBJECT(txb, permission), txb.pure(array_unique(entity_address), 'vector<address>')]
    })           
    return true;
}
export function set_description(txb:TransactionBlock, permission:PermissionObject, description:string) : boolean {
    if (!IsValidObjects([permission])) return false;
    if (!IsValidDesription(description)) return false;

    txb.moveCall({
        target:PROTOCOL.PermissionFn('description_set') as FnCallType,
        arguments: [TXB_OBJECT(txb, permission), txb.pure(description)]
    })
    return true;
}

export function add_admin(txb:TransactionBlock, permission:PermissionObject, admin:string[]) : boolean {
    if (!IsValidObjects([permission])) return false;
    if (!admin || !IsValidArray(admin, IsValidAddress)) return false;

    txb.moveCall({
        target:PROTOCOL.PermissionFn('admin_add_batch')  as FnCallType,
        arguments:[TXB_OBJECT(txb, permission), txb.pure(array_unique(admin), 'vector<address>')]
    });           
    return true;
}

export function remove_admin(txb:TransactionBlock, permission:PermissionObject, admin:string[], removeall?:boolean) : boolean {
    if (!IsValidObjects([permission])) return false;
    if (!removeall && !admin) return false;
    if (!IsValidArray(admin, IsValidAddress)) return false; 
    
    if (removeall) {
        txb.moveCall({
            target:PROTOCOL.PermissionFn('admins_clear')  as FnCallType,
            arguments:[TXB_OBJECT(txb, permission)]
        });    
    } else if (admin) {
        txb.moveCall({
            target:PROTOCOL.PermissionFn('admin_remove_batch')  as FnCallType,
            arguments:[TXB_OBJECT(txb, permission), txb.pure(array_unique(admin), 'vector<address>')]
        });            
    }
    return true
}

export function change_owner(txb:TransactionBlock, permission:PermissionObject, new_owner:string) :boolean {
    if (!IsValidObjects([permission])) return false;
    if (!IsValidAddress(new_owner)) return false;
    
    txb.moveCall({
        target:PROTOCOL.PermissionFn('builder_set')  as FnCallType,
        arguments:[TXB_OBJECT(txb, permission), txb.pure(new_owner, BCS.ADDRESS)]
    });        
    return true
}