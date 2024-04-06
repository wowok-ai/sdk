import { TransactionBlock, type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS} from '@mysten/bcs';
import { CLOCK_OBJECT, FnCallType, GuardObject, IsValidAddress, IsValidArgType, IsValidArray, IsValidDesription, IsValidObjects, IsValidUint, PROTOCOL, PassportObject, PermissionObject,
    RewardAddress, RewardObject, TXB_OBJECT} from './protocol';
import { array_unique } from './util';

export type Reward = TransactionResult;
export type CoinReward = TransactionResult;

export function reward(reward_type:string, txb:TransactionBlock, permission:PermissionObject, description:string, 
    minutes_duration:number, passport?:PassportObject) : RewardObject | boolean {
    if (!IsValidObjects([permission])) return false;
    if (!IsValidArgType(reward_type)) return false;
    if (!IsValidDesription(description)) return false;
    if (!IsValidUint(minutes_duration)) return false;

    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.RewardFn('new_with_passport') as FnCallType,
            arguments:[passport, txb.pure(description), txb.pure(minutes_duration, BCS.U64), 
                txb.object(CLOCK_OBJECT), TXB_OBJECT(txb, permission)], 
            typeArguments:[reward_type]
        })
    } else {
        return txb.moveCall({
            target:PROTOCOL.RewardFn('new') as FnCallType,
            arguments:[txb.pure(description), txb.pure(minutes_duration, BCS.U64), 
                txb.object(CLOCK_OBJECT), TXB_OBJECT(txb, permission)], 
            typeArguments:[reward_type]
        })
    }
}
export function launch(reward_type:string, txb:TransactionBlock, reward:RewardObject): RewardAddress | boolean {
    if (!IsValidObjects([reward])) return false;
    if (!IsValidArgType(reward_type)) return false;
    return txb.moveCall({
        target:PROTOCOL.RewardFn('create') as FnCallType,
        arguments:[TXB_OBJECT(txb, reward)], 
        typeArguments:[reward_type]
    })
}

export function destroy(reward_type:string, txb:TransactionBlock, reward:RewardObject) : boolean {
    if (!IsValidObjects([reward])) return false;
    if (!IsValidArgType(reward_type)) return false;
    txb.moveCall({
        target:PROTOCOL.RewardFn('destroy') as FnCallType,
        arguments: [TXB_OBJECT(txb, reward)],
    })   
    return true
}
export function reward_refund(reward_type:string, txb:TransactionBlock, reward:RewardObject, 
    permission:PermissionObject, passport?:PassportObject) :  boolean {
        if (!IsValidObjects([reward, permission])) return false;
        if (!IsValidArgType(reward_type)) return false;
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.RewardFn('refund_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, reward), txb.object(CLOCK_OBJECT), TXB_OBJECT(txb, permission)], 
            typeArguments:[reward_type]
        })  
    } else {
        txb.moveCall({
            target:PROTOCOL.RewardFn('refund') as FnCallType,
            arguments:[TXB_OBJECT(txb, reward), txb.object(CLOCK_OBJECT), TXB_OBJECT(txb, permission)], 
            typeArguments:[reward_type]
        })        
    }
    return true
}

