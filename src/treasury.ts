import { type TransactionResult, Transaction as TransactionBlock } from '@mysten/sui/transactions';
import { FnCallType, Protocol, PassportObject, PermissionObject, TreasuryAddress, TxbObject, CoinObject, PaymentObject,
    ReceivedObject } from './protocol';
import { IsValidDesription, IsValidU64, IsValidAddress, IsValidArgType, IsValidArray, parseObjectType} from './utils'
import { Errors, ERROR}  from './exception'

export interface DepositParam {
    coin: CoinObject,
    index: bigint,
    remark: string,
    for_object?: string,
    for_guard?: string,
}

export interface WithdrawItem {
    address: string,
    amount: bigint,
}
export interface WithdrawParam {
    items: WithdrawItem[],
    index: bigint,
    remark: string,
    for_object?: string,
    for_guard?: string,
}
export class Treasury {
    protected token_type;
    protected permission ;
    protected object : TxbObject;
    protected txb;

    get_token_type() {  return this.token_type }
    get_object() { return this.object }

    static From(txb:TransactionBlock, token_type:string, permission:PermissionObject, object:TxbObject) : Treasury {
        let d = new Treasury(txb,  token_type, permission)
        d.object = Protocol.TXB_OBJECT(txb, object)
        return d
    }   

    private constructor(txb:TransactionBlock, token_type:string, permission:PermissionObject) {
        this.token_type = token_type;
        this.permission = permission;
        this.txb = txb;
        this.object = '';
    }
    static New(txb:TransactionBlock, token_type:string, permission:PermissionObject, description:string, 
        bFreeDeposit:boolean=false, passport?:PassportObject) : Treasury {
        if (!Protocol.IsValidObjects([permission])) {
            ERROR(Errors.IsValidObjects, 'permission, bounty');
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        } 
        if (!IsValidArgType(token_type)) {
            ERROR(Errors.IsValidArgType, token_type);
        }
        
        let  d = new Treasury(txb, token_type, permission);
        if (passport) {
            d.object = txb.moveCall({
                target:Protocol.Instance().TreasuryFn('new_with_passport') as FnCallType,
                arguments:[passport, txb.pure.bool(bFreeDeposit), txb.pure.string(description),  Protocol.TXB_OBJECT(txb, permission)],
                typeArguments:[token_type],
            })        
        } else {
            d.object = txb.moveCall({
                target:Protocol.Instance().TreasuryFn('new') as FnCallType,
                arguments:[txb.pure.bool(bFreeDeposit), txb.pure.string(description),  Protocol.TXB_OBJECT(txb, permission)],
                typeArguments:[token_type],
            })        
        }
        return d
    }

