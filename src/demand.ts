import { TransactionBlock, Inputs, type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS } from '@mysten/bcs';
import { CLOCK_OBJECT, FnCallType, IsValidDesription, PROTOCOL, PassportObject, PermissionObject, IsValidArgType, GuardObject,
    DemandAddress, DemandObject, TXB_OBJECT, IsValidUint, IsValidAddress, TxbObject, IsValidObjects, ServiceObject } from './protocol';

export const MAX_EARNEST_COUNT = 200;
export const MAX_PRESENTERS_COUNT = 200;


export function demand(earnest_type:string, txb:TransactionBlock, permission:PermissionObject, description:string, 
    earnest:TransactionResult, passport?:PassportObject) : DemandObject | boolean {
    if (!IsValidObjects([permission, earnest])) return false;
    if (!IsValidDesription(description) || !IsValidArgType(earnest_type)) return false;

    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.DemandFn('new_with_passport') as FnCallType,
            arguments:[passport, txb.pure(description), earnest, TXB_OBJECT(txb, permission)],
            typeArguments:[earnest_type],
        })        
    } else {
        return txb.moveCall({
            target:PROTOCOL.DemandFn('new') as FnCallType,
            arguments:[txb.pure(description), earnest, TXB_OBJECT(txb, permission)],
            typeArguments:[earnest_type],
        })        
    }
}

export function launch(earnest_type:string, txb:TransactionBlock, demand:DemandObject) : DemandAddress | boolean {
    if (!IsValidObjects([demand])) return false;
    if (!IsValidArgType(earnest_type)) return false;
    return txb.moveCall({
        target:PROTOCOL.DemandFn('create') as FnCallType,
        arguments:[TXB_OBJECT(txb, demand)],
        typeArguments:[earnest_type],
    })
}

export function destroy(earnest_type:string, txb:TransactionBlock, demand:DemandObject) : boolean {
    if (!IsValidObjects([demand])) return false;
    if (!IsValidArgType(earnest_type)) return false;
    txb.moveCall({
        target:PROTOCOL.DemandFn('destroy') as FnCallType,
        arguments: [TXB_OBJECT(txb, demand)],
        typeArguments:[earnest_type]
    }) 
    return true  
}
export function demand_refund(earnest_type:string, txb:TransactionBlock, demand:DemandObject, permission:PermissionObject, 
    passport?:PassportObject) : boolean {
    if (!IsValidObjects([demand, permission])) return false;
    if (!IsValidArgType(earnest_type)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.DemandFn('refund_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, demand), txb.object(CLOCK_OBJECT), TXB_OBJECT(txb, permission)],
            typeArguments:[earnest_type],
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.DemandFn('refund') as FnCallType,
            arguments:[TXB_OBJECT(txb, demand), txb.object(CLOCK_OBJECT), TXB_OBJECT(txb, permission)],
            typeArguments:[earnest_type],
        })            
    }
    return true
}

export function demand_expand_time(earnest_type:string, txb:TransactionBlock, demand:DemandObject, permission:PermissionObject, 
    minutes_duration:number, passport?:PassportObject) : boolean {
    if (!IsValidObjects([demand, permission])) return false;
    if (!IsValidArgType(earnest_type)) return false;
    if (!IsValidUint(minutes_duration)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.DemandFn('time_expand_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, demand), txb.pure(minutes_duration, BCS.U64), txb.object(CLOCK_OBJECT), TXB_OBJECT(txb, permission)],
            typeArguments:[earnest_type],
        })  
    } else {
        txb.moveCall({
            target:PROTOCOL.DemandFn('time_expand') as FnCallType,
            arguments:[TXB_OBJECT(txb, demand), txb.pure(minutes_duration, BCS.U64), txb.object(CLOCK_OBJECT), TXB_OBJECT(txb, permission)],
            typeArguments:[earnest_type],
        })          
    }
    return true
}

