import { bcs, BCS, toHEX, fromHEX, getSuiMoveConfig } from '@mysten/bcs';
import { IsValidArray, IsValidPercent, IsValidName_AllowEmpty, Bcs, array_unique, IsValidArgType, IsValidDesription, 
    IsValidAddress, IsValidEndpoint, OptionNone, IsValidUint, IsValidInt, IsValidName, } from './utils'
import { FnCallType, GuardObject, PassportObject, PermissionObject, RepositoryObject, MachineObject, ServiceAddress, 
    ServiceObject, DiscountObject, OrderObject, OrderAddress, CoinObject, Protocol, 
    TxbObject} from './protocol';
import { ERROR, Errors } from './exception';

export type Service_Guard_Percent = {
    guard:GuardObject;
    percent: number;
}
export type Service_Sale = {
    item:string;
    price:number;
    stock:number;
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

export type Service_Buy_RequiredInfo = {
    pubkey: string;
    customer_info: string[];
}
export type Customer_RequiredInfo = {
    pubkey: string;
    customer_pubkey: string;
    customer_info_crypt: string[];
}
export enum BuyRequiredEnum {
    address = 'address',
    phone = 'phone',
    name = 'name',
    postcode = 'postcode'
}
export type Service_Buy = {
    item: string;
    max_price: number;
    count: number;
}

export type DicountDispatch = {
    receiver: string;
    count: number;
    discount: Service_Discount;
}

export class Service {
    protected pay_token_type;
    protected permission;
    protected object : TxbObject;
    protected protocol;

    get_pay_type() {  return this.pay_token_type }
    get_object() { return this.object }
    private constructor(protocol: Protocol, pay_token_type:string, permission:PermissionObject) {
        this.pay_token_type = pay_token_type
        this.protocol = protocol
        this.permission = permission
        this.object = ''
    }
    static From(protocol: Protocol, pay_token_type:string, permission:PermissionObject, object:TxbObject) : Service {
        let s = new Service(protocol, pay_token_type, permission);
        s.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), object);
        return s
    }
    static New(protocol: Protocol, pay_token_type:string, permission:PermissionObject, description:string, 
        payee_address:string, endpoint?:string, passport?:PassportObject) : Service {
        let s = new Service(protocol, pay_token_type, permission);
        if (!Protocol.IsValidObjects([permission])) {
            ERROR(Errors.IsValidObjects)
        }
        if (!IsValidArgType(pay_token_type)) {
            ERROR(Errors.IsValidArgType, 'this.pay_token_type')
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        if (!IsValidAddress(payee_address)) {
            ERROR(Errors.IsValidAddress, 'payee_address')
        }

        if (endpoint && !IsValidEndpoint(endpoint)) {
            ERROR(Errors.IsValidEndpoint)
        }

        let txb = protocol.CurrentSession();
        let ep = endpoint? txb.pure(Bcs.getInstance().ser_option_string(endpoint)) : OptionNone(txb);
        
        if (passport) {
            s.object = txb.moveCall({
                target:protocol.ServiceFn('new_with_passport') as FnCallType,
                arguments:[passport, txb.pure(description), txb.pure(payee_address, BCS.ADDRESS), ep, Protocol.TXB_OBJECT(txb, permission)],
                typeArguments:[pay_token_type],
            })
        } else {
            s.object = txb.moveCall({
                target:protocol.ServiceFn('new') as FnCallType,
                arguments:[txb.pure(description), txb.pure(payee_address, BCS.ADDRESS), ep, Protocol.TXB_OBJECT(txb, permission)],
                typeArguments:[pay_token_type],
            })
        }
        return s
    }

    launch() : ServiceAddress  {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target:this.protocol.ServiceFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object)],
            typeArguments:[this.pay_token_type]
    })
}
    destroy() {
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.ServiceFn('destroy') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
            typeArguments:[this.pay_token_type]
        })   
    }
    set_description(description:string, passport?:PassportObject)  {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ServiceFn('description_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(description), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            txb.moveCall({
                target:this.protocol.ServiceFn('description_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(description), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }
    set_price(item:string, price:number, bNotFoundAssert:boolean=true, passport?:PassportObject) {
        if (!IsValidInt(price)) {
            ERROR(Errors.IsValidInt, 'price')
        } 
        if (!IsValidName(item)) {
            ERROR(Errors.IsValidName, 'item')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ServiceFn('price_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(item), txb.pure(price, BCS.U64), 
                    txb.pure(bNotFoundAssert, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            txb.moveCall({
                target:this.protocol.ServiceFn('price_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(item), txb.pure(price, BCS.U64), 
                    txb.pure(bNotFoundAssert, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }
    set_stock(item:string, stock:number, bNotFoundAssert:boolean=true, passport?:PassportObject)  {
        if (!IsValidName(item)) {
            ERROR(Errors.IsValidName, 'item')
        }
        if (!IsValidInt(stock)) {
            ERROR(Errors.IsValidInt, 'stock')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ServiceFn('stock_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(item), txb.pure(stock, BCS.U64), 
                    txb.pure(bNotFoundAssert, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            txb.moveCall({
                target:this.protocol.ServiceFn('stock_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(item), txb.pure(stock, BCS.U64), 
                    txb.pure(bNotFoundAssert, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }
    add_stock(item:string, stock_add:number, bNotFoundAssert:boolean=true, passport?:PassportObject)  {
        if (!IsValidName(item)) {
            ERROR(Errors.IsValidName, 'item')
        }
        if (!IsValidUint(stock_add)) {
            ERROR(Errors.IsValidUint, 'stock_add')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ServiceFn('stock_add_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(item), txb.pure(stock_add, BCS.U64), 
                    txb.pure(bNotFoundAssert, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })  
        } else {
            txb.moveCall({
                target:this.protocol.ServiceFn('stock_add') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(item), txb.pure(stock_add, BCS.U64), 
                    txb.pure(bNotFoundAssert, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })        
        }
    }
    reduce_stock(item:string, stock_reduce:number, bNotFoundAssert:boolean=true, passport?:PassportObject)  {
        if (!IsValidName(item)) {
            ERROR(Errors.IsValidName, 'item')
        }
        if (!IsValidUint(stock_reduce)) {
            ERROR(Errors.IsValidUint, 'stock_reduce')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ServiceFn('stock_reduce_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(item), txb.pure(stock_reduce, BCS.U64), 
                    txb.pure(bNotFoundAssert, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            txb.moveCall({
                target:this.protocol.ServiceFn('stock_reduce') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(item), txb.pure(stock_reduce, BCS.U64), 
                    txb.pure(bNotFoundAssert, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }
    set_payee(payee:string, passport?:PassportObject)  {
        if (!IsValidAddress(payee)) {
            ERROR(Errors.IsValidAddress, 'payee');
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ServiceFn('payee_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(payee, BCS.ADDRESS), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            txb.moveCall({
                target:this.protocol.ServiceFn('payee_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(payee, BCS.ADDRESS), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }
    repository_add(repository:RepositoryObject, passport?:PassportObject) {
        if (!Protocol.IsValidObjects([this.object, this.permission, repository])) return false;
        if (!IsValidArgType(this.pay_token_type)) return false;

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ServiceFn('repository_add_with_passport') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, repository), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            txb.moveCall({
                target:this.protocol.ServiceFn('repository_add') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, repository), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
        
    }
    repository_remove(repository_address?:string[], removeall?:boolean, passport?:PassportObject) {
        if (!removeall && !repository_address) {
            ERROR(Errors.AllInvalid,  'removeall & repository_address');
        }
        if (repository_address && !IsValidArray(repository_address, IsValidAddress)) {
            ERROR(Errors.IsValidArray,  'repository_address');
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (removeall) {
                txb.moveCall({
                    target:this.protocol.ServiceFn('repository_remove_all_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                txb.moveCall({
                    target:this.protocol.ServiceFn('repository_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(repository_address!), 'vector<address>'), 
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })                    
            }
        } else {
            if (removeall) {
                txb.moveCall({
                    target:this.protocol.ServiceFn('repository_remove_all') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                txb.moveCall({
                    target:this.protocol.ServiceFn('repository_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(repository_address!), 'vector<address>'), 
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })                       
            }
        }
    }

    add_withdraw_guards(guards:Service_Guard_Percent[], passport?:PassportObject) {
        let bValid = true;
        guards.forEach((v) => {
            if (!Protocol.IsValidObjects([v.guard])) bValid  = false;
            if (!IsValidPercent(v.percent)) bValid =  false;
        })
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'guards')
        }

        let txb = this.protocol.CurrentSession();
        guards.forEach((guard) => { 
            if (passport) {
                txb.moveCall({
                    target:this.protocol.ServiceFn('withdraw_guard_add_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard.guard), 
                        txb.pure(guard.percent, BCS.U8), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]            
                    })
            } else {
                txb.moveCall({
                    target:this.protocol.ServiceFn('withdraw_guard_add') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard.guard), txb.pure(guard.percent, BCS.U8), 
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]            
                    })
            }
        })
    }
    remove_withdraw_guards(guard_address?:string[], removeall?:boolean, passport?:PassportObject) {
        if (!removeall && !guard_address) {
            ERROR(Errors.AllInvalid, 'guard_address & removeall')
        }

        if (guard_address && !IsValidArray(guard_address, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'guard_address')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (removeall) {
                txb.moveCall({
                    target:this.protocol.ServiceFn('withdraw_guard_remove_all_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })    
            } else {
                txb.moveCall({
                    target:this.protocol.ServiceFn('withdraw_guard_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(guard_address!), 'vector<address>'), 
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })            
            }
        } else {
            if (removeall) {
                txb.moveCall({
                    target:this.protocol.ServiceFn('withdraw_guard_remove_all') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })     
            } else {
                txb.moveCall({
                    target:this.protocol.ServiceFn('withdraw_guard_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(guard_address!), 'vector<address>'), 
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })            
            }
        }
    }
    add_refund_guards(guards:Service_Guard_Percent[], passport?:PassportObject) {
        let bValid = true;
        guards.forEach((v) => {
            if (!Protocol.IsValidObjects([v.guard])) bValid = false;
            if (!IsValidPercent(v.percent)) bValid = false;
        })
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'guards')
        }

        let txb = this.protocol.CurrentSession();
        guards.forEach((guard) => { 
            if (passport) {
                txb.moveCall({
                    target:this.protocol.ServiceFn('refund_guard_add_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard.guard), 
                        txb.pure(guard.percent, BCS.U8), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]            
                })                
            } else {
                txb.moveCall({
                    target:this.protocol.ServiceFn('refund_guard_add') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard.guard), txb.pure(guard.percent, BCS.U8), 
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]            
                })
            }
        })
    }
    remove_refund_guards(guard_address?:string[], removeall?:boolean, passport?:PassportObject) {
        if (!guard_address && !removeall) {
            ERROR(Errors.AllInvalid, 'guard_address & removeall');
        }
        if (guard_address && !IsValidArray(guard_address, IsValidAddress)) {
            ERROR(Errors.InvalidParam, 'guard_address')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (removeall) {
                txb.moveCall({
                    target:this.protocol.ServiceFn('refund_guard_remove_all_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                txb.moveCall({
                    target:this.protocol.ServiceFn('refund_guard_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(guard_address!), 'vector<address>'),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            }
        } else {
            if (removeall) {
                txb.moveCall({
                    target:this.protocol.ServiceFn('refund_guard_remove_all') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                txb.moveCall({
                    target:this.protocol.ServiceFn('refund_guard_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(guard_address!), 'vector<address>'),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            }
        }
    }

    is_valid_sale(sales:Service_Sale[]) {
        let bValid = true; let names:string[]  = [];
        sales.forEach((v) => {
            if (!IsValidName(v.item)) bValid = false;
            if (!IsValidInt(v.price)) bValid = false;
            if (!IsValidUint(v.stock)) bValid = false;
            if (names.includes(v.item)) bValid = false;
            names.push(v.item)
        })
        return bValid
    }

    add_sale(sales:Service_Sale[], passport?:PassportObject) {
        if (!sales || !this.is_valid_sale(sales)) {
            ERROR(Errors.InvalidParam, 'Service_Sale')
        }
        
        let names: string[]  = []; let price: number[] = []; let stock: number[] = [];
        sales.forEach((s) => {
            names.push(s.item); price.push(s.price); stock.push(s.stock);
        })

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ServiceFn('sales_add_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(Bcs.getInstance().ser_vector_string(names)), 
                    txb.pure(Bcs.getInstance().ser_vector_u64(price)), txb.pure(Bcs.getInstance().ser_vector_u64(stock)), 
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            txb.moveCall({
                target:this.protocol.ServiceFn('sales_add') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(Bcs.getInstance().ser_vector_string(names)), 
                    txb.pure(Bcs.getInstance().ser_vector_u64(price)), txb.pure(Bcs.getInstance().ser_vector_u64(stock)), 
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
        
    }
    remove_sales(sales?:string[], removeall?:boolean, passport?:PassportObject) {
        if (!removeall && !sales) {
            ERROR(Errors.AllInvalid, 'sales & removeall')
        }
        if (sales && !IsValidArray(sales, IsValidName)) {
            ERROR(Errors.IsValidArray, 'sales')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (removeall) {
                txb.moveCall({
                    target:this.protocol.ServiceFn('sales_remove_all_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })    
            } else {
                txb.moveCall({
                    target:this.protocol.ServiceFn('sales_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(Bcs.getInstance().ser_vector_string(array_unique(sales!))), 
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })            
            }
        } else {
            if (removeall) {
                txb.moveCall({
                    target:this.protocol.ServiceFn('sales_remove_all') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })      
            } else {
                txb.moveCall({
                    target:this.protocol.ServiceFn('sales_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(Bcs.getInstance().ser_vector_string(array_unique(sales!))), 
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })            
            }
        }     
    }

    discount_transfer(discount_dispatch:DicountDispatch[], passport?:PassportObject) {
        if (!discount_dispatch || discount_dispatch.length > Service.MAX_DISCOUNT_RECEIVER_COUNT) {
            ERROR(Errors.InvalidParam, 'discount_dispatch')
        }

        let bValid = true;
        discount_dispatch.forEach((v) => {
            if (!IsValidAddress(v.receiver)) bValid = false;
            if (!IsValidUint(v.count) || v.count > Service.MAX_DISCOUNT_COUNT_ONCE) bValid = false;
            if (!IsValidName_AllowEmpty(v.discount.name)) bValid = false;
            if (v.discount.type == Service_Discount_Type.ratio && !IsValidPercent(v.discount.off)) bValid = false;
            if (!IsValidUint(v.discount.duration_minutes)) bValid = false;
            if (v.discount?.time_start && !IsValidUint(v.discount.time_start)) bValid = false;
            if (v.discount?.price_greater && !IsValidInt(v.discount.price_greater))  bValid = false;
        })
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'discount_dispatch')
        }

        let txb = this.protocol.CurrentSession();
        discount_dispatch.forEach((discount) => {
            let price_greater = discount.discount?.price_greater ? 
                txb.pure(Bcs.getInstance().ser_option_u64(discount.discount.price_greater)) : OptionNone(txb);
            let time_start = discount.discount?.time_start ? 
                txb.pure(Bcs.getInstance().ser_option_u64(discount.discount.time_start)) : OptionNone(txb);

            if (passport) {
                txb.moveCall({
                    target:this.protocol.ServiceFn('dicscount_create_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(discount.discount.name), 
                        txb.pure(discount.discount.type, BCS.U8), 
                        txb.pure(discount.discount.off, BCS.U64), price_greater, time_start, 
                        txb.pure(discount.discount.duration_minutes, BCS.U64), txb.pure(discount.count, BCS.U64), 
                        Protocol.TXB_OBJECT(txb, this.permission), txb.pure(discount.receiver, BCS.ADDRESS), txb.object(Protocol.CLOCK_OBJECT)],
                    typeArguments:[this.pay_token_type]
                });
            } else {
                txb.moveCall({
                    target:this.protocol.ServiceFn('dicscount_create') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(discount.discount.name), 
                        txb.pure(discount.discount.type, BCS.U8), 
                        txb.pure(discount.discount.off, BCS.U64), price_greater, time_start, 
                        txb.pure(discount.discount.duration_minutes, BCS.U64), txb.pure(discount.count, BCS.U64), 
                        Protocol.TXB_OBJECT(txb, this.permission), txb.pure(discount.receiver, BCS.ADDRESS), txb.object(Protocol.CLOCK_OBJECT)],
                    typeArguments:[this.pay_token_type]
                })
            }
        });
    }

    // 同时支持withdraw guard和permission guard
    withdraw(order:OrderObject, passport?:PassportObject) {
        if (!Protocol.IsValidObjects([order]))  {
            ERROR(Errors.IsValidObjects, 'order')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ServiceFn('withdraw_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })        
        } else {
            txb.moveCall({
                target:this.protocol.ServiceFn('withdraw') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })               
        }
        
    }
    set_buy_guard(guard?:GuardObject, passport?:PassportObject) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (guard) {
                txb.moveCall({
                    target:this.protocol.ServiceFn('buy_guard_set_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })        
            } else {
                txb.moveCall({
                    target:this.protocol.ServiceFn('buy_guard_none_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })   
            }
        } else {
            if (guard) {
                txb.moveCall({
                    target:this.protocol.ServiceFn('buy_guard_set') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })        
            } else {
                txb.moveCall({
                    target:this.protocol.ServiceFn('buy_guard_none') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })   
            }
        }
    }
    set_machine(machine?:MachineObject, passport?:PassportObject) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (machine) {
                txb.moveCall({
                    target:this.protocol.ServiceFn('machine_set_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, machine), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })        
            } else {
                txb.moveCall({
                    target:this.protocol.ServiceFn('machine_none_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })   
            }
        } else {
            if (machine) {
                txb.moveCall({
                    target:this.protocol.ServiceFn('machine_set') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, machine), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })        
            } else {
                txb.moveCall({
                    target:this.protocol.ServiceFn('machine_none') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })   
            }
        }
    }

    set_endpoint(endpoint?:string, passport?:PassportObject) {
        if (endpoint && !IsValidEndpoint(endpoint)) {
            ERROR(Errors.IsValidEndpoint);
        }

        let txb = this.protocol.CurrentSession();
        let ep = endpoint? txb.pure(Bcs.getInstance().ser_option_string(endpoint)) : OptionNone(txb);
        
        if (passport) {
            txb.moveCall({
                target:this.protocol.ServiceFn('endpoint_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), ep, Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })      
        } else {
            txb.moveCall({
                target:this.protocol.ServiceFn('endpoint_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), ep, Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })      
        }   
    }
    publish(passport?:PassportObject) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ServiceFn('publish_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })   
        } else {
            txb.moveCall({
                target:this.protocol.ServiceFn('publish') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })   
        }      
        
    }
    clone(passport?:PassportObject) : ServiceObject  {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            return txb.moveCall({
                target:this.protocol.ServiceFn('clone_withpassport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })    
        } else {
            return txb.moveCall({
                target:this.protocol.ServiceFn('clone') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })    
        }  
    }

    set_customer_required(pubkey:string, customer_required: BuyRequiredEnum[], passport?:PassportObject) {
        if (!pubkey) {
            ERROR(Errors.InvalidParam, 'pubkey')
        } 
        if(!customer_required) {
            ERROR(Errors.InvalidParam, 'customer_required')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ServiceFn('required_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), 
                    txb.pure(Bcs.getInstance().ser_vector_vector_u8(array_unique(customer_required))), 
                    txb.pure(pubkey, 'vector<u8>'), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })         
        } else {
            txb.moveCall({
                target:this.protocol.ServiceFn('required_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), 
                    txb.pure(Bcs.getInstance().ser_vector_vector_u8(array_unique(customer_required))), 
                    txb.pure(pubkey, 'vector<u8>'), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })         
        }
    }
    remove_customer_required(passport?:PassportObject) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ServiceFn('required_none_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })  
        } else {
            txb.moveCall({
                target:this.protocol.ServiceFn('required_none') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })  
        }       
    }
    change_required_pubkey(pubkey:string, passport?:PassportObject) {
        if (!pubkey) {
            ERROR(Errors.InvalidParam, 'pubkey')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ServiceFn('required_pubkey_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(pubkey, 'vector<u8>'), 
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })    
        } else {
            txb.moveCall({
                target:this.protocol.ServiceFn('required_pubkey_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(pubkey, 'vector<u8>'), 
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })    
        }     
    }
    change_order_required_pubkey(order:OrderObject, pubkey:string, passport?:PassportObject) {
        if (!Protocol.IsValidObjects([order])) {
            ERROR(Errors.IsValidObjects, 'order')
        }
        if (!pubkey) {
            ERROR(Errors.InvalidParam, 'pubkey')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ServiceFn('order_pubkey_update_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order), txb.pure(pubkey, 'vector<u8>'), 
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })   
        } else {
            txb.moveCall({
                target:this.protocol.ServiceFn('order_pubkey_update') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order), txb.pure(pubkey, 'vector<u8>'), 
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })   
        }    
    }
    pause(pause:boolean, passport?:PassportObject) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ServiceFn('pause_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(pause, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })     
        } else {
            txb.moveCall({
                target:this.protocol.ServiceFn('pause') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(pause, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })     
        }    
        
    }
    customer_refund(order:OrderObject, passport?:PassportObject) {
        if (!Protocol.IsValidObjects([order])) {
            ERROR(Errors.IsValidObjects, 'order')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
            target:this.protocol.ServiceFn('refund_with_passport') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order), passport],
            typeArguments:[this.pay_token_type]
            })               
        } else {
            txb.moveCall({
                target:this.protocol.ServiceFn('refund') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order)],
                typeArguments:[this.pay_token_type]
            })            
        }
    }

    update_order_required_info(order:OrderObject, customer_info_crypto: Customer_RequiredInfo) {
        if (!Protocol.IsValidObjects([order])) {
            ERROR(Errors.IsValidObjects, 'order')
        }
        if (!customer_info_crypto.pubkey || !customer_info_crypto.customer_info_crypt) {
            ERROR(Errors.InvalidParam, 'customer_info_crypto')
        }

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.ServiceFn('order_required_info_update') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order), 
                txb.pure(customer_info_crypto.pubkey, 'vector<u8>'), 
                txb.pure(customer_info_crypto.customer_pubkey, 'vector<u8>'), 
                txb.pure(Bcs.getInstance().ser_vector_vector_u8(array_unique(customer_info_crypto.customer_info_crypt)))],
            typeArguments:[this.pay_token_type]
        })    
        
    }
    
    buy(buy_items:Service_Buy[], coin:CoinObject, discount?:DiscountObject, machine?:MachineObject, 
        customer_info_crypto?: Customer_RequiredInfo, passport?:PassportObject) : OrderAddress {
        if (!buy_items) {
            ERROR(Errors.InvalidParam, 'buy_items')
        }

        let bValid = true; let names:string[]  = [];
        buy_items.forEach((v) => {
            if (!IsValidName(v.item)) bValid = false;
            if (!IsValidInt(v.max_price)) bValid = false;
            if (!IsValidUint(v.count)) bValid = false;
            if (names.includes(v.item)) bValid = false;
            names.push(v.item)
        })
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'buy_items')
        }

        let name:string[] = []; let price:number[] = [];    let stock:number[] = []; let order;
        buy_items.forEach((b) => { name.push(b.item); price.push(b.max_price); stock.push(b.count)})

        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (discount) {
                order = txb.moveCall({
                    target:this.protocol.ServiceFn('dicount_buy_with_passport') as FnCallType,
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(Bcs.getInstance().ser_vector_string(name)), 
                        txb.pure(Bcs.getInstance().ser_vector_u64(price)), txb.pure(Bcs.getInstance().ser_vector_u64(stock)), 
                        Protocol.TXB_OBJECT(txb, coin), Protocol.TXB_OBJECT(txb, discount), txb.object(Protocol.CLOCK_OBJECT)],                   
                    typeArguments:[this.pay_token_type]            
            })} else {
                order = txb.moveCall({
                    target:this.protocol.ServiceFn('buy_with_passport') as FnCallType,
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(Bcs.getInstance().ser_vector_string(name)), 
                        txb.pure(Bcs.getInstance().ser_vector_u64(price)), 
                        txb.pure(Bcs.getInstance().ser_vector_u64(stock)), 
                        Protocol.TXB_OBJECT(txb, coin)],
                    typeArguments:[this.pay_token_type]            
            })}             
        } else {
            if (discount) {
                order = txb.moveCall({
                    target:this.protocol.ServiceFn('disoucnt_buy') as FnCallType,
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(Bcs.getInstance().ser_vector_string(name)), 
                        txb.pure(Bcs.getInstance().ser_vector_u64(price)), 
                        txb.pure(Bcs.getInstance().ser_vector_u64(stock)), 
                        Protocol.TXB_OBJECT(txb, coin), 
                        Protocol.TXB_OBJECT(txb, discount), txb.object(Protocol.CLOCK_OBJECT)],                
                    typeArguments:[this.pay_token_type]            
            })} else {
                order = txb.moveCall({
                    target:this.protocol.ServiceFn('buy') as FnCallType,
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(Bcs.getInstance().ser_vector_string(name)), 
                        txb.pure(Bcs.getInstance().ser_vector_u64(price)), 
                        txb.pure(Bcs.getInstance().ser_vector_u64(stock)), 
                        Protocol.TXB_OBJECT(txb, coin)],
                    typeArguments:[this.pay_token_type]            
            })}           
        }

        if (customer_info_crypto) {
            this.update_order_required_info(order, customer_info_crypto);
        }

        if (machine) {
            return txb.moveCall({
                target:this.protocol.ServiceFn('order_create_with_machine') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order), Protocol.TXB_OBJECT(txb, machine)],
                typeArguments:[this.pay_token_type]            
            })        
        } else {
            return txb.moveCall({
                target:this.protocol.ServiceFn('order_create') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order)],
                typeArguments:[this.pay_token_type]            
            })  
        }
    }

    order_bind_machine(order:OrderObject, machine:MachineObject) {
        if (!Protocol.IsValidObjects([order, machine])) {
            ERROR(Errors.IsValidObjects, 'order & machine');
        }

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.ServiceFn('order_create_with_machine') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, order), Protocol.TXB_OBJECT(txb, machine)],
            typeArguments:[this.pay_token_type]            
        })    
    }

    change_permission(new_permission:PermissionObject) {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects)
        }

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.ServiceFn('permission_set') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission), Protocol.TXB_OBJECT(txb, new_permission)],
            typeArguments:[this.pay_token_type]            
        })    
        this.permission = new_permission
    }

    static MAX_DISCOUNT_COUNT_ONCE = 200;
    static MAX_DISCOUNT_RECEIVER_COUNT = 200;
}
