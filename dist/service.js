"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = exports.BuyRequiredEnum = exports.Service_Discount_Type = void 0;
var utils_1 = require("./utils");
var protocol_1 = require("./protocol");
var exception_1 = require("./exception");
var Service_Discount_Type;
(function (Service_Discount_Type) {
    Service_Discount_Type[Service_Discount_Type["ratio"] = 0] = "ratio";
    Service_Discount_Type[Service_Discount_Type["minus"] = 1] = "minus";
})(Service_Discount_Type || (exports.Service_Discount_Type = Service_Discount_Type = {}));
var BuyRequiredEnum;
(function (BuyRequiredEnum) {
    BuyRequiredEnum["address"] = "address";
    BuyRequiredEnum["phone"] = "phone";
    BuyRequiredEnum["name"] = "name";
    BuyRequiredEnum["postcode"] = "postcode";
})(BuyRequiredEnum || (exports.BuyRequiredEnum = BuyRequiredEnum = {}));
var Service = /** @class */ (function () {
    function Service(txb, pay_token_type, permission) {
        this.pay_token_type = pay_token_type;
        this.txb = txb;
        this.permission = permission;
        this.object = '';
    }
    //static token2coin = (token:string) => { return '0x2::coin::Coin<' + token + '>'};
    Service.prototype.get_pay_type = function () { return this.pay_token_type; };
    Service.prototype.get_object = function () { return this.object; };
    Service.From = function (txb, token_type, permission, object) {
        var s = new Service(txb, token_type, permission);
        s.object = protocol_1.Protocol.TXB_OBJECT(txb, object);
        return s;
    };
    Service.New = function (txb, token_type, permission, description, payee_treasury, passport) {
        if (!protocol_1.Protocol.IsValidObjects([permission, payee_treasury])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects);
        }
        if (!(0, utils_1.IsValidTokenType)(token_type)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidTokenType, 'New: pay_token_type');
        }
        if (!(0, utils_1.IsValidDesription)(description)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription);
        }
        var pay_token_type = token_type;
        var s = new Service(txb, pay_token_type, permission);
        if (passport) {
            s.object = txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('new_with_passport'),
                arguments: [passport, txb.pure.string(description), txb.object(payee_treasury), protocol_1.Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [pay_token_type],
            });
        }
        else {
            s.object = txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('new'),
                arguments: [txb.pure.string(description), txb.object(payee_treasury), protocol_1.Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [pay_token_type],
            });
        }
        return s;
    };
    Service.prototype.launch = function () {
        return this.txb.moveCall({
            target: protocol_1.Protocol.Instance().ServiceFn('create'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object)],
            typeArguments: [this.pay_token_type]
        });
    };
    Service.prototype.set_description = function (description, passport) {
        if (!(0, utils_1.IsValidDesription)(description)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription);
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('description_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('description_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Service.prototype.set_price = function (item, price, bNotFoundAssert, passport) {
        if (bNotFoundAssert === void 0) { bNotFoundAssert = true; }
        if (!(0, utils_1.IsValidU64)(price)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidU64, 'set_price price');
        }
        if (!Service.IsValidItemName(item)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidServiceItemName, 'set_price item');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('price_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item),
                    this.txb.pure.u64(price),
                    this.txb.pure.bool(bNotFoundAssert), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('price_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item),
                    this.txb.pure.u64(price),
                    this.txb.pure.bool(bNotFoundAssert), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Service.prototype.set_stock = function (item, stock, bNotFoundAssert, passport) {
        if (bNotFoundAssert === void 0) { bNotFoundAssert = true; }
        if (!Service.IsValidItemName(item)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidServiceItemName, 'item');
        }
        if (!(0, utils_1.IsValidU64)(stock)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidU64, 'stock');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('stock_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item),
                    this.txb.pure.u64(stock),
                    this.txb.pure.bool(bNotFoundAssert), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('stock_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item),
                    this.txb.pure.u64(stock),
                    this.txb.pure.bool(bNotFoundAssert), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Service.prototype.add_stock = function (item, stock_add, bNotFoundAssert, passport) {
        if (bNotFoundAssert === void 0) { bNotFoundAssert = true; }
        if (!Service.IsValidItemName(item)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidServiceItemName, 'add_stock item');
        }
        if (!(0, utils_1.IsValidU64)(stock_add)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidUint, 'add_stock stock_add');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('stock_add_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item),
                    this.txb.pure.u64(stock_add),
                    this.txb.pure.bool(bNotFoundAssert), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('stock_add'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item),
                    this.txb.pure.u64(stock_add),
                    this.txb.pure.bool(bNotFoundAssert), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Service.prototype.reduce_stock = function (item, stock_reduce, bNotFoundAssert, passport) {
        if (bNotFoundAssert === void 0) { bNotFoundAssert = true; }
        if (!Service.IsValidItemName(item)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidServiceItemName, 'reduce_stock item');
        }
        if (!(0, utils_1.IsValidU64)(stock_reduce)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidUint, 'reduce_stock stock_reduce');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('stock_reduce_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item),
                    this.txb.pure.u64(stock_reduce),
                    this.txb.pure.bool(bNotFoundAssert), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('stock_reduce'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item),
                    this.txb.pure.u64(stock_reduce),
                    this.txb.pure.bool(bNotFoundAssert), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Service.prototype.set_sale_endpoint = function (item, endpoint, bNotFoundAssert, passport) {
        if (bNotFoundAssert === void 0) { bNotFoundAssert = true; }
        if (!Service.IsValidItemName(item)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidServiceItemName, 'set_sale_endpoint item');
        }
        if (endpoint && !(0, utils_1.IsValidEndpoint)(endpoint)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidEndpoint, 'set_sale_endpoint endpoint');
        }
        var ep = this.txb.pure.option('string', endpoint ? endpoint : undefined);
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('sale_endpoint_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item), ep,
                    this.txb.pure.bool(bNotFoundAssert), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('sale_endpoint_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(item), ep,
                    this.txb.pure.bool(bNotFoundAssert), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Service.prototype.set_payee = function (payee, passport) {
        if (!protocol_1.Protocol.IsValidObjects([payee])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'set_payee');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('payee_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(payee), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('payee_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(payee), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Service.prototype.add_repository = function (repository, passport) {
        if (!protocol_1.Protocol.IsValidObjects([repository])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'repository_add');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('repository_add_with_passport'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, repository), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('repository_add'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, repository), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Service.prototype.remove_repository = function (repository_address, removeall, passport) {
        if (!removeall && repository_address.length === 0)
            return;
        if (!(0, utils_1.IsValidArray)(repository_address, utils_1.IsValidAddress)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'repository_address');
        }
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('repository_remove_all_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('repository_remove_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', (0, utils_1.array_unique)(repository_address)),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (removeall) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('repository_remove_all'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('repository_remove'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', (0, utils_1.array_unique)(repository_address)),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    };
    Service.prototype.add_arbitration = function (arbitraion, arbitraion_token_type, passport) {
        if (!protocol_1.Protocol.IsValidObjects([arbitraion])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'add_arbitration.arbitraion');
        }
        if (!(0, utils_1.IsValidTokenType)(arbitraion_token_type)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidTokenType, 'add_arbitration.arbitraion_token_type');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('arbitration_add_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, arbitraion), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type, arbitraion_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('arbitration_add'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, arbitraion), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type, arbitraion_token_type]
            });
        }
    };
    Service.prototype.remove_arbitration = function (address, removeall, passport) {
        if (!removeall && address.length === 0)
            return;
        if (!(0, utils_1.IsValidArray)(address, utils_1.IsValidAddress)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'remove_arbitration.address');
        }
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('arbitration_remove_all_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('arbitration_remove_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', (0, utils_1.array_unique)(address)),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (removeall) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('arbitration_remove_all'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('arbitration_remove'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', (0, utils_1.array_unique)(address)),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    };
    Service.prototype.add_withdraw_guards = function (guards, passport) {
        var _this = this;
        if (guards.length === 0)
            return;
        var bValid = true;
        guards.forEach(function (v) {
            if (!protocol_1.Protocol.IsValidObjects([v.guard]))
                bValid = false;
            if (!(0, utils_1.IsValidPercent)(v.percent))
                bValid = false;
        });
        if (!bValid) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'guards');
        }
        guards.forEach(function (guard) {
            if (passport) {
                _this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('withdraw_guard_add_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.object), protocol_1.Protocol.TXB_OBJECT(_this.txb, guard.guard),
                        _this.txb.pure.u8(guard.percent), protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.permission)],
                    typeArguments: [_this.pay_token_type]
                });
            }
            else {
                _this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('withdraw_guard_add'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.object), protocol_1.Protocol.TXB_OBJECT(_this.txb, guard.guard), _this.txb.pure.u8(guard.percent),
                        protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.permission)],
                    typeArguments: [_this.pay_token_type]
                });
            }
        });
    };
    Service.prototype.remove_withdraw_guards = function (guard_address, removeall, passport) {
        if (!removeall && guard_address.length === 0) {
            return;
        }
        if (!(0, utils_1.IsValidArray)(guard_address, utils_1.IsValidAddress)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'guard_address');
        }
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('withdraw_guard_remove_all_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('withdraw_guard_remove_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', (0, utils_1.array_unique)(guard_address)),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (removeall) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('withdraw_guard_remove_all'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('withdraw_guard_remove'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', (0, utils_1.array_unique)(guard_address)),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    };
    Service.prototype.add_refund_guards = function (guards, passport) {
        var _this = this;
        if (guards.length === 0)
            return;
        var bValid = true;
        guards.forEach(function (v) {
            if (!protocol_1.Protocol.IsValidObjects([v.guard]))
                bValid = false;
            if (!(0, utils_1.IsValidPercent)(v.percent))
                bValid = false;
        });
        if (!bValid) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'guards');
        }
        guards.forEach(function (guard) {
            if (passport) {
                _this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('refund_guard_add_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.object), protocol_1.Protocol.TXB_OBJECT(_this.txb, guard.guard),
                        _this.txb.pure.u8(guard.percent), protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.permission)],
                    typeArguments: [_this.pay_token_type]
                });
            }
            else {
                _this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('refund_guard_add'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.object), protocol_1.Protocol.TXB_OBJECT(_this.txb, guard.guard), _this.txb.pure.u8(guard.percent),
                        protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.permission)],
                    typeArguments: [_this.pay_token_type]
                });
            }
        });
    };
    Service.prototype.remove_refund_guards = function (guard_address, removeall, passport) {
        if (guard_address.length === 0 && !removeall)
            return;
        if (!(0, utils_1.IsValidArray)(guard_address, utils_1.IsValidAddress)) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'guard_address');
        }
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('refund_guard_remove_all_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('refund_guard_remove_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', (0, utils_1.array_unique)(guard_address)),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (removeall) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('refund_guard_remove_all'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('refund_guard_remove'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', (0, utils_1.array_unique)(guard_address)),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    };
    Service.prototype.is_valid_sale = function (sales) {
        var bValid = true;
        var names = [];
        sales.forEach(function (v) {
            if (!Service.IsValidItemName(v.item))
                bValid = false;
            if (!(0, utils_1.IsValidU64)(v.price))
                bValid = false;
            if (!(0, utils_1.IsValidU64)(v.stock))
                bValid = false;
            if (names.includes(v.item))
                bValid = false;
            names.push(v.item);
        });
        return bValid;
    };
    Service.prototype.add_sales = function (sales, bExistAssert, passport) {
        if (bExistAssert === void 0) { bExistAssert = false; }
        if (sales.length === 0)
            return;
        if (!this.is_valid_sale(sales)) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'add_sales');
        }
        var names = [];
        var price = [];
        var stock = [];
        var endpoint = [];
        sales.forEach(function (s) {
            var _a;
            if (s.endpoint && !(0, utils_1.IsValidEndpoint)(s.endpoint)) {
                (0, exception_1.ERROR)(exception_1.Errors.IsValidEndpoint, 'add_sales');
            }
            names.push(s.item);
            price.push(s.price);
            stock.push(s.stock);
            endpoint.push((_a = s.endpoint) !== null && _a !== void 0 ? _a : '');
        });
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('sales_add_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', names),
                    this.txb.pure.vector('string', endpoint),
                    this.txb.pure.vector('u64', price), this.txb.pure.vector('u64', stock),
                    this.txb.pure.bool(bExistAssert),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('sales_add'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', names),
                    this.txb.pure.vector('string', endpoint),
                    this.txb.pure.vector('u64', price), this.txb.pure.vector('u64', stock),
                    this.txb.pure.bool(bExistAssert),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Service.prototype.remove_sales = function (sales, passport) {
        if (sales.length === 0)
            return;
        if (!(0, utils_1.IsValidArray)(sales, Service.IsValidItemName)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'remove_sales');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('sales_remove_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', (0, utils_1.array_unique)(sales)),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('sales_remove'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', (0, utils_1.array_unique)(sales)),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Service.prototype.discount_transfer = function (discount_dispatch, passport) {
        var _this = this;
        if (!discount_dispatch || discount_dispatch.length > Service.MAX_DISCOUNT_RECEIVER_COUNT) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'discount_dispatch');
        }
        var bValid = true;
        discount_dispatch.forEach(function (v) {
            var _a, _b;
            if (!(0, utils_1.IsValidAddress)(v.receiver))
                bValid = false;
            if (!(0, utils_1.IsValidU64)(v.count) || v.count > Service.MAX_DISCOUNT_COUNT_ONCE)
                bValid = false;
            if (!(0, utils_1.IsValidName_AllowEmpty)(v.discount.name))
                bValid = false;
            if (v.discount.type == Service_Discount_Type.ratio && !(0, utils_1.IsValidPercent)(v.discount.off))
                bValid = false;
            if (!(0, utils_1.IsValidU64)(v.discount.duration_minutes))
                bValid = false;
            if (((_a = v.discount) === null || _a === void 0 ? void 0 : _a.time_start) && !(0, utils_1.IsValidU64)(v.discount.time_start))
                bValid = false;
            if (((_b = v.discount) === null || _b === void 0 ? void 0 : _b.price_greater) && !(0, utils_1.IsValidU64)(v.discount.price_greater))
                bValid = false;
        });
        if (!bValid) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'discount_dispatch');
        }
        var clock = this.txb.sharedObjectRef(protocol_1.Protocol.CLOCK_OBJECT);
        discount_dispatch.forEach(function (discount) {
            var _a, _b, _c, _d;
            var price_greater = _this.txb.pure.option('u64', ((_a = discount.discount) === null || _a === void 0 ? void 0 : _a.price_greater) ? (_b = discount.discount) === null || _b === void 0 ? void 0 : _b.price_greater : undefined);
            var time_start = _this.txb.pure.option('u64', ((_c = discount.discount) === null || _c === void 0 ? void 0 : _c.time_start) ? (_d = discount.discount) === null || _d === void 0 ? void 0 : _d.time_start : undefined);
            if (passport) {
                _this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('dicscount_create_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.object), _this.txb.pure.string(discount.discount.name),
                        _this.txb.pure.u8(discount.discount.type),
                        _this.txb.pure.u64(discount.discount.off), price_greater, time_start,
                        _this.txb.pure.u64(discount.discount.duration_minutes), _this.txb.pure.u64(discount.count),
                        protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.permission), _this.txb.pure.address(discount.receiver), _this.txb.object(clock)],
                    typeArguments: [_this.pay_token_type]
                });
            }
            else {
                _this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('dicscount_create'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.object), _this.txb.pure.string(discount.discount.name),
                        _this.txb.pure.u8(discount.discount.type),
                        _this.txb.pure.u64(discount.discount.off), price_greater, time_start,
                        _this.txb.pure.u64(discount.discount.duration_minutes), _this.txb.pure.u64(discount.count),
                        protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.permission), _this.txb.pure.address(discount.receiver),
                        _this.txb.object(clock)],
                    typeArguments: [_this.pay_token_type]
                });
            }
        });
    };
    // support both withdraw guard and permission guard
    // withdraw_guard & passport must BOTH valid.
    Service.prototype.withdraw = function (order, param, passport) {
        if (!protocol_1.Protocol.IsValidObjects([order, param.treasury, param.withdraw_guard, passport])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects);
        }
        if ((param === null || param === void 0 ? void 0 : param.for_guard) && !protocol_1.Protocol.IsValidObjects([param.for_guard])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'withdraw.param.for_guard');
        }
        if ((param === null || param === void 0 ? void 0 : param.for_object) && !(0, utils_1.IsValidAddress)(param.for_object)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'withdraw.param.for_object');
        }
        if (!(0, utils_1.IsValidU64)(param.index)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidU64, 'withdraw.param.index');
        }
        if (!(0, utils_1.IsValidDesription)(param.remark)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription, 'withdraw.param.remark');
        }
        var for_obj = this.txb.pure.option('address', param.for_object ? param.for_object : undefined);
        var clock = this.txb.sharedObjectRef(protocol_1.Protocol.CLOCK_OBJECT);
        if (param.for_guard) {
            return this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('withdraw_forGuard_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, order), this.txb.object(param.withdraw_guard),
                    this.txb.object(param.treasury), for_obj, this.txb.object(param.for_guard), this.txb.pure.u64(param.index), this.txb.pure.string(param.remark),
                    this.txb.object(clock), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            return this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('withdraw_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, order), this.txb.object(param.withdraw_guard),
                    this.txb.object(param.treasury), for_obj, this.txb.pure.u64(param.index), this.txb.pure.string(param.remark),
                    this.txb.object(clock), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Service.prototype.set_buy_guard = function (guard, passport) {
        if (passport) {
            if (guard) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('buy_guard_set_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, guard), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('buy_guard_none_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (guard) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('buy_guard_set'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, guard), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('buy_guard_none'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    };
    Service.prototype.set_machine = function (machine, passport) {
        if (passport) {
            if (machine) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('machine_set_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, machine), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('machine_none_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (machine) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('machine_set'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, machine), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('machine_none'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    };
    Service.prototype.set_endpoint = function (endpoint, passport) {
        if (endpoint && !(0, utils_1.IsValidEndpoint)(endpoint)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidEndpoint);
        }
        var ep = this.txb.pure.option('string', endpoint ? endpoint : undefined);
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('endpoint_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), ep, protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('endpoint_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), ep, protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Service.prototype.publish = function (passport) {
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('publish_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('publish'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Service.prototype.clone = function (new_token_type, passport) {
        if (passport) {
            return this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('clone_withpassport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type, new_token_type ? new_token_type : this.pay_token_type]
            });
        }
        else {
            return this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('clone'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type, new_token_type ? new_token_type : this.pay_token_type]
            });
        }
    };
    Service.prototype.set_customer_required = function (pubkey, customer_required, passport) {
        if (customer_required.length > 0 && !pubkey) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'set_customer_required');
        }
        if (pubkey.length > Service.MAX_PUBKEY_SIZE) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'set_customer_required.pubkey');
        }
        if (customer_required.length > Service.MAX_REQUIRES_COUNT) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'set_customer_required.customer_required');
        }
        if (!(0, utils_1.IsValidArray)(customer_required, utils_1.IsValidName)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'set_customer_required.customer_required');
        }
        var req = (0, utils_1.array_unique)(customer_required);
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('required_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.vector('string', req),
                    this.txb.pure.string(pubkey), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('required_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.vector('string', req),
                    this.txb.pure.string(pubkey), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Service.prototype.remove_customer_required = function (passport) {
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('required_none_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('required_none'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Service.prototype.change_required_pubkey = function (pubkey, passport) {
        if (!pubkey) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'pubkey');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('required_pubkey_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(pubkey),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('required_pubkey_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(pubkey),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
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
    Service.prototype.pause = function (pause, passport) {
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('pause_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(pause), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('pause'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(pause), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Service.prototype.refund_withArb = function (order, arb, arb_type) {
        if (!protocol_1.Protocol.IsValidObjects([order, arb])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'refund_withArb.order or arb');
        }
        if (!(0, utils_1.IsValidTokenType)(arb_type)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidTokenType, 'refund_withArb.arb_type');
        }
        var clock = this.txb.sharedObjectRef(protocol_1.Protocol.CLOCK_OBJECT);
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().ServiceFn('refund_with_arb'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, order), this.txb.object(arb), this.txb.object(clock)],
            typeArguments: [this.pay_token_type, arb_type]
        });
    };
    Service.prototype.refund = function (order, refund_guard, passport) {
        if (!protocol_1.Protocol.IsValidObjects([order])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'refund.order');
        }
        if (refund_guard && !protocol_1.Protocol.IsValidObjects([refund_guard])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'refund.refund_guard');
        }
        if (passport && !refund_guard) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'refund.passport need refund_guard');
        }
        var clock = this.txb.sharedObjectRef(protocol_1.Protocol.CLOCK_OBJECT);
        if (passport && refund_guard) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('refund_with_passport'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, order), this.txb.object(refund_guard),
                    passport, this.txb.object(clock)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('refund'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, order)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Service.prototype.update_order_required_info = function (order, customer_info_crypto) {
        if (!customer_info_crypto.customer_pubkey || customer_info_crypto.customer_info_crypt.length === 0) {
            return;
        }
        if (!protocol_1.Protocol.IsValidObjects([order])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'update_order_required_info.order');
        }
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().ServiceFn('order_required_info_update'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, order),
                this.txb.pure.string(customer_info_crypto.customer_pubkey),
                this.txb.pure.string(customer_info_crypto.customer_info_crypt)],
            typeArguments: [this.pay_token_type]
        });
    };
    Service.prototype.buy = function (buy_items, coin, discount, machine, customer_info_crypto, passport) {
        if (!buy_items) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'buy_items');
        }
        var bValid = true;
        var names = [];
        buy_items.forEach(function (v) {
            if (!Service.IsValidItemName(v.item))
                bValid = false;
            if (!(0, utils_1.IsValidU64)(v.max_price))
                bValid = false;
            if (!(0, utils_1.IsValidU64)(v.count))
                bValid = false;
            if (names.includes(v.item))
                bValid = false;
            names.push(v.item);
        });
        if (!bValid) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'buy_items invalid');
        }
        var name = [];
        var price = [];
        var stock = [];
        var order;
        buy_items.forEach(function (b) { name.push(b.item); price.push(b.max_price); stock.push(b.count); });
        var clock = this.txb.sharedObjectRef(protocol_1.Protocol.CLOCK_OBJECT);
        if (passport) {
            if (discount) {
                order = this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('dicount_buy_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', name),
                        this.txb.pure.vector('u64', price), this.txb.pure.vector('u64', stock),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, coin), protocol_1.Protocol.TXB_OBJECT(this.txb, discount), this.txb.object(clock)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                order = this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('buy_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', name),
                        this.txb.pure.vector('u64', price), this.txb.pure.vector('u64', stock),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, coin)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (discount) {
                order = this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('disoucnt_buy'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', name),
                        this.txb.pure.vector('u64', price),
                        this.txb.pure.vector('u64', stock),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, coin),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, discount), this.txb.object(clock)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                order = this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('buy'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', name),
                        this.txb.pure.vector('u64', price),
                        this.txb.pure.vector('u64', stock),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, coin)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        if (customer_info_crypto) {
            this.update_order_required_info(order, customer_info_crypto);
        }
        if (machine) {
            return this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('order_create_with_machine'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, order), protocol_1.Protocol.TXB_OBJECT(this.txb, machine)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            return this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('order_create'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, order)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Service.prototype.order_bind_machine = function (order, machine) {
        if (!protocol_1.Protocol.IsValidObjects([order, machine])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'order & machine');
        }
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().ServiceFn('order_create_with_machine'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, order), protocol_1.Protocol.TXB_OBJECT(this.txb, machine)],
            typeArguments: [this.pay_token_type]
        });
    };
    Service.prototype.add_treasury = function (treasury_token_type, treasury, passport) {
        if (!protocol_1.Protocol.IsValidObjects([treasury])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'add_treasury.treasury');
        }
        if (!(0, utils_1.IsValidTokenType)(treasury_token_type)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidTokenType, 'add_treasury.treasury_token_type');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('treasury_add_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(treasury), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type, treasury_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('treasury_add'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(treasury), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type, treasury_token_type]
            });
        }
    };
    Service.prototype.remove_treasury = function (treasury, removeall, passport) {
        if (!removeall && treasury.length === 0)
            return;
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('treasury_remove_all_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('treasury_remove_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', treasury), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (removeall) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('treasury_remove_all'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ServiceFn('treasury_remove'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', treasury), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    };
    Service.prototype.change_permission = function (new_permission) {
        if (!protocol_1.Protocol.IsValidObjects([new_permission])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects);
        }
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().ServiceFn('permission_set'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission), protocol_1.Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments: [this.pay_token_type]
        });
        this.permission = new_permission;
    };
    Service.prototype.set_order_agent = function (order, agent, orderProgress) {
        Service.SetOrderAgent(this.txb, this.pay_token_type, order, agent, orderProgress);
    };
    Service.prototype.change_order_payer = function (order, new_addr) {
        Service.ChangeOrderPayer(this.txb, this.pay_token_type, order, new_addr);
    };
    Service.IsValidItemName = function (name) {
        if (!name)
            return false;
        return new TextEncoder().encode(name).length <= Service.MAX_ITEM_NAME_LENGTH;
    };
    Service.MAX_DISCOUNT_COUNT_ONCE = 200;
    Service.MAX_DISCOUNT_RECEIVER_COUNT = 20;
    Service.MAX_GUARD_COUNT = 16;
    Service.MAX_REPOSITORY_COUNT = 32;
    Service.MAX_ITEM_NAME_LENGTH = 256;
    Service.MAX_TREASURY_COUNT = 8;
    Service.MAX_ORDER_AGENT_COUNT = 8;
    Service.MAX_ORDER_ARBS_COUNT = 8;
    Service.MAX_ARBITRATION_COUNT = 8;
    Service.MAX_REQUIRES_COUNT = 16;
    Service.MAX_PUBKEY_SIZE = 3000;
    Service.parseObjectType = function (chain_type) {
        return (0, utils_1.parseObjectType)(chain_type, 'service::Service<');
    };
    Service.parseOrderObjectType = function (chain_type) {
        return (0, utils_1.parseObjectType)(chain_type, 'order::Order<');
    };
    Service.endpoint = function (service_endpoint, item_endpoint, item_name) {
        if (item_endpoint) {
            return item_endpoint;
        }
        else if (service_endpoint) {
            return service_endpoint + '/sales/' + encodeURI(item_name);
        }
    };
    Service.DiscountObjects = function (owner, handleDiscountObject) {
        protocol_1.Protocol.Client().getOwnedObjects({ owner: owner,
            filter: { MoveModule: { module: 'order', package: protocol_1.Protocol.Instance().Package('wowok') } },
            options: { showContent: true, showType: true } }).then(function (res) {
            handleDiscountObject(owner, res.data.map(function (v) { return v.data; }));
        }).catch(function (e) {
            console.log(e);
        });
    };
    // The agent has the same order operation power as the order payer; The agent can only be set by the order payer.
    Service.SetOrderAgent = function (txb, order_token_type, order, agent, order_progress) {
        if (!(0, utils_1.IsValidTokenType)(order_token_type)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidTokenType, 'SetOrderAgent.order_token_type');
        }
        if (!protocol_1.Protocol.IsValidObjects([order])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'SetOrderAgent.order');
        }
        if (!(0, utils_1.IsValidArray)(agent, utils_1.IsValidAddress)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'SetOrderAgent.agent');
        }
        if ((0, utils_1.array_unique)(agent).length > Service.MAX_ORDER_AGENT_COUNT) {
            (0, exception_1.ERROR)(exception_1.Errors.Fail, 'SetOrderAgent.agent count');
        }
        if (order_progress) {
            txb.moveCall({
                target: protocol_1.Protocol.Instance().OrderFn('agent_set_with_progress'),
                arguments: [txb.object(order), txb.pure.vector('address', (0, utils_1.array_unique)(agent)), txb.object(order_progress)],
                typeArguments: [order_token_type]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.Protocol.Instance().OrderFn('agent_set'),
                arguments: [txb.object(order), txb.pure.vector('address', (0, utils_1.array_unique)(agent))],
                typeArguments: [order_token_type]
            });
        }
    };
    Service.ChangeOrderPayer = function (txb, order_token_type, order, new_addr) {
        if (!(0, utils_1.IsValidTokenType)(order_token_type)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidTokenType, 'ChangeOrderPayer.order_token_type');
        }
        if (!protocol_1.Protocol.IsValidObjects([order])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'ChangeOrderPayer.order');
        }
        if (!(0, utils_1.IsValidAddress)(new_addr)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'ChangeOrderPayer.new_addr');
        }
        txb.moveCall({
            target: protocol_1.Protocol.Instance().OrderFn('payer_change'),
            arguments: [txb.object(order), txb.pure.address(new_addr)],
            typeArguments: [order_token_type]
        });
    };
    return Service;
}());
exports.Service = Service;
