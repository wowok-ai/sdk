"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create_payment = exports.PAYMENT_MAX_RECEIVER_COUNT = void 0;
var protocol_1 = require("./protocol");
var utils_1 = require("./utils");
var exception_1 = require("./exception");
exports.PAYMENT_MAX_RECEIVER_COUNT = 200;
function create_payment(txb, pay_token_type, param) {
    if (!pay_token_type)
        (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'Payment.New.pay_token_type');
    if (param.receiver.length > exports.PAYMENT_MAX_RECEIVER_COUNT) {
        (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'Payment.New.param.receiver');
    }
    if (!(0, utils_1.IsValidArray)(param.receiver, function (item) { return (0, utils_1.IsValidAddress)(item.address) && protocol_1.Protocol.IsValidObjects([item.coin]); })) {
        (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'Payment.New.param.receiver');
    }
    if ((param === null || param === void 0 ? void 0 : param.for_object) && !(0, utils_1.IsValidAddress)(param.for_object)) {
        (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'Payment.New.param.for_object');
    }
    if ((param === null || param === void 0 ? void 0 : param.for_guard) && !(0, utils_1.IsValidAddress)(param.for_guard)) {
        (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'Payment.New.param.for_guard');
    }
    if ((param === null || param === void 0 ? void 0 : param.business_remark) && !(0, utils_1.IsValidDesription)(param === null || param === void 0 ? void 0 : param.business_remark)) {
        (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription, 'Payment.New.param.business_remark');
    }
    var obj = txb.pure.option('address', param.for_object ? param.for_object : undefined);
    var clock = txb.sharedObjectRef(protocol_1.Protocol.CLOCK_OBJECT);
    if (param.for_guard) {
        return txb.moveCall({
            target: protocol_1.Protocol.Instance().PaymentFn('create_withGuard'),
            arguments: [txb.pure.vector('address', param.receiver.map(function (i) { return i.address; })), txb.makeMoveVec({ elements: param.receiver.map(function (i) { return i.coin; }) }),
                obj, txb.object(param.for_guard), txb.pure.u64(param.business_index), txb.pure.string(param.business_remark), txb.object(clock)],
            typeArguments: [pay_token_type],
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.Protocol.Instance().PaymentFn('create'),
            arguments: [txb.pure.vector('address', param.receiver.map(function (i) { return i.address; })), txb.makeMoveVec({ elements: param.receiver.map(function (i) { return i.coin; }) }),
                obj, txb.pure.u64(param.business_index), txb.pure.string(param.business_remark), txb.object(clock)],
            typeArguments: [pay_token_type],
        });
    }
}
exports.create_payment = create_payment;
