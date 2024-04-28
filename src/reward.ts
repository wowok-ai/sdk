import { TransactionBlock, type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS} from '@mysten/bcs';
import { FnCallType, GuardObject, PassportObject, PermissionObject, RewardAddress, Protocol, TxbObject, } from './protocol';
import { array_unique, IsValidAddress, IsValidArgType, IsValidArray, IsValidDesription,  IsValidUint, } from './utils';
import { ERROR, Errors } from './exception';

export type CoinReward = TransactionResult;
export type RewardGuardPortions = {
    guard:GuardObject;
    portions:number;
}

export class Reward {
    protected earnest_type;
    protected permission ;
    protected object:TxbObject;
    protected protocol;
    
    get_earnest_type() {  return this.earnest_type }
    get_object() { return this.object }
    private constructor(protocol:Protocol, earnest_type:string, permission:PermissionObject) {
        this.protocol = protocol
        this.earnest_type = earnest_type
        this.permission = permission
        this.object = ''
    }
    static From(protocol:Protocol, earnest_type:string, permission:PermissionObject, object:TxbObject) : Reward {
        let r = new Reward(protocol, earnest_type,  permission);
        r.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), object);
        return  r
    }
    static New(protocol:Protocol, earnest_type:string, permission:PermissionObject, description:string, 
        minutes_duration:number, passport?:PassportObject) : Reward {
        let r = new Reward(protocol, earnest_type,  permission);
        if (!Protocol.IsValidObjects([permission])) {
            ERROR(Errors.IsValidObjects, 'permission')
        }
        if (!IsValidArgType(earnest_type)) {
            ERROR(Errors.IsValidArgType, 'earnest_type')
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        if (!IsValidUint(minutes_duration)) {
            ERROR(Errors.IsValidUint, 'minutes_duration')
        }

        let txb = protocol.CurrentSession()

        if (passport) {
            r.object = txb.moveCall({
                target:protocol.RewardFn('new_with_passport') as FnCallType,
                arguments:[passport, txb.pure(description), txb.pure(minutes_duration, BCS.U64), 
                    txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, permission)], 
                typeArguments:[earnest_type]
            })
        } else {
            r.object = txb.moveCall({
                target:protocol.RewardFn('new') as FnCallType,
                arguments:[txb.pure(description), txb.pure(minutes_duration, BCS.U64), 
                    txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, permission)], 
                typeArguments:[earnest_type]
            })
        }
        return r
    }
    
    launch(): RewardAddress  {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target:this.protocol.RewardFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object)], 
            typeArguments:[this.earnest_type]
        })
    }

    destroy()  {
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.RewardFn('destroy') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
        })   
    }

    refund(passport?:PassportObject) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.RewardFn('refund_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, this.permission)], 
                typeArguments:[this.earnest_type]
            })  
        } else {
            txb.moveCall({
                target:this.protocol.RewardFn('refund') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, this.permission)], 
                typeArguments:[this.earnest_type]
            })        
        }
    }

    expand_time(minutes_expand:number, passport?:PassportObject)  {
        if (!IsValidUint(minutes_expand)) {
            ERROR(Errors.IsValidUint, 'minutes_expand')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.RewardFn('time_expand_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(minutes_expand, BCS.U64), Protocol.TXB_OBJECT(txb, this.permission)], 
                typeArguments:[this.earnest_type]
            })
        } else {
            txb.moveCall({
                target:this.protocol.RewardFn('time_expand') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(minutes_expand, BCS.U64), Protocol.TXB_OBJECT(txb, this.permission)], 
                typeArguments:[this.earnest_type]
            })
        }
        
    }

    add_guard(gurads:RewardGuardPortions[], passport?:PassportObject)  {
        if (!gurads) {
            ERROR(Errors.InvalidParam, 'gurads')
        }

        let bValid = true;
        gurads.forEach((v) => {
            if (!IsValidUint(v.portions) || v.portions > Reward.MAX_PORTIONS_COUNT) bValid = false;
            if (!Protocol.IsValidObjects([v.guard])) bValid = false;
        })
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'gurads')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            gurads.forEach((guard) => 
                txb.moveCall({
                    target:this.protocol.RewardFn('guard_add_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), 
                        Protocol.TXB_OBJECT(txb, guard.guard), txb.pure(guard.portions, BCS.U8), 
                        Protocol.TXB_OBJECT(txb, this.permission)], 
                    typeArguments:[this.earnest_type]
                })
            )
        } else {
            gurads.forEach((guard) => 
                txb.moveCall({
                    target:this.protocol.RewardFn('guard_add') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard.guard), 
                        txb.pure(guard.portions, BCS.U8), Protocol.TXB_OBJECT(txb, this.permission)], 
                    typeArguments:[this.earnest_type]
                })
            )
        }
    }

    remove_guard(guards:string[], removeall?:boolean, passport?:PassportObject)  {
        if (!removeall && !guards) {
            ERROR(Errors.AllInvalid,  'guards & removeall')
        }

        if (guards && !IsValidArray(guards, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'guards')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (removeall) {
                txb.moveCall({
                    target:this.protocol.RewardFn('guard_remove_all_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)], 
                    typeArguments:[this.earnest_type]
                })
            } else {
                txb.moveCall({
                    target:this.protocol.RewardFn('guard_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(guards), 'vector<address>'), 
                        Protocol.TXB_OBJECT(txb, this.permission)], 
                    typeArguments:[this.earnest_type]
                })
            }
        } else {
            if (removeall) {
                txb.moveCall({
                    target:this.protocol.RewardFn('guard_remove_all') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)], 
                    typeArguments:[this.earnest_type]
                })
            } else {
                txb.moveCall({
                    target:this.protocol.RewardFn('guard_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(guards, 'vector<address>'), 
                        Protocol.TXB_OBJECT(txb, this.permission)], 
                    typeArguments:[this.earnest_type]
                })
            }
        }
        
    }
    allow_repeat_claim(allow_repeat_claim:boolean, passport?:PassportObject)  {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.RewardFn('allow_repeat_claim_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission), 
                    txb.pure(allow_repeat_claim, BCS.BOOL)], 
                typeArguments:[this.earnest_type]
            })
        } else {
            txb.moveCall({
                target:this.protocol.RewardFn('allow_repeat_claim') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission), 
                    txb.pure(allow_repeat_claim, BCS.BOOL)], 
                typeArguments:[this.earnest_type]
            })
        }
    }

    set_description(description:string, passport?:PassportObject)  {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.RewardFn('description_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(description), Protocol.TXB_OBJECT(txb, this.permission)], 
                typeArguments:[this.earnest_type]
            })
        } else {
            txb.moveCall({
                target:this.protocol.RewardFn('description_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(description), Protocol.TXB_OBJECT(txb, this.permission)], 
                typeArguments:[this.earnest_type]
            })
        }
    }

    lock_guards(passport?:PassportObject)  {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.RewardFn('guard_lock_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)], 
                typeArguments:[this.earnest_type]
            })
        } else {
            txb.moveCall({
                target:this.protocol.RewardFn('guard_lock') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)], 
                typeArguments:[this.earnest_type]
            })
        }
    }

    claim(passport?:PassportObject)  {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.RewardFn('claim_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.object(Protocol.CLOCK_OBJECT)], 
                typeArguments:[this.earnest_type]
            })
        } else {
            txb.moveCall({
                target:this.protocol.RewardFn('claim') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.object(Protocol.CLOCK_OBJECT)], 
                typeArguments:[this.earnest_type]
            })        
        }
        ;
    }
    deposit(rewards:CoinReward[])  {
        if (!rewards || !Protocol.IsValidObjects(rewards)) {
            ERROR(Errors.IsValidArray)
        }

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.RewardFn('deposit') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.makeMoveVec({objects:array_unique(rewards)})], //@
            typeArguments:[this.earnest_type]
        })
    }

    change_permission(new_permission:PermissionObject) {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects)
        }

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.RewardFn('this.permission_set') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission), Protocol.TXB_OBJECT(txb, new_permission)],
            typeArguments:[this.earnest_type]            
        })    
        this.permission = new_permission
    }

    static MAX_PORTIONS_COUNT = 255;
}