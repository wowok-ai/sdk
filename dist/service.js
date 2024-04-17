"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.change_permission = exports.order_bind_service_machine = exports.buy = exports.update_order_required_info = exports.customer_refund = exports.service_pause = exports.service_change_order_required_pubkey = exports.service_change_required_pubkey = exports.service_remove_customer_required = exports.service_set_customer_required = exports.BuyRequiredEnum = exports.service_clone = exports.service_publish = exports.service_set_endpoint = exports.service_set_machine = exports.service_set_buy_guard = exports.service_withdraw = exports.service_discount_transfer = exports.MAX_DISCOUNT_RECEIVER_COUNT = exports.MAX_DISCOUNT_COUNT_ONCE = exports.Service_Discount_Type = exports.service_remove_sales = exports.service_add_sale = exports.is_valid_sale = exports.service_remove_refund_guards = exports.service_add_refund_guards = exports.service_remove_withdraw_guards = exports.service_add_withdraw_guards = exports.service_repository_remove = exports.service_repository_add = exports.service_set_payee = exports.service_reduce_stock = exports.service_add_stock = exports.service_set_stock = exports.service_set_price = exports.service_set_description = exports.destroy = exports.launch = exports.service = void 0;
const bcs_1 = require("@mysten/bcs");
const utils_1 = require("./utils");
const protocol_1 = require("./protocol");
function service(pay_type, txb, permission, description, payee_address, endpoint, passport) {
    if (!(0, protocol_1.IsValidObjects)([permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (!(0, protocol_1.IsValidDesription)(description))
        return false;
    if (!(0, protocol_1.IsValidAddress)(payee_address))
        return false;
    if (endpoint && !(0, protocol_1.IsValidEndpoint)(endpoint))
        return false;
    let ep = endpoint ? txb.pure(utils_1.BCS_CONVERT.ser_option_string(endpoint)) : (0, protocol_1.OptionNone)(txb);
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('new_with_passport'),
            arguments: [passport, txb.pure(description), txb.pure(payee_address, bcs_1.BCS.ADDRESS), ep, (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type],
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('new'),
            arguments: [txb.pure(description), txb.pure(payee_address, bcs_1.BCS.ADDRESS), ep, (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type],
        });
    }
}
exports.service = service;
function launch(pay_type, txb, service) {
    if (!(0, protocol_1.IsValidObjects)([service]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    return txb.moveCall({
        target: protocol_1.PROTOCOL.ServiceFn('create'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, service)],
        typeArguments: [pay_type]
    });
}
exports.launch = launch;
function destroy(pay_type, txb, service) {
    if (!(0, protocol_1.IsValidObjects)([service]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.ServiceFn('destroy'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, service)],
        typeArguments: [pay_type]
    });
    return true;
}
exports.destroy = destroy;
function service_set_description(pay_type, txb, service, permission, description, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (!(0, protocol_1.IsValidDesription)(description))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('description_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(description), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('description_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(description), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    return true;
}
exports.service_set_description = service_set_description;
function service_set_price(pay_type, txb, service, permission, item, price, bNotFoundAssert = true, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (!(0, protocol_1.IsValidInt)(price) || !(0, protocol_1.IsValidName)(item))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('price_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(item), txb.pure(price, bcs_1.BCS.U64),
                txb.pure(bNotFoundAssert, bcs_1.BCS.BOOL), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('price_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(item), txb.pure(price, bcs_1.BCS.U64),
                txb.pure(bNotFoundAssert, bcs_1.BCS.BOOL), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    return true;
}
exports.service_set_price = service_set_price;
function service_set_stock(pay_type, txb, service, permission, item, stock, bNotFoundAssert = true, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (!(0, protocol_1.IsValidName)(item) || !(0, protocol_1.IsValidInt)(stock))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('stock_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(item), txb.pure(stock, bcs_1.BCS.U64),
                txb.pure(bNotFoundAssert, bcs_1.BCS.BOOL), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('stock_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(item), txb.pure(stock, bcs_1.BCS.U64),
                txb.pure(bNotFoundAssert, bcs_1.BCS.BOOL), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    return true;
}
exports.service_set_stock = service_set_stock;
function service_add_stock(pay_type, txb, service, permission, item, stock_add, bNotFoundAssert = true, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (!(0, protocol_1.IsValidName)(item) || !(0, protocol_1.IsValidUint)(stock_add))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('stock_add_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(item), txb.pure(stock_add, bcs_1.BCS.U64),
                txb.pure(bNotFoundAssert, bcs_1.BCS.BOOL), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('stock_add'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(item), txb.pure(stock_add, bcs_1.BCS.U64),
                txb.pure(bNotFoundAssert, bcs_1.BCS.BOOL), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    return true;
}
exports.service_add_stock = service_add_stock;
function service_reduce_stock(pay_type, txb, service, permission, item, stock_reduce, bNotFoundAssert = true, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (!(0, protocol_1.IsValidName)(item) || !(0, protocol_1.IsValidUint)(stock_reduce))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('stock_reduce_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(item), txb.pure(stock_reduce, bcs_1.BCS.U64),
                txb.pure(bNotFoundAssert, bcs_1.BCS.BOOL), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('stock_reduce'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(item), txb.pure(stock_reduce, bcs_1.BCS.U64),
                txb.pure(bNotFoundAssert, bcs_1.BCS.BOOL), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    return true;
}
exports.service_reduce_stock = service_reduce_stock;
function service_set_payee(pay_type, txb, service, permission, payee, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (!(0, protocol_1.IsValidAddress)(payee))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('payee_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(payee, bcs_1.BCS.ADDRESS), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('payee_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(payee, bcs_1.BCS.ADDRESS), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    return true;
}
exports.service_set_payee = service_set_payee;
function service_repository_add(pay_type, txb, service, permission, repository, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission, repository]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('repository_add_with_passport'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, repository), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('repository_add'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, repository), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    return true;
}
exports.service_repository_add = service_repository_add;
function service_repository_remove(pay_type, txb, service, permission, repository_address, removeall, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (!removeall && !repository_address)
        return false;
    if (repository_address && !(0, protocol_1.IsValidArray)(repository_address, protocol_1.IsValidAddress))
        return false;
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('repository_remove_all_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('repository_remove_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), txb.pure((0, utils_1.array_unique)(repository_address), 'vector<address>'), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
    }
    else {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('repository_remove_all'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('repository_remove'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), txb.pure((0, utils_1.array_unique)(repository_address), 'vector<address>'), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
    }
    return true;
}
exports.service_repository_remove = service_repository_remove;
function service_add_withdraw_guards(pay_type, txb, service, permission, guards, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    let bValid = true;
    guards.forEach((v) => {
        if (!(0, protocol_1.IsValidObjects)([v.guard]))
            return false;
        if (!(0, protocol_1.IsValidPercent)(v.percent))
            return false;
    });
    if (!bValid)
        return false;
    guards.forEach((guard) => {
        if (passport) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('withdraw_guard_add_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, guard.guard), txb.pure(guard.percent, bcs_1.BCS.U8), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('withdraw_guard_add'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, guard.guard), txb.pure(guard.percent, bcs_1.BCS.U8), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
    });
    return true;
}
exports.service_add_withdraw_guards = service_add_withdraw_guards;
function service_remove_withdraw_guards(pay_type, txb, service, permission, guard_address, removeall, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (!removeall && !guard_address)
        return false;
    if (guard_address && !(0, protocol_1.IsValidArray)(guard_address, protocol_1.IsValidAddress))
        return false;
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('withdraw_guard_remove_all_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('withdraw_guard_remove_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), txb.pure((0, utils_1.array_unique)(guard_address), 'vector<address>'), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
    }
    else {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('withdraw_guard_remove_all'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('withdraw_guard_remove'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), txb.pure((0, utils_1.array_unique)(guard_address), 'vector<address>'), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
    }
    return true;
}
exports.service_remove_withdraw_guards = service_remove_withdraw_guards;
function service_add_refund_guards(pay_type, txb, service, permission, guards, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    let bValid = true;
    guards.forEach((v) => {
        if (!(0, protocol_1.IsValidObjects)([v.guard]))
            return false;
        if (!(0, protocol_1.IsValidPercent)(v.percent))
            return false;
    });
    if (!bValid)
        return false;
    guards.forEach((guard) => {
        if (passport) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('refund_guard_add_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, guard.guard), txb.pure(guard.percent, bcs_1.BCS.U8), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('refund_guard_add'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, guard.guard), txb.pure(guard.percent, bcs_1.BCS.U8), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
    });
    return true;
}
exports.service_add_refund_guards = service_add_refund_guards;
function service_remove_refund_guards(pay_type, txb, service, permission, guard_address, removeall, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (!guard_address && !removeall)
        return false;
    if (guard_address && !(0, protocol_1.IsValidArray)(guard_address, protocol_1.IsValidAddress))
        return false;
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('refund_guard_remove_all_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('refund_guard_remove_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), txb.pure((0, utils_1.array_unique)(guard_address), 'vector<address>'), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
    }
    else {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('refund_guard_remove_all'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('refund_guard_remove'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), txb.pure((0, utils_1.array_unique)(guard_address), 'vector<address>'), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
    }
    return true;
}
exports.service_remove_refund_guards = service_remove_refund_guards;
function is_valid_sale(sales) {
    let bValid = true;
    let names = [];
    sales.forEach((v) => {
        if (!(0, protocol_1.IsValidName)(v.item))
            bValid = false;
        if (!(0, protocol_1.IsValidInt)(v.price))
            bValid = false;
        if (!(0, protocol_1.IsValidUint)(v.stock))
            bValid = false;
        if (names.includes(v.item))
            bValid = false;
        names.push(v.item);
    });
    return bValid;
}
exports.is_valid_sale = is_valid_sale;
function service_add_sale(pay_type, txb, service, permission, sales, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (!sales)
        return false;
    let bValid = is_valid_sale(sales);
    if (!bValid)
        return false;
    let names = [];
    let price = [];
    let stock = [];
    sales.forEach((s) => {
        names.push(s.item);
        price.push(s.price);
        stock.push(s.stock);
    });
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('sales_add_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(utils_1.BCS_CONVERT.ser_vector_string(names)),
                txb.pure(utils_1.BCS_CONVERT.ser_vector_u64(price)), txb.pure(utils_1.BCS_CONVERT.ser_vector_u64(stock)), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('sales_add'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(utils_1.BCS_CONVERT.ser_vector_string(names)),
                txb.pure(utils_1.BCS_CONVERT.ser_vector_u64(price)), txb.pure(utils_1.BCS_CONVERT.ser_vector_u64(stock)), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    return true;
}
exports.service_add_sale = service_add_sale;
function service_remove_sales(pay_type, txb, service, permission, sales, removeall, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (!removeall && !sales)
        return false;
    if (sales && !(0, protocol_1.IsValidArray)(sales, protocol_1.IsValidName))
        return false;
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('sales_remove_all_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('sales_remove_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(utils_1.BCS_CONVERT.ser_vector_string((0, utils_1.array_unique)(sales))), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
    }
    else {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('sales_remove_all'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('sales_remove'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(utils_1.BCS_CONVERT.ser_vector_string((0, utils_1.array_unique)(sales))), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
    }
    return true;
}
exports.service_remove_sales = service_remove_sales;
var Service_Discount_Type;
(function (Service_Discount_Type) {
    Service_Discount_Type[Service_Discount_Type["ratio"] = 0] = "ratio";
    Service_Discount_Type[Service_Discount_Type["minus"] = 1] = "minus";
})(Service_Discount_Type || (exports.Service_Discount_Type = Service_Discount_Type = {}));
exports.MAX_DISCOUNT_COUNT_ONCE = 200;
exports.MAX_DISCOUNT_RECEIVER_COUNT = 200;
function service_discount_transfer(pay_type, txb, service, permission, discount_dispatch, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (!discount_dispatch || discount_dispatch.length > exports.MAX_DISCOUNT_RECEIVER_COUNT)
        return false;
    let bValid = true;
    discount_dispatch.forEach((v) => {
        if (!(0, protocol_1.IsValidAddress)(v.receiver))
            bValid = false;
        if (!(0, protocol_1.IsValidUint)(v.count) || v.count > exports.MAX_DISCOUNT_COUNT_ONCE)
            return false;
        if (!(0, protocol_1.IsValidName_AllowEmpty)(v.discount.name))
            return false;
        if (v.discount.type == Service_Discount_Type.ratio && !(0, protocol_1.IsValidPercent)(v.discount.off))
            return false;
        if (!(0, protocol_1.IsValidUint)(v.discount.duration_minutes))
            return false;
        if (v.discount?.time_start && !(0, protocol_1.IsValidUint)(v.discount.time_start))
            return false;
        if (v.discount?.price_greater && !(0, protocol_1.IsValidInt)(v.discount.price_greater))
            return false;
    });
    if (!bValid)
        return false;
    discount_dispatch.forEach((discount) => {
        let price_greater = discount.discount?.price_greater ?
            txb.pure(utils_1.BCS_CONVERT.ser_option_u64(discount.discount.price_greater)) : (0, protocol_1.OptionNone)(txb);
        let time_start = discount.discount?.time_start ?
            txb.pure(utils_1.BCS_CONVERT.ser_option_u64(discount.discount.time_start)) : (0, protocol_1.OptionNone)(txb);
        if (passport) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('dicscount_create_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(discount.discount.name), txb.pure(discount.discount.type, bcs_1.BCS.U8),
                    txb.pure(discount.discount.off, bcs_1.BCS.U64), price_greater, time_start,
                    txb.pure(discount.discount.duration_minutes, bcs_1.BCS.U64), txb.pure(discount.count, bcs_1.BCS.U64),
                    (0, protocol_1.TXB_OBJECT)(txb, permission), txb.pure(discount.receiver, bcs_1.BCS.ADDRESS), txb.object(protocol_1.CLOCK_OBJECT)],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('dicscount_create'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(discount.discount.name), txb.pure(discount.discount.type, bcs_1.BCS.U8),
                    txb.pure(discount.discount.off, bcs_1.BCS.U64), price_greater, time_start,
                    txb.pure(discount.discount.duration_minutes, bcs_1.BCS.U64), txb.pure(discount.count, bcs_1.BCS.U64),
                    (0, protocol_1.TXB_OBJECT)(txb, permission), txb.pure(discount.receiver, bcs_1.BCS.ADDRESS), txb.object(protocol_1.CLOCK_OBJECT)],
                typeArguments: [pay_type]
            });
        }
    });
    return true;
}
exports.service_discount_transfer = service_discount_transfer;
// 同时支持withdraw guard和permission guard
function service_withdraw(pay_type, txb, service, permission, order, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission, order]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('withdraw_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, order), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('withdraw'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, order), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    return true;
}
exports.service_withdraw = service_withdraw;
function service_set_buy_guard(pay_type, txb, service, permission, guard, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (passport) {
        if (guard) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('buy_guard_set_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, guard), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('buy_guard_none_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
    }
    else {
        if (guard) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('buy_guard_set'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, guard), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('buy_guard_none'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
    }
    return true;
}
exports.service_set_buy_guard = service_set_buy_guard;
function service_set_machine(pay_type, txb, service, permission, machine, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (passport) {
        if (machine) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('machine_set_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('machine_none_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
    }
    else {
        if (machine) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('machine_set'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, machine), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('machine_none'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, permission)],
                typeArguments: [pay_type]
            });
        }
    }
    return true;
}
exports.service_set_machine = service_set_machine;
function service_set_endpoint(pay_type, txb, service, permission, endpoint, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (endpoint && !(0, protocol_1.IsValidEndpoint)(endpoint))
        return false;
    let ep = endpoint ? txb.pure(utils_1.BCS_CONVERT.ser_option_string(endpoint)) : (0, protocol_1.OptionNone)(txb);
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('endpoint_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), ep, (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('endpoint_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), ep, (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    return true;
}
exports.service_set_endpoint = service_set_endpoint;
function service_publish(pay_type, txb, service, permission, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('publish_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('publish'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    return true;
}
exports.service_publish = service_publish;
function service_clone(pay_type, txb, service, permission, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('clone_withpassport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('clone'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    return true;
}
exports.service_clone = service_clone;
var BuyRequiredEnum;
(function (BuyRequiredEnum) {
    BuyRequiredEnum["address"] = "address";
    BuyRequiredEnum["phone"] = "phone";
    BuyRequiredEnum["name"] = "name";
    BuyRequiredEnum["postcode"] = "postcode";
})(BuyRequiredEnum || (exports.BuyRequiredEnum = BuyRequiredEnum = {}));
function service_set_customer_required(pay_type, txb, service, permission, service_pubkey, customer_required, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (!service_pubkey || !customer_required)
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('required_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(utils_1.BCS_CONVERT.ser_vector_vector_u8((0, utils_1.array_unique)(customer_required))), txb.pure(service_pubkey, 'vector<u8>'), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('required_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(utils_1.BCS_CONVERT.ser_vector_vector_u8((0, utils_1.array_unique)(customer_required))), txb.pure(service_pubkey, 'vector<u8>'), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    return true;
}
exports.service_set_customer_required = service_set_customer_required;
function service_remove_customer_required(pay_type, txb, service, permission, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('required_none_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('required_none'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    return true;
}
exports.service_remove_customer_required = service_remove_customer_required;
function service_change_required_pubkey(pay_type, txb, service, permission, service_pubkey, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (!service_pubkey)
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('required_pubkey_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(service_pubkey, 'vector<u8>'), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('required_pubkey_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(service_pubkey, 'vector<u8>'), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    return true;
}
exports.service_change_required_pubkey = service_change_required_pubkey;
function service_change_order_required_pubkey(pay_type, txb, service, permission, order, service_pubkey, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission, order]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (!service_pubkey)
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('order_pubkey_update_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, order), txb.pure(service_pubkey, 'vector<u8>'), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('order_pubkey_update'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, order), txb.pure(service_pubkey, 'vector<u8>'), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    return true;
}
exports.service_change_order_required_pubkey = service_change_order_required_pubkey;
function service_pause(pay_type, txb, service, permission, pause, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('pause_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(pause, bcs_1.BCS.BOOL), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('pause'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(pause, bcs_1.BCS.BOOL), (0, protocol_1.TXB_OBJECT)(txb, permission)],
            typeArguments: [pay_type]
        });
    }
    return true;
}
exports.service_pause = service_pause;
function customer_refund(pay_type, txb, service, order, passport) {
    if (!(0, protocol_1.IsValidObjects)([service, order]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('refund_with_passport'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, order), passport],
            typeArguments: [pay_type]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('refund'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, order)],
            typeArguments: [pay_type]
        });
    }
    return true;
}
exports.customer_refund = customer_refund;
function update_order_required_info(pay_type, txb, service, order, customer_info_crypto) {
    if (!(0, protocol_1.IsValidObjects)([service, order]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (!customer_info_crypto.service_pubkey || !customer_info_crypto.customer_info_crypt)
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.ServiceFn('order_required_info_update'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, order),
            txb.pure(customer_info_crypto.service_pubkey, 'vector<u8>'),
            txb.pure(customer_info_crypto.customer_pubkey, 'vector<u8>'),
            txb.pure(utils_1.BCS_CONVERT.ser_vector_vector_u8((0, utils_1.array_unique)(customer_info_crypto.customer_info_crypt)))],
        typeArguments: [pay_type]
    });
    return true;
}
exports.update_order_required_info = update_order_required_info;
function buy(pay_type, txb, service, buy_items, coin, discount, service_machine, customer_info_crypto, passport) {
    if (!(0, protocol_1.IsValidObjects)([service]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    if (!buy_items)
        return false;
    let bValid = true;
    let names = [];
    buy_items.forEach((v) => {
        if (!(0, protocol_1.IsValidName)(v.item))
            bValid = false;
        if (!(0, protocol_1.IsValidInt)(v.max_price))
            bValid = false;
        if (!(0, protocol_1.IsValidUint)(v.count))
            bValid = false;
        if (names.includes(v.item))
            bValid = false;
        names.push(v.item);
    });
    if (!bValid)
        return false;
    let name = [];
    let price = [];
    let stock = [];
    let order;
    buy_items.forEach((b) => { name.push(b.item); price.push(b.max_price); stock.push(b.count); });
    if (passport) {
        if (discount) {
            order = txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('dicount_buy_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(utils_1.BCS_CONVERT.ser_vector_string(name)), txb.pure(utils_1.BCS_CONVERT.ser_vector_u64(price)),
                    txb.pure(utils_1.BCS_CONVERT.ser_vector_u64(stock)), (0, protocol_1.TXB_OBJECT)(txb, coin), (0, protocol_1.TXB_OBJECT)(txb, discount), txb.object(protocol_1.CLOCK_OBJECT)],
                typeArguments: [pay_type]
            });
        }
        else {
            order = txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('buy_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(utils_1.BCS_CONVERT.ser_vector_string(name)), txb.pure(utils_1.BCS_CONVERT.ser_vector_u64(price)),
                    txb.pure(utils_1.BCS_CONVERT.ser_vector_u64(stock)), (0, protocol_1.TXB_OBJECT)(txb, coin)],
                typeArguments: [pay_type]
            });
        }
    }
    else {
        if (discount) {
            order = txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('disoucnt_buy'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(utils_1.BCS_CONVERT.ser_vector_string(name)), txb.pure(utils_1.BCS_CONVERT.ser_vector_u64(price)),
                    txb.pure(utils_1.BCS_CONVERT.ser_vector_u64(stock)), (0, protocol_1.TXB_OBJECT)(txb, coin), (0, protocol_1.TXB_OBJECT)(txb, discount), txb.object(protocol_1.CLOCK_OBJECT)],
                typeArguments: [pay_type]
            });
        }
        else {
            order = txb.moveCall({
                target: protocol_1.PROTOCOL.ServiceFn('buy'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), txb.pure(utils_1.BCS_CONVERT.ser_vector_string(name)), txb.pure(utils_1.BCS_CONVERT.ser_vector_u64(price)),
                    txb.pure(utils_1.BCS_CONVERT.ser_vector_u64(stock)), (0, protocol_1.TXB_OBJECT)(txb, coin)],
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
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, order), (0, protocol_1.TXB_OBJECT)(txb, service_machine)],
            typeArguments: [pay_type]
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.ServiceFn('order_create'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, order)],
            typeArguments: [pay_type]
        });
    }
}
exports.buy = buy;
function order_bind_service_machine(pay_type, txb, service, order, service_machine) {
    if (!(0, protocol_1.IsValidObjects)([service, order, service_machine]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.ServiceFn('order_create_with_machine'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, order), (0, protocol_1.TXB_OBJECT)(txb, service_machine)],
        typeArguments: [pay_type]
    });
    return true;
}
exports.order_bind_service_machine = order_bind_service_machine;
function change_permission(pay_type, txb, service, old_permission, new_permission) {
    if (!(0, protocol_1.IsValidObjects)([service, old_permission, new_permission]))
        return false;
    if (!(0, protocol_1.IsValidArgType)(pay_type))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.ServiceFn('permission_set'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, service), (0, protocol_1.TXB_OBJECT)(txb, old_permission), (0, protocol_1.TXB_OBJECT)(txb, new_permission)],
        typeArguments: [pay_type]
    });
    return true;
}
exports.change_permission = change_permission;
