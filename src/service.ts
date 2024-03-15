import { SuiObjectChange } from '@mysten/sui.js/client';
import { TransactionBlock, Inputs, type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS } from '@mysten/bcs';
import { CLOCK_OBJECT, FnCallType, GuardObject, description_data, PROTOCOL, MAX_ENDPOINT_LENGTH, name_data} from './protocol';
import { BCS_CONVERT } from './util';
import { PassportObject} from './passport'
import { PermissionObject } from './permission'
import { RepositoryObject } from './repository';
import { MachineObject } from './machine';

export type ServiceObject = TransactionResult;
export type ServiceAddress = TransactionResult;

export function service(pay_type:string, txb:TransactionBlock, permission:PermissionObject, description:string, 
    payee_address:string, endpoint_url?:string, passport?:PassportObject) : ServiceObject | undefined {
        if (endpoint_url && endpoint_url.length > MAX_ENDPOINT_LENGTH) return undefined;
        let endpoint = endpoint_url? txb.pure(BCS_CONVERT.ser_option_string(endpoint_url)) : txb.pure([], BCS.U8);
    
    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.ServiceFn('new_with_passport') as FnCallType,
            arguments:[passport, txb.pure(description_data(description)), txb.pure(payee_address, BCS.ADDRESS), endpoint, permission],
            typeArguments:[pay_type],
        })
    } else {
        return txb.moveCall({
            target:PROTOCOL.ServiceFn('new') as FnCallType,
            arguments:[txb.pure(description_data(description)), txb.pure(payee_address, BCS.ADDRESS), endpoint, permission],
            typeArguments:[pay_type],
        })
    }
}

