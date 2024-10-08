import { FnCallType, PassportObject, PermissionObject, GuardObject, VoteAddress, Protocol, TxbObject} from './protocol';
import { IsValidDesription, IsValidUintLarge, IsValidAddress, Bcs, array_unique, IsValidArray, IsValidName } from './utils';
import { ERROR, Errors } from './exception';
import { ValueType } from './protocol';
import { Transaction as TransactionBlock} from '@mysten/sui/transactions';

export const MAX_AGREES_COUNT = 200;
export const MAX_CHOICE_COUNT = 200;

export type VoteOption = {
    name:string;
    reference_address?:string;
}

export class Vote {
    protected permission;
    protected object : TxbObject;
    protected txb;
    
    get_object() { return this.object }
    private constructor(txb:TransactionBlock, permission:PermissionObject) {
        this.object = '';
        this.txb = txb;
        this.permission = permission;
    }
    static From(txb:TransactionBlock, permission:PermissionObject, object:TxbObject) : Vote {
        let v = new Vote(txb, permission);
        v.object = Protocol.TXB_OBJECT(txb, object)
        return v
    }
    static New(txb:TransactionBlock, permission:PermissionObject, description:string, minutes_duration:boolean,  time:number,
        max_choice_count?:number, reference_address?:string, passport?:PassportObject) : Vote {
        if (!Protocol.IsValidObjects([permission])) {
            ERROR(Errors.IsValidObjects,  'permission')
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        if (!IsValidUintLarge(time)) {
            ERROR(Errors.IsValidUint, 'time')
        }
        if (max_choice_count && !IsValidUintLarge(max_choice_count)) {
            ERROR(Errors.IsValidUint, 'max_choice_count')
        }
        if (max_choice_count && max_choice_count > MAX_CHOICE_COUNT) {
            ERROR(Errors.InvalidParam, 'max_choice_count')
        }
        if (reference_address && !IsValidAddress(reference_address)) {
            ERROR(Errors.IsValidAddress, 'reference_address')
        }

        let v = new Vote(txb, permission);    
        
        let reference = txb.pure.option('address', reference_address ? reference_address : undefined);
        let choice_count = max_choice_count ? max_choice_count : 1;
        const clock = txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            v.object = txb.moveCall({
                target:Protocol.Instance().VoteFn('new_with_passport') as FnCallType,
                arguments:[passport, txb.pure.string(description), reference, txb.object(clock), txb.pure.bool(minutes_duration),
                    txb.pure.u64(time), txb.pure.u8(choice_count), Protocol.TXB_OBJECT(txb, permission)]
            })
        } else {
            v.object = txb.moveCall({
                target:Protocol.Instance().VoteFn('new') as FnCallType,
                arguments:[txb.pure.string(description), reference, txb.object(clock), txb.pure.bool(minutes_duration),
                    txb.pure.u64(time), txb.pure.u8(choice_count), Protocol.TXB_OBJECT(txb, permission)]
            })
        }
        return v
    }

