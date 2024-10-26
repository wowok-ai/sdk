import { FnCallType, PaymentObject, ReceivedObject, PaymentAddress, Protocol, TxbObject, CoinObject, PassportObject} from './protocol';
import { IsValidDesription, IsValidAddress, Bcs, array_unique, IsValidArray, IsValidName, IsValidU64, IsValidU256, IsValidU8 } from './utils';
import { ERROR, Errors } from './exception';
import { DepositParam, WithdrawParam, WithdrawItem } from './treasury';
import { Transaction as TransactionBlock} from '@mysten/sui/transactions';

export interface WithholdingGuard {
    guard: string,
    amount: bigint,
}
export interface WithholdingParam {
    guards: WithholdingGuard[]
}

export class Withholding {
    protected object : TxbObject;
    protected pay_token_type;
    protected txb;
    
    get_pay_type() {  return this.pay_token_type }
    get_object() { return this.object }
    private constructor(txb:TransactionBlock, pay_token_type:string, ) {
        this.object = '';
        this.pay_token_type = pay_token_type;
        this.txb = txb;
    }

    static From(txb:TransactionBlock, pay_token_type:string, object:TxbObject) : Withholding {
        if (!pay_token_type) ERROR(Errors.InvalidParam, 'Withholding.From.pay_token_type');
        let v = new Withholding(txb, pay_token_type);
        v.object = Protocol.TXB_OBJECT(txb, object)
        return v
    }

    static New(txb:TransactionBlock, pay_token_type:string, param:WithholdingParam) : Withholding {
        if (!pay_token_type) ERROR(Errors.InvalidParam, 'Withholding.New_fromAddress.pay_token_type');
        if (param.guards.length === 0 || param.guards.length > Withholding.MAX_GUARD_COUNT) {
            ERROR(Errors.InvalidParam, 'Withholding.New.param.guards length')
        }
        if (!IsValidArray(param.guards, (item:WithholdingGuard) => IsValidAddress(item.guard) && IsValidU64(item.amount))) {
            ERROR(Errors.InvalidParam, 'Withholding.New.param.guards')
        }

        let v = new Withholding(txb, pay_token_type);    
        const clock = txb.sharedObjectRef(Protocol.CLOCK_OBJECT);

        v.object = txb.moveCall({
            target:Protocol.Instance().WithholdingFn('new') as FnCallType,
            arguments:[],
            typeArguments:[pay_token_type],
        })    

        param.guards.forEach((i) => {
            txb.moveCall({
                target:Protocol.Instance().WithholdingFn('add_guard') as FnCallType,
                arguments:[txb.object(v.object), txb.object(i.guard), txb.pure.u64(i.amount)],
                typeArguments:[pay_token_type],
            })      
        })
        return v
    }

    launch() : PaymentAddress {
        return this.txb.moveCall({
            target:Protocol.Instance().WithholdingFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)],
            typeArguments:[this.pay_token_type],
        })
    }

    receive(payment:PaymentObject, received:ReceivedObject) {
        if (!Protocol.IsValidObjects([payment, received])) {
            ERROR(Errors.IsValidArray, 'receive.payment&received');
        }
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);

        return this.txb.moveCall({
            target:Protocol.Instance().WithholdingFn('receive') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(received), this.txb.object(payment), 
                this.txb.object(clock)],
            typeArguments:[this.pay_token_type],
        })
    }

    deposit(param:DepositParam) {
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

        if (param.for_guard) {
            return this.txb.moveCall({
                target:Protocol.Instance().WithholdingFn('deposit_forGuard') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                    this.txb.pure.string(param.remark), for_obj, this.txb.object(param.for_guard), this.txb.object(clock)],
                typeArguments:[this.pay_token_type],
            })
        } else {
            return this.txb.moveCall({
                target:Protocol.Instance().WithholdingFn('deposit') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                    this.txb.pure.string(param.remark), for_obj, this.txb.object(clock)],
                typeArguments:[this.pay_token_type],
            })
        }
    }

    // param.treasury -> coins ; param.receiver -> null
    withdraw(guard:string, param:WithdrawParam, passport:PassportObject)  {
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

        if (param.for_guard) {
            return this.txb.moveCall({
                target:Protocol.Instance().WithholdingFn('withdraw_forGuard') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(guard), this.txb.object(passport), 
                    this.txb.pure.vector('address', param.items.map(i=>i.address)), this.txb.pure.vector('u64', param.items.map(i=>i.amount)),
                    this.txb.pure.u64(param.index), this.txb.pure.string(param.remark), for_obj, this.txb.object(param.for_guard), this.txb.object(clock)],
                typeArguments:[this.pay_token_type],
            })
        } else {
            return this.txb.moveCall({
                target:Protocol.Instance().WithholdingFn('withdraw') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(guard), this.txb.object(passport), 
                    this.txb.pure.vector('address', param.items.map(i=>i.address)), this.txb.pure.vector('u64', param.items.map(i=>i.amount)),
                    this.txb.pure.u64(param.index), this.txb.pure.string(param.remark), for_obj, this.txb.object(clock)],
                typeArguments:[this.pay_token_type],
            })
        }
    }

    static  MAX_GUARD_COUNT = 16;
}