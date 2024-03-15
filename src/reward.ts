import { TransactionBlock, Inputs, type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS, getSuiMoveConfig, toHEX, fromHEX, BcsReader } from '@mysten/bcs';
import { CLOCK_OBJECT, FnCallType, description_data, GuardObject, PROTOCOL} from './protocol';
import { verify,  PassportObject} from './passport'
import { PermissionIndex, PermissionObject } from './permission'

export type RewardObject = TransactionResult;
export type RewardAddress = TransactionResult;
export type Reward = TransactionResult;

export function reward(reward_type:string, txb:TransactionBlock, permission:PermissionObject, description:string, minutes_duration:number, passport?:PassportObject) : RewardObject {
    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.RewardFn('new_with_passport') as FnCallType,
            arguments:[passport, txb.pure(description_data(description)), txb.pure(minutes_duration, BCS.U64), 
                txb.object(CLOCK_OBJECT), permission], 
            typeArguments:[reward_type]
        })
    } else {
        return txb.moveCall({
            target:PROTOCOL.RewardFn('new') as FnCallType,
            arguments:[txb.pure(description_data(description)), txb.pure(minutes_duration, BCS.U64), 
                txb.object(CLOCK_OBJECT), permission], 
            typeArguments:[reward_type]
        })
    }
}
export function launch(reward_type:string, txb:TransactionBlock, reward:RewardObject): RewardAddress {
    return txb.moveCall({
        target:PROTOCOL.RewardFn('create') as FnCallType,
        arguments:[reward], 
        typeArguments:[reward_type]
    })
}
export function destroy(reward_type:string, txb:TransactionBlock, reward:RewardObject) {
    return txb.moveCall({
        target:PROTOCOL.RewardFn('destroy') as FnCallType,
        arguments: [reward],
    })   
}
export function reward_refund(reward_type:string, txb:TransactionBlock, reward:RewardObject, permission:PermissionObject, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.RewardFn('refund_with_passport') as FnCallType,
            arguments:[passport, reward, txb.object(CLOCK_OBJECT), permission], 
            typeArguments:[reward_type]
        })  
    } else {
        txb.moveCall({
            target:PROTOCOL.RewardFn('refund') as FnCallType,
            arguments:[reward, txb.object(CLOCK_OBJECT), permission], 
            typeArguments:[reward_type]
        })        
    }
}

export function reward_expand_time(reward_type:string, txb:TransactionBlock, reward:RewardObject, permission:PermissionObject, minutes_expand:number, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.RewardFn('time_expand_with_passport') as FnCallType,
            arguments:[passport, reward, txb.pure(minutes_expand, BCS.U64), permission], 
            typeArguments:[reward_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.RewardFn('time_expand') as FnCallType,
            arguments:[reward, txb.pure(minutes_expand, BCS.U64), permission], 
            typeArguments:[reward_type]
        })
    }
}
export type RewardGuardPortions = {
    guard:GuardObject;
    portions:number;
}
export function reward_add_guard(reward_type:string, txb:TransactionBlock, reward:RewardObject, permission:PermissionObject, gurads:RewardGuardPortions[], passport?:PassportObject) {
    if (passport) {
        gurads.forEach((guard) => 
            txb.moveCall({
                target:PROTOCOL.RewardFn('guard_add_with_passport') as FnCallType,
                arguments:[passport, reward, guard.guard, txb.pure(guard.portions, BCS.U64), permission], 
                typeArguments:[reward_type]
            })
        )
    } else {
        gurads.forEach((guard) => 
            txb.moveCall({
                target:PROTOCOL.RewardFn('guard_add') as FnCallType,
                arguments:[reward, guard.guard, txb.pure(guard.portions, BCS.U64), permission], 
                typeArguments:[reward_type]
            })
        )
    }
}
export function reward_remove_guard(reward_type:string, txb:TransactionBlock, reward:RewardObject, permission:PermissionObject, guards:string[], removeall?:boolean, passport?:PassportObject) {
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.RewardFn('guard_remove_all_with_passport') as FnCallType,
                arguments:[passport, reward, permission], 
                typeArguments:[reward_type]
            })
        } else {
            txb.moveCall({
                target:PROTOCOL.RewardFn('guard_remove_with_passport') as FnCallType,
                arguments:[passport, reward, txb.pure(guards, 'vector<address>'), permission], 
                typeArguments:[reward_type]
            })
        }
    } else {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.RewardFn('guard_remove_all') as FnCallType,
                arguments:[reward, permission], 
                typeArguments:[reward_type]
            })
        } else {
            txb.moveCall({
                target:PROTOCOL.RewardFn('guard_remove') as FnCallType,
                arguments:[reward, txb.pure(guards, 'vector<address>'), permission], 
                typeArguments:[reward_type]
            })
        }
    }
}
export function reward_set_description(reward_type:string, txb:TransactionBlock, reward:RewardObject, permission:PermissionObject, description:string, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.RewardFn('description_set_with_passport') as FnCallType,
            arguments:[passport, reward, txb.pure(description_data(description)), permission], 
            typeArguments:[reward_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.RewardFn('description_set') as FnCallType,
            arguments:[reward, txb.pure(description_data(description)), permission], 
            typeArguments:[reward_type]
        })
    }
}
export function reward_lock_guards(reward_type:string, txb:TransactionBlock, reward:RewardObject, permission:PermissionObject, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.RewardFn('guard_lock_with_passport') as FnCallType,
            arguments:[passport, reward, permission], 
            typeArguments:[reward_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.RewardFn('guard_lock') as FnCallType,
            arguments:[reward, permission], 
            typeArguments:[reward_type]
        })
    }
}
export function claim(reward_type:string, txb:TransactionBlock, reward:RewardObject, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.RewardFn('claim_with_passport') as FnCallType,
            arguments:[passport, reward, txb.object(CLOCK_OBJECT)], 
            typeArguments:[reward_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.RewardFn('claim_with_passport') as FnCallType,
            arguments:[reward, txb.object(CLOCK_OBJECT)], 
            typeArguments:[reward_type]
        })        
    }
}
export function deposit(reward_type:string, txb:TransactionBlock, reward:RewardObject, reward_objects:Reward[]) {
    txb.moveCall({
        target:PROTOCOL.RewardFn('deposit') as FnCallType,
        arguments:[reward, txb.makeMoveVec({objects:reward_objects})], //@
        typeArguments:[reward_type]
    })
}
export function change_permission(reward_type:string, txb:TransactionBlock, reward:RewardObject, old_permission:PermissionObject, new_permission:PermissionObject) {
    txb.moveCall({
        target:PROTOCOL.RewardFn('permission_set') as FnCallType,
        arguments: [reward, old_permission, new_permission],
        typeArguments:[reward_type]            
    })    
}