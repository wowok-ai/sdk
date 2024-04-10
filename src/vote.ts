import { TransactionBlock } from '@mysten/sui.js/transactions';
import { BCS } from '@mysten/bcs';
import { CLOCK_OBJECT, FnCallType, PROTOCOL, PassportObject, PermissionObject, GuardObject, VoteAddress, 
    VoteObject, IsValidObjects, IsValidDesription, IsValidUint, IsValidAddress, OptionNone, TXB_OBJECT,
    IsValidArray, IsValidName} from './protocol';
import { BCS_CONVERT, array_unique } from './utils';

export const MAX_AGREES_COUNT = 200;
export const MAX_CHOICE_COUNT = 200;

export function vote(txb:TransactionBlock, permission:PermissionObject, description:string, minutes_duration:number, 
    max_choice_count?:number, reference_address?:string, passport?:PassportObject) : VoteObject | boolean {
    if (!IsValidObjects([permission])) return false;
    if (!IsValidDesription(description)) return false;
    if (!IsValidUint(minutes_duration)) return false;
    if (max_choice_count && !IsValidUint(max_choice_count)) return false;
    if (max_choice_count && max_choice_count > MAX_CHOICE_COUNT) return false;
    if (reference_address && !IsValidAddress(reference_address)) return false;

    let reference = reference_address?  txb.pure(BCS_CONVERT.ser_option_address(reference_address)) : OptionNone(txb);
    let choice_count = max_choice_count ? max_choice_count : 1;

    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.VoteFn('new_with_passport') as FnCallType,
            arguments:[passport, txb.pure(description), reference, txb.pure(CLOCK_OBJECT), 
                txb.pure(minutes_duration, BCS.U64), txb.pure(choice_count, BCS.U8), TXB_OBJECT(txb, permission)]
        })
    } else {
        return txb.moveCall({
            target:PROTOCOL.VoteFn('new') as FnCallType,
            arguments:[txb.pure(description), reference, txb.pure(CLOCK_OBJECT), 
                txb.pure(minutes_duration, BCS.U64), txb.pure(choice_count, BCS.U8), TXB_OBJECT(txb, permission)]
        })
    }
}
export function launch(txb:TransactionBlock, vote:VoteObject) : VoteAddress | boolean {
    if (!IsValidObjects([vote])) return false;
    return txb.moveCall({
        target:PROTOCOL.VoteFn('create') as FnCallType,
        arguments:[TXB_OBJECT(txb, vote)]
    })
}
export function destroy(txb:TransactionBlock, vote:VoteObject) : boolean  {
    if (!IsValidObjects([vote])) return false;
    txb.moveCall({
        target:PROTOCOL.VoteFn('destroy') as FnCallType,
        arguments:[TXB_OBJECT(txb, vote)]
    })
    return true
}
export function vote_set_description(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, 
    description:string, passport?:PassportObject) : boolean {
    if (!IsValidObjects([vote, permission])) return false;
    if (!IsValidDesription(description)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.VoteFn('description_set_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, vote), txb.pure(description), TXB_OBJECT(txb, permission)]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.VoteFn('description_set') as FnCallType,
            arguments:[TXB_OBJECT(txb, vote), txb.pure(description), TXB_OBJECT(txb, permission)]
        })
    }
    return true
}

