import { IsValidArray, IsValidPercent, IsValidName_AllowEmpty, parseObjectType, array_unique, IsValidTokenType, IsValidDesription, 
    IsValidAddress, IsValidEndpoint, IsValidU64,
    IsValidName, } from './utils'
import { FnCallType, GuardObject, PassportObject, PermissionObject, RepositoryObject, MachineObject, ServiceAddress, 
    ServiceObject, DiscountObject, OrderObject, OrderAddress, CoinObject, Protocol, ValueType,
    TxbObject,
    TreasuryObject,
    PaymentAddress,
    ArbObject,
    ArbitrationObject,
    ProgressObject} from './protocol';
import { ERROR, Errors } from './exception';
import { Transaction as TransactionBlock,  } from '@mysten/sui/transactions';
import { SuiObjectData } from '@mysten/sui/client';

export type Service_Guard_Percent = {
    guard:GuardObject;
    percent: number;
}
export type Service_Sale = {
    item: string;
    price: string;
    stock: string;
    endpoint?:string | null;
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
    price_greater?: bigint;
}

export type Service_Buy_RequiredInfo = {
    pubkey: string;
    customer_info: string[];
}
export type Customer_RequiredInfo = {
    customer_pubkey: string;
    customer_info_crypt: string;
}
export enum BuyRequiredEnum {
    address = 'address',
    phone = 'phone',
    name = 'name',
    postcode = 'postcode'
}

export type Service_Buy = {
    item: string;
    max_price: bigint;
    count: bigint;
}

export type DicountDispatch = {
    receiver: string;
    count: bigint;
    discount: Service_Discount;
}
export interface WithdrawPayee {
    withdraw_guard: GuardObject;
    treasury: TreasuryObject,
    index: bigint,
    remark: string,
    for_object?: string,
    for_guard?: GuardObject,
}


export type handleDiscountObject = (owner:string, objects:(SuiObjectData|null|undefined)[]) => void;
export class Service {
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
    static From(txb: TransactionBlock, token_type:string, permission:PermissionObject, object:TxbObject) : Service {
        let s = new Service(txb, token_type, permission);
        s.object = Protocol.TXB_OBJECT(txb, object);
        return s
    }
    static New(txb: TransactionBlock, token_type:string, permission:PermissionObject, description:string, 
        payee_treasury:TreasuryObject, passport?:PassportObject) : Service {
        if (!Protocol.IsValidObjects([permission, payee_treasury])) {
            ERROR(Errors.IsValidObjects)
        }
        if (!IsValidTokenType(token_type)) {
            ERROR(Errors.IsValidTokenType, 'New: pay_token_type') 
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }

        let pay_token_type = token_type;
        let s = new Service(txb, pay_token_type, permission);
        

        if (passport) {
            s.object = txb.moveCall({
                target:Protocol.Instance().ServiceFn('new_with_passport') as FnCallType,
                arguments:[passport, txb.pure.string(description), txb.object(payee_treasury), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments:[pay_token_type],
            })
        } else {
            s.object = txb.moveCall({
                target:Protocol.Instance().ServiceFn('new') as FnCallType,
                arguments:[txb.pure.string(description), txb.object(payee_treasury), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments:[pay_token_type],
            })
        }
        return s
    }

    launch() : ServiceAddress  {
        return this.txb.moveCall({
            target:Protocol.Instance().ServiceFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object)],
            typeArguments:[this.pay_token_type]
        })
    }

