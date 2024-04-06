import { TransactionBlock, type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS } from '@mysten/bcs'; 
import { BCS_CONVERT, array_unique } from './util'
import { CLOCK_OBJECT, FnCallType, GuardObject, PROTOCOL, PassportObject, PermissionObject,
    RepositoryObject, MachineObject, ServiceAddress, ServiceObject, IsValidObjects, IsValidArgType, IsValidDesription, 
    IsValidAddress, IsValidEndpoint, OptionNone, TXB_OBJECT, IsValidUint, IsValidInt, IsValidName, DiscountObject,
    IsValidArray, IsValidPercent, IsValidName_AllowEmpty, OrderObject, OrderAddress, CoinObject } from './protocol';

export function service(pay_type:string, txb:TransactionBlock, permission:PermissionObject, description:string, 
    payee_address:string, endpoint?:string, passport?:PassportObject) : ServiceObject | boolean {
    if (!IsValidObjects([permission])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (!IsValidDesription(description)) return false;
    if (!IsValidAddress(payee_address)) return false;

    if (endpoint && !IsValidEndpoint(endpoint)) return false;
    let ep = endpoint? txb.pure(BCS_CONVERT.ser_option_string(endpoint)) : OptionNone(txb);
    
    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.ServiceFn('new_with_passport') as FnCallType,
            arguments:[passport, txb.pure(description), txb.pure(payee_address, BCS.ADDRESS), ep, TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type],
        })
    } else {
        return txb.moveCall({
            target:PROTOCOL.ServiceFn('new') as FnCallType,
            arguments:[txb.pure(description), txb.pure(payee_address, BCS.ADDRESS), ep, TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type],
        })
    }
}