export function vote_set_reference(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, 
    reference_address?:string, passport?:PassportObject)  : boolean {
    if (!IsValidObjects([vote, permission])) return false;
    if (reference_address && !IsValidAddress(reference_address)) return false;
    let reference = reference_address?  txb.pure(BCS_CONVERT.ser_option_address(reference_address)) : OptionNone(txb); 
    
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.VoteFn('reference_set_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, vote), reference, TXB_OBJECT(txb, permission)]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.VoteFn('reference_set') as FnCallType,
            arguments:[TXB_OBJECT(txb, vote), reference, TXB_OBJECT(txb, permission)]
        })
    }
    return true
}
export function vote_add_guard(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, 
    guard:GuardObject, vote_weight:number, passport?:PassportObject)  : boolean {
    if (!IsValidObjects([vote, permission, guard])) return false;
    if (!IsValidUint(vote_weight)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.VoteFn('guard_add_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, vote), TXB_OBJECT(txb, guard), txb.pure(vote_weight, BCS.U64), TXB_OBJECT(txb, permission)]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.VoteFn('guard_add') as FnCallType,
            arguments:[TXB_OBJECT(txb, vote), TXB_OBJECT(txb, guard), txb.pure(vote_weight, BCS.U64), TXB_OBJECT(txb, permission)]
        })
    }
    return true
}
export function vote_remove_guard(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, 
    guard_address:string[], removeall?:boolean, passport?:PassportObject) : boolean {
    if (!IsValidObjects([vote, permission])) return false;
    if (!removeall && !guard_address) return false;
    if (guard_address && !IsValidArray(guard_address, IsValidAddress)) return false;

    if (passport) {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.VoteFn('guard_remove_all_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, vote), TXB_OBJECT(txb, permission)]
            })      
        } else {
            txb.moveCall({
                target:PROTOCOL.VoteFn('guard_remove_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, vote), txb.pure(array_unique(guard_address), 'vector<address>'), TXB_OBJECT(txb, permission)]
            })        
        }
    } else {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.VoteFn('guard_remove_all') as FnCallType,
                arguments:[TXB_OBJECT(txb, vote), TXB_OBJECT(txb, permission)]
            })      
        } else {
            txb.moveCall({
                target:PROTOCOL.VoteFn('guard_remove') as FnCallType,
                arguments:[TXB_OBJECT(txb, vote), txb.pure(array_unique(guard_address), 'vector<address>'), TXB_OBJECT(txb, permission)]
            })        
        }
    }
    return true
}
export type VoteOption = {
    name:string;
    reference_address?:string;
}
export function vote_add_option(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, 
    options:VoteOption[], passport?:PassportObject) : boolean  {
    if (!IsValidObjects([vote, permission])) return false;
    if (!options) return false;
    let bValid = true;
    options.forEach((v) => {
        if (!IsValidName(v.name)) bValid = false;
        if (v?.reference_address && IsValidAddress(v.reference_address)) bValid = false;
    })
    if (!bValid) return false; 
    
    options.forEach((option) => {
        let reference = option?.reference_address ? txb.pure(BCS_CONVERT.ser_option_address(option.reference_address)) : OptionNone(txb); 
        if (passport) {
            txb.moveCall({
                target:PROTOCOL.VoteFn('agrees_add_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, vote), txb.pure(option.name), reference, TXB_OBJECT(txb, permission)]
            })       
        } else {
            txb.moveCall({
                target:PROTOCOL.VoteFn('agrees_add') as FnCallType,
                arguments:[TXB_OBJECT(txb, vote), txb.pure(option.name), reference, TXB_OBJECT(txb, permission)]
            })                 
        }
    })
    return true
}
export function vote_remove_option(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, 
    options:string[], removeall?:boolean, passport?:PassportObject) : boolean {
    if (!IsValidObjects([vote, permission])) return false;
    if (!removeall && !options) return false;
    if (options && !IsValidArray(options, IsValidAddress)) return false;

    if (passport) {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.VoteFn('agrees_remove_all_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, vote), TXB_OBJECT(txb, permission)]
            })      
        } else {
            txb.moveCall({
                target:PROTOCOL.VoteFn('agrees_remove_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, vote), txb.pure(BCS_CONVERT.ser_vector_string(array_unique(options))), TXB_OBJECT(txb, permission)]
            })             
        }
    } else {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.VoteFn('agrees_remove_all') as FnCallType,
                arguments:[TXB_OBJECT(txb, vote), TXB_OBJECT(txb, permission)]
            })      
        } else {
            txb.moveCall({
                target:PROTOCOL.VoteFn('agrees_remove') as FnCallType,
                arguments:[TXB_OBJECT(txb, vote), txb.pure(BCS_CONVERT.ser_vector_string(array_unique(options))), TXB_OBJECT(txb, permission)]
            })        
        }
    }
    return true
}
export function vote_set_max_choice_count(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, 
    max_choice_count:number, passport?:PassportObject) : boolean {
    if (!IsValidObjects([vote, permission])) return false;
    if (!IsValidUint(max_choice_count) || max_choice_count > MAX_CHOICE_COUNT) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.VoteFn('max_choice_count_set_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, vote), txb.pure(max_choice_count, BCS.U8), TXB_OBJECT(txb, permission)]
        })   
    } else {
        txb.moveCall({
            target:PROTOCOL.VoteFn('max_choice_count_set') as FnCallType,
            arguments:[TXB_OBJECT(txb, vote), txb.pure(max_choice_count, BCS.U8), TXB_OBJECT(txb, permission)]
        })   
    }  
    return true
}
export function vote_open_voting(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, 
    passport?:PassportObject) : boolean {
    if (!IsValidObjects([vote, permission])) return false;
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.VoteFn('options_locked_for_voting_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, vote), TXB_OBJECT(txb, permission)]
        })   
    } else {
        txb.moveCall({
            target:PROTOCOL.VoteFn('options_locked_for_voting') as FnCallType,
            arguments:[TXB_OBJECT(txb, vote), TXB_OBJECT(txb, permission)]
        })   
    }
    return true
}

