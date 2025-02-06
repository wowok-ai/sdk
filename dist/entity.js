"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
var protocol_1 = require("./protocol");
var utils_1 = require("./utils");
var exception_1 = require("./exception");
var Entity = /** @class */ (function () {
    function Entity(txb) {
        this.txb = txb;
        this.object = '';
    }
    Entity.prototype.get_object = function () { return this.object; };
    Entity.From = function (txb) {
        var r = new Entity(txb);
        r.object = protocol_1.Protocol.TXB_OBJECT(txb, protocol_1.Protocol.Instance().EntityObject());
        return r;
    };
    Entity.prototype.mark = function (resource, address, like) {
        if (!(0, utils_1.IsValidAddress)(address))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, like);
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().EntityFn(like),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, resource.get_object()),
                this.txb.pure.address(address)]
        });
    };
    Entity.prototype.add_safer = function (safer, bExistModify) {
        if (bExistModify === void 0) { bExistModify = true; }
        if (safer.length === 0)
            return;
        if (!(0, utils_1.IsValidArray)(safer, function (v) {
            if (!(0, utils_1.IsValidName)(v.name) || !(0, utils_1.IsValidDesription)(v.value)) {
                return false;
            }
        })) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'add_safer');
        }
        var name = safer.map(function (v) { return v.name; });
        var value = safer.map(function (v) { return v.value; });
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().EntityFn('safer_add'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', name),
                this.txb.pure.vector('string', value), this.txb.pure.bool(bExistModify)]
        });
    };
    Entity.prototype.remove_safer = function (name, removeall) {
        if (name.length === 0 && !removeall)
            return;
        if (removeall) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().EntityFn('safer_remove_all'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object)]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().EntityFn('safer_remove'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', name)]
            });
        }
    };
    Entity.prototype.update = function (info) {
        var _a, _b, _c, _d;
        if ((info === null || info === void 0 ? void 0 : info.name) && !(0, utils_1.IsValidName)(info.name))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName, 'update');
        if ((info === null || info === void 0 ? void 0 : info.description) && !(0, utils_1.IsValidDesription)(info.description))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription, 'update');
        if ((info === null || info === void 0 ? void 0 : info.avatar) && !(0, utils_1.isValidHttpUrl)(info.avatar))
            (0, exception_1.ERROR)(exception_1.Errors.isValidHttpUrl, 'update:avatar');
        if ((info === null || info === void 0 ? void 0 : info.twitter) && !(0, utils_1.IsValidName)(info.twitter))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName, 'update:twitter');
        if ((info === null || info === void 0 ? void 0 : info.homepage) && !(0, utils_1.isValidHttpUrl)(info.homepage))
            (0, exception_1.ERROR)(exception_1.Errors.isValidHttpUrl, 'update:homepage');
        if ((info === null || info === void 0 ? void 0 : info.discord) && !(0, utils_1.IsValidName)(info.discord))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName, 'update:discord');
        var bytes = utils_1.Bcs.getInstance().bcs.ser('PersonalInfo', {
            name: info.name ? new TextEncoder().encode(info.name) : '',
            description: (info === null || info === void 0 ? void 0 : info.description) ? new TextEncoder().encode(info.description) : '',
            avatar: (_a = info === null || info === void 0 ? void 0 : info.avatar) !== null && _a !== void 0 ? _a : '',
            twitter: (_b = info === null || info === void 0 ? void 0 : info.twitter) !== null && _b !== void 0 ? _b : '',
            discord: (_c = info === null || info === void 0 ? void 0 : info.discord) !== null && _c !== void 0 ? _c : '',
            homepage: (_d = info === null || info === void 0 ? void 0 : info.homepage) !== null && _d !== void 0 ? _d : '',
        }).toBytes();
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().EntityFn('avatar_update'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('u8', [].slice.call(bytes))]
        });
    };
    Entity.prototype.create_resource = function () {
        return this.txb.moveCall({
            target: protocol_1.Protocol.Instance().EntityFn('resource_create'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object)]
        });
    };
    Entity.prototype.create_resource2 = function () {
        return this.txb.moveCall({
            target: protocol_1.Protocol.Instance().EntityFn('resource_create2'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object)]
        });
    };
    Entity.prototype.destroy_resource = function (resource) {
        return this.txb.moveCall({
            target: protocol_1.Protocol.Instance().EntityFn('resource_destroy'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, resource.get_object())]
        });
    };
    Entity.prototype.transfer_resource = function (resource, new_address) {
        if (!(0, utils_1.IsValidAddress)(new_address))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'transfer_resource');
        return this.txb.moveCall({
            target: protocol_1.Protocol.Instance().EntityFn('resource_transfer'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, resource.get_object()),
                this.txb.pure.address(new_address)]
        });
    };
    Entity.prototype.query_ent = function (address_queried) {
        if (!(0, utils_1.IsValidAddress)(address_queried)) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'query_ent');
        }
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().EntityFn('QueryEnt'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(address_queried)]
        });
    };
    return Entity;
}());
exports.Entity = Entity;