    launch() : VoteAddress {
        return this.txb.moveCall({
            target:Protocol.Instance().VoteFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)]
        })
    }

    destroy() {
        this.txb.moveCall({
            target:Protocol.Instance().VoteFn('destroy') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)]
        })
    }

    set_description(description:string, passport?:PassportObject)  {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().VoteFn('description_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().VoteFn('description_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)]
            })
        }
    }

    set_reference(reference_address?:string|null, passport?:PassportObject)   {
        if (reference_address && !IsValidAddress(reference_address)) {
            ERROR(Errors.IsValidAddress)
        }
        
        let reference = this.txb.pure.option('address', reference_address ? reference_address : undefined); 
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().VoteFn('reference_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), reference, Protocol.TXB_OBJECT(this.txb, this.permission)]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().VoteFn('reference_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), reference, Protocol.TXB_OBJECT(this.txb, this.permission)]
            })
        }
        
    }
    add_guard(guard:GuardObject, weight:number, passport?:PassportObject)   {
        if (!Protocol.IsValidObjects([guard])) {
            ERROR(Errors.IsValidObjects, 'add_guard')
        }
        if (!IsValidUintLarge(weight)) {
            ERROR(Errors.IsValidUint, 'add_guard')
        }

        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().VoteFn('guard_add_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard), 
                    this.txb.pure.u64(weight), Protocol.TXB_OBJECT(this.txb, this.permission)]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().VoteFn('guard_add') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard), 
                    this.txb.pure.u64(weight), Protocol.TXB_OBJECT(this.txb, this.permission)]
            })
        }
    }

    remove_guard(guard_address:string[], removeall?:boolean, passport?:PassportObject)  {
        if (!removeall && guard_address.length===0)   return;

        if (!IsValidArray(guard_address, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'remove_guard')
        }
        
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().VoteFn('guard_remove_all_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)]
                })      
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().VoteFn('guard_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                        this.txb.pure.vector('address', array_unique(guard_address)), Protocol.TXB_OBJECT(this.txb, this.permission)]
                })        
            }
        } else {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().VoteFn('guard_remove_all') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)]
                })      
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().VoteFn('guard_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                        this.txb.pure.vector('address', array_unique(guard_address)), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                })        
            }
        }
    }

    add_option(options:VoteOption[], passport?:PassportObject)   {
        if (options.length === 0) return ;

        let bValid = true;
        options.forEach((v) => {
            if (!IsValidName(v.name)) bValid = false;
            if (v?.reference_address && IsValidAddress(v.reference_address)) bValid = false;
        })
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'options')
        }

        options.forEach((option) => {
            let reference = this.txb.pure.option('address', option?.reference_address) ;

            if (passport) {
                this.txb.moveCall({
                    target:Protocol.Instance().VoteFn('agrees_add_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(option.name), 
                        reference, Protocol.TXB_OBJECT(this.txb, this.permission)]
                })       
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().VoteFn('agrees_add') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(option.name), 
                        reference, Protocol.TXB_OBJECT(this.txb, this.permission)]
                })                 
            }
        })
    }
    remove_option(options:string[], removeall?:boolean, passport?:PassportObject)  {
        if (!removeall && options.length===0) {
            return
        }
        if (options && !IsValidArray(options, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'remove_option')
        }
        
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().VoteFn('agrees_remove_all_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)]
                })      
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().VoteFn('agrees_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                        this.txb.pure.vector('string', array_unique(options)), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                })             
            }
        } else {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().VoteFn('agrees_remove_all') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)]
                })      
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().VoteFn('agrees_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                        this.txb.pure.vector('string', array_unique(options)),  
                        Protocol.TXB_OBJECT(this.txb, this.permission)]
                })        
            }
        }
    }
    set_max_choice_count(max_choice_count:number, passport?:PassportObject)  {
        if (!IsValidUintLarge(max_choice_count) || max_choice_count > MAX_CHOICE_COUNT) {
            ERROR(Errors.InvalidParam, 'max_choice_count')
        }

        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().VoteFn('max_choice_count_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.pure.u8(max_choice_count), Protocol.TXB_OBJECT(this.txb, this.permission)]
            })   
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().VoteFn('max_choice_count_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u8(max_choice_count), Protocol.TXB_OBJECT(this.txb, this.permission)]
            })   
        }  
    }

    open_voting(passport?:PassportObject)  {
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().VoteFn('options_locked_for_voting_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)]
            })   
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().VoteFn('options_locked_for_voting') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)]
            })   
        }
    }

    lock_deadline(passport?:PassportObject)  {
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().VoteFn('deadline_locked_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)]
            })   
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().VoteFn('deadline_locked') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)]
            })   
        }
    }

    expand_deadline(ms_expand:boolean, time:number, passport?:PassportObject)  {
        if (!IsValidUintLarge(time)) {
            ERROR(Errors.IsValidUint, 'time')
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().VoteFn('deadline_expand_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(ms_expand),
                    this.txb.pure.u64(time), Protocol.TXB_OBJECT(this.txb, this.permission)]
            })  
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().VoteFn('deadline_expand') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(ms_expand),
                    this.txb.pure.u64(time), Protocol.TXB_OBJECT(this.txb, this.permission)]
            })  
        } 
    }

    lock_guard(passport?:PassportObject)  {
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().VoteFn('guard_lock_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)]
            })   
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().VoteFn('guard_lock') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)]
            })   
        }
    }

    agree(options:string[], passport?:PassportObject)  {
        if (options.length === 0) return;
        if (options.length > MAX_CHOICE_COUNT) {
            ERROR(Errors.InvalidParam, 'agree')
        }

        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().VoteFn('with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.pure.vector('string', array_unique(options))]
            })  
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().VoteFn('this.object') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.pure.vector('string', array_unique(options))]
            })           
        }
    }

    change_permission(new_permission:PermissionObject)  {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects)
        }
        
        this.txb.moveCall({
            target:Protocol.Instance().VoteFn('this.permission_set') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb,this.permission), Protocol.TXB_OBJECT(this.txb, new_permission)],         
        })    
        this.permission = new_permission
    }
}