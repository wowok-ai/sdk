import { type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS } from '@mysten/bcs';
import { FnCallType, Protocol, PassportObject, PermissionObject, GuardObject, DemandAddress, TxbObject} from './protocol';
import { IsValidDesription, IsValidUint, IsValidAddress, IsValidArgType, } from './utils'
import { Errors, ERROR}  from './exception'
import { Service } from './service'


export class Demand {
    protected earnest_type;
    protected permission ;
    protected object : TxbObject ;
    protected protocol;

    get_earnest_type() {  return this.earnest_type }
    get_object() { return this.object }

    static From(protocol:Protocol, earnest_type:string, permission:PermissionObject, object:TxbObject) : Demand {
        let d = new Demand(protocol,  earnest_type, permission)
        d.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), object)
        return d
    }

    private constructor(protocol:Protocol, earnest_type:string, permission:PermissionObject) {
        this.earnest_type = earnest_type;
        this.permission = permission;
        this.protocol = protocol;
        this.object = '';
    }
    static New(protocol:Protocol, earnest_type:string, permission:PermissionObject, description:string, 
        earnest:TransactionResult, passport?:PassportObject) : Demand {
        let  d = new Demand(protocol, earnest_type, permission);

        if (!Protocol.IsValidObjects([permission, earnest])) {
            ERROR(Errors.IsValidObjects, 'permission, earnest');
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        } 
        if (!IsValidArgType(earnest_type)) {
            ERROR(Errors.IsValidArgType, earnest_type);
        }

        let txb = protocol.CurrentSession();
        if (passport) {
            d.object = txb.moveCall({
                target:protocol.DemandFn('new_with_passport') as FnCallType,
                arguments:[passport, txb.pure(description), earnest, Protocol.TXB_OBJECT(txb, permission)],
                typeArguments:[earnest_type],
            })        
        } else {
            d.object = txb.moveCall({
                target:protocol.DemandFn('new') as FnCallType,
                arguments:[txb.pure(description), earnest, Protocol.TXB_OBJECT(txb, permission)],
                typeArguments:[earnest_type],
            })        
        }
        return d
    }

    launch() : DemandAddress {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target:this.protocol.DemandFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object)],
            typeArguments:[this.earnest_type],
        })
    }
    
    destroy() {
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.DemandFn('destroy') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
            typeArguments:[this.earnest_type]
        }) 
    }
    refund(passport?:PassportObject)  {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.DemandFn('refund_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.earnest_type],
            })
        } else {
            txb.moveCall({
                target:this.protocol.DemandFn('refund') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.earnest_type],
            })            
        }
    }
    
    expand_time(minutes_duration:number, passport?:PassportObject) {
        if (!IsValidUint(minutes_duration)) {
            ERROR(Errors.IsValidUint, 'minutes_duration');
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.DemandFn('time_expand_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(minutes_duration, BCS.U64), 
                    txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.earnest_type],
            })  
        } else {
            txb.moveCall({
                target:this.protocol.DemandFn('time_expand') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(minutes_duration, BCS.U64), 
                    txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.earnest_type],
            })          
        }
    }
    
   set_guard(guard?:GuardObject, passport?:PassportObject)  {  
        if (guard && !Protocol.IsValidObjects([guard])) {
            ERROR(Errors.IsValidObjects, 'guard');
        }
    
        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (guard) {
                txb.moveCall({
                    target:this.protocol.DemandFn('guard_set_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard), 
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.earnest_type],
                })            
            } else {
                txb.moveCall({
                    target:this.protocol.DemandFn('guard_none_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.earnest_type],
                })               
            }
        } else {
            if (guard) {
                txb.moveCall({
                    target:this.protocol.DemandFn('guard_set') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard), 
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.earnest_type],
                })            
            } else {
                txb.moveCall({
                    target:this.protocol.DemandFn('guard_none') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.earnest_type],
                })               
            }        
        }
    }
    
    set_description(description:string, passport?:PassportObject) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
    
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.DemandFn('description_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(description), 
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.earnest_type],
            })    
        } else {
            txb.moveCall({
                target:this.protocol.DemandFn('description_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(description), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.earnest_type],
            })    
        }
    }
    
    yes(service_address:string, passport?:PassportObject) {
        if (!IsValidAddress(service_address)) {
            ERROR(Errors.IsValidAddress)
        }
    
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.DemandFn('yes_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), 
                    txb.pure(service_address, BCS.ADDRESS), 
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.earnest_type],
            })    
        } else {
            txb.moveCall({
                target:this.protocol.DemandFn('yes') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), 
                    txb.pure(service_address, BCS.ADDRESS), 
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.earnest_type],
            })    
        }
    }
    
    deposit(earnest:TxbObject)  {
        if (!Protocol.IsValidObjects([earnest])) {
            ERROR(Errors.IsValidObjects)
        }

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.DemandFn('deposit') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, earnest)],
            typeArguments:[this.earnest_type],
        })    
    }
    
    present(service_address: string, service_pay_type:string, tips:string, passport?:PassportObject) {
        if (!IsValidDesription(tips)) {
            ERROR(Errors.IsValidDesription, 'tips')
        }
        if (!IsValidAddress(service_address)) {
            ERROR(Errors.IsValidAddress, 'service_address')
        }
        if (!IsValidArgType(service_pay_type)) {
            ERROR(Errors.IsValidArgType, 'service_pay_type')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.DemandFn('present_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, service_address), 
                    txb.pure(tips, BCS.STRING)],
                typeArguments:[this.earnest_type, service_pay_type],
            })   
        } else {
            txb.moveCall({
                target:this.protocol.DemandFn('present') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, service_address), 
                    txb.pure(tips, BCS.STRING)],
                typeArguments:[this.earnest_type, service_pay_type],
            })   
        } 
    }
    change_permission(new_permission:PermissionObject)  {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects)
        }
    
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.DemandFn('permission_set') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission), Protocol.TXB_OBJECT(txb, new_permission)],
            typeArguments:[this.earnest_type]            
        })    
        this.permission = new_permission
    }

    static MAX_EARNEST_COUNT = 200;
    static MAX_PRESENTERS_COUNT = 200;
}