export function launch(pay_type:string, txb:TransactionBlock, service:ServiceObject) : ServiceAddress | boolean {
    if (!IsValidObjects([service])) return false;
    if (!IsValidArgType(pay_type)) return false;
    return txb.moveCall({
        target:PROTOCOL.ServiceFn('create') as FnCallType,
        arguments:[TXB_OBJECT(txb, service)],
        typeArguments:[pay_type]
    })
}
export function destroy(pay_type:string, txb:TransactionBlock, service:ServiceObject) : boolean {
    if (!IsValidObjects([service])) return false;
    if (!IsValidArgType(pay_type)) return false;
    txb.moveCall({
        target:PROTOCOL.ServiceFn('destroy') as FnCallType,
        arguments: [TXB_OBJECT(txb, service)],
        typeArguments:[pay_type]
    })   
    return true
}
export function service_set_description(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    permission:PermissionObject, description:string, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (!IsValidDesription(description)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('description_set_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, service), txb.pure(description), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('description_set') as FnCallType,
            arguments:[TXB_OBJECT(txb, service), txb.pure(description), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })
    }
    return true
}
export function service_set_price(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, 
    item:string, price:number, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (!IsValidInt(price) || !IsValidName(item)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('price_set_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, service), txb.pure(item), txb.pure(price, BCS.U64), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('price_set') as FnCallType,
            arguments:[TXB_OBJECT(txb, service), txb.pure(item), txb.pure(price, BCS.U64), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })
    }
    return true
}
export function service_set_stock(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, 
    item:string, stock:number, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (!IsValidName(item) || !IsValidInt(stock)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('stock_set_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, service), txb.pure(item), txb.pure(stock, BCS.U64), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('stock_set') as FnCallType,
            arguments:[TXB_OBJECT(txb, service), txb.pure(item), txb.pure(stock, BCS.U64), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })
    }
    return true
}
export function service_add_stock(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, 
    item:string, stock_add:number, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (!IsValidName(item) || !IsValidUint(stock_add)) return false;
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('stock_add_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, service), txb.pure(item), txb.pure(stock_add, BCS.U64), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })  
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('stock_add') as FnCallType,
            arguments:[TXB_OBJECT(txb, service), txb.pure(item), txb.pure(stock_add, BCS.U64), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })        
    }
    return true
}
export function service_reduce_stock(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, 
    item:string, stock_reduce:number, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (!IsValidName(item) || !IsValidUint(stock_reduce)) return false;
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('stock_reduce_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, service), txb.pure(item), txb.pure(stock_reduce, BCS.U64), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('stock_reduce') as FnCallType,
            arguments:[TXB_OBJECT(txb, service), txb.pure(item), txb.pure(stock_reduce, BCS.U64), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })
    }
    return  true
}
export function service_set_payee(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, 
    payee:string, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (!IsValidAddress(payee)) return false;
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('payee_set_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, service), txb.pure(payee, BCS.ADDRESS), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('payee_set') as FnCallType,
            arguments:[TXB_OBJECT(txb, service), txb.pure(payee, BCS.ADDRESS), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })
    }
    return true
}
export function service_repository_add(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, 
    repository:RepositoryObject, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission, repository])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('repository_add_with_passport') as FnCallType,
            arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, repository), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('repository_add') as FnCallType,
            arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, repository), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })
    }
    return true
}
export function service_repository_remove(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    permission:PermissionObject, repository_address?:string[], removeall?:boolean, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (!removeall && !repository_address) return false;
    if (repository_address && !IsValidArray(repository_address, IsValidAddress)) return false;

    if (passport) {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('repository_remove_all_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, service), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('repository_remove_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, service), txb.pure(array_unique(repository_address!), 'vector<address>'), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })                    
        }
    } else {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('repository_remove_all') as FnCallType,
                arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('repository_remove') as FnCallType,
                arguments:[TXB_OBJECT(txb, service), txb.pure(array_unique(repository_address!), 'vector<address>'), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })                       
        }
    }
    return true
}
export type Service_Guard_Percent = {
    guard:GuardObject;
    percent: number;
}
export function service_add_withdraw_guards(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    permission:PermissionObject, guards:Service_Guard_Percent[], passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;
    let bValid = true;
    guards.forEach((v) => {
        if (!IsValidObjects([v.guard])) return false;
        if (!IsValidPercent(v.percent)) return false;
    })
    if (!bValid) return false;

    guards.forEach((guard) => { 
        if (passport) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('withdraw_guard_add_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, service), TXB_OBJECT(txb, guard.guard), txb.pure(guard.percent, BCS.U8), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]            
                })
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('withdraw_guard_add') as FnCallType,
                arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, guard.guard), txb.pure(guard.percent, BCS.U8), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]            
                })
        }
    })
    return true
}
export function service_remove_withdraw_guards(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    permission:PermissionObject, guard_address?:string[], removeall?:boolean, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (!removeall && !guard_address) return false;
    if (guard_address && !IsValidArray(guard_address, IsValidAddress)) return false;

    if (passport) {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('withdraw_guard_remove_all_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, service), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })    
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('withdraw_guard_remove_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, service), txb.pure(array_unique(guard_address!), 'vector<address>'), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })            
        }
    } else {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('withdraw_guard_remove_all') as FnCallType,
                arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })     
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('withdraw_guard_remove') as FnCallType,
                arguments:[TXB_OBJECT(txb, service), txb.pure(array_unique(guard_address!), 'vector<address>'), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })            
        }
    }
    return true
}
export function service_add_refund_guards(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    permission:PermissionObject, guards:Service_Guard_Percent[], passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;
    let bValid = true;
    guards.forEach((v) => {
        if (!IsValidObjects([v.guard])) return false;
        if (!IsValidPercent(v.percent)) return false;
    })
    if (!bValid) return false;

    guards.forEach((guard) => { 
        if (passport) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('refund_guard_add_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, service), TXB_OBJECT(txb, guard.guard), txb.pure(guard.percent, BCS.U8), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]            
            })                
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('refund_guard_add') as FnCallType,
                arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, guard.guard), txb.pure(guard.percent, BCS.U8), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]            
            })
        }
    })
    return true
}
export function service_remove_refund_guards(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    permission:PermissionObject, guard_address?:string[], removeall?:boolean, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (!guard_address && !removeall) return false;
    if (guard_address && !IsValidArray(guard_address, IsValidAddress)) return false;

    if (passport) {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('refund_guard_remove_all_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, service), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('refund_guard_remove_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, service), txb.pure(array_unique(guard_address!), 'vector<address>'), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })
        }
    } else {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('refund_guard_remove_all') as FnCallType,
                arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('refund_guard_remove') as FnCallType,
                arguments:[TXB_OBJECT(txb, service), txb.pure(array_unique(guard_address!), 'vector<address>'), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })
        }
    }
    return true
}
export type Service_Sale = {
    item:string;
    price:number;
    stock:number;
}