export function launch(pay_type:string, txb:TransactionBlock, service:ServiceObject) : ServiceAddress {
    return txb.moveCall({
        target:PROTOCOL.ServiceFn('create') as FnCallType,
        arguments:[service],
        typeArguments:[pay_type]
    })
}
export function destroy(pay_type:string, txb:TransactionBlock, service:ServiceObject) {
    return txb.moveCall({
        target:PROTOCOL.ServiceFn('destroy') as FnCallType,
        arguments: [service],
        typeArguments:[pay_type]
    })   
}
export function service_set_description(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, description:string, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('description_set_with_passport') as FnCallType,
            arguments:[passport, service, txb.pure(description_data(description)), permission],
            typeArguments:[pay_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('description_set') as FnCallType,
            arguments:[service, txb.pure(description_data(description)), permission],
            typeArguments:[pay_type]
        })
    }
}
export function service_set_price(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, item:string, price:number, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('price_set_with_passport') as FnCallType,
            arguments:[passport, service, txb.pure(item), txb.pure(price, BCS.U64), permission],
            typeArguments:[pay_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('price_set') as FnCallType,
            arguments:[service, txb.pure(item), txb.pure(price, BCS.U64), permission],
            typeArguments:[pay_type]
        })
    }
}
export function service_set_stock(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, item:string, stock:number, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('stock_set_with_passport') as FnCallType,
            arguments:[passport, service, txb.pure(item), txb.pure(stock, BCS.U64), permission],
            typeArguments:[pay_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('stock_set') as FnCallType,
            arguments:[service, txb.pure(item), txb.pure(stock, BCS.U64), permission],
            typeArguments:[pay_type]
        })
    }
}
export function service_add_stock(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, item:string, stock_add:number, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('stock_add_with_passport') as FnCallType,
            arguments:[passport, service, txb.pure(item), txb.pure(stock_add, BCS.U64), permission],
            typeArguments:[pay_type]
        })  
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('stock_add') as FnCallType,
            arguments:[service, txb.pure(item), txb.pure(stock_add, BCS.U64), permission],
            typeArguments:[pay_type]
        })        
    }
}
export function service_reduce_stock(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, item:string, stock_reduce:number, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('stock_reduce_with_passport') as FnCallType,
            arguments:[passport, service, txb.pure(item), txb.pure(stock_reduce, BCS.U64), permission],
            typeArguments:[pay_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('stock_reduce') as FnCallType,
            arguments:[service, txb.pure(item), txb.pure(stock_reduce, BCS.U64), permission],
            typeArguments:[pay_type]
        })
    }
}
export function service_set_payee(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, payee:string, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('payee_set_with_passport') as FnCallType,
            arguments:[passport, service, txb.pure(payee, BCS.ADDRESS), permission],
            typeArguments:[pay_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('payee_set') as FnCallType,
            arguments:[service, txb.pure(payee, BCS.ADDRESS), permission],
            typeArguments:[pay_type]
        })
    }
}
export function service_repository_add(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, repository:RepositoryObject, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('repository_add_with_passport') as FnCallType,
            arguments:[service, repository, permission],
            typeArguments:[pay_type]
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('repository_add') as FnCallType,
            arguments:[service, repository, permission],
            typeArguments:[pay_type]
        })
    }
}
export function service_repository_remove(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, repository_address:string[], removeall?:boolean, passport?:PassportObject) {
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('repository_remove_all_with_passport') as FnCallType,
                arguments:[passport, service, permission],
                typeArguments:[pay_type]
            })
        } else {
            repository_address.forEach((rep_addr) => {
                txb.moveCall({
                    target:PROTOCOL.ServiceFn('repository_remove_with_passport') as FnCallType,
                    arguments:[passport, service, txb.pure(rep_addr, BCS.ADDRESS), permission],
                    typeArguments:[pay_type]
                })           
            })
        }
    } else {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('repository_remove_all') as FnCallType,
                arguments:[service, permission],
                typeArguments:[pay_type]
            })
        } else {
            repository_address.forEach((rep_addr) => {
                txb.moveCall({
                    target:PROTOCOL.ServiceFn('repository_remove') as FnCallType,
                    arguments:[service, txb.pure(rep_addr, BCS.ADDRESS), permission],
                    typeArguments:[pay_type]
                })           
            })
        }
    }
}
export type Service_Guard_Percent = {
    guard:GuardObject | string;
    percent: number;
}
export function service_add_withdraw_guards(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, guards:Service_Guard_Percent[], passport?:PassportObject) {
    guards.forEach((guard) => { 
        let arg: string | TransactionResult = guard.guard; 
        if (typeof arg == "string") {
            arg = txb.object(guard.guard) as TransactionResult 
        }

        if (passport) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('withdraw_guard_add_with_passport') as FnCallType,
                arguments:[passport, service, arg, txb.pure(guard.percent, BCS.U8), permission],
                typeArguments:[pay_type]            
                })
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('withdraw_guard_add') as FnCallType,
                arguments:[service, arg, txb.pure(guard.percent, BCS.U8), permission],
                typeArguments:[pay_type]            
                })
        }
    })
}
export function service_remove_withdraw_guards(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, guard_address:string[], passport?:PassportObject) {
    guard_address.forEach((guard) => { 
        if (passport) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('withdraw_guard_remove_with_passport') as FnCallType,
                arguments:[passport, service, txb.pure(guard, BCS.ADDRESS), permission],
                typeArguments:[pay_type]
                })
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('withdraw_guard_remove') as FnCallType,
                arguments:[service, txb.pure(guard, BCS.ADDRESS), permission],
                typeArguments:[pay_type]
            })
        }
    })
}
export function service_add_refund_guards(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, guards:Service_Guard_Percent[], passport?:PassportObject) {
    guards.forEach((guard) => { 
        let arg: string | TransactionResult = guard.guard; 
        if (typeof arg == "string") {
            arg = txb.object(guard.guard) as TransactionResult 
        }
        if (passport) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('refund_guard_add_with_passport') as FnCallType,
                arguments:[passport, service, arg, txb.pure(guard.percent, BCS.U8), permission],
                typeArguments:[pay_type]            
            })                
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('refund_guard_add') as FnCallType,
                arguments:[service, arg, txb.pure(guard.percent, BCS.U8), permission],
                typeArguments:[pay_type]            
            })
        }
    })
}
export function service_remove_refund_guards(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, guard_address:string[]) {
    guard_address.forEach((guard) => { 
            txb.moveCall({
            target:PROTOCOL.ServiceFn('refund_guard_remove') as FnCallType,
            arguments:[service, txb.pure(guard, BCS.ADDRESS), permission],
            typeArguments:[pay_type]
        })
    })
}
export type Service_Sale = {
    item:string;
    price:number;
    stock:number;
}

