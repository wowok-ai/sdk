"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Treasury = exports.Treasury_Operation = exports.Treasury_WithdrawMode = void 0;
var protocol_1 = require("./protocol");
var utils_1 = require("./utils");
var exception_1 = require("./exception");
var Treasury_WithdrawMode;
(function (Treasury_WithdrawMode) {
    Treasury_WithdrawMode[Treasury_WithdrawMode["PERMISSION"] = 0] = "PERMISSION";
    Treasury_WithdrawMode[Treasury_WithdrawMode["GUARD_ONLY_AND_IMMUTABLE"] = 1] = "GUARD_ONLY_AND_IMMUTABLE";
    Treasury_WithdrawMode[Treasury_WithdrawMode["BOTH_PERMISSION_AND_GUARD"] = 2] = "BOTH_PERMISSION_AND_GUARD";
})(Treasury_WithdrawMode || (exports.Treasury_WithdrawMode = Treasury_WithdrawMode = {}));
var Treasury_Operation;
(function (Treasury_Operation) {
    Treasury_Operation[Treasury_Operation["WITHDRAW"] = 1] = "WITHDRAW";
    Treasury_Operation[Treasury_Operation["DEPOSIT"] = 2] = "DEPOSIT";
    Treasury_Operation[Treasury_Operation["RECEIVE"] = 4] = "RECEIVE";
})(Treasury_Operation || (exports.Treasury_Operation = Treasury_Operation = {}));
var Treasury = /** @class */ (function () {
    function Treasury(txb, token_type, permission) {
        this.token_type = token_type;
        this.permission = permission;
        this.txb = txb;
        this.object = '';
    }
    Treasury.prototype.get_token_type = function () { return this.token_type; };
    Treasury.prototype.get_object = function () { return this.object; };
    Treasury.From = function (txb, token_type, permission, object) {
        var d = new Treasury(txb, token_type, permission);
        d.object = protocol_1.Protocol.TXB_OBJECT(txb, object);
        return d;
    };
    Treasury.New = function (txb, token_type, permission, description, passport) {
        if (!protocol_1.Protocol.IsValidObjects([permission])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'Treasury.New permission, bounty');
        }
        if (!(0, utils_1.IsValidDesription)(description)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription, 'Treasury.New.description');
        }
        if (!(0, utils_1.IsValidArgType)(token_type)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArgType, token_type);
        }
        var d = new Treasury(txb, token_type, permission);
        if (passport) {
            d.object = txb.moveCall({
                target: protocol_1.Protocol.Instance().TreasuryFn('new_with_passport'),
                arguments: [passport, txb.pure.string(description), protocol_1.Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [token_type],
            });
        }
        else {
            d.object = txb.moveCall({
                target: protocol_1.Protocol.Instance().TreasuryFn('new'),
                arguments: [txb.pure.string(description), protocol_1.Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [token_type],
            });
        }
        return d;
    };
    Treasury.prototype.launch = function () {
        return this.txb.moveCall({
            target: protocol_1.Protocol.Instance().TreasuryFn('create'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object)],
            typeArguments: [this.token_type],
        });
    };
    Treasury.prototype.set_deposit_guard = function (guard, passport) {
        if (guard && !(0, utils_1.IsValidAddress)(guard)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'set_deposit_guard.guard');
        }
        if (passport) {
            if (guard) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().TreasuryFn('deposit_guard_set_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                        this.txb.object(guard), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().TreasuryFn('deposit_guard_none_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
        }
        else {
            if (guard) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().TreasuryFn('deposit_guard_set'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                        this.txb.object(guard), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().TreasuryFn('deposit_guard_none'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
        }
    };
    // return payment address
    Treasury.prototype.deposit = function (param, passport) {
        if (!protocol_1.Protocol.IsValidObjects([param.coin])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'deposit.param.coin');
        }
        if (!(0, utils_1.IsValidDesription)(param.remark)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription, 'deposit.param.remark');
        }
        if ((param === null || param === void 0 ? void 0 : param.for_object) && !(0, utils_1.IsValidAddress)(param.for_object)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'deposit.param.for_object');
        }
        if ((param === null || param === void 0 ? void 0 : param.for_guard) && !(0, utils_1.IsValidAddress)(param.for_guard)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'deposit.param.for_guard');
        }
        if (param.index !== undefined && !(0, utils_1.IsValidU64)(param.index)) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'deposit.param.index');
        }
        var for_obj = this.txb.pure.option('address', param.for_object ? param.for_object : undefined);
        var clock = this.txb.sharedObjectRef(protocol_1.Protocol.CLOCK_OBJECT);
        if (passport) {
            if (param.for_guard) {
                return this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().TreasuryFn('deposit_forGuard_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                        this.txb.pure.string(param.remark), for_obj, this.txb.object(param.for_guard), this.txb.object(clock), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
            else {
                return this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().TreasuryFn('deposit_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                        this.txb.pure.string(param.remark), for_obj, this.txb.object(clock), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
        }
        else {
            if (param.for_guard) {
                return this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().TreasuryFn('deposit_forGuard'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                        this.txb.pure.string(param.remark), for_obj, this.txb.object(param.for_guard), this.txb.object(clock), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
            else {
                return this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().TreasuryFn('deposit'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, param.coin), this.txb.pure.u64(param.index),
                        this.txb.pure.string(param.remark), for_obj, this.txb.object(clock), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
        }
    };
    // return current balance
    Treasury.prototype.receive = function (payment, received, passport) {
        if (!protocol_1.Protocol.IsValidObjects([payment, received])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'receive.payment&received');
        }
        var clock = this.txb.sharedObjectRef(protocol_1.Protocol.CLOCK_OBJECT);
        if (passport) {
            return this.txb.moveCall({
                target: protocol_1.Protocol.Instance().TreasuryFn('receive_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(received), this.txb.object(payment),
                    this.txb.object(clock), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.token_type],
            });
        }
        else {
            return this.txb.moveCall({
                target: protocol_1.Protocol.Instance().TreasuryFn('receive'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(received), this.txb.object(payment),
                    this.txb.object(clock), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.token_type],
            });
        }
    };
    // return payment address
    Treasury.prototype.withdraw = function (param, passport) {
        if (param.items.length === 0)
            return undefined;
        if (!(0, utils_1.IsValidArray)(param.items, function (item) { return (0, utils_1.IsValidU64)(item.amount) && (0, utils_1.IsValidAddress)(item.address); })) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'withdraw.param.items');
        }
        if (!(0, utils_1.IsValidDesription)(param.remark)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription, 'withdraw.param.remark');
        }
        if (!(0, utils_1.IsValidU64)(param.index)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidU64, 'withdraw.param.index');
        }
        if ((param === null || param === void 0 ? void 0 : param.for_guard) && !(0, utils_1.IsValidAddress)(param.for_guard)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'withdraw.param.for_guard');
        }
        if ((param === null || param === void 0 ? void 0 : param.for_object) && !(0, utils_1.IsValidAddress)(param.for_object)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'withdraw.param.for_object');
        }
        if ((param === null || param === void 0 ? void 0 : param.withdraw_guard) && !(0, utils_1.IsValidAddress)(param.withdraw_guard)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'withdraw.param.withdraw_guard');
        }
        if ((param === null || param === void 0 ? void 0 : param.withdraw_guard) && !passport) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'withdraw.param.withdraw_guard');
        }
        var for_obj = this.txb.pure.option('address', param.for_object ? param.for_object : undefined);
        var clock = this.txb.sharedObjectRef(protocol_1.Protocol.CLOCK_OBJECT);
        if (param.withdraw_guard && passport) { //@ dont need passport, use withdraw guard!
            if (param.for_guard) {
                return this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().TreasuryFn('withdraw_useGuard_forGuard'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(function (v) { return v.address; })),
                        this.txb.pure.vector('u64', param.items.map(function (v) { return v.amount; })), this.txb.pure.u64(param.index), this.txb.pure.string(param.remark),
                        for_obj, this.txb.object(param.for_guard), this.txb.object(clock), this.txb.object(param.withdraw_guard)],
                    typeArguments: [this.token_type],
                });
            }
            else {
                return this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().TreasuryFn('withdraw_useGuard'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(function (v) { return v.address; })),
                        this.txb.pure.vector('u64', param.items.map(function (v) { return v.amount; })), this.txb.pure.u64(param.index), this.txb.pure.string(param.remark),
                        for_obj, this.txb.object(clock), this.txb.object(param.withdraw_guard)],
                    typeArguments: [this.token_type],
                });
            }
        }
        else {
            if (passport) {
                if (param.for_guard) {
                    return this.txb.moveCall({
                        target: protocol_1.Protocol.Instance().TreasuryFn('withdraw_forGuard_with_passport'),
                        arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(function (v) { return v.address; })),
                            this.txb.pure.vector('u64', param.items.map(function (v) { return v.amount; })), this.txb.pure.u64(param.index),
                            this.txb.pure.string(param.remark), for_obj, this.txb.object(param.for_guard), this.txb.object(clock), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                        typeArguments: [this.token_type],
                    });
                }
                else {
                    return this.txb.moveCall({
                        target: protocol_1.Protocol.Instance().TreasuryFn('withdraw_with_passport'),
                        arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(function (v) { return v.address; })),
                            this.txb.pure.vector('u64', param.items.map(function (v) { return v.amount; })), this.txb.pure.u64(param.index),
                            this.txb.pure.string(param.remark), for_obj, this.txb.object(clock), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                        typeArguments: [this.token_type],
                    });
                }
            }
            else {
                if (param.for_guard) {
                    return this.txb.moveCall({
                        target: protocol_1.Protocol.Instance().TreasuryFn('withdraw_forGuard'),
                        arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(function (v) { return v.address; })),
                            this.txb.pure.vector('u64', param.items.map(function (v) { return v.amount; })), this.txb.pure.u64(param.index),
                            this.txb.pure.string(param.remark), for_obj, this.txb.object(param.for_guard), this.txb.object(clock), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                        typeArguments: [this.token_type],
                    });
                }
                else {
                    return this.txb.moveCall({
                        target: protocol_1.Protocol.Instance().TreasuryFn('withdraw'),
                        arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', param.items.map(function (v) { return v.address; })),
                            this.txb.pure.vector('u64', param.items.map(function (v) { return v.amount; })), this.txb.pure.u64(param.index),
                            this.txb.pure.string(param.remark), for_obj, this.txb.object(clock), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                        typeArguments: [this.token_type],
                    });
                }
            }
        }
    };
    Treasury.prototype.set_description = function (description, passport) {
        if (!(0, utils_1.IsValidDesription)(description)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription, 'set_description.description');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().TreasuryFn('description_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.token_type],
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().TreasuryFn('description_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.token_type],
            });
        }
    };
    Treasury.prototype.set_withdraw_mode = function (mode, passport) {
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().TreasuryFn('withdraw_mode_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u8(mode), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.token_type],
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().TreasuryFn('withdraw_mode_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u8(mode), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.token_type],
            });
        }
    };
    Treasury.prototype.add_withdraw_guard = function (guard, amount, passport) {
        if (!(0, utils_1.IsValidAddress)(guard)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'add_withdraw_guard.guard');
        }
        if (!(0, utils_1.IsValidU64)(amount)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidU64, 'add_withdraw_guard.amount');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().TreasuryFn('withdraw_guard_add_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(guard), this.txb.pure.u64(amount),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.token_type],
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().TreasuryFn('withdraw_guard_add'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(guard), this.txb.pure.u64(amount),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.token_type],
            });
        }
    };
    Treasury.prototype.remove_withdraw_guard = function (guard, removeall, passport) {
        if (guard.length === 0 && !removeall)
            return;
        if (!(0, utils_1.IsValidArray)(guard, utils_1.IsValidAddress)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'add_withdraw_guard.guard');
        }
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().TreasuryFn('withdraw_guard_remove_all_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().TreasuryFn('withdraw_guard_remove_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', guard),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
        }
        else {
            if (removeall) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().TreasuryFn('withdraw_guard_remove_all'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().TreasuryFn('withdraw_guard_remove'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', guard),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.token_type],
                });
            }
        }
    };
    Treasury.prototype.change_permission = function (new_permission) {
        if (!protocol_1.Protocol.IsValidObjects([new_permission])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'change_permission.new_permission');
        }
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().TreasuryFn('permission_set'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission), protocol_1.Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments: [this.token_type]
        });
        this.permission = new_permission;
    };
    Treasury.parseObjectType = function (chain_type) {
        return (0, utils_1.parseObjectType)(chain_type, 'treasury::Treasury<');
    };
    Treasury.MAX_WITHDRAW_GUARD_COUNT = 16;
    return Treasury;
}());
exports.Treasury = Treasury;