export function service_add_sale(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    permission:PermissionObject, sales:Service_Sale[], passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;
    let bValid = true;
    sales.forEach((v) => {
        if (!IsValidName(v.item)) bValid = false;
        if (!IsValidInt(v.price)) bValid = false;
        if (!IsValidInt(v.stock)) bValid = false;
    })
    if (!bValid) return false;

    if (passport) {
        sales.forEach((sale) => txb.moveCall({
            target:PROTOCOL.ServiceFn('sales_add_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, service), txb.pure(sale.item), txb.pure(sale.price, BCS.U64), txb.pure(sale.stock, BCS.U64), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        }))
    } else {
        sales.forEach((sale) => txb.moveCall({
            target:PROTOCOL.ServiceFn('sales_add') as FnCallType,
            arguments:[TXB_OBJECT(txb, service), txb.pure(sale.item), txb.pure(sale.price, BCS.U64), txb.pure(sale.stock, BCS.U64), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        }))
    }
    return true
}
export function service_remove_sales(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    permission:PermissionObject, sales?:string[], removeall?:boolean, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (!removeall && !sales) return false;
    if (sales && !IsValidArray(sales, IsValidName)) return false;
    
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('sales_remove_all_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, service), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })    
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('sales_remove_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, service), txb.pure(BCS_CONVERT.ser_vector_string(array_unique(sales!))), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })            
        }
    } else {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('sales_remove_all') as FnCallType,
                arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })      
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('sales_remove') as FnCallType,
                arguments:[TXB_OBJECT(txb, service), txb.pure(BCS_CONVERT.ser_vector_string(array_unique(sales!))), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })            
        }
    }
    return true
}

export enum Service_Discount_Type {
    ratio = 0, // -off%
    minus = 1, // -off
}
export type Service_Discount = {
    name: string; // not empty
    type: Service_Discount_Type;
    off: number;
    duration_minutes: number;
    time_start?: number; // current time if undefined
    price_greater?: number;
}
const MAX_DISCOUNT_COUNT_ONCE = 200;
const MAX_DISCOUNT_RECEIVER_COUNT = 200;

export type DicountDispatch = {
    receiver: string;
    count: number;
    discount: Service_Discount;
}

export function service_discount_transfer(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    permission:PermissionObject, discount_dispatch:DicountDispatch[], passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (!discount_dispatch || discount_dispatch.length > MAX_DISCOUNT_RECEIVER_COUNT) return false;

    let bValid = true;
    discount_dispatch.forEach((v) => {
        if (!IsValidAddress(v.receiver)) bValid = false;
        if (!IsValidUint(v.count) || v.count > MAX_DISCOUNT_COUNT_ONCE) return false;
        if (!IsValidName_AllowEmpty(v.discount.name)) return false;
        if (v.discount.type == Service_Discount_Type.ratio && !IsValidPercent(v.discount.off)) return false;
        if (!IsValidUint(v.discount.duration_minutes)) return false;
        if (v.discount?.time_start && !IsValidUint(v.discount.time_start)) return false;
        if (v.discount?.price_greater && !IsValidInt(v.discount.price_greater)) return false;
    })
    if (!bValid) return false;

    discount_dispatch.forEach((discount) => {
        let price_greater = discount.discount?.price_greater ? 
            txb.pure(BCS_CONVERT.ser_option_u64(discount.discount.price_greater)) : OptionNone(txb);
        let time_start = discount.discount?.time_start ? 
            txb.pure(BCS_CONVERT.ser_option_u64(discount.discount.time_start)) : OptionNone(txb);

        if (passport) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('dicscount_create_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, service), txb.pure(discount.discount.name), txb.pure(discount.discount.type, BCS.U8), txb.pure(discount.discount.off, BCS.U64), price_greater,
                    time_start, txb.pure(discount.discount.duration_minutes, BCS.U64), txb.pure(discount.count, BCS.U64), TXB_OBJECT(txb, permission), txb.pure(discount.receiver, BCS.ADDRESS), txb.object(CLOCK_OBJECT)],
                typeArguments:[pay_type]
            });
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('dicscount_create') as FnCallType,
                arguments:[TXB_OBJECT(txb, service), txb.pure(discount.discount.name), txb.pure(discount.discount.type, BCS.U8), txb.pure(discount.discount.off, BCS.U64), price_greater,
                    time_start, txb.pure(discount.discount.duration_minutes, BCS.U64), txb.pure(discount.count, BCS.U64), TXB_OBJECT(txb, permission), txb.pure(discount.receiver, BCS.ADDRESS), txb.object(CLOCK_OBJECT)],
                typeArguments:[pay_type]
            })
        }
    });
    return true;
}

