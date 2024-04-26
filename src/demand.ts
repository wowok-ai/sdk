import { type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS } from '@mysten/bcs';
import { FnCallType, Protocol, PassportObject, PermissionObject, GuardObject, DemandAddress, TxbObject} from './protocol.js';
import { IsValidDesription, IsValidUint, IsValidAddress, IsValidArgType, } from './utils.js'
import { Errors, ERROR}  from './exception.js'
import { Service } from './service.js'


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
        return true
    }
    
    yes(service_id:string, passport?:PassportObject) {
        if (!IsValidAddress(service_id)) {
            ERROR(Errors.IsValidAddress)
        }
    
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.DemandFn('yes_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(service_id, BCS.ADDRESS), 
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.earnest_type],
            })    
        } else {
            txb.moveCall({
                target:this.protocol.DemandFn('yes') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(service_id, BCS.ADDRESS), 
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
    
    present(service: Service, tips:string, passport?:PassportObject) : boolean {
        if (!IsValidDesription(tips)) {
            ERROR(Errors.IsValidDesription, 'tips')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.DemandFn('present_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, service.get_object()), 
                    txb.pure(tips, BCS.STRING), ],
                typeArguments:[this.earnest_type, service.get_pay_type()],
            })   
        } else {
            txb.moveCall({
                target:this.protocol.DemandFn('present') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, service.get_object()), 
                    txb.pure(tips, BCS.STRING), ],
                typeArguments:[this.earnest_type, service.get_pay_type()],
            })   
        } 
        return true
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
        return true
    }

    static MAX_EARNEST_COUNT = 200;
    static MAX_PRESENTERS_COUNT = 200;
}

