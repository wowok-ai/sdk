"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Demand = void 0;
var protocol_1 = require("./protocol");
var utils_1 = require("./utils");
var exception_1 = require("./exception");
var Demand = /** @class */ (function () {
    function Demand(txb, bounty_type, permission) {
        this.bounty_type = bounty_type;
        this.permission = permission;
        this.txb = txb;
        this.object = '';
    }
    Demand.prototype.get_bounty_type = function () { return this.bounty_type; };
    Demand.prototype.get_object = function () { return this.object; };
    Demand.From = function (txb, bounty_type, permission, object) {
        var d = new Demand(txb, bounty_type, permission);
        d.object = protocol_1.Protocol.TXB_OBJECT(txb, object);
        return d;
    };
    Demand.New = function (txb, bounty_type, ms_expand, time, permission, description, bounty, passport) {
        if (!protocol_1.Protocol.IsValidObjects([permission, bounty])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'permission, bounty');
        }
        if (!(0, utils_1.IsValidDesription)(description)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription);
        }
        if (!(0, utils_1.IsValidArgType)(bounty_type)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArgType, bounty_type);
        }
        if (!(0, utils_1.IsValidU64)(time)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidUint, 'time');
        }
        var d = new Demand(txb, bounty_type, permission);
        var clock = txb.sharedObjectRef(protocol_1.Protocol.CLOCK_OBJECT);
        if (passport) {
            d.object = txb.moveCall({
                target: protocol_1.Protocol.Instance().DemandFn('new_with_passport'),
                arguments: [passport, txb.pure.string(description), txb.object(bounty), txb.pure.bool(ms_expand), txb.pure.u64(time),
                    txb.object(clock), protocol_1.Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [bounty_type],
            });
        }
        else {
            d.object = txb.moveCall({
                target: protocol_1.Protocol.Instance().DemandFn('new'),
                arguments: [txb.pure.string(description), txb.object(bounty), txb.pure.bool(ms_expand), txb.pure.u64(time),
                    txb.object(clock), protocol_1.Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [bounty_type],
            });
        }
        return d;
    };
    Demand.prototype.launch = function () {
        return this.txb.moveCall({
            target: protocol_1.Protocol.Instance().DemandFn('create'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object)],
            typeArguments: [this.bounty_type],
        });
    };
    Demand.prototype.refund = function (passport) {
        var clock = this.txb.sharedObjectRef(protocol_1.Protocol.CLOCK_OBJECT);
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().DemandFn('refund_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.object(clock), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.bounty_type],
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().DemandFn('refund'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(clock), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.bounty_type],
            });
        }
    };
    // minutes_duration TRUE , time is minutes count; otherwise, the deadline time
    Demand.prototype.expand_time = function (minutes_duration, time, passport) {
        if (!(0, utils_1.IsValidU64)(time)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidUint, 'time');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().DemandFn('time_expand_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(minutes_duration),
                    this.txb.pure.u64(time), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.bounty_type],
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().DemandFn('time_expand'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(minutes_duration),
                    this.txb.pure.u64(time), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.bounty_type],
            });
        }
    };
    Demand.prototype.set_guard = function (guard, service_identifier, passport) {
        if (guard && !protocol_1.Protocol.IsValidObjects([guard])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'guard');
        }
        if (service_identifier !== undefined && !(0, utils_1.IsValidU8)(service_identifier)) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'set_guard.service_identifier');
        }
        var id = this.txb.pure.option('u8', service_identifier !== undefined ? service_identifier : undefined);
        if (passport) {
            if (guard) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().DemandFn('guard_set_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, guard), id,
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.bounty_type],
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().DemandFn('guard_none_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.bounty_type],
                });
            }
        }
        else {
            if (guard) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().DemandFn('guard_set'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, guard), id,
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.bounty_type],
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().DemandFn('guard_none'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.bounty_type],
                });
            }
        }
    };
    Demand.prototype.set_description = function (description, passport) {
        if (!(0, utils_1.IsValidDesription)(description)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription);
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().DemandFn('description_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.bounty_type],
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().DemandFn('description_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.bounty_type],
            });
        }
    };
    Demand.prototype.yes = function (service_address, passport) {
        if (!(0, utils_1.IsValidAddress)(service_address)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress);
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().DemandFn('yes_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.address(service_address),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.bounty_type],
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().DemandFn('yes'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.address(service_address),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.bounty_type],
            });
        }
    };
    Demand.prototype.deposit = function (bounty) {
        if (!protocol_1.Protocol.IsValidObjects([bounty])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects);
        }
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().DemandFn('deposit'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, bounty)],
            typeArguments: [this.bounty_type],
        });
    };
    Demand.prototype.present = function (service, service_pay_type, tips, passport) {
        if (!(0, utils_1.IsValidDesription)(tips)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription, 'present.tips');
        }
        if (service_pay_type && !(0, utils_1.IsValidArgType)(service_pay_type)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArgType, 'service_pay_type');
        }
        if (typeof (service) === 'number') {
            if (!(0, utils_1.IsValidU8)(service) || !passport) {
                (0, exception_1.ERROR)(exception_1.Errors.IsValidU8, 'present.service or present.passport');
            }
        }
        else {
            if (!protocol_1.Protocol.IsValidObjects([service])) {
                (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'present.service');
            }
        }
        if (passport) {
            if (typeof (service) === 'number') {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().DemandFn('present_with_passport2'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(tips)],
                    typeArguments: [this.bounty_type],
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().DemandFn('present_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, service),
                        this.txb.pure.string(tips)],
                    typeArguments: [this.bounty_type, service_pay_type],
                });
            }
        }
        else {
            if (typeof (service) !== 'number') {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().DemandFn('present'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, service),
                        this.txb.pure.string(tips)],
                    typeArguments: [this.bounty_type, service_pay_type],
                });
            }
        }
    };
    Demand.prototype.change_permission = function (new_permission) {
        if (!protocol_1.Protocol.IsValidObjects([new_permission])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects);
        }
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().DemandFn('permission_set'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission), protocol_1.Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments: [this.bounty_type]
        });
        this.permission = new_permission;
    };
    Demand.parseObjectType = function (chain_type) {
        return (0, utils_1.parseObjectType)(chain_type, 'demand::Demand<');
    };
    Demand.MAX_BOUNTY_COUNT = 300;
    Demand.MAX_PRESENTERS_COUNT = 200;
    return Demand;
}());
exports.Demand = Demand;
