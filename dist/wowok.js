"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wowok = void 0;
var protocol_1 = require("./protocol");
var utils_1 = require("./utils");
var exception_1 = require("./exception");
var Wowok = /** @class */ (function () {
    function Wowok(txb) {
        this.txb = txb;
        this.object = '';
    }
    Wowok.prototype.get_object = function () { return this.object; };
    Wowok.From = function (txb) {
        var r = new Wowok(txb);
        r.object = protocol_1.Protocol.TXB_OBJECT(txb, protocol_1.Protocol.Instance().WowokObject());
        return r;
    };
    Wowok.prototype.register_grantor = function (name, grantee_permission) {
        if (!(0, utils_1.IsValidName)(name))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName, 'register_grantor');
        if (!protocol_1.Protocol.IsValidObjects([grantee_permission]))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'register_grantor');
        var clock = this.txb.sharedObjectRef(protocol_1.Protocol.CLOCK_OBJECT);
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().WowokFn('grantor_register'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name), this.txb.object(clock),
                protocol_1.Protocol.TXB_OBJECT(this.txb, grantee_permission)]
        });
    };
    Wowok.prototype.grantor_time_expand_1year = function (grantor) {
        if (!(0, utils_1.IsValidAddress)(grantor))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'grantor_time_expand_1year');
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().WowokFn('grantor_time_expand_1year'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(grantor)]
        });
    };
    Wowok.prototype.grantor_rename = function (new_name) {
        if (!(0, utils_1.IsValidName)(new_name))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName, 'grantor_rename');
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().WowokFn('grantor_time_expand_1year'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(new_name)]
        });
    };
    Wowok.prototype.mint = function (amount, recipient) {
        if (!(0, utils_1.IsValidAddress)(recipient))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'mint');
        if (!(0, utils_1.IsValidU64)(amount))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidU64, 'mint');
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().BaseWowokFn('mint'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, protocol_1.Protocol.Instance().TreasuryCap()), this.txb.pure.u64(amount),
                this.txb.pure.address(recipient)]
        });
    };
    Wowok.prototype.oracle = function (description, permission) {
        if (!(0, utils_1.IsValidDesription)(description))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription, 'oracle.description');
        if (!protocol_1.Protocol.IsValidObjects([permission]))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'oracle.permission');
        return this.txb.moveCall({
            target: protocol_1.Protocol.Instance().WowokFn('oracle_repository'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, protocol_1.Protocol.Instance().OracleObject()), this.txb.pure.string(description),
                this.txb.object(permission)]
        });
    };
    return Wowok;
}());
exports.Wowok = Wowok;