    launch() : TreasuryAddress {
        return this.txb.moveCall({
            target:Protocol.Instance().TreasuryFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)],
            typeArguments:[this.token_type],
        })
    }
    
    destroy() {
        this.txb.moveCall({
            target:Protocol.Instance().TreasuryFn('destroy') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object)],
            typeArguments:[this.token_type]
        }) 
    }
    
    set_free_deposit(bFreeDeposit:boolean, passport?:PassportObject)  {
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().TreasuryFn('free_deposit_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.pure.bool(bFreeDeposit), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().TreasuryFn('free_deposit_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(bFreeDeposit), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })            
        }
    }
    
    deposit(param:DepositParam, bFreeDeposit:boolean=false, passport?:PassportObject) :TxbObject {
        if (!Protocol.IsValidObjects([param.coin])) {
            ERROR(Errors.IsValidObjects, 'deposit.param.coin')
        }
        if (!IsValidDesription(param.remark)) {
            ERROR(Errors.IsValidDesription, 'deposit.param.remark')
        }
        if (param?.for_object && !IsValidAddress(param.for_object)) {
            ERROR(Errors.IsValidAddress, 'deposit.param.for_object')
        }
        if (param?.for_guard && !IsValidAddress(param.for_guard)) {
            ERROR(Errors.IsValidAddress, 'deposit.param.for_guard')
        }
        if (param.index !== undefined && !IsValidU64(param.index)) {
            ERROR(Errors.InvalidParam, 'deposit.param.index')
        }

        const for_obj = this.txb.pure.option('address', param.for_object ?? undefined);
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);

        if (bFreeDeposit) {
            if (param.for_guard) {
                return this.txb.moveCall({
                    target:Protocol.Instance().TreasuryFn('free_deposit_forGuard') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                        this.txb.pure.string(param.remark), for_obj, this.txb.object(param.for_guard), this.txb.object(clock)],
                    typeArguments:[this.token_type],
                })  
            } else {
                return this.txb.moveCall({
                    target:Protocol.Instance().TreasuryFn('free_deposit') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                        this.txb.pure.string(param.remark), for_obj, this.txb.object(clock)],
                    typeArguments:[this.token_type],
                })  
            }
        } else {
            if (passport) {
                if (param.for_guard) {
                    return this.txb.moveCall({
                        target:Protocol.Instance().TreasuryFn('deposit_forGuard_with_passport') as FnCallType,
                        arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                            this.txb.pure.string(param.remark), for_obj, this.txb.object(param.for_guard), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                        typeArguments:[this.token_type],
                    })  
                } else {
                    return this.txb.moveCall({
                        target:Protocol.Instance().TreasuryFn('deposit_with_passport') as FnCallType,
                        arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                            this.txb.pure.string(param.remark), for_obj, this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                        typeArguments:[this.token_type],
                    })  
                }
            } else {
                if (param.for_guard) {
                    return this.txb.moveCall({
                        target:Protocol.Instance().TreasuryFn('deposit_forGuard') as FnCallType,
                        arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                            this.txb.pure.string(param.remark), for_obj, this.txb.object(param.for_guard), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                        typeArguments:[this.token_type],
                    })  
                } else {
                    return this.txb.moveCall({
                        target:Protocol.Instance().TreasuryFn('deposit') as FnCallType,
                        arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                            this.txb.pure.string(param.remark), for_obj, this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                        typeArguments:[this.token_type],
                    })  
                }
            }
        }
    }

    receive(payment:PaymentObject, received:ReceivedObject, passport?:PassportObject)  {
        if (!Protocol.IsValidObjects([payment, received])) {
            ERROR(Errors.IsValidArray, 'receive.payment&received');
        }
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            return this.txb.moveCall({
                target:Protocol.Instance().TreasuryFn('receive_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(received), this.txb.object(payment), 
                    this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })
        } else {
            return this.txb.moveCall({
                target:Protocol.Instance().TreasuryFn('receive') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(received), this.txb.object(payment), 
                    this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })
        }
    }
    
    withdraw(param:WithdrawParam, passport?:PassportObject)  {
        if (param.items.length === 0) return undefined;
        if (!IsValidArray(param.items, (item:WithdrawItem) => IsValidU64(item.amount) && IsValidAddress(item.address))) {
            ERROR(Errors.IsValidArray, 'withdraw.param.items')
        }
        if (!IsValidDesription(param.remark)) {
            ERROR(Errors.IsValidDesription, 'withdraw.param.remark')
        }
        if (!IsValidU64(param.index)) {
            ERROR(Errors.IsValidU64, 'withdraw.param.index')
        }
        if (param?.for_guard && !IsValidAddress(param.for_guard)) {
            ERROR(Errors.IsValidAddress, 'withdraw.param.for_guard')
        }
        if (param?.for_object && !IsValidAddress(param.for_object)) {
            ERROR(Errors.IsValidAddress, 'withdraw.param.for_object')
        }

        const for_obj = this.txb.pure.option('address', param.for_object ?? undefined);
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);

        if (passport) {
            if (param.for_guard) {
                return this.txb.moveCall({
                    target:Protocol.Instance().TreasuryFn('withdraw_forGuard_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(v=>v.address)), 
                        this.txb.pure.vector('u64', param.items.map(v=>v.amount)), this.txb.pure.u64(param.index),
                        this.txb.pure.string(param.remark), for_obj, this.txb.object(param.for_guard), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.token_type],
                })
            } else {
                return this.txb.moveCall({
                    target:Protocol.Instance().TreasuryFn('withdraw_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(v=>v.address)), 
                        this.txb.pure.vector('u64', param.items.map(v=>v.amount)), this.txb.pure.u64(param.index),
                        this.txb.pure.string(param.remark), for_obj, this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.token_type],
                })
            }
        } else {
            if (param.for_guard) {
                return this.txb.moveCall({
                    target:Protocol.Instance().TreasuryFn('withdraw_forGuard') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(v=>v.address)), 
                        this.txb.pure.vector('u64', param.items.map(v=>v.amount)), this.txb.pure.u64(param.index),
                        this.txb.pure.string(param.remark), for_obj, this.txb.object(param.for_guard), this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.token_type],
                })
            } else {
                console.log(param)
                return this.txb.moveCall({
                    target:Protocol.Instance().TreasuryFn('withdraw') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(v=>v.address)), 
                        this.txb.pure.vector('u64', param.items.map(v=>v.amount)), this.txb.pure.u64(param.index),
                        this.txb.pure.string(param.remark), for_obj, this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.token_type],
                })
            }
        }
    }

    set_description(description:string, passport?:PassportObject) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription, 'set_description.description');
        }
    
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().TreasuryFn('description_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })    
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().TreasuryFn('description_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })    
        }
    }
    
    change_permission(new_permission:PermissionObject)  {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects, 'change_permission.new_permission')
        }
    
        this.txb.moveCall({
            target:Protocol.Instance().TreasuryFn('permission_set') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission), Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments:[this.token_type]            
        })    
        this.permission = new_permission
    }
    static parseObjectType = (chain_type:string) : string =>  {
        return parseObjectType(chain_type, 'treasury::Treasury<')
    }

    static OP_WITHDRAW = 0;
    static OP_DEPOSIT = 1;
    static OP_RECEIVE = 2;
}

