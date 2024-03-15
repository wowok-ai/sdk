import { TransactionBlock, Inputs, type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS, getSuiMoveConfig, toHEX, fromHEX, BcsReader } from '@mysten/bcs';
import { CLOCK_OBJECT, FnCallType, description_data, name_data, PROTOCOL} from './protocol';
import { GuardObject } from './protocol';
import { verify,  PassportObject} from './passport'
import { PermissionIndex, PermissionObject } from './permission'

export type VoteObject = TransactionResult;
export type VoteAddress = TransactionResult;

export function vote(txb:TransactionBlock, permission:PermissionObject, description:string, minutes_duration:number, 
    max_choice_count:number, reference_address?:string, passport?:PassportObject) : VoteObject {
    let reference = txb.pure([], BCS.U8);
    if (reference_address) { reference = txb.pure(reference_address, BCS.ADDRESS) }

    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.VoteFn('new_with_passport') as FnCallType,
            arguments:[passport, txb.pure(description_data(description)), reference, txb.pure(CLOCK_OBJECT), 
                txb.pure(minutes_duration, BCS.U64), txb.pure(max_choice_count, BCS.U8), permission]
        })
    } else {
        return txb.moveCall({
            target:PROTOCOL.VoteFn('new') as FnCallType,
            arguments:[txb.pure(description_data(description)), reference, txb.pure(CLOCK_OBJECT), 
                txb.pure(minutes_duration, BCS.U64), txb.pure(max_choice_count, BCS.U8), permission]
        })
    }
}
export function launch(txb:TransactionBlock, vote:VoteObject) : VoteAddress {
    return txb.moveCall({
        target:PROTOCOL.VoteFn('create') as FnCallType,
        arguments:[vote]
    })
}
export function destroy(txb:TransactionBlock, vote:VoteObject)  {
    txb.moveCall({
        target:PROTOCOL.VoteFn('destroy') as FnCallType,
        arguments:[vote]
    })
}
export function vote_set_description(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, description:string, passport?:PassportObject)  {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.VoteFn('description_set_with_passport') as FnCallType,
            arguments:[passport, vote, txb.pure(description_data(description)), permission]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.VoteFn('description_set') as FnCallType,
            arguments:[vote, txb.pure(description_data(description)), permission]
        })
    }
}