export function service_add_sale(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, sales:Service_Sale[], passport?:PassportObject) {
    if (passport) {
        sales.forEach((sale) => txb.moveCall({
            target:PROTOCOL.ServiceFn('sales_add_with_passport') as FnCallType,
            arguments:[passport, service, txb.pure(description_data(sale.item)), txb.pure(sale.price, BCS.U64), txb.pure(sale.stock, BCS.U64), permission],
            typeArguments:[pay_type]
        }))
    } else {
        sales.forEach((sale) => txb.moveCall({
            target:PROTOCOL.ServiceFn('sales_add') as FnCallType,
            arguments:[service, txb.pure(description_data(sale.item)), txb.pure(sale.price, BCS.U64), txb.pure(sale.stock, BCS.U64), permission],
            typeArguments:[pay_type]
        }))
    }
}
export function service_remove_sale(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, sales:string[], passport?:PassportObject) {
    if (passport) {
        sales.forEach((sale) => txb.moveCall({
            target:PROTOCOL.ServiceFn('sales_remove_with_passport') as FnCallType,
            arguments:[passport, service, txb.pure(description_data(sale)), permission],
            typeArguments:[pay_type]
        }))
    } else {
        sales.forEach((sale) => txb.moveCall({
            target:PROTOCOL.ServiceFn('sales_remove') as FnCallType,
            arguments:[service, txb.pure(description_data(sale)), permission],
            typeArguments:[pay_type]
        }))
    }
}

export enum Service_Discount_Type {
    ratio = 0, // -off%
    minus = 1, // -off
}
export type Service_Discount = {
    name: string;
    type: Service_Discount_Type;
    off: number;
    duration_minutes: number;
    time_start?: number; // current time if undefined
    price_greater?: number;
}
const MAX_DISCOUNT_TRANSFER_COUNT = 200;
const MAX_DISCOUNT_RECEIVER_COUNT = 100;

export type DicountDispatch = {
    receiver: string;
    count: number;
    discount: Service_Discount;
}
export const MAX_DISCOUNT_COUNT_ONCE = 100;

