import { SuiClient, getFullnodeUrl, SuiObjectResponse } from '@mysten/sui.js/client';
import { TransactionBlock, Inputs, type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS } from '@mysten/bcs';
import { CLOCK_OBJECT, FnCallType, PROTOCOL, description_data} from './protocol';
import { GuardObject } from './protocol';
import { verify,  PassportObject} from './passport'
import { PermissionIndex, PermissionObject } from './permission'
import { ServiceObject } from './service'

export type DemandAddress = TransactionResult;
export type DemandObject = TransactionResult;

export const MAX_EARNEST_COUNT = 200;
export const MAX_PRESENTERS_COUNT = 200;

export function demand(earnest_type:string, txb:TransactionBlock, permission:TransactionResult, description:string, earnest:TransactionResult, passport?:PassportObject) : DemandObject {
    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.DemandFn('new_with_passport') as FnCallType,
            arguments:[passport, txb.pure(description_data(description)), earnest, permission],
            typeArguments:[earnest_type],
        })        
    } else {
        return txb.moveCall({
            target:PROTOCOL.DemandFn('new') as FnCallType,
            arguments:[txb.pure(description_data(description)), earnest, permission],
            typeArguments:[earnest_type],
        })        
    }
}

export function launch(earnest_type:string, txb:TransactionBlock, demand:DemandObject) : DemandAddress {
    return txb.moveCall({
        target:PROTOCOL.DemandFn('create') as FnCallType,
        arguments:[demand],
        typeArguments:[earnest_type],
    })
}
export function destroy(earnest_type:string, txb:TransactionBlock, demand:DemandObject) {
    return txb.moveCall({
        target:PROTOCOL.DemandFn('destroy') as FnCallType,
        arguments: [demand],
        typeArguments:[earnest_type]
    })   
}
export function demand_refund(earnest_type:string, txb:TransactionBlock, demand:DemandObject, permission:TransactionResult, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.DemandFn('refund_with_passport') as FnCallType,
            arguments:[passport, demand, txb.object(CLOCK_OBJECT), permission],
            typeArguments:[earnest_type],
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.DemandFn('refund') as FnCallType,
            arguments:[demand, txb.object(CLOCK_OBJECT), permission],
            typeArguments:[earnest_type],
        })            
    }
}

export function demand_expand_time(earnest_type:string, txb:TransactionBlock, demand:DemandObject, permission:TransactionResult, 
    minutes_duration:number, passport?:PassportObject) {
    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.DemandFn('time_expand_with_passport') as FnCallType,
            arguments:[passport, demand, txb.pure(minutes_duration, BCS.U64), txb.object(CLOCK_OBJECT), permission],
            typeArguments:[earnest_type],
        })  
    } else {
        return txb.moveCall({
            target:PROTOCOL.DemandFn('time_expand') as FnCallType,
            arguments:[demand, txb.pure(minutes_duration, BCS.U64), txb.object(CLOCK_OBJECT), permission],
            typeArguments:[earnest_type],
        })          
    }
}

export function demand_set_guard(earnest_type:string, txb:TransactionBlock, demand:DemandObject, permission:TransactionResult, guard?:GuardObject, passport?:PassportObject) {  
    if (passport) {
        if (guard) {
            return txb.moveCall({
                target:PROTOCOL.DemandFn('guard_set_with_passport') as FnCallType,
                arguments:[passport, demand, guard, permission],
                typeArguments:[earnest_type],
            })            
        } else {
            return txb.moveCall({
                target:PROTOCOL.DemandFn('guard_none_with_passport') as FnCallType,
                arguments:[passport, demand, permission],
                typeArguments:[earnest_type],
            })               
        }
    } else {
        if (guard) {
            return txb.moveCall({
                target:PROTOCOL.DemandFn('guard_set') as FnCallType,
                arguments:[demand, guard, permission],
                typeArguments:[earnest_type],
            })            
        } else {
            return txb.moveCall({
                target:PROTOCOL.DemandFn('guard_none') as FnCallType,
                arguments:[demand, permission],
                typeArguments:[earnest_type],
            })               
        }        
    }
}

export function demand_set_description(earnest_type:string, txb:TransactionBlock, demand:DemandObject, permission:TransactionResult, description:string, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.DemandFn('description_set_with_passport') as FnCallType,
            arguments:[passport, demand, txb.pure(description_data(description)), permission],
            typeArguments:[earnest_type],
        })    
    } else {
        txb.moveCall({
            target:PROTOCOL.DemandFn('description_set') as FnCallType,
            arguments:[demand, txb.pure(description_data(description)), permission],
            typeArguments:[earnest_type],
        })    
    }
}

export function demand_yes(earnest_type:string, txb:TransactionBlock, demand:DemandObject, permission:TransactionResult, service:string, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.DemandFn('yes_with_passport') as FnCallType,
            arguments:[passport, demand, txb.pure(service, BCS.ADDRESS), permission],
            typeArguments:[earnest_type],
        })    
    } else {
        txb.moveCall({
            target:PROTOCOL.DemandFn('yes') as FnCallType,
            arguments:[demand, txb.pure(service, BCS.ADDRESS), permission],
            typeArguments:[earnest_type],
        })    
    }
}

export function deposit(earnest_type:string, txb:TransactionBlock, demand:DemandObject, earnest:TransactionResult) {
    return txb.moveCall({
        target:PROTOCOL.DemandFn('deposit') as FnCallType,
        arguments:[demand, earnest],
        typeArguments:[earnest_type],
    })    
}

export function present(earnest_type:string, service_type:string, txb:TransactionBlock, demand:DemandObject, service:ServiceObject, tips:string, passport?:PassportObject) {
    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.DemandFn('present_with_passport') as FnCallType,
            arguments:[passport, demand, service, txb.pure(description_data(tips)), ],
            typeArguments:[earnest_type, service_type],
        })   
    } else {
        return txb.moveCall({
            target:PROTOCOL.DemandFn('present') as FnCallType,
            arguments:[demand, service, txb.pure(description_data(tips)), ],
            typeArguments:[earnest_type, service_type],
        })   
    } 
}
export function change_permission(earnest_type:string, txb:TransactionBlock, demand:DemandObject, old_permission:PermissionObject, new_permission:PermissionObject) {
    txb.moveCall({
        target:PROTOCOL.DemandFn('permission_set') as FnCallType,
        arguments: [demand, old_permission, new_permission],
        typeArguments:[earnest_type]            
    })    
}