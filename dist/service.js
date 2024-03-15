"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.change_permission = exports.order_bind_service_machine = exports.buy = exports.update_order_required_info = exports.customer_refund = exports.service_pause = exports.service_change_order_required_pubkey = exports.service_change_required_pubkey = exports.service_remove_customer_required = exports.service_set_customer_required = exports.service_clone = exports.service_publish = exports.service_set_endpoint = exports.service_set_machine = exports.service_set_buy_guard = exports.service_withdraw = exports.service_discount_transfer = exports.MAX_DISCOUNT_COUNT_ONCE = exports.Service_Discount_Type = exports.service_remove_sale = exports.service_add_sale = exports.service_remove_refund_guards = exports.service_add_refund_guards = exports.service_remove_withdraw_guards = exports.service_add_withdraw_guards = exports.service_repository_remove = exports.service_repository_add = exports.service_set_payee = exports.service_reduce_stock = exports.service_add_stock = exports.service_set_stock = exports.service_set_price = exports.service_set_description = exports.destroy = exports.launch = exports.service = void 0;
const bcs_1 = require("@mysten/bcs");
const protocol_1 = require("./protocol");
const util_1 = require("./util");
function service(pay_type, txb, permission, description, payee_address, endpoint_url, passport) {
    if (endpoint_url && endpoint_url.length > protocol_1.MAX_ENDPOINT_LENGTH)
        return undefined;
    let endpoint = endpoint_url ? txb.pure(util_1.BCS_CONVERT.ser_option_string(endpoint_url)) : txb.pure([], bcs_1.BCS.U8);
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('new_with_passport'),
            arguments: [passport, txb.pure((0, protocol_1.description_data)(description)), txb.pure(payee_address, bcs_1.BCS.ADDRESS), endpoint, permission],
            typeArguments: [pay_type],
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('new'),
            arguments: [txb.pure((0, protocol_1.description_data)(description)), txb.pure(payee_address, bcs_1.BCS.ADDRESS), endpoint, permission],
            typeArguments: [pay_type],
        });
    }
}
exports.service = service;
function launch(pay_type, txb, service) {
    return txb.moveCall({
        target: protocol_1.PROTOCOL.ServiceFn('create'),
        arguments: [service],
        typeArguments: [pay_type]
    });
}
exports.launch = launch;
function destroy(pay_type, txb, service) {
    return txb.moveCall({
        target: protocol_1.PROTOCOL.ServiceFn('destroy'),
        arguments: [service],
        typeArguments: [pay_type]
    });
}
exports.destroy = destroy;
function service_set_description(pay_type, txb, service, permission, description, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('description_set_with_passport'),
            arguments: [passport, service, txb.pure((0, protocol_1.description_data)(description)), permission],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('description_set'),
            arguments: [service, txb.pure((0, protocol_1.description_data)(description)), permission],
            typeArguments: [pay_type]
        });
    }
}
exports.service_set_description = service_set_description;
function service_set_price(pay_type, txb, service, permission, item, price, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('price_set_with_passport'),
            arguments: [passport, service, txb.pure(item), txb.pure(price, bcs_1.BCS.U64), permission],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('price_set'),
            arguments: [service, txb.pure(item), txb.pure(price, bcs_1.BCS.U64), permission],
            typeArguments: [pay_type]
        });
    }
}
exports.service_set_price = service_set_price;
function service_set_stock(pay_type, txb, service, permission, item, stock, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('stock_set_with_passport'),
            arguments: [passport, service, txb.pure(item), txb.pure(stock, bcs_1.BCS.U64), permission],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('stock_set'),
            arguments: [service, txb.pure(item), txb.pure(stock, bcs_1.BCS.U64), permission],
            typeArguments: [pay_type]
        });
    }
}
exports.service_set_stock = service_set_stock;
function service_add_stock(pay_type, txb, service, permission, item, stock_add, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('stock_add_with_passport'),
            arguments: [passport, service, txb.pure(item), txb.pure(stock_add, bcs_1.BCS.U64), permission],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('stock_add'),
            arguments: [service, txb.pure(item), txb.pure(stock_add, bcs_1.BCS.U64), permission],
            typeArguments: [pay_type]
        });
    }
}
exports.service_add_stock = service_add_stock;
function service_reduce_stock(pay_type, txb, service, permission, item, stock_reduce, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('stock_reduce_with_passport'),
            arguments: [passport, service, txb.pure(item), txb.pure(stock_reduce, bcs_1.BCS.U64), permission],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('stock_reduce'),
            arguments: [service, txb.pure(item), txb.pure(stock_reduce, bcs_1.BCS.U64), permission],
            typeArguments: [pay_type]
        });
    }
}
exports.service_reduce_stock = service_reduce_stock;
function service_set_payee(pay_type, txb, service, permission, payee, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('payee_set_with_passport'),
            arguments: [passport, service, txb.pure(payee, bcs_1.BCS.ADDRESS), permission],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('payee_set'),
            arguments: [service, txb.pure(payee, bcs_1.BCS.ADDRESS), permission],
            typeArguments: [pay_type]
        });
    }
}
exports.service_set_payee = service_set_payee;
function service_repository_add(pay_type, txb, service, permission, repository, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('repository_add_with_passport'),
            arguments: [service, repository, permission],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('repository_add'),
            arguments: [service, repository, permission],
            typeArguments: [pay_type]
        });
    }
}
exports.service_repository_add = service_repository_add;
function service_repository_remove(pay_type, txb, service, permission, repository_address, removeall, passport) {
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('repository_remove_all_with_passport'),
                arguments: [passport, service, permission],
                typeArguments: [pay_type]
            });
        }
        else {
            repository_address.forEach((rep_addr) => {
                txb.moveCall({
                    target: protocol_1.PROTOCOL.ServiceFn('repository_remove_with_passport'),
                    arguments: [passport, service, txb.pure(rep_addr, bcs_1.BCS.ADDRESS), permission],
                    typeArguments: [pay_type]
                });
            });
        }
    }
    else {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('repository_remove_all'),
                arguments: [service, permission],
                typeArguments: [pay_type]
            });
        }
        else {
            repository_address.forEach((rep_addr) => {
                txb.moveCall({
                    target: protocol_1.PROTOCOL.ServiceFn('repository_remove'),
                    arguments: [service, txb.pure(rep_addr, bcs_1.BCS.ADDRESS), permission],
                    typeArguments: [pay_type]
                });
            });
        }
    }
}
exports.service_repository_remove = service_repository_remove;
function service_add_withdraw_guards(pay_type, txb, service, permission, guards, passport) {
    guards.forEach((guard) => {
        let arg = guard.guard;
        if (typeof arg == "string") {
            arg = txb.object(guard.guard);
        }
        if (passport) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('withdraw_guard_add_with_passport'),
                arguments: [passport, service, arg, txb.pure(guard.percent, bcs_1.BCS.U8), permission],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('withdraw_guard_add'),
                arguments: [service, arg, txb.pure(guard.percent, bcs_1.BCS.U8), permission],
                typeArguments: [pay_type]
            });
        }
    });
}
exports.service_add_withdraw_guards = service_add_withdraw_guards;
function service_remove_withdraw_guards(pay_type, txb, service, permission, guard_address, passport) {
    guard_address.forEach((guard) => {
        if (passport) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('withdraw_guard_remove_with_passport'),
                arguments: [passport, service, txb.pure(guard, bcs_1.BCS.ADDRESS), permission],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('withdraw_guard_remove'),
                arguments: [service, txb.pure(guard, bcs_1.BCS.ADDRESS), permission],
                typeArguments: [pay_type]
            });
        }
    });
}
exports.service_remove_withdraw_guards = service_remove_withdraw_guards;
function service_add_refund_guards(pay_type, txb, service, permission, guards, passport) {
    guards.forEach((guard) => {
        let arg = guard.guard;
        if (typeof arg == "string") {
            arg = txb.object(guard.guard);
        }
        if (passport) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('refund_guard_add_with_passport'),
                arguments: [passport, service, arg, txb.pure(guard.percent, bcs_1.BCS.U8), permission],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('refund_guard_add'),
                arguments: [service, arg, txb.pure(guard.percent, bcs_1.BCS.U8), permission],
                typeArguments: [pay_type]
            });
        }
    });
}
exports.service_add_refund_guards = service_add_refund_guards;
function service_remove_refund_guards(pay_type, txb, service, permission, guard_address) {
    guard_address.forEach((guard) => {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('refund_guard_remove'),
            arguments: [service, txb.pure(guard, bcs_1.BCS.ADDRESS), permission],
            typeArguments: [pay_type]
        });
    });
}
exports.service_remove_refund_guards = service_remove_refund_guards;
function service_add_sale(pay_type, txb, service, permission, sales, passport) {
    if (passport) {
        sales.forEach((sale) => txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('sales_add_with_passport'),
            arguments: [passport, service, txb.pure((0, protocol_1.description_data)(sale.item)), txb.pure(sale.price, bcs_1.BCS.U64), txb.pure(sale.stock, bcs_1.BCS.U64), permission],
            typeArguments: [pay_type]
        }));
    }
    else {
        sales.forEach((sale) => txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('sales_add'),
            arguments: [service, txb.pure((0, protocol_1.description_data)(sale.item)), txb.pure(sale.price, bcs_1.BCS.U64), txb.pure(sale.stock, bcs_1.BCS.U64), permission],
            typeArguments: [pay_type]
        }));
    }
}
exports.service_add_sale = service_add_sale;
function service_remove_sale(pay_type, txb, service, permission, sales, passport) {
    if (passport) {
        sales.forEach((sale) => txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('sales_remove_with_passport'),
            arguments: [passport, service, txb.pure((0, protocol_1.description_data)(sale)), permission],
            typeArguments: [pay_type]
        }));
    }
    else {
        sales.forEach((sale) => txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('sales_remove'),
            arguments: [service, txb.pure((0, protocol_1.description_data)(sale)), permission],
            typeArguments: [pay_type]
        }));
    }
}
exports.service_remove_sale = service_remove_sale;
var Service_Discount_Type;
(function (Service_Discount_Type) {
    Service_Discount_Type[Service_Discount_Type["ratio"] = 0] = "ratio";
    Service_Discount_Type[Service_Discount_Type["minus"] = 1] = "minus";
})(Service_Discount_Type || (exports.Service_Discount_Type = Service_Discount_Type = {}));
const MAX_DISCOUNT_TRANSFER_COUNT = 200;
const MAX_DISCOUNT_RECEIVER_COUNT = 100;
exports.MAX_DISCOUNT_COUNT_ONCE = 100;
function service_discount_transfer(pay_type, txb, service, permission, discount_dispatch, passport) {
    if (discount_dispatch.length > MAX_DISCOUNT_RECEIVER_COUNT)
        return undefined;
    for (let i = 0; i < discount_dispatch.length; i++) {
        if (discount_dispatch[i].count > MAX_DISCOUNT_TRANSFER_COUNT) {
            return undefined;
        }
        if (discount_dispatch[i].discount.type == Service_Discount_Type.ratio) {
            if (discount_dispatch[i].discount.off > 100)
                return undefined;
        }
    }
    discount_dispatch.forEach((discount) => {
        if (discount.discount.duration_minutes == 0)
            return;
        if (discount.count > exports.MAX_DISCOUNT_COUNT_ONCE || discount.count == 0)
            return;
        let price_greater = txb.pure([], bcs_1.BCS.U8);
        if (discount.discount?.price_greater) {
            price_greater = txb.pure(util_1.BCS_CONVERT.ser_option_u64(discount.discount.price_greater));
        }
        let time_start = txb.pure([], bcs_1.BCS.U8);
        if (discount.discount.time_start) {
            time_start = txb.pure(util_1.BCS_CONVERT.ser_option_u64(discount.discount.time_start));
        }
        if (passport) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('dicscount_create_with_passport'),
                arguments: [passport, service, txb.pure((0, protocol_1.name_data)(discount.discount.name)), txb.pure(discount.discount.type, bcs_1.BCS.U8), txb.pure(discount.discount.off, bcs_1.BCS.U64), price_greater,
                    time_start, txb.pure(discount.discount.duration_minutes, bcs_1.BCS.U64), txb.pure(discount.count, bcs_1.BCS.U64), permission, txb.pure(discount.receiver, bcs_1.BCS.ADDRESS), txb.object(protocol_1.CLOCK_OBJECT)],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('dicscount_create'),
                arguments: [service, txb.pure((0, protocol_1.name_data)(discount.discount.name)), txb.pure(discount.discount.type, bcs_1.BCS.U8), txb.pure(discount.discount.off, bcs_1.BCS.U64), price_greater,
                    time_start, txb.pure(discount.discount.duration_minutes, bcs_1.BCS.U64), txb.pure(discount.count, bcs_1.BCS.U64), permission, txb.pure(discount.receiver, bcs_1.BCS.ADDRESS), txb.object(protocol_1.CLOCK_OBJECT)],
                typeArguments: [pay_type]
            });
        }
    });
}
exports.service_discount_transfer = service_discount_transfer;
// 同时支持withdraw guard和permission guard
function service_withdraw(pay_type, txb, service, permission, order, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('withdraw_with_passport'),
            arguments: [passport, service, order, passport, permission],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('withdraw'),
            arguments: [service, order, permission],
            typeArguments: [pay_type]
        });
    }
}
exports.service_withdraw = service_withdraw;
function service_set_buy_guard(pay_type, txb, service, permission, guard, passport) {
    if (passport) {
        if (guard) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('buy_guard_set_with_passport'),
                arguments: [passport, service, guard, permission],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('buy_guard_none_with_passport'),
                arguments: [passport, service, permission],
                typeArguments: [pay_type]
            });
        }
    }
    else {
        if (guard) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('buy_guard_set'),
                arguments: [service, guard, permission],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('buy_guard_none'),
                arguments: [service, permission],
                typeArguments: [pay_type]
            });
        }
    }
}
exports.service_set_buy_guard = service_set_buy_guard;
function service_set_machine(pay_type, txb, service, permission, machine, passport) {
    if (passport) {
        if (machine) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('machine_set_with_passport'),
                arguments: [passport, service, machine, permission],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('machine_none_with_passport'),
                arguments: [passport, service, permission],
                typeArguments: [pay_type]
            });
        }
    }
    else {
        if (machine) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('machine_set'),
                arguments: [service, machine, permission],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('machine_none'),
                arguments: [service, permission],
                typeArguments: [pay_type]
            });
        }
    }
}
exports.service_set_machine = service_set_machine;
function service_set_endpoint(pay_type, txb, service, permission, endpoint_url, passport) {
    if (endpoint_url && endpoint_url.length > protocol_1.MAX_ENDPOINT_LENGTH)
        return undefined;
    let endpoint = endpoint_url ? txb.pure(endpoint_url) : txb.pure([], bcs_1.BCS.U8);
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('endpoint_set_with_passport'),
            arguments: [passport, service, endpoint, permission],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('endpoint_set'),
            arguments: [service, endpoint, permission],
            typeArguments: [pay_type]
        });
    }
}
exports.service_set_endpoint = service_set_endpoint;
function service_publish(pay_type, txb, service, permission, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('publish_with_passport'),
            arguments: [passport, service, permission],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('publish'),
            arguments: [service, permission],
            typeArguments: [pay_type]
        });
    }
}
exports.service_publish = service_publish;
function service_clone(pay_type, txb, service, permission, passport) {
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('clone_withpassport'),
            arguments: [passport, service, permission],
            typeArguments: [pay_type]
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('clone'),
            arguments: [service, permission],
            typeArguments: [pay_type]
        });
    }
}
exports.service_clone = service_clone;
function service_set_customer_required(pay_type, txb, service, permission, service_pubkey, customer_required, passport) {
    if (service_pubkey.length == 0 || customer_required.length == 0)
        return undefined;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('required_set_with_passport'),
            arguments: [passport, service, txb.pure(customer_required, 'vector<string>'), txb.pure(service_pubkey, 'vector<u8>'), permission],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('required_set'),
            arguments: [service, txb.pure(customer_required, 'vector<string>'), txb.pure(service_pubkey, 'vector<u8>'), permission],
            typeArguments: [pay_type]
        });
    }
}
exports.service_set_customer_required = service_set_customer_required;
function service_remove_customer_required(pay_type, txb, service, permission, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('required_none_with_passport'),
            arguments: [passport, service, permission],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('required_none'),
            arguments: [service, permission],
            typeArguments: [pay_type]
        });
    }
}
exports.service_remove_customer_required = service_remove_customer_required;
function service_change_required_pubkey(pay_type, txb, service, permission, service_pubkey, passport) {
    if (!service_pubkey)
        return undefined;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('required_pubkey_set_with_passport'),
            arguments: [passport, service, txb.pure(service_pubkey, 'vector<u8>'), permission],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('required_pubkey_set'),
            arguments: [service, txb.pure(service_pubkey, 'vector<u8>'), permission],
            typeArguments: [pay_type]
        });
    }
}
exports.service_change_required_pubkey = service_change_required_pubkey;
function service_change_order_required_pubkey(pay_type, txb, service, permission, order, service_pubkey, passport) {
    if (!service_pubkey)
        return undefined;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('order_pubkey_update_with_passport'),
            arguments: [passport, service, order, txb.pure(service_pubkey, 'vector<u8>'), permission],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('order_pubkey_update'),
            arguments: [service, order, txb.pure(service_pubkey, 'vector<u8>'), permission],
            typeArguments: [pay_type]
        });
    }
}
exports.service_change_order_required_pubkey = service_change_order_required_pubkey;
function service_pause(pay_type, txb, service, permission, pause, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('pause_with_passport'),
            arguments: [passport, service, txb.pure(pause, bcs_1.BCS.BOOL), permission],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('pause'),
            arguments: [service, txb.pure(pause, bcs_1.BCS.BOOL), permission],
            typeArguments: [pay_type]
        });
    }
}
exports.service_pause = service_pause;
function customer_refund(pay_type, txb, service, order, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('refund_with_passport'),
            arguments: [service, order, passport],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('refund'),
            arguments: [service, order],
            typeArguments: [pay_type]
        });
    }
}
exports.customer_refund = customer_refund;
function update_order_required_info(pay_type, txb, service, order, customer_info_crypto) {
    txb.moveCall({
        target: protocol_1.PROTOCOL.ServiceFn('order_required_info_update'),
        arguments: [service, order, txb.pure(customer_info_crypto.service_pubkey, 'vector<u8>'),
            txb.pure(customer_info_crypto.customer_pubkey, 'vector<u8>'),
            txb.pure(customer_info_crypto.customer_info_crypt, 'vector<string>')],
        typeArguments: [pay_type]
    });
}
exports.update_order_required_info = update_order_required_info;
function buy(pay_type, txb, service, buy_items, coin, discount, service_machine, customer_info_crypto, passport) {
    if (buy_items.length == 0)
        return undefined;
    let i = [];
    let c = [];
    let order;
    buy_items.forEach((item) => { i.push(item.item); c.push(item.count); });
    if (passport) {
        if (discount) {
            order = txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('dicount_buy_with_passport'),
                arguments: [passport, service, txb.pure(util_1.BCS_CONVERT.ser_vector_string(i)),
                    txb.pure(util_1.BCS_CONVERT.ser_vector_u64(c)), coin, discount, txb.object(protocol_1.CLOCK_OBJECT)], typeArguments: [pay_type]
            });
        }
        else {
            order = txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('buy_with_passport'),
                arguments: [passport, service, txb.pure(util_1.BCS_CONVERT.ser_vector_string(i)),
                    txb.pure(util_1.BCS_CONVERT.ser_vector_u64(c)), coin],
                typeArguments: [pay_type]
            });
        }
    }
    else {
        if (discount) {
            order = txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('disoucnt_buy'),
                arguments: [service, txb.pure(util_1.BCS_CONVERT.ser_vector_string(i)),
                    txb.pure(util_1.BCS_CONVERT.ser_vector_u64(c)), coin, discount, txb.object(protocol_1.CLOCK_OBJECT)],
                typeArguments: [pay_type]
            });
        }
        else {
            order = txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('buy'),
                arguments: [service, txb.pure(util_1.BCS_CONVERT.ser_vector_string(i)),
                    txb.pure(util_1.BCS_CONVERT.ser_vector_u64(c)), coin],
                typeArguments: [pay_type]
            });
        }
    }
    if (customer_info_crypto) {
        update_order_required_info(pay_type, txb, service, order, customer_info_crypto);
    }
    if (service_machine) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('order_create_with_machine'),
            arguments: [service, order, service_machine],
            typeArguments: [pay_type]
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('order_create'),
            arguments: [service, order],
            typeArguments: [pay_type]
        });
    }
}
exports.buy = buy;
function order_bind_service_machine(pay_type, txb, service, order, service_machine) {
    txb.moveCall({
        target: protocol_1.PROTOCOL.ServiceFn('order_create_with_machine'),
        arguments: [service, order, service_machine],
        typeArguments: [pay_type]
    });
}
exports.order_bind_service_machine = order_bind_service_machine;
function change_permission(pay_type, txb, service, old_permission, new_permission) {
    txb.moveCall({
        target: protocol_1.PROTOCOL.ServiceFn('permission_set'),
        arguments: [service, old_permission, new_permission],
        typeArguments: [pay_type]
    });
}
exports.change_permission = change_permission;