// 同时支持withdraw guard和permission guard
export function service_withdraw(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    permission:PermissionObject, order:OrderObject, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission, order])) return false;
    if (!IsValidArgType(pay_type)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('withdraw_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, service), TXB_OBJECT(txb, order), passport, TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })        
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('withdraw') as FnCallType,
            arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, order), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })               
    }
    return true
}
export function service_set_buy_guard(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    permission:PermissionObject, guard?:GuardObject, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;

    if (passport) {
        if (guard) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('buy_guard_set_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, service), TXB_OBJECT(txb, guard), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })        
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('buy_guard_none_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, service), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })   
        }
    } else {
        if (guard) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('buy_guard_set') as FnCallType,
                arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, guard), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })        
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('buy_guard_none') as FnCallType,
                arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })   
        }
    }
    return true
}
export function service_set_machine(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    permission:PermissionObject, machine?:MachineObject, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;

    if (passport) {
        if (machine) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('machine_set_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, service), TXB_OBJECT(txb, machine), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })        
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('machine_none_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, service), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })   
        }
    } else {
        if (machine) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('machine_set') as FnCallType,
                arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, machine), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })        
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('machine_none') as FnCallType,
                arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, permission)],
                typeArguments:[pay_type]
            })   
        }
    }
    return true
}

export function service_set_endpoint(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    permission:PermissionObject, endpoint?:string, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (endpoint && !IsValidEndpoint(endpoint)) return false;
    let ep = endpoint? txb.pure(BCS_CONVERT.ser_option_string(endpoint)) : OptionNone(txb);

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('endpoint_set_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, service), ep, TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })      
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('endpoint_set') as FnCallType,
            arguments:[TXB_OBJECT(txb, service), ep, TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })      
    }   
    return true
}
export function service_publish(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    permission:PermissionObject, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('publish_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, service), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })   
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('publish') as FnCallType,
            arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })   
    }      
    return true
}
export function service_clone(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    permission:PermissionObject, passport?:PassportObject) : ServiceObject | boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.ServiceFn('clone_withpassport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, service), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })    
    } else {
        return txb.moveCall({
            target:PROTOCOL.ServiceFn('clone') as FnCallType,
            arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })    
    }  
    return true   
}

export type Service_Buy_RequiredInfo = {
    service_pubkey: string;
    customer_info: string[];
}
export type Customer_RequiredInfo = {
    service_pubkey: string;
    customer_pubkey: string;
    customer_info_crypt: string[];
}
export enum BuyRequiredEnum {
    address = 'address',
    phone = 'phone',
    name = 'name',
    postcode = 'postcode'
}