export function service_discount_transfer(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, discount_dispatch:DicountDispatch[], passport?:PassportObject) {
    if (discount_dispatch.length > MAX_DISCOUNT_RECEIVER_COUNT) return undefined;

    for (let i = 0; i < discount_dispatch.length; i ++ ) {
        if (discount_dispatch[i].count > MAX_DISCOUNT_TRANSFER_COUNT) {
            return undefined
        }
        if (discount_dispatch[i].discount.type == Service_Discount_Type.ratio) {
            if (discount_dispatch[i].discount.off > 100) return undefined;
        }        
    }

    discount_dispatch.forEach((discount) => {
        if (discount.discount.duration_minutes == 0) return;
        if (discount.count > MAX_DISCOUNT_COUNT_ONCE || discount.count == 0) return;

        let price_greater = txb.pure([], BCS.U8);
        if (discount.discount?.price_greater) {
            price_greater = txb.pure(BCS_CONVERT.ser_option_u64(discount.discount.price_greater));
        }
        let time_start = txb.pure([], BCS.U8);
        if (discount.discount.time_start) {
            time_start = txb.pure(BCS_CONVERT.ser_option_u64(discount.discount.time_start));
        }

        if (passport) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('dicscount_create_with_passport') as FnCallType,
                arguments:[passport, service, txb.pure(name_data(discount.discount.name)), txb.pure(discount.discount.type, BCS.U8), txb.pure(discount.discount.off, BCS.U64), price_greater,
                    time_start, txb.pure(discount.discount.duration_minutes, BCS.U64), txb.pure(discount.count, BCS.U64), permission, txb.pure(discount.receiver, BCS.ADDRESS), txb.object(CLOCK_OBJECT)],
                typeArguments:[pay_type]
            });
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('dicscount_create') as FnCallType,
                arguments:[service, txb.pure(name_data(discount.discount.name)), txb.pure(discount.discount.type, BCS.U8), txb.pure(discount.discount.off, BCS.U64), price_greater,
                    time_start, txb.pure(discount.discount.duration_minutes, BCS.U64), txb.pure(discount.count, BCS.U64), permission, txb.pure(discount.receiver, BCS.ADDRESS), txb.object(CLOCK_OBJECT)],
                typeArguments:[pay_type]
            })
        }
    });
}
export type OrderObject = TransactionResult;
export type OrderAddress = TransactionResult;

// 同时支持withdraw guard和permission guard
export function service_withdraw(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, order:OrderObject, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('withdraw_with_passport') as FnCallType,
            arguments:[passport, service, order, passport, permission],
            typeArguments:[pay_type]
        })        
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('withdraw') as FnCallType,
            arguments:[service, order, permission],
            typeArguments:[pay_type]
        })               
    }
}
export function service_set_buy_guard(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, guard?:GuardObject, passport?:PassportObject) {
    if (passport) {
        if (guard) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('buy_guard_set_with_passport') as FnCallType,
                arguments:[passport, service, guard, permission],
                typeArguments:[pay_type]
            })        
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('buy_guard_none_with_passport') as FnCallType,
                arguments:[passport, service, permission],
                typeArguments:[pay_type]
            })   
        }
    } else {
        if (guard) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('buy_guard_set') as FnCallType,
                arguments:[service, guard, permission],
                typeArguments:[pay_type]
            })        
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('buy_guard_none') as FnCallType,
                arguments:[service, permission],
                typeArguments:[pay_type]
            })   
        }
    }
}
export function service_set_machine(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, machine?:MachineObject, passport?:PassportObject) {
    if (passport) {
        if (machine) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('machine_set_with_passport') as FnCallType,
                arguments:[passport, service, machine, permission],
                typeArguments:[pay_type]
            })        
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('machine_none_with_passport') as FnCallType,
                arguments:[passport, service, permission],
                typeArguments:[pay_type]
            })   
        }
    } else {
        if (machine) {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('machine_set') as FnCallType,
                arguments:[service, machine, permission],
                typeArguments:[pay_type]
            })        
        } else {
            txb.moveCall({
                target:PROTOCOL.ServiceFn('machine_none') as FnCallType,
                arguments:[service, permission],
                typeArguments:[pay_type]
            })   
        }
    }
}

export function service_set_endpoint(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, endpoint_url?:string, passport?:PassportObject) {
    if (endpoint_url && endpoint_url.length > MAX_ENDPOINT_LENGTH) return undefined;
    let endpoint = endpoint_url ? txb.pure(endpoint_url) : txb.pure([], BCS.U8);
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('endpoint_set_with_passport') as FnCallType,
            arguments:[passport, service, endpoint, permission],
            typeArguments:[pay_type]
        })      
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('endpoint_set') as FnCallType,
            arguments:[service, endpoint, permission],
            typeArguments:[pay_type]
        })      
    }   
}
export function service_publish(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('publish_with_passport') as FnCallType,
            arguments:[passport, service, permission],
            typeArguments:[pay_type]
        })   
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('publish') as FnCallType,
            arguments:[service, permission],
            typeArguments:[pay_type]
        })   
    }      
}
export function service_clone(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, passport?:PassportObject) : ServiceObject{
    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.ServiceFn('clone_withpassport') as FnCallType,
            arguments:[passport, service, permission],
            typeArguments:[pay_type]
        })    
    } else {
        return txb.moveCall({
            target:PROTOCOL.ServiceFn('clone') as FnCallType,
            arguments:[service, permission],
            typeArguments:[pay_type]
        })    
    }     
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

