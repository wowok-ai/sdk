import { TransactionArgument, Transaction as TransactionBlock, type TransactionResult, } from '@mysten/sui/transactions';
import { FnCallType, GuardObject, PassportObject, PermissionObject, RewardAddress, Protocol, TxbObject, } from './protocol';
import { array_unique, IsValidAddress, IsValidArgType, IsValidArray, IsValidDesription, IsValidU64, parseObjectType} from './utils';
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
    protected txb;
    
    get_earnest_type() {  return this.earnest_type }
    get_object() { return this.object }
    private constructor(txb:TransactionBlock, earnest_type:string, permission:PermissionObject) {
        this.txb = txb
        this.earnest_type = earnest_type
        this.permission = permission
        this.object = ''
    }
    static From(txb:TransactionBlock, earnest_type:string, permission:PermissionObject, object:TxbObject) : Reward {
        let r = new Reward(txb, earnest_type,  permission);
        r.object = Protocol.TXB_OBJECT(txb, object);
        return  r
    }
    static New(txb:TransactionBlock, earnest_type:string, permission:PermissionObject, description:string, 
        ms_expand:boolean, time:number, passport?:PassportObject) : Reward {
        if (!Protocol.IsValidObjects([permission])) {
            ERROR(Errors.IsValidObjects, 'permission')
        }
        if (!IsValidArgType(earnest_type)) {
            ERROR(Errors.IsValidArgType, 'earnest_type')
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        if (!IsValidU64(time)) {
            ERROR(Errors.IsValidUint, 'time')
        }

        let r = new Reward(txb, earnest_type,  permission);
        const clock = txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            r.object = txb.moveCall({
                target:Protocol.Instance().RewardFn('new_with_passport') as FnCallType,
                arguments:[passport, txb.pure.string(description), txb.pure.bool(ms_expand), txb.pure.u64(time), 
                    txb.object(clock), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments:[earnest_type]
            })
        } else {
            r.object = txb.moveCall({
                target:Protocol.Instance().RewardFn('new') as FnCallType,
                arguments:[txb.pure.string(description), txb.pure.bool(ms_expand), txb.pure.u64(time), 
                    txb.object(clock), Protocol.TXB_OBJECT(txb, permission)], 
                typeArguments:[earnest_type]
            })
        }
        return r
    }
    
    launch(): RewardAddress  {
        return this.txb.moveCall({
            target:Protocol.Instance().RewardFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)], 
            typeArguments:[this.earnest_type]
        })
    }

    destroy()  {
        this.txb.moveCall({
            target:Protocol.Instance().RewardFn('destroy') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object)],
        })   
    }

    refund(passport?:PassportObject) {
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().RewardFn('refund_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)], 
                typeArguments:[this.earnest_type]
            })  
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().RewardFn('refund') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)], 
                typeArguments:[this.earnest_type]
            })        
        }
    }

    expand_time(ms_expand:boolean, time:number, passport?:PassportObject)  {
        if (!IsValidU64(time)) {
            ERROR(Errors.IsValidUint, 'minutes_expand')
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().RewardFn('time_expand_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(ms_expand),
                    this.txb.pure.u64(time), Protocol.TXB_OBJECT(this.txb, this.permission)], 
                typeArguments:[this.earnest_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().RewardFn('time_expand') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object),this.txb.pure.bool(ms_expand),
                    this.txb.pure.u64(time), Protocol.TXB_OBJECT(this.txb, this.permission)], 
                typeArguments:[this.earnest_type]
            })
        }
    }

    add_guard(guards:RewardGuardPortions[], passport?:PassportObject)  {
        if (guards.length === 0) return;

        let bValid = true;
        guards.forEach((v) => {
            if (!IsValidU64(v.portions) || v.portions > Reward.MAX_PORTIONS_COUNT) bValid = false;
            if (!Protocol.IsValidObjects([v.guard])) bValid = false;
        })
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'guards')
        }

        if (passport) {
            guards.forEach((guard) => 
                this.txb.moveCall({
                    target:Protocol.Instance().RewardFn('guard_add_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                        Protocol.TXB_OBJECT(this.txb, guard.guard), this.txb.pure.u8(guard.portions), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)], 
                    typeArguments:[this.earnest_type]
                })
            )
        } else {
            guards.forEach((guard) => 
                this.txb.moveCall({
                    target:Protocol.Instance().RewardFn('guard_add') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard.guard), 
                        this.txb.pure.u8(guard.portions), Protocol.TXB_OBJECT(this.txb, this.permission)], 
                    typeArguments:[this.earnest_type]
                })
            )
        }
    }

    remove_guard(guards:string[], removeall?:boolean, passport?:PassportObject)  {
        if (!removeall && guards.length===0) {
            return
        }

        if (!IsValidArray(guards, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'guards')
        }
        
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().RewardFn('guard_remove_all_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)], 
                    typeArguments:[this.earnest_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().RewardFn('guard_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(guards)), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)], 
                    typeArguments:[this.earnest_type]
                })
            }
        } else {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().RewardFn('guard_remove_all') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)], 
                    typeArguments:[this.earnest_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().RewardFn('guard_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(guards)), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)], 
                    typeArguments:[this.earnest_type]
                })
            }
        }
        
    }
    allow_repeat_claim(allow_repeat_claim:boolean, passport?:PassportObject)  {
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().RewardFn('allow_repeat_claim_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission), 
                    this.txb.pure.bool(allow_repeat_claim)], 
                typeArguments:[this.earnest_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().RewardFn('allow_repeat_claim') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission), 
                    this.txb.pure.bool(allow_repeat_claim)], 
                typeArguments:[this.earnest_type]
            })
        }
    }

    set_description(description:string, passport?:PassportObject)  {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().RewardFn('description_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)], 
                typeArguments:[this.earnest_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().RewardFn('description_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)], 
                typeArguments:[this.earnest_type]
            })
        }
    }

    lock_guards(passport?:PassportObject)  {
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().RewardFn('guard_lock_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)], 
                typeArguments:[this.earnest_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().RewardFn('guard_lock') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)], 
                typeArguments:[this.earnest_type]
            })
        }
    }

    claim(passport?:PassportObject)  {
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().RewardFn('claim_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(clock)], 
                typeArguments:[this.earnest_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().RewardFn('claim') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(clock)], 
                typeArguments:[this.earnest_type]
            })        
        }
    }

    deposit(rewards:(TransactionResult | TransactionArgument)[])  {
        if (!rewards || !Protocol.IsValidObjects(rewards)) {
            ERROR(Errors.IsValidArray)
        }

        this.txb.moveCall({
            target:Protocol.Instance().RewardFn('deposit') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.makeMoveVec({elements:array_unique(rewards)})], //@
            typeArguments:[this.earnest_type]
        })
    }

    allow_claim(bAllowClaim: boolean, passport?:PassportObject) {
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().RewardFn('allow_claim_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission),
                    this.txb.pure.bool(bAllowClaim)], 
                typeArguments:[this.earnest_type]
            })      
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().RewardFn('allow_claim') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.pure.bool(bAllowClaim)], 
                typeArguments:[this.earnest_type]
            })            
        }
    }

    change_permission(new_permission:PermissionObject) {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects)
        }
        
        this.txb.moveCall({
            target:Protocol.Instance().RewardFn('permission_set') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission), Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments:[this.earnest_type]            
        })    
        this.permission = new_permission
    }
    static parseObjectType = (chain_type:string) : string =>  {
        return parseObjectType(chain_type, 'reward::Reward<')
    }
    static MAX_PORTIONS_COUNT = 600;
    static MAX_GUARD_COUNT = 16;
}