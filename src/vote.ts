import { BCS } from '@mysten/bcs';
import { FnCallType, PassportObject, PermissionObject, GuardObject, VoteAddress, Protocol, TxbObject} from './protocol';
import { IsValidDesription, IsValidUint, IsValidAddress, OptionNone, Bcs, array_unique, IsValidArray, IsValidName } from './utils';
import { ERROR, Errors } from './exception';
import { ValueType } from './protocol';

export const MAX_AGREES_COUNT = 200;
export const MAX_CHOICE_COUNT = 200;

export type VoteOption = {
    name:string;
    reference_address?:string;
}

export class Vote {
    protected permission;
    protected object : TxbObject;
    protected protocol;
    
    get_object() { return this.object }
    private constructor(protocol:Protocol, permission:PermissionObject) {
        this.object = '';
        this.protocol = protocol;
        this.permission = permission;
    }
    static From(protocol:Protocol, permission:PermissionObject, object:TxbObject) : Vote {
        let v = new Vote(protocol, permission);
        v.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), object)
        return v
    }
    static New(protocol:Protocol, permission:PermissionObject, description:string, minutes_duration:number, 
        max_choice_count?:number, reference_address?:string, passport?:PassportObject) : Vote {
        if (!Protocol.IsValidObjects([permission])) {
            ERROR(Errors.IsValidObjects,  'permission')
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        if (!IsValidUint(minutes_duration)) {
            ERROR(Errors.IsValidUint, 'minutes_duration')
        }
        if (max_choice_count && !IsValidUint(max_choice_count)) {
            ERROR(Errors.IsValidUint, 'max_choice_count')
        }
        if (max_choice_count && max_choice_count > MAX_CHOICE_COUNT) {
            ERROR(Errors.InvalidParam, 'max_choice_count')
        }
        if (reference_address && !IsValidAddress(reference_address)) {
            ERROR(Errors.IsValidAddress, 'reference_address')
        }

        let v = new Vote(protocol, permission);    
        let txb  = protocol.CurrentSession();
        let reference = reference_address?  txb.pure(Bcs.getInstance().ser(ValueType.TYPE_OPTION_ADDRESS, reference_address)) : OptionNone(txb);
        let choice_count = max_choice_count ? max_choice_count : 1;

        if (passport) {
            v.object = txb.moveCall({
                target:protocol.VoteFn('new_with_passport') as FnCallType,
                arguments:[passport, txb.pure(description), reference, txb.pure(Protocol.CLOCK_OBJECT), 
                    txb.pure(minutes_duration, BCS.U64), txb.pure(choice_count, BCS.U8), Protocol.TXB_OBJECT(txb, permission)]
            })
        } else {
            v.object = txb.moveCall({
                target:protocol.VoteFn('new') as FnCallType,
                arguments:[txb.pure(description), reference, txb.pure(Protocol.CLOCK_OBJECT), 
                    txb.pure(minutes_duration, BCS.U64), txb.pure(choice_count, BCS.U8), Protocol.TXB_OBJECT(txb, permission)]
            })
        }
        return v
    }

    launch() : VoteAddress {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target:this.protocol.VoteFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object)]
        })
    }

    destroy() {
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.VoteFn('destroy') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object)]
        })
    }

    set_description(description:string, passport?:PassportObject)  {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.VoteFn('description_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(description), Protocol.TXB_OBJECT(txb, this.permission)]
            })
        } else {
            txb.moveCall({
                target:this.protocol.VoteFn('description_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(description), Protocol.TXB_OBJECT(txb, this.permission)]
            })
        }
        
    }

    set_reference(reference_address?:string, passport?:PassportObject)   {
        if (reference_address && !IsValidAddress(reference_address)) {
            ERROR(Errors.IsValidAddress)
        }

        let txb = this.protocol.CurrentSession();
        let reference = reference_address?  txb.pure(Bcs.getInstance().ser(ValueType.TYPE_OPTION_ADDRESS, reference_address)) : OptionNone(txb); 
        if (passport) {
            txb.moveCall({
                target:this.protocol.VoteFn('reference_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), reference, Protocol.TXB_OBJECT(txb, this.permission)]
            })
        } else {
            txb.moveCall({
                target:this.protocol.VoteFn('reference_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), reference, Protocol.TXB_OBJECT(txb, this.permission)]
            })
        }
        
    }
    add_guard(guard:GuardObject, weight:number, passport?:PassportObject)   {
        if (!Protocol.IsValidObjects([guard])) {
            ERROR(Errors.IsValidObjects, 'guard')
        }
        if (!IsValidUint(weight)) {
            ERROR(Errors.IsValidUint, 'weight')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.VoteFn('guard_add_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard), 
                    txb.pure(weight, BCS.U64), Protocol.TXB_OBJECT(txb, this.permission)]
            })
        } else {
            txb.moveCall({
                target:this.protocol.VoteFn('guard_add') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard), 
                    txb.pure(weight, BCS.U64), Protocol.TXB_OBJECT(txb, this.permission)]
            })
        }
    }

    remove_guard(guard_address:string[], removeall?:boolean, passport?:PassportObject)  {
        if (!removeall && !guard_address) {
            ERROR(Errors.AllInvalid, 'guard_address & removeall')
        }

        if (guard_address && !IsValidArray(guard_address, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'guard_address')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (removeall) {
                txb.moveCall({
                    target:this.protocol.VoteFn('guard_remove_all_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)]
                })      
            } else {
                txb.moveCall({
                    target:this.protocol.VoteFn('guard_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), 
                        txb.pure(array_unique(guard_address), 'vector<address>'), Protocol.TXB_OBJECT(txb, this.permission)]
                })        
            }
        } else {
            if (removeall) {
                txb.moveCall({
                    target:this.protocol.VoteFn('guard_remove_all') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)]
                })      
            } else {
                txb.moveCall({
                    target:this.protocol.VoteFn('guard_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), 
                        txb.pure(array_unique(guard_address), 'vector<address>'), 
                        Protocol.TXB_OBJECT(txb, this.permission)]
                })        
            }
        }
    }

    add_option(options:VoteOption[], passport?:PassportObject)   {
        if (!options) {
            ERROR(Errors.InvalidParam, 'options')
        }

        let bValid = true;
        options.forEach((v) => {
            if (!IsValidName(v.name)) bValid = false;
            if (v?.reference_address && IsValidAddress(v.reference_address)) bValid = false;
        })
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'options')
        }

        let txb = this.protocol.CurrentSession();
        options.forEach((option) => {
            let reference = option?.reference_address ? 
                txb.pure(Bcs.getInstance().ser(ValueType.TYPE_OPTION_ADDRESS, option.reference_address)) : 
                OptionNone(txb); 

            if (passport) {
                txb.moveCall({
                    target:this.protocol.VoteFn('agrees_add_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(option.name), 
                        reference, Protocol.TXB_OBJECT(txb, this.permission)]
                })       
            } else {
                txb.moveCall({
                    target:this.protocol.VoteFn('agrees_add') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(option.name), 
                        reference, Protocol.TXB_OBJECT(txb, this.permission)]
                })                 
            }
        })
    }
    remove_option(options:string[], removeall?:boolean, passport?:PassportObject)  {
        if (!removeall && !options) {
            ERROR(Errors.AllInvalid, 'options & removeall')
        }
        if (options && !IsValidArray(options, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'options')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (removeall) {
                txb.moveCall({
                    target:this.protocol.VoteFn('agrees_remove_all_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)]
                })      
            } else {
                txb.moveCall({
                    target:this.protocol.VoteFn('agrees_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), 
                        txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, array_unique(options))), 
                        Protocol.TXB_OBJECT(txb, this.permission)]
                })             
            }
        } else {
            if (removeall) {
                txb.moveCall({
                    target:this.protocol.VoteFn('agrees_remove_all') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)]
                })      
            } else {
                txb.moveCall({
                    target:this.protocol.VoteFn('agrees_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), 
                        txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, array_unique(options))), 
                        Protocol.TXB_OBJECT(txb, this.permission)]
                })        
            }
        }
    }
    set_max_choice_count(max_choice_count:number, passport?:PassportObject)  {
        if (!IsValidUint(max_choice_count) || max_choice_count > MAX_CHOICE_COUNT) {
            ERROR(Errors.InvalidParam, 'max_choice_count')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.VoteFn('max_choice_count_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), 
                    txb.pure(max_choice_count, BCS.U8), Protocol.TXB_OBJECT(txb, this.permission)]
            })   
        } else {
            txb.moveCall({
                target:this.protocol.VoteFn('max_choice_count_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(max_choice_count, BCS.U8), Protocol.TXB_OBJECT(txb, this.permission)]
            })   
        }  
    }

    open_voting(passport?:PassportObject)  {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.VoteFn('options_locked_for_voting_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)]
            })   
        } else {
            txb.moveCall({
                target:this.protocol.VoteFn('options_locked_for_voting') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)]
            })   
        }
    }

    lock_deadline(passport?:PassportObject)  {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.VoteFn('deadline_locked_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, this.permission)]
            })   
        } else {
            txb.moveCall({
                target:this.protocol.VoteFn('deadline_locked') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, this.permission)]
            })   
        }
    }

    expand_deadline(minutes_expand:number, passport?:PassportObject)  {
        if (!IsValidUint(minutes_expand)) {
            ERROR(Errors.IsValidUint, 'minutes_expand')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.VoteFn('deadline_expand_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), 
                    txb.pure(minutes_expand, BCS.U64), Protocol.TXB_OBJECT(txb, this.permission)]
            })  
        } else {
            txb.moveCall({
                target:this.protocol.VoteFn('deadline_expand') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), 
                    txb.pure(minutes_expand, BCS.U64), Protocol.TXB_OBJECT(txb, this.permission)]
            })  
        } 
        
    }
    lock_guard(passport?:PassportObject)  {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.VoteFn('guard_lock_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)]
            })   
        } else {
            txb.moveCall({
                target:this.protocol.VoteFn('guard_lock') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)]
            })   
        }
    }

    agree(options:string[], passport?:PassportObject)  {
        if (!options || options.length > MAX_CHOICE_COUNT) {
            ERROR(Errors.InvalidParam, 'options')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.VoteFn('with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), 
                    txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, array_unique(options)))]
            })  
        } else {
            txb.moveCall({
                target:this.protocol.VoteFn('this.object') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), 
                    txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, array_unique(options)))]
            })           
        }
        
    }

    change_permission(new_permission:PermissionObject)  {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects)
        }

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.VoteFn('this.permission_set') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb,this.permission), Protocol.TXB_OBJECT(txb, new_permission)],         
        })    
        this.permission = new_permission
    }
}