export function service_set_customer_required(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject,
    service_pubkey:string, customer_required: BuyRequiredEnum[], passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (!service_pubkey || !customer_required) return false;
    
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('required_set_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, service), txb.pure(BCS_CONVERT.ser_vector_vector_u8(array_unique(customer_required))), txb.pure(service_pubkey, 'vector<u8>'), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })         
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('required_set') as FnCallType,
            arguments:[TXB_OBJECT(txb, service), txb.pure(BCS_CONVERT.ser_vector_vector_u8(array_unique(customer_required))), txb.pure(service_pubkey, 'vector<u8>'), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })         
    }
    return true
}
export function service_remove_customer_required(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    permission:PermissionObject, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('required_none_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, service), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
         })  
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('required_none') as FnCallType,
            arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
         })  
    }       
    return true
}
export function service_change_required_pubkey(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    permission:PermissionObject, service_pubkey:string, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (!service_pubkey) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('required_pubkey_set_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, service), txb.pure(service_pubkey, 'vector<u8>'), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })    
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('required_pubkey_set') as FnCallType,
            arguments:[TXB_OBJECT(txb, service), txb.pure(service_pubkey, 'vector<u8>'), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })    
    }     
    return true
}
export function service_change_order_required_pubkey(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    permission:PermissionObject, order:OrderObject, service_pubkey:string, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission, order])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (!service_pubkey) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('order_pubkey_update_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, service), TXB_OBJECT(txb, order), txb.pure(service_pubkey, 'vector<u8>'), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })   
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('order_pubkey_update') as FnCallType,
            arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, order), txb.pure(service_pubkey, 'vector<u8>'), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
        })   
    }    
    return true  
}
export function service_pause(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, 
    pause:boolean, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, permission])) return false;
    if (!IsValidArgType(pay_type)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('pause_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, service), txb.pure(pause, BCS.BOOL), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
         })     
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('pause') as FnCallType,
            arguments:[TXB_OBJECT(txb, service), txb.pure(pause, BCS.BOOL), TXB_OBJECT(txb, permission)],
            typeArguments:[pay_type]
         })     
    }    
    return true
}
export function customer_refund(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    order:OrderObject, passport?:PassportObject) : boolean {
    if (!IsValidObjects([service, order])) return false;
    if (!IsValidArgType(pay_type)) return false;

    if (passport) {
        txb.moveCall({
        target:PROTOCOL.ServiceFn('refund_with_passport') as FnCallType,
        arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, order), passport],
        typeArguments:[pay_type]
        })               
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('refund') as FnCallType,
            arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, order)],
            typeArguments:[pay_type]
        })            
    }
    return true
}
export type Service_Buy = {
    item: string;
    count: number;
}