export function reward_expand_time(reward_type:string, txb:TransactionBlock, reward:RewardObject, 
    permission:PermissionObject, minutes_expand:number, passport?:PassportObject) : boolean {
    if (!IsValidObjects([reward, permission])) return false;
    if (!IsValidArgType(reward_type)) return false;
    if (!IsValidUint(minutes_expand)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.RewardFn('time_expand_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, reward), txb.pure(minutes_expand, BCS.U64), TXB_OBJECT(txb, permission)], 
            typeArguments:[reward_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.RewardFn('time_expand') as FnCallType,
            arguments:[TXB_OBJECT(txb, reward), txb.pure(minutes_expand, BCS.U64), TXB_OBJECT(txb, permission)], 
            typeArguments:[reward_type]
        })
    }
    return true
}
export type RewardGuardPortions = {
    guard:GuardObject;
    portions:number;
}
export function reward_add_guard(reward_type:string, txb:TransactionBlock, reward:RewardObject, 
    permission:PermissionObject, gurads:RewardGuardPortions[], passport?:PassportObject) : boolean {
    if (!IsValidObjects([reward, permission])) return false;
    if (!IsValidArgType(reward_type)) return false;
    if (!gurads) return false;

    let bValid = true;
    gurads.forEach((v) => {
        if (!IsValidUint(v.portions)) bValid = false;
        if (!IsValidObjects([v.guard])) bValid = false;
    })
    if (!bValid) return false;

    if (passport) {
        gurads.forEach((guard) => 
            txb.moveCall({
                target:PROTOCOL.RewardFn('guard_add_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, reward), TXB_OBJECT(txb, guard.guard), txb.pure(guard.portions, BCS.U64), TXB_OBJECT(txb, permission)], 
                typeArguments:[reward_type]
            })
        )
    } else {
        gurads.forEach((guard) => 
            txb.moveCall({
                target:PROTOCOL.RewardFn('guard_add') as FnCallType,
                arguments:[TXB_OBJECT(txb, reward), TXB_OBJECT(txb, guard.guard), txb.pure(guard.portions, BCS.U64), TXB_OBJECT(txb, permission)], 
                typeArguments:[reward_type]
            })
        )
    }
    return true
}
export function reward_remove_guard(reward_type:string, txb:TransactionBlock, reward:RewardObject,
    permission:PermissionObject, guards:string[], removeall?:boolean, passport?:PassportObject) : boolean {
    if (!IsValidObjects([reward, permission])) return false;
    if (!IsValidArgType(reward_type)) return false;
    if (!removeall && !guards) return false;
    if (guards && !IsValidArray(guards, IsValidAddress)) return false;

    if (passport) {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.RewardFn('guard_remove_all_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, reward), TXB_OBJECT(txb, permission)], 
                typeArguments:[reward_type]
            })
        } else {
            txb.moveCall({
                target:PROTOCOL.RewardFn('guard_remove_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, reward), txb.pure(array_unique(guards), 'vector<address>'), TXB_OBJECT(txb, permission)], 
                typeArguments:[reward_type]
            })
        }
    } else {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.RewardFn('guard_remove_all') as FnCallType,
                arguments:[TXB_OBJECT(txb, reward), TXB_OBJECT(txb, permission)], 
                typeArguments:[reward_type]
            })
        } else {
            txb.moveCall({
                target:PROTOCOL.RewardFn('guard_remove') as FnCallType,
                arguments:[TXB_OBJECT(txb, reward), txb.pure(guards, 'vector<address>'), TXB_OBJECT(txb, permission)], 
                typeArguments:[reward_type]
            })
        }
    }
    return true
}
export function allow_repeat_claim(reward_type:string, txb:TransactionBlock, reward:RewardObject, 
    permission:PermissionObject, allow_repeat_claim:boolean, passport?:PassportObject) : boolean {
    if (!IsValidObjects([reward, permission])) return false;
    if (!IsValidArgType(reward_type)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.RewardFn('allow_repeat_claim_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, reward), TXB_OBJECT(txb, permission), txb.pure(allow_repeat_claim, BCS.BOOL)], 
            typeArguments:[reward_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.RewardFn('allow_repeat_claim_with_passport') as FnCallType,
            arguments:[TXB_OBJECT(txb, reward), TXB_OBJECT(txb, permission), txb.pure(allow_repeat_claim, BCS.BOOL)], 
            typeArguments:[reward_type]
        })
    }
    return true
}
export function reward_set_description(reward_type:string, txb:TransactionBlock, reward:RewardObject, 
    permission:PermissionObject, description:string, passport?:PassportObject) : boolean {
    if (!IsValidObjects([reward, permission])) return false;
    if (!IsValidArgType(reward_type)) return false;
    if (!IsValidDesription(description)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.RewardFn('description_set_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, reward), txb.pure(description), TXB_OBJECT(txb, permission)], 
            typeArguments:[reward_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.RewardFn('description_set') as FnCallType,
            arguments:[TXB_OBJECT(txb, reward), txb.pure(description), TXB_OBJECT(txb, permission)], 
            typeArguments:[reward_type]
        })
    }
    return true
}
export function reward_lock_guards(reward_type:string, txb:TransactionBlock, reward:RewardObject, 
    permission:PermissionObject, passport?:PassportObject) : boolean {
    if (!IsValidObjects([reward, permission])) return false;
    if (!IsValidArgType(reward_type)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.RewardFn('guard_lock_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, reward), TXB_OBJECT(txb, permission)], 
            typeArguments:[reward_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.RewardFn('guard_lock') as FnCallType,
            arguments:[TXB_OBJECT(txb, reward), TXB_OBJECT(txb, permission)], 
            typeArguments:[reward_type]
        })
    }
    return true
}
export function claim(reward_type:string, txb:TransactionBlock, reward:RewardObject, passport?:PassportObject) : boolean {
    if (!IsValidObjects([reward])) return false;
    if (!IsValidArgType(reward_type)) return false;
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.RewardFn('claim_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, reward), txb.object(CLOCK_OBJECT)], 
            typeArguments:[reward_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.RewardFn('claim') as FnCallType,
            arguments:[TXB_OBJECT(txb, reward), txb.object(CLOCK_OBJECT)], 
            typeArguments:[reward_type]
        })        
    }
    return true;
}
export function deposit(reward_type:string, txb:TransactionBlock, reward:RewardObject, rewards:Reward[]) : boolean {
    if (!IsValidObjects([reward])) return false;
    if (!IsValidArgType(reward_type)) return false;
    if (!rewards && !IsValidObjects(rewards)) return false;

    txb.moveCall({
        target:PROTOCOL.RewardFn('deposit') as FnCallType,
        arguments:[TXB_OBJECT(txb, reward), txb.makeMoveVec({objects:array_unique(rewards)})], //@
        typeArguments:[reward_type]
    })
    return true
}

export function change_permission(reward_type:string, txb:TransactionBlock, reward:RewardObject, 
    old_permission:PermissionObject, new_permission:PermissionObject) : boolean{
    if (!IsValidObjects([reward, old_permission, new_permission])) return false;
    if (!IsValidArgType(reward_type)) return false;
    
    txb.moveCall({
        target:PROTOCOL.RewardFn('permission_set') as FnCallType,
        arguments: [TXB_OBJECT(txb, reward), TXB_OBJECT(txb, old_permission), TXB_OBJECT(txb, new_permission)],
        typeArguments:[reward_type]            
    })    
    return true
}