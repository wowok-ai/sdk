"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = void 0;
var protocol_1 = require("./protocol");
var utils_1 = require("./utils");
var exception_1 = require("./exception");
var Resource = /** @class */ (function () {
    function Resource(txb) {
        this.txb = txb;
        this.object = '';
    }
    Resource.prototype.get_object = function () { return this.object; };
    Resource.From = function (txb, object) {
        var r = new Resource(txb);
        r.object = protocol_1.Protocol.TXB_OBJECT(txb, object);
        return r;
    };
    Resource.prototype.launch = function () {
        if (!this.object)
            (0, exception_1.ERROR)(exception_1.Errors.Fail, 'launch object Invalid');
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().ResourceFn('create'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object)]
        });
    };
    Resource.prototype.add = function (name, object) {
        var bString = true;
        if (!(0, utils_1.IsValidName)(name))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName, 'add.name');
        if (!(0, utils_1.IsValidArray)(object, function (item) {
            if (typeof (item) === 'string') {
                return (0, utils_1.IsValidAddress)(item);
            }
            else {
                bString = false;
            }
            return true;
        })) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'add.object');
        }
        if (bString) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ResourceFn('add'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name),
                    this.txb.pure.vector('address', object)]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ResourceFn('add'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name),
                    this.txb.makeMoveVec({ elements: object, type: 'address' })]
            });
        }
    };
    Resource.prototype.add2 = function (object, name) {
        if (typeof (object) === 'string' && !(0, utils_1.IsValidAddress)(object))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'add2');
        if (!(0, utils_1.IsValidArray)(name, utils_1.IsValidName))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'add2');
        if (!name)
            return;
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().ResourceFn('add2'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), typeof (object) === 'string' ? this.txb.pure.address(object) : object,
                this.txb.pure.vector('string', name)]
        });
    };
    Resource.prototype.remove = function (name, object, removeall) {
        if (!(0, utils_1.IsValidName)(name))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName, 'Resource: remove');
        if (object.length === 0 && !removeall)
            return;
        if (removeall) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ResourceFn('remove_all'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name)]
            });
        }
        else if (object) {
            if (!(0, utils_1.IsValidArray)(object, utils_1.IsValidAddress))
                (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'Resource: remove');
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ResourceFn('remove'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name),
                    this.txb.pure.vector('address', object)]
            });
        }
    };
    Resource.prototype.remove2 = function (object, name) {
        if (!(0, utils_1.IsValidAddress)(object))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'Resource: remove2');
        if (!(0, utils_1.IsValidArray)(name, utils_1.IsValidName))
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'Resource: remove2');
        if (!name)
            return;
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().ResourceFn('remove2'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(object),
                this.txb.pure.vector('string', name)]
        });
    };
    Resource.prototype.rename = function (old_name, new_name) {
        if (!(0, utils_1.IsValidName)(new_name))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName, 'Resource: rename');
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().ResourceFn('rename'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(old_name),
                this.txb.pure.string(new_name)]
        });
    };
    Resource.prototype.add_tags = function (object, nick, tags) {
        if (!(0, utils_1.IsValidAddress)(object))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'add_tags');
        if (!nick || !tags)
            return;
        if (!(0, utils_1.IsValidName)(nick))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName, 'add_tags');
        if (!(0, utils_1.IsValidArray)(tags, utils_1.IsValidName))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'add_tags');
        if (tags.length > Resource.MAX_TAGS)
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'add_tags');
        var encode = new TextEncoder();
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().ResourceFn('tags_add'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(object),
                this.txb.pure.string(nick),
                this.txb.pure.vector('string', tags)
            ]
        });
    };
    Resource.prototype.remove_tags = function (object) {
        if (!(0, utils_1.IsValidAddress)(object))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'Resource: remove_tags');
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().ResourceFn('tags_remove'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(object)]
        });
    };
    Resource.MAX_ADDRESS_COUNT = 600;
    Resource.MAX_TAGS = 8;
    Resource.LikeName = "like";
    Resource.DislikeName = "dislike";
    Resource.FavorName = "favor";
    Resource.LaunchName = 'launch';
    Resource.OrderName = 'order';
    return Resource;
}());
exports.Resource = Resource;