export function update_order_required_info(pay_type:string, txb:TransactionBlock, service:ServiceObject,
    order:OrderObject, customer_info_crypto: Customer_RequiredInfo) : boolean {
    if (!IsValidObjects([service, order])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (!customer_info_crypto.service_pubkey || !customer_info_crypto.customer_info_crypt) return false;

    txb.moveCall({
        target:PROTOCOL.ServiceFn('order_required_info_update') as FnCallType,
        arguments:[TXB_OBJECT(txb, service), TXB_OBJECT(txb, order), 
            txb.pure(customer_info_crypto.service_pubkey, 'vector<u8>'), 
            txb.pure(customer_info_crypto.customer_pubkey, 'vector<u8>'), 
            txb.pure(BCS_CONVERT.ser_vector_vector_u8(array_unique(customer_info_crypto.customer_info_crypt)))],
        typeArguments:[pay_type]
    })    
    return true
}
export function buy(pay_type:string, txb:TransactionBlock, service:ServiceObject, buy_items:Service_Buy[], coin:CoinObject, discount?:DiscountObject, 
    service_machine?:MachineObject, customer_info_crypto?: Customer_RequiredInfo, passport?:PassportObject) : OrderAddress | boolean {
    if (!IsValidObjects([service])) return false;
    if (!IsValidArgType(pay_type)) return false;
    if (!buy_items) return false;

    let bValid = true;
    buy_items.forEach((v) => {
        if (!IsValidName(v.item)) bValid = false;
        if (!IsValidUint(v.count)) bValid = false;
    })
    if (!bValid) return false;

    let i:string[] = []; let c:number[] = [];    let order;
    buy_items.forEach((item) => { i.push(item.item); c.push(item.count); })

    if (passport) {
        if (discount) {
            order = txb.moveCall({
                target:PROTOCOL.ServiceFn('dicount_buy_with_passport') as FnCallType,
                arguments: [passport, TXB_OBJECT(txb, service), txb.pure(BCS_CONVERT.ser_vector_string(i)), 
                    txb.pure(BCS_CONVERT.ser_vector_u64(c)), TXB_OBJECT(txb, coin), TXB_OBJECT(txb, discount), txb.object(CLOCK_OBJECT)],                   
                typeArguments:[pay_type]            
        })} else {
            order = txb.moveCall({
                target:PROTOCOL.ServiceFn('buy_with_passport') as FnCallType,
                arguments: [passport, TXB_OBJECT(txb, service), txb.pure(BCS_CONVERT.ser_vector_string(i)), 
                    txb.pure(BCS_CONVERT.ser_vector_u64(c)), TXB_OBJECT(txb, coin)],
                typeArguments:[pay_type]            
        })}             
    } else {
        if (discount) {
            order = txb.moveCall({
                target:PROTOCOL.ServiceFn('disoucnt_buy') as FnCallType,
                arguments: [TXB_OBJECT(txb, service), txb.pure(BCS_CONVERT.ser_vector_string(i)), 
                    txb.pure(BCS_CONVERT.ser_vector_u64(c)), TXB_OBJECT(txb, coin), TXB_OBJECT(txb, discount), txb.object(CLOCK_OBJECT)],                
                typeArguments:[pay_type]            
        })} else {
            order = txb.moveCall({
                target:PROTOCOL.ServiceFn('buy') as FnCallType,
                arguments: [TXB_OBJECT(txb, service), txb.pure(BCS_CONVERT.ser_vector_string(i)), 
                    txb.pure(BCS_CONVERT.ser_vector_u64(c)), TXB_OBJECT(txb, coin)],
                typeArguments:[pay_type]            
        })}           
    }

    if (customer_info_crypto) {
        update_order_required_info(pay_type, txb, service, order, customer_info_crypto);
    }

    if (service_machine) {
        return txb.moveCall({
            target:PROTOCOL.ServiceFn('order_create_with_machine') as FnCallType,
            arguments: [TXB_OBJECT(txb, service), TXB_OBJECT(txb, order), TXB_OBJECT(txb, service_machine)],
            typeArguments:[pay_type]            
        })        
    } else {
        return txb.moveCall({
            target:PROTOCOL.ServiceFn('order_create') as FnCallType,
            arguments: [TXB_OBJECT(txb, service), TXB_OBJECT(txb, order)],
            typeArguments:[pay_type]            
        })  
    }
}

export function order_bind_service_machine(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    order:OrderObject, service_machine:MachineObject) : boolean {
    if (!IsValidObjects([service, order, service_machine])) return false;
    if (!IsValidArgType(pay_type)) return false;
    
    txb.moveCall({
        target:PROTOCOL.ServiceFn('order_create_with_machine') as FnCallType,
        arguments: [TXB_OBJECT(txb, service), TXB_OBJECT(txb, order), TXB_OBJECT(txb, service_machine)],
        typeArguments:[pay_type]            
    })    
    return true
}

export function change_permission(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    old_permission:PermissionObject, new_permission:PermissionObject) : boolean {
    if (!IsValidObjects([service, old_permission, new_permission])) return false;
    if (!IsValidArgType(pay_type)) return false;

    txb.moveCall({
        target:PROTOCOL.ServiceFn('permission_set') as FnCallType,
        arguments: [TXB_OBJECT(txb, service), TXB_OBJECT(txb, old_permission), TXB_OBJECT(txb, new_permission)],
        typeArguments:[pay_type]            
    })    
    return true
}
