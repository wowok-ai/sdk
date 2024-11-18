import { IsValidArray, IsValidPercent, IsValidName_AllowEmpty, parseObjectType, array_unique, IsValidTokenType, IsValidDesription, 
    IsValidAddress, IsValidEndpoint, IsValidU64,
    IsValidName, } from './utils'
import { FnCallType, GuardObject, PassportObject, PermissionObject, RepositoryObject, MachineObject, ServiceAddress, 
    ServiceObject, DiscountObject, OrderObject, OrderAddress, CoinObject, Protocol, ValueType,
    TxbObject,
    ArbitrationAddress} from './protocol';
import { ERROR, Errors } from './exception';
import { Transaction as TransactionBlock,  } from '@mysten/sui/transactions';
import { SuiObjectData } from '@mysten/sui/client';

export interface VotingGuard {
    guard:string,
    voting_weight:string, // bigint
}

export interface Vote {
    arb: string,
    voting_guard?: string,
    agrees: number[],
}

export interface Feedback {
    arb:string,
    feedback:string, 
    indemnity?:string,  // bigint
}

export interface Dispute {
    order: string,
    order_token_type: string,
    description: string,
    votable_proposition: string[],
    fee?: CoinObject,
}

export class Arbitration {
    protected pay_token_type;
    protected permission;
    protected object : TxbObject;
    protected txb;

    //static token2coin = (token:string) => { return '0x2::coin::Coin<' + token + '>'};