export function vote_set_reference(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, reference_address?:string, passport?:PassportObject)  {
    let reference = txb.pure([], BCS.U8);
    if (reference_address) { reference = txb.pure(reference_address, BCS.ADDRESS) }
    
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.VoteFn('reference_set_with_passport') as FnCallType,
            arguments:[passport, vote, reference, permission]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.VoteFn('reference_set') as FnCallType,
            arguments:[vote, reference, permission]
        })
    }
}
export function vote_add_guard(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, guard:GuardObject, vote_weight:number, passport?:PassportObject)  {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.VoteFn('guard_add_with_passport') as FnCallType,
            arguments:[passport, vote, guard, txb.pure(vote_weight, BCS.U64), permission]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.VoteFn('guard_add') as FnCallType,
            arguments:[vote, guard, txb.pure(vote_weight, BCS.U64), permission]
        })
    }
}
export function vote_remove_guard(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, guard_address:string[], removeall?:boolean, passport?:PassportObject)  {
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.VoteFn('guard_remove_all_with_passport') as FnCallType,
                arguments:[passport, vote, permission]
            })      
        } else {
            txb.moveCall({
                target:PROTOCOL.VoteFn('guard_remove_with_passport') as FnCallType,
                arguments:[passport, vote, txb.pure(guard_address, 'vector<address>'), permission]
            })        
        }
    } else {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.VoteFn('guard_remove_all') as FnCallType,
                arguments:[vote, permission]
            })      
        } else {
            txb.moveCall({
                target:PROTOCOL.VoteFn('guard_remove') as FnCallType,
                arguments:[vote, txb.pure(guard_address, 'vector<address>'), permission]
            })        
        }
    }
}
export type VoteOption = {
    name:string;
    reference_address?:string;
}
export function vote_add_option(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, options:VoteOption[], passport?:PassportObject)  {
    options.forEach((option) => {
        let reference = txb.pure([], BCS.U8);
        if (option.reference_address) { reference = txb.pure(option.reference_address, BCS.ADDRESS) }
        if (passport) {
            txb.moveCall({
                target:PROTOCOL.VoteFn('agrees_add_with_passport') as FnCallType,
                arguments:[passport, vote, txb.pure(name_data(option.name)), reference, permission]
            })       
        } else {
            txb.moveCall({
                target:PROTOCOL.VoteFn('agrees_add') as FnCallType,
                arguments:[vote, txb.pure(name_data(option.name)), reference, permission]
            })                 
        }
    })
}
export function vote_remove_option(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, options:string[], removeall?:boolean, passport?:PassportObject)  {
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.VoteFn('agrees_remove_all_with_passport') as FnCallType,
                arguments:[passport, vote, permission]
            })      
        } else {
            options.forEach((option) => {
                txb.moveCall({
                    target:PROTOCOL.VoteFn('agrees_remove_with_passport') as FnCallType,
                    arguments:[passport, vote, txb.pure(name_data(option)), permission]
                })        
            })        
        }
    } else {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.VoteFn('agrees_remove_all') as FnCallType,
                arguments:[vote, permission]
            })      
        } else {
            options.forEach((option) => {
                txb.moveCall({
                    target:PROTOCOL.VoteFn('agrees_remove') as FnCallType,
                    arguments:[vote, txb.pure(name_data(option)), permission]
                })        
            })        
        }
    }
}
export function vote_set_max_choice_count(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, max_choice_count:number, passport?:PassportObject)  {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.VoteFn('max_choice_count_set_with_passport') as FnCallType,
            arguments:[passport, vote, txb.pure(max_choice_count, BCS.U8), permission]
        })   
    } else {
        txb.moveCall({
            target:PROTOCOL.VoteFn('max_choice_count_set') as FnCallType,
            arguments:[vote, txb.pure(max_choice_count, BCS.U8), permission]
        })   
    }  
}
export function vote_open_voting(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.VoteFn('options_locked_for_voting_with_passport') as FnCallType,
            arguments:[passport, vote, permission]
        })   
    } else {
        txb.moveCall({
            target:PROTOCOL.VoteFn('options_locked_for_voting') as FnCallType,
            arguments:[vote, permission]
        })   
    }
}

export function vote_lock_deadline(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.VoteFn('deadline_locked_with_passport') as FnCallType,
            arguments:[passport, vote, txb.object(CLOCK_OBJECT), permission]
        })   
    } else {
        txb.moveCall({
            target:PROTOCOL.VoteFn('deadline_locked') as FnCallType,
            arguments:[vote, txb.object(CLOCK_OBJECT), permission]
        })   
    }
}

export function vote_expand_deadline(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, minutes_expand:number, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.VoteFn('deadline_expand_with_passport') as FnCallType,
            arguments:[passport, vote, txb.pure(minutes_expand, BCS.U64), permission]
        })  
    } else {
        txb.moveCall({
            target:PROTOCOL.VoteFn('deadline_expand') as FnCallType,
            arguments:[vote, txb.pure(minutes_expand, BCS.U64), permission]
        })  
    } 
}
export function vote_lock_guard(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.VoteFn('guard_lock_with_passport') as FnCallType,
            arguments:[passport, vote, permission]
        })   
    } else {
        txb.moveCall({
            target:PROTOCOL.VoteFn('guard_lock') as FnCallType,
            arguments:[vote, permission]
        })   
    }
}

export function agree(txb:TransactionBlock, vote:VoteObject, options:string[], passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.VoteFn('vote_with_passport') as FnCallType,
            arguments:[passport, vote, txb.pure(options, 'vector<string>')]
        })  
    } else {
        txb.moveCall({
            target:PROTOCOL.VoteFn('vote') as FnCallType,
            arguments:[vote, txb.pure(options, 'vector<string>')]
        })           
    }
}

export function change_permission(txb:TransactionBlock, vote:VoteObject, old_permission:PermissionObject, new_permission:PermissionObject) {
    txb.moveCall({
        target:PROTOCOL.VoteFn('permission_set') as FnCallType,
        arguments: [vote, old_permission, new_permission],         
    })    
}
