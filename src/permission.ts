import { TransactionBlock, Inputs, type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS } from '@mysten/bcs';
import { description_data, FnCallType, PROTOCOL, TxbObject, GuardObject, TXB_OBJECT} from './protocol';
import { array_unique } from './util';


export const MAX_ADMIN_COUNT = 64;
export const MAX_ENTITY_COUNT = 1024;
export const MAX_PERMISSION_INDEX_COUNT = 512;

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
}
export type Permission_Index = {
    index:PermissionIndex;
    guard?: TxbObject;
}
export type Permission_Entity = {
    who:string;
    permissions:Permission_Index[];
}

export type PermissionAddress = TransactionResult;
export type PermissionObject = TransactionResult;

export function permission(txb:TransactionBlock, description:string) : PermissionObject {
    return txb.moveCall({
        target: PROTOCOL.PermissionFn('new') as FnCallType,
        arguments: [txb.pure(description_data(description))]
    });
}

export function launch(txb:TransactionBlock, permission:PermissionObject) : PermissionAddress {
    return txb.moveCall({ // address returned
        target:PROTOCOL.PermissionFn('create')  as FnCallType,
        arguments:[ permission ]        
    })
}

export function add_entity(txb:TransactionBlock, permission:PermissionObject, entities:Permission_Entity[]) {
    let guards:any[]  = [];
    for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];
        let indexes :number[] = [];

        for (let j = 0; j <  entity.permissions.length; j++) {
            let index = entity.permissions[j];
            if (index?.guard) {
                guards.push({who:entity.who, index:index.index, guard:index.guard});
            }
            
            if (!indexes.includes(index.index))   {
                indexes.push(index.index);
            }      
        }    
        if (indexes.length > 0) {
            txb.moveCall({
                target:PROTOCOL.PermissionFn('add_batch') as FnCallType,
                arguments:[permission, txb.pure(entity.who, BCS.ADDRESS), txb.pure(indexes, 'vector<u64>')]
            })            
        }
    } 
    // set guards
    guards.forEach(({who, index, guard}) => {
        txb.moveCall({
            target:PROTOCOL.PermissionFn('guard_set') as FnCallType,
            arguments:[ permission, txb.pure(who, BCS.ADDRESS), txb.pure(index, BCS.U64), TXB_OBJECT(txb, guard)]
        })
    })
}

// guard: undefine to set none
export function set_guard(txb:TransactionBlock, permission:PermissionObject, who:string, index:number, guard?:string | GuardObject) {
    if (guard) {
        txb.moveCall({
            target:PROTOCOL.PermissionFn('guard_set') as FnCallType,
            arguments:[permission, txb.pure(who, BCS.ADDRESS), txb.pure(index, BCS.U64), TXB_OBJECT(txb, guard)]
        })    
    } else {
        txb.moveCall({
            target:PROTOCOL.PermissionFn('guard_none') as FnCallType,
            arguments:[permission, txb.pure(who, BCS.ADDRESS), txb.pure(index, BCS.U64)]
        })       
    }
}

export function add_or_modify(txb:TransactionBlock, permission:PermissionObject, who:string, index:number, modifyIfOldExist?:boolean, guard?:string | GuardObject) {
    if (guard) {
        txb.moveCall({
            target:PROTOCOL.PermissionFn('add_or_modify') as FnCallType,
            arguments:[permission, txb.pure(who, BCS.ADDRESS), txb.pure(index, BCS.U64), TXB_OBJECT(txb, guard), txb.pure(modifyIfOldExist, BCS.BOOL)]
        })    
    } else {
        txb.moveCall({
            target:PROTOCOL.PermissionFn('add_or_modify') as FnCallType,
            arguments:[permission, txb.pure(who, BCS.ADDRESS), txb.pure(index, BCS.U64), txb.pure([], BCS.U8), txb.pure(modifyIfOldExist, BCS.BOOL)]
        })   
    }
}
export function remove_index(txb:TransactionBlock, permission:PermissionObject, who:string, index:number[]) {
    if (index) {
        txb.moveCall({
            target:PROTOCOL.PermissionFn('remove_index') as FnCallType,
            arguments:[permission, txb.pure(who, BCS.ADDRESS), txb.pure(index, 'vector<u64>')]
        })            
    }
}
export function remove_entity(txb:TransactionBlock, permission:PermissionObject, who:string[]) {
    if (who) {
        txb.moveCall({
            target:PROTOCOL.PermissionFn('remove') as FnCallType,
            arguments:[permission, txb.pure(who, 'vector<address>')]
        })           
    }
}
export function set_description(txb:TransactionBlock, permission:PermissionObject, description:string) {
    txb.moveCall({
        target:PROTOCOL.PermissionFn('description_set') as FnCallType,
        arguments: [permission, txb.pure(description_data(description))]
    })
}

export function add_admin(txb:TransactionBlock, permission:PermissionObject, admin:string[]) {
    let n = array_unique(admin); 
    txb.moveCall({
        target:PROTOCOL.PermissionFn('admin_add_batch')  as FnCallType,
        arguments:[permission, txb.pure(n, 'vector<address>')]
    });    
}

export function remove_admin(txb:TransactionBlock, permission:PermissionObject, admin:string[], removeall?:boolean) {
    if (removeall) {
        txb.moveCall({
            target:PROTOCOL.PermissionFn('admins_clear')  as FnCallType,
            arguments:[permission]
        });    
    } else {
        txb.moveCall({
            target:PROTOCOL.PermissionFn('admin_remove_batch')  as FnCallType,
            arguments:[permission, txb.pure(admin, 'vector<address>')]
        });            
    }
}

export function change_owner(txb:TransactionBlock, permission:PermissionObject, new_owner:string) {
    txb.moveCall({
        target:PROTOCOL.PermissionFn('builder_set')  as FnCallType,
        arguments:[permission, txb.pure(new_owner, BCS.ADDRESS)]
    });        
}