    get_pay_type() {  return this.pay_token_type }
    get_object() { return this.object }
    private constructor(txb: TransactionBlock, pay_token_type:string, permission:PermissionObject) {
        this.pay_token_type = pay_token_type
        this.txb = txb
        this.permission = permission
        this.object = ''
    }
    static From(txb: TransactionBlock, token_type:string, permission:PermissionObject, object:TxbObject) : Arbitration {
        let s = new Arbitration(txb, token_type, permission);
        s.object = Protocol.TXB_OBJECT(txb, object);
        return s
    }
    static New(txb: TransactionBlock, token_type:string, permission:PermissionObject, description:string, 
        fee:bigint, passport?:PassportObject) : Arbitration {
        if (!Protocol.IsValidObjects([permission])) {
            ERROR(Errors.IsValidObjects)
        }
        if (!IsValidTokenType(token_type)) {
            ERROR(Errors.IsValidTokenType, 'New.token_type') 
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        if (!IsValidU64(fee)) {
            ERROR(Errors.IsValidU64, 'New.fee')
        }

        let pay_token_type = token_type;
        let obj = new Arbitration(txb, pay_token_type, permission);

        if (passport) {
            obj.object = txb.moveCall({
                target:Protocol.Instance().ArbitrationFn('new_with_passport') as FnCallType,
                arguments:[passport, txb.pure.string(description), txb.pure.u64(fee), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments:[pay_token_type],
            })
        } else {
            obj.object = txb.moveCall({
                target:Protocol.Instance().ArbitrationFn('new') as FnCallType,
                arguments:[txb.pure.string(description), txb.pure.u64(fee), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments:[pay_token_type],
            })
        }
        return obj
    }

    launch() : ArbitrationAddress  {
        return this.txb.moveCall({
            target:Protocol.Instance().ArbitrationFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)],
            typeArguments:[this.pay_token_type]
        })
    }

    set_description(description:string, passport?:PassportObject)  {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription, 'set_description.description')
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ArbitrationFn('description_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ArbitrationFn('description_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }

    set_fee(fee:bigint, passport?:PassportObject)  {
        if (!IsValidU64(fee)) {
            ERROR(Errors.IsValidU64, 'set_fee.fee')
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ArbitrationFn('fee_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u64(fee), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ArbitrationFn('fee_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u64(fee), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }

    set_endpoint(endpoint?:string, passport?:PassportObject)  {
        if (endpoint && !IsValidEndpoint(endpoint)) {
            ERROR(Errors.IsValidEndpoint, 'set_endpoint.endpoint')
        }
        
        if (passport) {
            if (endpoint) {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('endpoint_set_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(endpoint), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('endpoint_none_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            }
        } else {
            if (endpoint) {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('endpoint_set') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(endpoint), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('endpoint_none') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            }
        }
    }

    add_voting_guard(guard: VotingGuard[], passport?:PassportObject) {
        if (guard.length === 0) return ;
        if (!IsValidArray(guard, (g:VotingGuard) => IsValidAddress(g.guard) && IsValidU64(g.voting_weight))) {
            ERROR(Errors.IsValidArray, 'add_voting_guard.guard')
        }
        if (passport) {
            guard.forEach(v => {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('voting_guard_add_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(v.guard), 
                        this.txb.pure.u64(v.voting_weight), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            })
        } else {
            guard.forEach(v => {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('voting_guard_add') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(v.guard), 
                        this.txb.pure.u64(v.voting_weight), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            })
        }
    }
    remove_voting_guard(guard: string[], removeall?:boolean, passport?:PassportObject) {
        if (!removeall && guard.length===0)  return;
        
        if (!IsValidArray(guard, IsValidAddress)) {
            ERROR(Errors.IsValidArray,  'remove_voting_guard.guard');
        }

        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('voting_guard_removeall_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('voting_guard_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', guard), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            }
        } else {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('voting_guard_removeall') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('voting_guard_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', guard), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            }
        }
    }

    set_guard(apply_guard?:string, passport?:PassportObject) {
        if (apply_guard && !IsValidAddress(apply_guard)) {
            ERROR(Errors.IsValidAddress, 'set_guard.apply_guard')
        }
        
        if (passport) {
            if (apply_guard) {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('usage_guard_set_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(apply_guard), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('usage_guard_none_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            }
        } else {
            if (apply_guard) {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('usage_guard_set') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(apply_guard), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('usage_guard_none') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            }
        }
    }
    publish(passport?:PassportObject) {
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ArbitrationFn('publish_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ArbitrationFn('publish') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }
    vote(param:Vote, passport?:PassportObject) {
        if (param.voting_guard && !IsValidAddress(param.voting_guard)) {
            ERROR(Errors.IsValidAddress, 'vote.param.voting_guard')
        }
        if (!IsValidArray(param.agrees, (v:number)=> IsValidU64(v) && v < Arbitration.MAX_PROPOSITION_COUNT)) {
            ERROR(Errors.IsValidArray, 'vote.param.agrees')
        }
        if (!IsValidAddress(param.arb)) {
            ERROR(Errors.IsValidAddress, 'vote.param.arb')
        }

        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            if (param.voting_guard) {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('vote_with_passport') as FnCallType,
                    arguments:[passport, this.txb.object(param.voting_guard), Protocol.TXB_OBJECT(this.txb, this.object), 
                        this.txb.object(param.arb), this.txb.pure.vector('u8', param.agrees),
                        this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('vote2_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(param.arb), this.txb.pure.vector('u8', param.agrees),
                        this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            }
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ArbitrationFn('vote') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(param.arb), this.txb.pure.vector('u8', param.agrees),
                    this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }

    arbitration(param:Feedback, passport?:PassportObject) {
        if (!IsValidDesription(param.feedback)) {
            ERROR(Errors.IsValidDesription, 'arbitration.param.feedback')
        }
        if (!IsValidAddress(param.arb)) {
            ERROR(Errors.IsValidAddress, 'arbitration.param.arb')
        }

        if (param.indemnity && !IsValidU64(param.indemnity)) {
            ERROR(Errors.IsValidU64, 'arbitration.param.indemnity')
        }
        let ind = this.txb.pure.option('u64', param.indemnity ? param.indemnity : undefined);

        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ArbitrationFn('arbitration_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.object(param.arb), this.txb.pure.string(param.feedback), ind, Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ArbitrationFn('arbitration') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.object(param.arb), this.txb.pure.string(param.feedback), ind, Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }

    withdraw_fee(arb:string, passport?:PassportObject) {
        if (!IsValidAddress(arb)) {
            ERROR(Errors.IsValidAddress, 'withdraw_fee.arb')
        }
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ArbitrationFn('withdraw_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.object(arb), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ArbitrationFn('withdraw') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.object(arb), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }

    dispute(param:Dispute, passport?:PassportObject) {
        if (!IsValidAddress(param.order)) {
            ERROR(Errors.IsValidAddress, 'dispute.param.order')
        }
        if (!IsValidTokenType(param.order_token_type)) {
            ERROR(Errors.IsValidTokenType, 'dispute.param.order_token_type')
        }
        if (!IsValidDesription(param.description)) {
            ERROR(Errors.IsValidDesription, 'dispute.param.description')
        }
        if (!IsValidArray(param.votable_proposition, IsValidName)) {
            ERROR(Errors.IsValidArray, 'dispute.param.votable_proposition')
        }

        if (passport) {
            if (param.fee) {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('dispute_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(param.order), this.txb.pure.string(param.description),
                        this.txb.pure.vector('string', param.votable_proposition), this.txb.object(param.fee)],
                    typeArguments:[this.pay_token_type, param.order_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('free_dispute_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(param.order), this.txb.pure.string(param.description),
                        this.txb.pure.vector('string', param.votable_proposition)],
                    typeArguments:[this.pay_token_type, param.order_token_type]
                })
            }
        } else {
            if (param.fee) {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('dispute') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(param.order), this.txb.pure.string(param.description),
                        this.txb.pure.vector('string', param.votable_proposition), this.txb.object(param.fee)],
                    typeArguments:[this.pay_token_type, param.order_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ArbitrationFn('free_dispute') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(param.order), this.txb.pure.string(param.description),
                        this.txb.pure.vector('string', param.votable_proposition)],
                    typeArguments:[this.pay_token_type, param.order_token_type]
                })
            }
        }
    }

    static MAX_PROPOSITION_COUNT = 16;
    static MAX_VOTING_GUARD_COUNT = 16;
}