export function vote_lock_deadline(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, 
    passport?:PassportObject) : boolean {
    if (!IsValidObjects([vote, permission])) return false;
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.VoteFn('deadline_locked_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, vote), txb.object(CLOCK_OBJECT), TXB_OBJECT(txb, permission)]
        })   
    } else {
        txb.moveCall({
            target:PROTOCOL.VoteFn('deadline_locked') as FnCallType,
            arguments:[TXB_OBJECT(txb, vote), txb.object(CLOCK_OBJECT), TXB_OBJECT(txb, permission)]
        })   
    }
    return true
}

export function vote_expand_deadline(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, 
    minutes_expand:number, passport?:PassportObject) : boolean {
    if (!IsValidObjects([vote, permission])) return false;
    if (!IsValidUint(minutes_expand)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.VoteFn('deadline_expand_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, vote), txb.pure(minutes_expand, BCS.U64), TXB_OBJECT(txb, permission)]
        })  
    } else {
        txb.moveCall({
            target:PROTOCOL.VoteFn('deadline_expand') as FnCallType,
            arguments:[TXB_OBJECT(txb, vote), txb.pure(minutes_expand, BCS.U64), TXB_OBJECT(txb, permission)]
        })  
    } 
    return true
}
export function vote_lock_guard(txb:TransactionBlock, vote:VoteObject, permission:PermissionObject, 
    passport?:PassportObject) : boolean {
    if (!IsValidObjects([vote, permission])) return false;
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.VoteFn('guard_lock_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, vote), TXB_OBJECT(txb, permission)]
        })   
    } else {
        txb.moveCall({
            target:PROTOCOL.VoteFn('guard_lock') as FnCallType,
            arguments:[TXB_OBJECT(txb, vote), TXB_OBJECT(txb, permission)]
        })   
    }
    return true
}

export function agree(txb:TransactionBlock, vote:VoteObject, options:string[], passport?:PassportObject) : boolean {
    if (!IsValidObjects([vote])) return false;
    if (!options || options.length > MAX_CHOICE_COUNT) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.VoteFn('vote_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, vote), txb.pure(BCS_CONVERT.ser_vector_string(array_unique(options)))]
        })  
    } else {
        txb.moveCall({
            target:PROTOCOL.VoteFn('vote') as FnCallType,
            arguments:[TXB_OBJECT(txb, vote), txb.pure(BCS_CONVERT.ser_vector_string(array_unique(options)))]
        })           
    }
    return true
}

export function change_permission(txb:TransactionBlock, vote:VoteObject, old_permission:PermissionObject, 
    new_permission:PermissionObject) : boolean {
    if (!IsValidObjects([vote, old_permission, new_permission])) return false;
    txb.moveCall({
        target:PROTOCOL.VoteFn('permission_set') as FnCallType,
        arguments: [TXB_OBJECT(txb, vote), TXB_OBJECT(txb, old_permission), TXB_OBJECT(txb, new_permission)],         
    })    
    return true
}