export function service_set_customer_required(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject,
    service_pubkey:string, customer_required: string[], passport?:PassportObject) {
    if (service_pubkey.length == 0 || customer_required.length == 0) return undefined;
    
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('required_set_with_passport') as FnCallType,
            arguments:[passport, service, txb.pure(customer_required, 'vector<string>'), txb.pure(service_pubkey, 'vector<u8>'), permission],
            typeArguments:[pay_type]
        })         
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('required_set') as FnCallType,
            arguments:[service, txb.pure(customer_required, 'vector<string>'), txb.pure(service_pubkey, 'vector<u8>'), permission],
            typeArguments:[pay_type]
        })         
    }
}
export function service_remove_customer_required(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('required_none_with_passport') as FnCallType,
            arguments:[passport, service, permission],
            typeArguments:[pay_type]
         })  
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('required_none') as FnCallType,
            arguments:[service, permission],
            typeArguments:[pay_type]
         })  
    }       
}
export function service_change_required_pubkey(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, service_pubkey:string, passport?:PassportObject) {
    if (!service_pubkey) return undefined;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('required_pubkey_set_with_passport') as FnCallType,
            arguments:[passport, service, txb.pure(service_pubkey, 'vector<u8>'), permission],
            typeArguments:[pay_type]
        })    
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('required_pubkey_set') as FnCallType,
            arguments:[service, txb.pure(service_pubkey, 'vector<u8>'), permission],
            typeArguments:[pay_type]
        })    
    }     
}
export function service_change_order_required_pubkey(pay_type:string, txb:TransactionBlock, service:ServiceObject, 
    permission:PermissionObject, order:OrderObject, service_pubkey:string, passport?:PassportObject) {
    if (!service_pubkey) return undefined;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('order_pubkey_update_with_passport') as FnCallType,
            arguments:[passport, service, order, txb.pure(service_pubkey, 'vector<u8>'), permission],
            typeArguments:[pay_type]
        })   
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('order_pubkey_update') as FnCallType,
            arguments:[service, order, txb.pure(service_pubkey, 'vector<u8>'), permission],
            typeArguments:[pay_type]
        })   
    }      
}
export function service_pause(pay_type:string, txb:TransactionBlock, service:ServiceObject, permission:PermissionObject, pause:boolean, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('pause_with_passport') as FnCallType,
            arguments:[passport, service, txb.pure(pause, BCS.BOOL), permission],
            typeArguments:[pay_type]
         })     
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('pause') as FnCallType,
            arguments:[service, txb.pure(pause, BCS.BOOL), permission],
            typeArguments:[pay_type]
         })     
    }    
}
export function customer_refund(pay_type:string, txb:TransactionBlock, service:ServiceObject, order:OrderObject, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
        target:PROTOCOL.ServiceFn('refund_with_passport') as FnCallType,
        arguments:[service, order, passport],
        typeArguments:[pay_type]
        })               
    } else {
        txb.moveCall({
            target:PROTOCOL.ServiceFn('refund') as FnCallType,
            arguments:[service, order],
            typeArguments:[pay_type]
        })            
    }
}
export type Service_Buy = {
    item: string;
    count: number;
}
export type DiscountObject = TransactionResult;
export type CoinObject = TransactionResult;

