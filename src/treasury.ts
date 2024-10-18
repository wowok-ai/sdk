import { type TransactionResult, Transaction as TransactionBlock } from '@mysten/sui/transactions';
import { FnCallType, Protocol, PassportObject, PermissionObject, DemandAddress, TxbObject, CoinObject} from './protocol';
import { IsValidDesription, IsValidU64, IsValidAddress, IsValidArgType, } from './utils'
import { Errors, ERROR}  from './exception'

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

    launch() : DemandAddress {
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
    
    set_free_deposits(bFreeDeposit:boolean, passport?:PassportObject)  {
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().TreasuryFn('free_deposits_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.pure.bool(bFreeDeposit), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().TreasuryFn('free_deposits_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(bFreeDeposit), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })            
        }
    }
    
    deposit(coin:CoinObject, tips:string, for_object?:string, index?:number, from_object?:string, passport?:PassportObject) :TxbObject {
        if (!Protocol.IsValidObjects([coin])) {
            ERROR(Errors.IsValidObjects, 'deposit.coin')
        }
        if (!IsValidDesription(tips)) {
            ERROR(Errors.IsValidDesription, 'deposit.tips')
        }
        if (for_object && !IsValidAddress(for_object)) {
            ERROR(Errors.IsValidAddress, 'deposit.tips')
        }
        if (from_object && !IsValidAddress(from_object)) {
            ERROR(Errors.IsValidAddress, 'deposit.from_object')
        }
        if (index !== undefined && !IsValidU64(index)) {
            ERROR(Errors.InvalidParam, 'deposit.index')
        }
        const for_obj = this.txb.pure.option('address', for_object ?? undefined);
        const idx = this.txb.pure.option('u64', index ?? undefined);
        const from_obj = this.txb.pure.option('address', from_object ?? undefined);
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);

        if (passport) {
            return this.txb.moveCall({
                target:Protocol.Instance().TreasuryFn('deposit_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, coin), 
                    this.txb.pure.string(tips), for_obj, idx, from_obj, this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })
        } else {
            return this.txb.moveCall({
                target:Protocol.Instance().TreasuryFn('deposit') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, coin), 
                    this.txb.pure.string(tips), for_obj, idx, from_obj, this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })  
        }
    }

    free_deposit(coin:CoinObject, tips:string, for_object?:string, index?:number, from_object?:string) : TxbObject  {
        if (!Protocol.IsValidObjects([coin])) {
            ERROR(Errors.IsValidObjects, 'free_deposit.coin')
        }
        if (!IsValidDesription(tips)) {
            ERROR(Errors.IsValidDesription, 'free_deposit.tips')
        }
        if (for_object && !IsValidAddress(for_object)) {
            ERROR(Errors.IsValidAddress, 'free_deposit.for_object')
        }
        if (from_object && !IsValidAddress(from_object)) {
            ERROR(Errors.IsValidAddress, 'free_deposit.from_object')
        }
        if (index !== undefined && !IsValidU64(index)) {
            ERROR(Errors.InvalidParam, 'free_deposit.index')
        }
        const for_obj = this.txb.pure.option('address', for_object ?? undefined);
        const idx = this.txb.pure.option('u64', index ?? undefined);
        const from_obj = this.txb.pure.option('address', from_object ?? undefined);
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);

        return this.txb.moveCall({
            target:Protocol.Instance().TreasuryFn('deposit2') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, coin), 
                this.txb.pure.string(tips), for_obj, idx, from_obj, this.txb.object(clock)],
            typeArguments:[this.token_type],
        })  
    }
    
    withdraw(amount:number, tips:string, for_object?:string, index?:number, to_object?:string, passport?:PassportObject) : CoinObject {
        if (!IsValidU64(amount)) {
            ERROR(Errors.IsValidObjects, 'withdraw.amount')
        }
        if (!IsValidDesription(tips)) {
            ERROR(Errors.IsValidDesription, 'withdraw.tips')
        }
        if (for_object && !IsValidAddress(for_object)) {
            ERROR(Errors.IsValidAddress, 'withdraw.for_object')
        }
        if (to_object && !IsValidAddress(to_object)) {
            ERROR(Errors.IsValidAddress, 'withdraw.to_object')
        }
        if (index !== undefined && !IsValidU64(index)) {
            ERROR(Errors.InvalidParam, 'withdraw.index')
        }
        const for_obj = this.txb.pure.option('address', for_object ?? undefined);
        const idx = this.txb.pure.option('u64', index ?? undefined);
        const to_obj = this.txb.pure.option('address', to_object ?? undefined);
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);

        if (passport) {
            return this.txb.moveCall({
                target:Protocol.Instance().TreasuryFn('withdraw_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u64(amount), 
                    this.txb.pure.string(tips), for_obj, idx, to_obj, this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })
        } else {
            return this.txb.moveCall({
                target:Protocol.Instance().TreasuryFn('withdraw') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u64(amount), 
                    this.txb.pure.string(tips), for_obj, idx, to_obj, this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.token_type],
            })
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
        if (chain_type) {
            const s = 'treasury::Treasury<'
            const i = chain_type.indexOf(s);
            if (i > 0) {
                let r = chain_type.slice(i + s.length, chain_type.length-1);
                return r
            }
        }
        return '';
    }
}