export function demand_set_guard(earnest_type:string, txb:TransactionBlock, demand:DemandObject, permission:PermissionObject, 
    guard?:GuardObject, passport?:PassportObject) : boolean {  
    if (!IsValidObjects([demand, permission])) return false;
    if (!IsValidArgType(earnest_type)) return false;

    if (passport) {
        if (guard) {
            txb.moveCall({
                target:PROTOCOL.DemandFn('guard_set_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, demand), TXB_OBJECT(txb, guard), TXB_OBJECT(txb, permission)],
                typeArguments:[earnest_type],
            })            
        } else {
            txb.moveCall({
                target:PROTOCOL.DemandFn('guard_none_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, demand), TXB_OBJECT(txb, permission)],
                typeArguments:[earnest_type],
            })               
        }
    } else {
        if (guard) {
            txb.moveCall({
                target:PROTOCOL.DemandFn('guard_set') as FnCallType,
                arguments:[TXB_OBJECT(txb, demand), TXB_OBJECT(txb, guard), TXB_OBJECT(txb, permission)],
                typeArguments:[earnest_type],
            })            
        } else {
            txb.moveCall({
                target:PROTOCOL.DemandFn('guard_none') as FnCallType,
                arguments:[TXB_OBJECT(txb, demand), TXB_OBJECT(txb, permission)],
                typeArguments:[earnest_type],
            })               
        }        
    }
    return true
}

export function demand_set_description(earnest_type:string, txb:TransactionBlock, demand:DemandObject, 
    permission:PermissionObject, description:string, passport?:PassportObject) : boolean {
    if (!IsValidObjects([demand, permission])) return false;
    if (!IsValidArgType(earnest_type)) return false;
    if (!IsValidDesription(description)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.DemandFn('description_set_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, demand), txb.pure(description), TXB_OBJECT(txb, permission)],
            typeArguments:[earnest_type],
        })    
    } else {
        txb.moveCall({
            target:PROTOCOL.DemandFn('description_set') as FnCallType,
            arguments:[TXB_OBJECT(txb, demand), txb.pure(description), TXB_OBJECT(txb, permission)],
            typeArguments:[earnest_type],
        })    
    }
    return true
}

export function demand_yes(earnest_type:string, txb:TransactionBlock, demand:DemandObject, permission:PermissionObject, 
    service_id:string, passport?:PassportObject) : boolean {
    if (!IsValidObjects([demand, permission])) return false;
    if (!IsValidArgType(earnest_type)) return false;
    if (!IsValidAddress(service_id)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.DemandFn('yes_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, demand), txb.pure(service_id, BCS.ADDRESS), TXB_OBJECT(txb, permission)],
            typeArguments:[earnest_type],
        })    
    } else {
        txb.moveCall({
            target:PROTOCOL.DemandFn('yes') as FnCallType,
            arguments:[TXB_OBJECT(txb, demand), txb.pure(service_id, BCS.ADDRESS), TXB_OBJECT(txb, permission)],
            typeArguments:[earnest_type],
        })    
    }
    return true
}

export function deposit(earnest_type:string, txb:TransactionBlock, demand:DemandObject, earnest:TxbObject) : boolean {
    if (!IsValidObjects([demand, earnest])) return false;
    if (!IsValidArgType(earnest_type)) return false;
    txb.moveCall({
        target:PROTOCOL.DemandFn('deposit') as FnCallType,
        arguments:[TXB_OBJECT(txb, demand), TXB_OBJECT(txb, earnest)],
        typeArguments:[earnest_type],
    })    
    return true
}

export function present(earnest_type:string, service_type:string, txb:TransactionBlock, demand:DemandObject, 
    service:ServiceObject, tips:string, passport?:PassportObject) : boolean {
    if (!IsValidObjects([demand, service])) return false;
    if (!IsValidArgType(earnest_type)) return false;
    if (!IsValidDesription(tips)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.DemandFn('present_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, demand), TXB_OBJECT(txb, service), txb.pure(tips, BCS.STRING), ],
            typeArguments:[earnest_type, service_type],
        })   
    } else {
        txb.moveCall({
            target:PROTOCOL.DemandFn('present') as FnCallType,
            arguments:[TXB_OBJECT(txb, demand), TXB_OBJECT(txb, service), txb.pure(tips, BCS.STRING), ],
            typeArguments:[earnest_type, service_type],
        })   
    } 
    return true
}
export function change_permission(earnest_type:string, txb:TransactionBlock, demand:DemandObject, 
    old_permission:PermissionObject, new_permission:PermissionObject) : boolean {
    if (!IsValidObjects([demand, old_permission, new_permission])) return false;
    if (!IsValidArgType(earnest_type)) return false;

    txb.moveCall({
        target:PROTOCOL.DemandFn('permission_set') as FnCallType,
        arguments: [TXB_OBJECT(txb, demand), TXB_OBJECT(txb, old_permission), TXB_OBJECT(txb, new_permission)],
        typeArguments:[earnest_type]            
    })    
    return true
}