export function update_order_required_info(pay_type:string, txb:TransactionBlock, service:ServiceObject,
    order:OrderObject, customer_info_crypto: Customer_RequiredInfo) {
    txb.moveCall({
        target:PROTOCOL.ServiceFn('order_required_info_update') as FnCallType,
        arguments:[service, order, txb.pure(customer_info_crypto.service_pubkey, 'vector<u8>'), 
            txb.pure(customer_info_crypto.customer_pubkey, 'vector<u8>'), 
            txb.pure(customer_info_crypto.customer_info_crypt, 'vector<string>')],
        typeArguments:[pay_type]
        })    
}
export function buy(pay_type:string, txb:TransactionBlock, service:ServiceObject, buy_items:Service_Buy[], coin:CoinObject, discount?:DiscountObject, 
    service_machine?:MachineObject, customer_info_crypto?: Customer_RequiredInfo, passport?:PassportObject) : OrderAddress | undefined {
    if (buy_items.length == 0) return undefined;

    let i:string[] = []; let c:number[] = [];    let order;
    buy_items.forEach((item) => { i.push(item.item); c.push(item.count); })

    if (passport) {
        if (discount) {
            order = txb.moveCall({
                target:PROTOCOL.ServiceFn('dicount_buy_with_passport') as FnCallType,
                arguments: [passport, service, txb.pure(BCS_CONVERT.ser_vector_string(i)), 
                    txb.pure(BCS_CONVERT.ser_vector_u64(c)), coin, discount, txb.object(CLOCK_OBJECT)],                   typeArguments:[pay_type]            
        })} else {
            order = txb.moveCall({
                target:PROTOCOL.ServiceFn('buy_with_passport') as FnCallType,
                arguments: [passport, service, txb.pure(BCS_CONVERT.ser_vector_string(i)), 
                    txb.pure(BCS_CONVERT.ser_vector_u64(c)), coin],
                typeArguments:[pay_type]            
        })}             
    } else {
        if (discount) {
            order = txb.moveCall({
                target:PROTOCOL.ServiceFn('disoucnt_buy') as FnCallType,
                arguments: [service, txb.pure(BCS_CONVERT.ser_vector_string(i)), 
                    txb.pure(BCS_CONVERT.ser_vector_u64(c)), coin, discount, txb.object(CLOCK_OBJECT)],                
                typeArguments:[pay_type]            
        })} else {
            order = txb.moveCall({
                target:PROTOCOL.ServiceFn('buy') as FnCallType,
                arguments: [service, txb.pure(BCS_CONVERT.ser_vector_string(i)), 
                    txb.pure(BCS_CONVERT.ser_vector_u64(c)), coin],
                typeArguments:[pay_type]            
        })}           
    }

    if (customer_info_crypto) {
        update_order_required_info(pay_type, txb, service, order, customer_info_crypto);
    }

    if (service_machine) {
        return txb.moveCall({
            target:PROTOCOL.ServiceFn('order_create_with_machine') as FnCallType,
            arguments: [service, order, service_machine],
            typeArguments:[pay_type]            
        })        
    } else {
        return txb.moveCall({
            target:PROTOCOL.ServiceFn('order_create') as FnCallType,
            arguments: [service, order],
            typeArguments:[pay_type]            
        })  
    }
}

export function order_bind_service_machine(pay_type:string, txb:TransactionBlock, service:ServiceObject, order:OrderObject, service_machine:MachineObject) {
    txb.moveCall({
        target:PROTOCOL.ServiceFn('order_create_with_machine') as FnCallType,
        arguments: [service, order, service_machine],
        typeArguments:[pay_type]            
    })    
}

export function change_permission(pay_type:string, txb:TransactionBlock, service:ServiceObject, old_permission:PermissionObject, new_permission:PermissionObject) {
    txb.moveCall({
        target:PROTOCOL.ServiceFn('permission_set') as FnCallType,
        arguments: [service, old_permission, new_permission],
        typeArguments:[pay_type]            
    })    
}