    set_description(description:string, passport?:PassportObject)  {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('description_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('description_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }
    set_price(item:string, price:bigint, bNotFoundAssert:boolean=true, passport?:PassportObject) {
        if (!IsValidU64(price)) {
            ERROR(Errors.IsValidU64, 'set_price price')
        } 

        if (!Service.IsValidItemName(item)) {
            ERROR(Errors.IsValidServiceItemName, 'set_price item')
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('price_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item), 
                    this.txb.pure.u64(price), 
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('price_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item), 
                    this.txb.pure.u64(price), 
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }
    set_stock(item:string, stock:bigint, bNotFoundAssert:boolean=true, passport?:PassportObject)  {
        if (!Service.IsValidItemName(item)) {
            ERROR(Errors.IsValidServiceItemName, 'item')
        }
        if (!IsValidU64(stock)) {
            ERROR(Errors.IsValidU64, 'stock')
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('stock_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item), 
                    this.txb.pure.u64(stock), 
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('stock_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item), 
                    this.txb.pure.u64(stock), 
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }
    add_stock(item:string, stock_add:bigint, bNotFoundAssert:boolean=true, passport?:PassportObject)  {
        if (!Service.IsValidItemName(item)) {
            ERROR(Errors.IsValidServiceItemName, 'add_stock item')
        }
        if (!IsValidU64(stock_add)) {
            ERROR(Errors.IsValidUint, 'add_stock stock_add')
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('stock_add_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item), 
                    this.txb.pure.u64(stock_add), 
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })  
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('stock_add') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item), 
                    this.txb.pure.u64(stock_add), 
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })        
        }
    }
    reduce_stock(item:string, stock_reduce:bigint, bNotFoundAssert:boolean=true, passport?:PassportObject)  {
        if (!Service.IsValidItemName(item)) {
            ERROR(Errors.IsValidServiceItemName, 'reduce_stock item')
        }
        if (!IsValidU64(stock_reduce)) {
            ERROR(Errors.IsValidUint, 'reduce_stock stock_reduce')
        }

        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('stock_reduce_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item), 
                    this.txb.pure.u64(stock_reduce), 
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('stock_reduce') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item), 
                    this.txb.pure.u64(stock_reduce), 
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }

    set_sale_endpoint(item:string, endpoint?:string|null, bNotFoundAssert:boolean=true, passport?:PassportObject) {
        if (!Service.IsValidItemName(item)) {
            ERROR(Errors.IsValidServiceItemName, 'set_sale_endpoint item')
        }
        if (endpoint && !IsValidEndpoint(endpoint)) {
            ERROR(Errors.IsValidEndpoint, 'set_sale_endpoint endpoint')
        }
        
        let ep =  this.txb.pure.option('string', endpoint ? endpoint : undefined);
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('sale_endpoint_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item), ep, 
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('sale_endpoint_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item), ep, 
                    this.txb.pure.bool(bNotFoundAssert), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }        
    }

    set_payee(payee:TreasuryObject, passport?:PassportObject)  {
        if (!Protocol.IsValidObjects([payee])) {
            ERROR(Errors.IsValidObjects, 'set_payee');
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('payee_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(payee), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('payee_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(payee), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }
    add_repository(repository:RepositoryObject, passport?:PassportObject) {
        if (!Protocol.IsValidObjects([repository])) {
            ERROR(Errors.IsValidObjects, 'repository_add');
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('repository_add_with_passport') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, repository), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('repository_add') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, repository), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })  
        }
    }
    remove_repository(repository_address:string[], removeall?:boolean, passport?:PassportObject) {
        if (!removeall && repository_address.length===0)  return;
        
        if (!IsValidArray(repository_address, IsValidAddress)) {
            ERROR(Errors.IsValidArray,  'repository_address');
        }
        
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('repository_remove_all_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('repository_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(repository_address!)), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })                    
            }
        } else {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('repository_remove_all') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('repository_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(repository_address!)), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })                       
            }
        }
    }
    add_arbitration(arbitraion:ArbitrationObject, arbitraion_token_type:string, passport?:PassportObject) {
        if (!Protocol.IsValidObjects([arbitraion])) {
            ERROR(Errors.IsValidObjects, 'add_arbitration.arbitraion');
        }
        if (!IsValidTokenType(arbitraion_token_type)) {
            ERROR(Errors.IsValidTokenType, 'add_arbitration.arbitraion_token_type')
        }
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('arbitration_add_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, arbitraion), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type, arbitraion_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('arbitration_add') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, arbitraion), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type, arbitraion_token_type]
            })  
        }
    }
    remove_arbitration(address:string[], removeall?:boolean, passport?:PassportObject) {
        if (!removeall && address.length===0)  return;
        
        if (!IsValidArray(address, IsValidAddress)) {
            ERROR(Errors.IsValidArray,  'remove_arbitration.address');
        }
        
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('arbitration_remove_all_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('arbitration_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(address!)), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })                    
            }
        } else {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('arbitration_remove_all') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('arbitration_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(address!)), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })                       
            }
        }
    }
    add_withdraw_guards(guards:Service_Guard_Percent[], passport?:PassportObject) {
        if (guards.length === 0) return;

        let bValid = true;
        guards.forEach((v) => {
            if (!Protocol.IsValidObjects([v.guard])) bValid  = false;
            if (!IsValidPercent(v.percent)) bValid =  false;
        })
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'guards')
        }
        
        guards.forEach((guard) => { 
            if (passport) {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('withdraw_guard_add_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard.guard), 
                        this.txb.pure.u8(guard.percent), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]            
                    })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('withdraw_guard_add') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard.guard), this.txb.pure.u8(guard.percent), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]            
                    })
            }
        })
    }
    remove_withdraw_guards(guard_address:string[], removeall?:boolean, passport?:PassportObject) {
        if (!removeall && guard_address.length===0) {
            return
        }

        if (!IsValidArray(guard_address, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'guard_address')
        }

        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('withdraw_guard_remove_all_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })    
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('withdraw_guard_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(guard_address!)), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })            
            }
        } else {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('withdraw_guard_remove_all') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })     
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('withdraw_guard_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(guard_address!)), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })            
            }
        }
    }
    add_refund_guards(guards:Service_Guard_Percent[], passport?:PassportObject) {
        if (guards.length === 0) return;

        let bValid = true;
        guards.forEach((v) => {
            if (!Protocol.IsValidObjects([v.guard])) bValid = false;
            if (!IsValidPercent(v.percent)) bValid = false;
        })
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'guards')
        }

        guards.forEach((guard) => { 
            if (passport) {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('refund_guard_add_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard.guard), 
                        this.txb.pure.u8(guard.percent), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]            
                })                
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('refund_guard_add') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard.guard), this.txb.pure.u8(guard.percent), 
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]            
                })
            }
        })
    }
    remove_refund_guards(guard_address:string[], removeall?:boolean, passport?:PassportObject) {
        if (guard_address.length===0 && !removeall) return ;
        if (!IsValidArray(guard_address, IsValidAddress)) {
            ERROR(Errors.InvalidParam, 'guard_address')
        }

        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('refund_guard_remove_all_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('refund_guard_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(guard_address!)),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            }
        } else {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('refund_guard_remove_all') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('refund_guard_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(guard_address!)),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })
            }
        }
    }

    is_valid_sale(sales:Service_Sale[]) {
        let bValid = true; let names:string[]  = [];
        sales.forEach((v) => {
            if (!Service.IsValidItemName(v.item)) bValid = false;
            if (!IsValidU64(v.price)) bValid = false;
            if (!IsValidU64(v.stock)) bValid = false;
            if (names.includes(v.item)) bValid = false;
            names.push(v.item)
        })
        return bValid
    }

    add_sales(sales:Service_Sale[], bExistAssert:boolean=false, passport?:PassportObject) {
        if (sales.length === 0) return;

        if (!this.is_valid_sale(sales)) {
            ERROR(Errors.InvalidParam, 'add_sales')
        }
        
        let names: string[]  = []; let price: string[] = []; let stock: string[] = []; let endpoint: string[] = [];
        sales.forEach((s) => {
            if (s.endpoint && !IsValidEndpoint(s.endpoint)) {
                ERROR(Errors.IsValidEndpoint, 'add_sales')
            }
            names.push(s.item); price.push(s.price); stock.push(s.stock); endpoint.push(s.endpoint ?? '')
        })
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('sales_add_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', names), 
                    this.txb.pure.vector('string', endpoint),
                    this.txb.pure.vector('u64', price), this.txb.pure.vector('u64', stock), 
                    this.txb.pure.bool(bExistAssert),                    
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('sales_add') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', names), 
                    this.txb.pure.vector('string', endpoint),
                    this.txb.pure.vector('u64', price), this.txb.pure.vector('u64', stock), 
                    this.txb.pure.bool(bExistAssert),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })
        }
    }

    remove_sales(sales:string[], passport?:PassportObject) {
        if (sales.length === 0) return;

        if (!IsValidArray(sales, Service.IsValidItemName)) {
            ERROR(Errors.IsValidArray, 'remove_sales')
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('sales_remove_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', array_unique(sales!)),  
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })            
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('sales_remove') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', array_unique(sales!)), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })            
        }     
    }

    discount_transfer(discount_dispatch:DicountDispatch[], passport?:PassportObject) {
        if (!discount_dispatch || discount_dispatch.length > Service.MAX_DISCOUNT_RECEIVER_COUNT) {
            ERROR(Errors.InvalidParam, 'discount_dispatch')
        }

        let bValid = true;
        discount_dispatch.forEach((v) => {
            if (!IsValidAddress(v.receiver)) bValid = false;
            if (!IsValidU64(v.count) || v.count > Service.MAX_DISCOUNT_COUNT_ONCE) bValid = false;
            if (!IsValidName_AllowEmpty(v.discount.name)) bValid = false;
            if (v.discount.type == Service_Discount_Type.ratio && !IsValidPercent(v.discount.off)) bValid = false;
            if (!IsValidU64(v.discount.duration_minutes)) bValid = false;
            if (v.discount?.time_start && !IsValidU64(v.discount.time_start)) bValid = false;
            if (v.discount?.price_greater && !IsValidU64(v.discount.price_greater))  bValid = false;
        })
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'discount_dispatch')
        }
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        discount_dispatch.forEach((discount) => {
            let price_greater = this.txb.pure.option('u64', discount.discount?.price_greater ? discount.discount?.price_greater : undefined);
            let time_start = this.txb.pure.option('u64', discount.discount?.time_start ? discount.discount?.time_start : undefined);

            if (passport) {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('dicscount_create_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(discount.discount.name), 
                        this.txb.pure.u8(discount.discount.type), 
                        this.txb.pure.u64(discount.discount.off), price_greater, time_start, 
                        this.txb.pure.u64(discount.discount.duration_minutes), this.txb.pure.u64(discount.count), 
                        Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.pure.address(discount.receiver), this.txb.object(clock)],
                    typeArguments:[this.pay_token_type]
                });
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('dicscount_create') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(discount.discount.name), 
                        this.txb.pure.u8(discount.discount.type), 
                        this.txb.pure.u64(discount.discount.off), price_greater, time_start, 
                        this.txb.pure.u64(discount.discount.duration_minutes), this.txb.pure.u64(discount.count), 
                        Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.pure.address(discount.receiver), 
                        this.txb.object(clock)],
                    typeArguments:[this.pay_token_type]
                })
            }
        });
    }

    // support both withdraw guard and permission guard
    // withdraw_guard & passport must BOTH valid.
    withdraw(order:OrderObject, param:WithdrawPayee, passport:PassportObject) : PaymentAddress {
        if (!Protocol.IsValidObjects([order, param.treasury, param.withdraw_guard, passport]))  {
            ERROR(Errors.IsValidObjects,)
        }
        if (param?.for_guard && !Protocol.IsValidObjects([param.for_guard])) {
            ERROR(Errors.IsValidObjects, 'withdraw.param.for_guard')
        }
        if (param?.for_object && !IsValidAddress(param.for_object)) {
            ERROR(Errors.IsValidAddress, 'withdraw.param.for_object')
        }
        if (!IsValidU64(param.index)) {
            ERROR(Errors.IsValidU64, 'withdraw.param.index')
        }
        if (!IsValidDesription(param.remark)) {
            ERROR(Errors.IsValidDesription, 'withdraw.param.remark')
        }

        const for_obj = this.txb.pure.option('address', param.for_object ?  param.for_object : undefined);
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);

        if (param.for_guard) {
            return this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('withdraw_forGuard_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order), this.txb.object(param.withdraw_guard), 
                    this.txb.object(param.treasury), for_obj, this.txb.object(param.for_guard), this.txb.pure.u64(param.index), this.txb.pure.string(param.remark), 
                    this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })    
        } else {
            return this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('withdraw_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order), this.txb.object(param.withdraw_guard), 
                    this.txb.object(param.treasury), for_obj, this.txb.pure.u64(param.index), this.txb.pure.string(param.remark), 
                    this.txb.object(clock), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })    
        }      
    }

    set_buy_guard(guard?:GuardObject, passport?:PassportObject) {
        if (passport) {
            if (guard) {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('buy_guard_set_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })        
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('buy_guard_none_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })   
            }
        } else {
            if (guard) {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('buy_guard_set') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, guard), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })        
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('buy_guard_none') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })   
            }
        }
    }
    set_machine(machine?:MachineObject, passport?:PassportObject) {
        if (passport) {
            if (machine) {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('machine_set_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })        
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('machine_none_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })   
            }
        } else {
            if (machine) {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('machine_set') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })        
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('machine_none') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]
                })   
            }
        }
    }

    set_endpoint(endpoint?:string, passport?:PassportObject) {
        if (endpoint && !IsValidEndpoint(endpoint)) {
            ERROR(Errors.IsValidEndpoint);
        }

        let ep = this.txb.pure.option('string', endpoint ? endpoint : undefined);
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('endpoint_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), ep, Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })      
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('endpoint_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), ep, Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })      
        }   
    }

    publish(passport?:PassportObject) {
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('publish_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })   
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('publish') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })   
        }      
        
    }

    clone(new_token_type?:string, passport?:PassportObject) : ServiceObject  {
        if (passport) {
            return this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('clone_withpassport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type, new_token_type ? new_token_type : this.pay_token_type]
            })    
        } else {
            return this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('clone') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type, new_token_type ? new_token_type : this.pay_token_type]
            })    
        }  
    }

    set_customer_required(pubkey:string, customer_required: (BuyRequiredEnum | string)[], passport?:PassportObject) {
        if(customer_required.length > 0 && !pubkey) {
            ERROR(Errors.InvalidParam, 'set_customer_required')
        }
        if(pubkey.length > Service.MAX_PUBKEY_SIZE) {
            ERROR(Errors.InvalidParam, 'set_customer_required.pubkey')
        }
        if(customer_required.length > Service.MAX_REQUIRES_COUNT) {
            ERROR(Errors.InvalidParam, 'set_customer_required.customer_required')
        }
        if(!IsValidArray(customer_required, IsValidName)) {
            ERROR(Errors.IsValidArray, 'set_customer_required.customer_required')
        }

        let req = array_unique(customer_required) as string[];
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('required_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.pure.vector('string', req),
                    this.txb.pure.string(pubkey), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })         
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('required_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), 
                    this.txb.pure.vector('string', req),
                    this.txb.pure.string(pubkey), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })         
        }
    }

    remove_customer_required(passport?:PassportObject) {
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('required_none_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })  
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('required_none') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })  
        }       
    }

    change_required_pubkey(pubkey:string, passport?:PassportObject) {
        if (!pubkey) {
            ERROR(Errors.InvalidParam, 'pubkey')
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('required_pubkey_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(pubkey), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })    
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('required_pubkey_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(pubkey), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })    
        }     
    }
/*
    change_order_required_pubkey(order:OrderObject, pubkey:string, passport?:PassportObject) {
        if (!Protocol.IsValidObjects([order])) {
            ERROR(Errors.IsValidObjects, 'order')
        }
        if (!pubkey) {
            ERROR(Errors.InvalidParam, 'pubkey')
        }
        
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('order_pubkey_update_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order), this.txb.pure.string(pubkey), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })   
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('order_pubkey_update') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order), this.txb.pure.string(pubkey), 
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })   
        }    
    } */

    pause(pause:boolean, passport?:PassportObject) {
        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('pause_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(pause), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })     
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('pause') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(pause), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type]
            })     
        }    
    }

    refund_withArb(order:OrderObject, arb:ArbObject, arb_type:string) {
        if (!Protocol.IsValidObjects([order, arb])) {
            ERROR(Errors.IsValidObjects, 'refund_withArb.order or arb')
        }
        if (!IsValidTokenType(arb_type)) {
            ERROR(Errors.IsValidTokenType, 'refund_withArb.arb_type')
        }
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        this.txb.moveCall({
            target:Protocol.Instance().ServiceFn('refund_with_arb') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order), this.txb.object(arb), this.txb.object(clock)],
            typeArguments:[this.pay_token_type, arb_type]
            })     
    }

    refund(order:OrderObject, refund_guard?:GuardObject, passport?:PassportObject) {
        if (!Protocol.IsValidObjects([order])) {
            ERROR(Errors.IsValidObjects, 'refund.order')
        }
        if (refund_guard && !Protocol.IsValidObjects([refund_guard])) {
            ERROR(Errors.IsValidObjects, 'refund.refund_guard')
        }
        if (passport && !refund_guard) {
            ERROR(Errors.InvalidParam, 'refund.passport need refund_guard')
        }
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport && refund_guard) {
            this.txb.moveCall({
            target:Protocol.Instance().ServiceFn('refund_with_passport') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order), this.txb.object(refund_guard), 
                passport, this.txb.object(clock)],
            typeArguments:[this.pay_token_type]
            })               
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('refund') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order)],
                typeArguments:[this.pay_token_type]
            })            
        }
    }

    update_order_required_info(order:OrderObject, customer_info_crypto: Customer_RequiredInfo) {
        if (!customer_info_crypto.customer_pubkey || customer_info_crypto.customer_info_crypt.length === 0) {
            return 
        }

        if (!Protocol.IsValidObjects([order])) {
            ERROR(Errors.IsValidObjects, 'update_order_required_info.order')
        }
        
        this.txb.moveCall({
            target:Protocol.Instance().ServiceFn('order_required_info_update') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order), 
                this.txb.pure.string(customer_info_crypto.customer_pubkey), 
                this.txb.pure.string(customer_info_crypto.customer_info_crypt)],
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
            if (!Service.IsValidItemName(v.item)) bValid = false;
            if (!IsValidU64(v.max_price)) bValid = false;
            if (!IsValidU64(v.count)) bValid = false;
            if (names.includes(v.item)) bValid = false;
            names.push(v.item)
        })
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'buy_items invalid')
        }

        let name:string[] = []; let price:bigint[] = [];    let stock:bigint[] = []; let order;
        buy_items.forEach((b) => { name.push(b.item); price.push(b.max_price); stock.push(b.count)})
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            if (discount) {
                order = this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('dicount_buy_with_passport') as FnCallType,
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', name), 
                        this.txb.pure.vector('u64', price), this.txb.pure.vector('u64', stock), 
                        Protocol.TXB_OBJECT(this.txb, coin), Protocol.TXB_OBJECT(this.txb, discount), this.txb.object(clock)],                   
                    typeArguments:[this.pay_token_type]            
            })} else {
                order = this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('buy_with_passport') as FnCallType,
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', name), 
                        this.txb.pure.vector('u64', price), this.txb.pure.vector('u64', stock), 
                        Protocol.TXB_OBJECT(this.txb, coin)],
                    typeArguments:[this.pay_token_type]            
            })}             
        } else {
            if (discount) {
                order = this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('disoucnt_buy') as FnCallType,
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', name), 
                        this.txb.pure.vector('u64', price), 
                        this.txb.pure.vector('u64', stock), 
                        Protocol.TXB_OBJECT(this.txb, coin), 
                        Protocol.TXB_OBJECT(this.txb, discount), this.txb.object(clock)],                
                    typeArguments:[this.pay_token_type]            
            })} else {
                order = this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('buy') as FnCallType,
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', name), 
                        this.txb.pure.vector('u64', price), 
                        this.txb.pure.vector('u64', stock), 
                        Protocol.TXB_OBJECT(this.txb, coin)],
                    typeArguments:[this.pay_token_type]            
            })}           
        }

        if (customer_info_crypto) {
            this.update_order_required_info(order, customer_info_crypto);
        }

        if (machine) {
            return this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('order_create_with_machine') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order), Protocol.TXB_OBJECT(this.txb, machine)],
                typeArguments:[this.pay_token_type]            
            })        
        } else {
            return this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('order_create') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order)],
                typeArguments:[this.pay_token_type]            
            })  
        }
    }

    order_bind_machine(order:OrderObject, machine:MachineObject) {
        if (!Protocol.IsValidObjects([order, machine])) {
            ERROR(Errors.IsValidObjects, 'order & machine');
        }

        this.txb.moveCall({
            target:Protocol.Instance().ServiceFn('order_create_with_machine') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, order), Protocol.TXB_OBJECT(this.txb, machine)],
            typeArguments:[this.pay_token_type]            
        })    
    }

    add_treasury(treasury_token_type:string, treasury:TreasuryObject, passport?:PassportObject) {
        if (!Protocol.IsValidObjects([treasury])) {
            ERROR(Errors.IsValidObjects, 'add_treasury.treasury')
        }
        if (!IsValidTokenType(treasury_token_type)) {
            ERROR(Errors.IsValidTokenType, 'add_treasury.treasury_token_type')
        }

        if (passport) {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('treasury_add_with_passport') as FnCallType,
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(treasury), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type, treasury_token_type]            
            })                    
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().ServiceFn('treasury_add') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(treasury), Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments:[this.pay_token_type, treasury_token_type]            
            })                    
        }
    }

    remove_treasury(treasury:string[], removeall?:boolean, passport?:PassportObject) {
        if (!removeall && treasury.length === 0) return ;

        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('treasury_remove_all_with_passport') as FnCallType,
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]            
                })    
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('treasury_remove_with_passport') as FnCallType,
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', treasury), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]            
                })    
            }
        } else {
            if (removeall) {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('treasury_remove_all') as FnCallType,
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]            
                })    
            } else {
                this.txb.moveCall({
                    target:Protocol.Instance().ServiceFn('treasury_remove') as FnCallType,
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', treasury), Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments:[this.pay_token_type]            
                })    
            }
        }
    }

    change_permission(new_permission:PermissionObject) {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects)
        }

        this.txb.moveCall({
            target:Protocol.Instance().ServiceFn('permission_set') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission), Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments:[this.pay_token_type]            
        })    
        this.permission = new_permission
    }

    set_order_agent(order:OrderObject, agent:string[], orderProgress?:ProgressObject) {
        Service.SetOrderAgent(this.txb, this.pay_token_type, order, agent, orderProgress)
    }
    change_order_payer(order:OrderObject, new_addr:string) {
        Service.ChangeOrderPayer(this.txb, this.pay_token_type, order, new_addr)
    }
    static MAX_DISCOUNT_COUNT_ONCE = 200;
    static MAX_DISCOUNT_RECEIVER_COUNT = 20;
    static MAX_GUARD_COUNT = 16;
    static MAX_REPOSITORY_COUNT = 32;
    static MAX_ITEM_NAME_LENGTH = 256;
    static MAX_TREASURY_COUNT= 8;
    static MAX_ORDER_AGENT_COUNT = 8;
    static MAX_ORDER_ARBS_COUNT = 8;
    static MAX_ARBITRATION_COUNT = 8;
    static MAX_REQUIRES_COUNT = 16;
    static MAX_PUBKEY_SIZE = 3000;

    static IsValidItemName(name:string) : boolean {
        if (!name) return false;
        return new TextEncoder().encode(name).length <= Service.MAX_ITEM_NAME_LENGTH;
    }

    static parseObjectType = (chain_type:string | undefined | null) : string =>  {
        return parseObjectType(chain_type, 'service::Service<')
    }

    static parseOrderObjectType = (chain_type:string | undefined | null) : string =>  {
        return parseObjectType(chain_type, 'order::Order<')
    }

    static endpoint = (service_endpoint:string, item_endpoint:string, item_name:string) => {
        if (item_endpoint) {
            return item_endpoint
        } else if  (service_endpoint) {
            return service_endpoint + '/sales/' + encodeURI(item_name);
        }
    }

    static DiscountObjects = (owner:string, handleDiscountObject:handleDiscountObject) => {
        Protocol.Client().getOwnedObjects({owner:owner, 
            filter:{MoveModule:{module:'order', package:Protocol.Instance().Package('wowok')}}, 
            options:{showContent:true, showType:true}}).then((res) => {
            handleDiscountObject(owner, res.data.map((v)=>v.data));
        }).catch((e) => {
            console.log(e);
        })       
    }

    // The agent has the same order operation power as the order payer; The agent can only be set by the order payer.
    static SetOrderAgent = (txb:TransactionBlock, order_token_type:string, order:OrderObject, agent:string[], order_progress?:ProgressObject) => {
        if (!IsValidTokenType(order_token_type)) {
            ERROR(Errors.IsValidTokenType, 'SetOrderAgent.order_token_type');
        }
        if (!Protocol.IsValidObjects([order])) {
            ERROR(Errors.IsValidObjects, 'SetOrderAgent.order')
        }
        if (!IsValidArray(agent, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'SetOrderAgent.agent')
        }
        if (array_unique(agent).length > Service.MAX_ORDER_AGENT_COUNT) {
            ERROR(Errors.Fail, 'SetOrderAgent.agent count')
        }

        if (order_progress) {
            txb.moveCall({
                target:Protocol.Instance().OrderFn('agent_set_with_progress') as FnCallType,
                arguments: [txb.object(order), txb.pure.vector('address', array_unique(agent)), txb.object(order_progress)],
                typeArguments:[order_token_type]            
            })  
        } else {
            txb.moveCall({
                target:Protocol.Instance().OrderFn('agent_set') as FnCallType,
                arguments: [txb.object(order), txb.pure.vector('address', array_unique(agent))],
                typeArguments:[order_token_type]            
            })  
        }
    }
    static ChangeOrderPayer = (txb:TransactionBlock, order_token_type:string, order:OrderObject, new_addr:string) => {
        if (!IsValidTokenType(order_token_type)) {
            ERROR(Errors.IsValidTokenType, 'ChangeOrderPayer.order_token_type');
        }
        if (!Protocol.IsValidObjects([order])) {
            ERROR(Errors.IsValidObjects, 'ChangeOrderPayer.order')
        }
        if (!IsValidAddress(new_addr)) {
            ERROR(Errors.IsValidAddress, 'ChangeOrderPayer.new_addr')
        }
        txb.moveCall({
            target:Protocol.Instance().OrderFn('payer_change') as FnCallType,
            arguments: [txb.object(order), txb.pure.address(new_addr)],
            typeArguments:[order_token_type]            
        })  
    }
}
