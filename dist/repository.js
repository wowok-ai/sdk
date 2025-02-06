"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = exports.Repository_Type = exports.Repository_Policy_Mode = void 0;
var protocol_1 = require("./protocol");
var permission_1 = require("./permission");
var utils_1 = require("./utils");
var exception_1 = require("./exception");
var utils_2 = require("./utils");
var Repository_Policy_Mode;
(function (Repository_Policy_Mode) {
    Repository_Policy_Mode[Repository_Policy_Mode["POLICY_MODE_FREE"] = 0] = "POLICY_MODE_FREE";
    Repository_Policy_Mode[Repository_Policy_Mode["POLICY_MODE_STRICT"] = 1] = "POLICY_MODE_STRICT";
})(Repository_Policy_Mode || (exports.Repository_Policy_Mode = Repository_Policy_Mode = {}));
var Repository_Type;
(function (Repository_Type) {
    Repository_Type[Repository_Type["NORMAL"] = 0] = "NORMAL";
    Repository_Type[Repository_Type["WOWOK_GRANTEE"] = 1] = "WOWOK_GRANTEE";
    Repository_Type[Repository_Type["WOWOK_ORACLE"] = 2] = "WOWOK_ORACLE";
})(Repository_Type || (exports.Repository_Type = Repository_Type = {}));
var Repository = /** @class */ (function () {
    function Repository(txb, permission) {
        this.txb = txb;
        this.permission = permission;
        this.object = '';
    }
    Repository.prototype.get_object = function () { return this.object; };
    Repository.From = function (txb, permission, object) {
        var r = new Repository(txb, permission);
        r.object = protocol_1.Protocol.TXB_OBJECT(txb, object);
        return r;
    };
    Repository.New = function (txb, permission, description, policy_mode, passport) {
        if (policy_mode === void 0) { policy_mode = Repository_Policy_Mode.POLICY_MODE_FREE; }
        if (!protocol_1.Protocol.IsValidObjects([permission])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'permission');
        }
        if (!(0, utils_1.IsValidDesription)(description)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription);
        }
        var r = new Repository(txb, permission);
        if (passport) {
            r.object = txb.moveCall({
                target: protocol_1.Protocol.Instance().RepositoryFn('new_with_passport'),
                arguments: [passport, txb.pure.string(description), txb.pure.u8(policy_mode), protocol_1.Protocol.TXB_OBJECT(txb, permission)],
            });
        }
        else {
            r.object = txb.moveCall({
                target: protocol_1.Protocol.Instance().RepositoryFn('new'),
                arguments: [txb.pure.string(description), txb.pure.u8(policy_mode), protocol_1.Protocol.TXB_OBJECT(txb, permission)],
            });
        }
        return r;
    };
    Repository.prototype.launch = function () {
        return this.txb.moveCall({
            target: protocol_1.Protocol.Instance().RepositoryFn('create'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object)],
        });
    };
    Repository.prototype.add_data = function (data) {
        var _this = this;
        if (!Repository.IsValidName(data.key)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName);
        }
        var bValid = true;
        data.data.forEach(function (value) {
            if (!(0, utils_1.IsValidAddress)(value.address))
                bValid = false;
            if (!Repository.IsValidValue(value.bcsBytes))
                bValid = false;
        });
        if (!bValid) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam);
        }
        if ((data === null || data === void 0 ? void 0 : data.value_type) !== undefined) {
            data.data.forEach(function (d) { return _this.txb.moveCall({
                target: protocol_1.Protocol.Instance().RepositoryFn('add'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.object),
                    _this.txb.pure.address(d.address),
                    _this.txb.pure.string(data.key),
                    _this.txb.pure.u8(data.value_type),
                    _this.txb.pure.vector('u8', __spreadArray([], __read(d.bcsBytes), false)),
                    protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.permission),],
            }); });
        }
        else {
            data.data.forEach(function (d) { return _this.txb.moveCall({
                target: protocol_1.Protocol.Instance().RepositoryFn('add_typed_data'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.object),
                    _this.txb.pure.address(d.address),
                    _this.txb.pure.string(data.key),
                    _this.txb.pure.vector('u8', __spreadArray([], __read(d.bcsBytes), false)),
                    protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.permission),],
            }); });
        }
    };
    Repository.prototype.remove = function (address, key) {
        if (!Repository.IsValidName(key)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName);
        }
        if (!(0, utils_1.IsValidAddress)(address)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress);
        }
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().RepositoryFn('remove'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                this.txb.pure.address(address),
                this.txb.pure.string(key),
                protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission),
            ],
        });
    };
    Repository.prototype.add_reference = function (references, passport) {
        if (references.length === 0)
            return;
        if (!(0, utils_1.IsValidArray)(references, utils_1.IsValidAddress)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'add_reference');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().RepositoryFn('reference_add_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.vector('address', (0, utils_1.array_unique)(references)),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().RepositoryFn('reference_add'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.vector('address', (0, utils_1.array_unique)(references)),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
    };
    Repository.prototype.remove_reference = function (references, removeall, passport) {
        if (references.length === 0 && !removeall)
            return;
        if (!(0, utils_1.IsValidArray)(references, utils_1.IsValidAddress)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'remove_reference');
        }
        if (removeall) {
            if (passport) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().RepositoryFn('reference_removeall_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().RepositoryFn('reference_removeall'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
                });
            }
        }
        else {
            if (passport) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().RepositoryFn('reference_remove_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                        this.txb.pure.vector('address', (0, utils_1.array_unique)(references)),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().RepositoryFn('reference_remove'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                        this.txb.pure.vector('address', (0, utils_1.array_unique)(references)),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
                });
            }
        }
    };
    // add or modify the old 
    Repository.prototype.add_policies = function (policies, passport) {
        var _this = this;
        if (policies.length === 0)
            return;
        var bValid = true;
        policies.forEach(function (p) {
            if (!(0, utils_1.IsValidDesription)(p.description) || !Repository.IsValidName(p.key)) {
                bValid = false;
            }
        });
        if (!bValid) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'policies');
        }
        policies.forEach(function (policy) {
            var permission_index = _this.txb.pure.option('u64', (policy === null || policy === void 0 ? void 0 : policy.permissionIndex) ? policy === null || policy === void 0 ? void 0 : policy.permissionIndex : undefined);
            if (passport) {
                _this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().RepositoryFn('policy_add_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.object),
                        _this.txb.pure.string(policy.key),
                        _this.txb.pure.string(policy.description),
                        permission_index, _this.txb.pure.u8(policy.dataType),
                        protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.permission)]
                });
            }
            else {
                _this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().RepositoryFn('policy_add'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.object),
                        _this.txb.pure.string(policy.key),
                        _this.txb.pure.string(policy.description),
                        permission_index, _this.txb.pure.u8(policy.dataType),
                        protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.permission)]
                });
            }
        });
    };
    Repository.prototype.remove_policies = function (policy_keys, passport) {
        if (policy_keys.length === 0)
            return;
        if (!(0, utils_1.IsValidArray)(policy_keys, Repository.IsValidName)) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'policy_keys');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().RepositoryFn('policy_remove_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.vector('string', (0, utils_1.array_unique)(policy_keys)),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().RepositoryFn('policy_remove'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.vector('string', (0, utils_1.array_unique)(policy_keys)),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
    };
    Repository.prototype.rename_policy = function (policy_key, new_policy_key, passport) {
        if (!(0, utils_1.IsValidName)(policy_key) || !(0, utils_1.IsValidName)(new_policy_key)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName, 'change_policy');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().RepositoryFn('policy_rename_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.string(policy_key), this.txb.pure.string(new_policy_key),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().RepositoryFn('policy_rename'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.string(policy_key), this.txb.pure.string(new_policy_key),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
    };
    // PermissionIndex.description_set
    Repository.prototype.set_description = function (description, passport) {
        if (!(0, utils_1.IsValidDesription)(description)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription);
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().RepositoryFn('description_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().RepositoryFn('description_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
    };
    Repository.prototype.set_policy_mode = function (policy_mode, passport) {
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().RepositoryFn('policy_mode_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u8(policy_mode), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().RepositoryFn('policy_mode_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u8(policy_mode), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
    };
    Repository.prototype.set_policy_description = function (policy, description, passport) {
        if (!Repository.IsValidName(policy)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName, 'policy');
        }
        if (!(0, utils_1.IsValidDesription)(description)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription);
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().RepositoryFn('policy_description_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(policy), this.txb.pure.string(description),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().RepositoryFn('policy_description_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(policy), this.txb.pure.string(description),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
    };
    Repository.prototype.set_policy_permission = function (policy, permission_index, passport) {
        if (!Repository.IsValidName(policy)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName, 'policy');
        }
        var index = this.txb.pure.option('u64', undefined);
        if (permission_index !== undefined) {
            if (!permission_1.Permission.IsValidPermissionIndex(permission_index)) {
                (0, exception_1.ERROR)(exception_1.Errors.IsValidPermissionIndex);
            }
            index = this.txb.pure.option('u64', permission_index);
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().RepositoryFn('policy_permission_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), index, protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().RepositoryFn('policy_permission_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), index, protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
    };
    Repository.prototype.change_permission = function (new_permission) {
        if (!protocol_1.Protocol.IsValidObjects([new_permission])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects);
        }
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().RepositoryFn('permission_set'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission), protocol_1.Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments: []
        });
        this.permission = new_permission;
    };
    Repository.rpc_de_data = function (fields) {
        var rep = fields === null || fields === void 0 ? void 0 : fields.map(function (v) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
            var value = new Uint8Array((_c = (_b = (_a = v === null || v === void 0 ? void 0 : v.data) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.fields) === null || _c === void 0 ? void 0 : _c.value);
            var type = (value === null || value === void 0 ? void 0 : value.length) > 0 ? value[0] : null;
            var d = value.length > 0 ? value.slice(1) : Uint8Array.from([]);
            if (type === protocol_1.ValueType.TYPE_STRING) {
                d = utils_1.Bcs.getInstance().de(protocol_1.ValueType.TYPE_VEC_U8, d);
                d = new TextDecoder().decode(Uint8Array.from(d));
            }
            else if (type === protocol_1.ValueType.TYPE_VEC_STRING) {
                d = utils_1.Bcs.getInstance().de(protocol_1.ValueType.TYPE_VEC_VEC_U8, d);
                d = d.map(function (i) {
                    return new TextDecoder().decode(Uint8Array.from(i));
                });
            }
            else {
                d = utils_1.Bcs.getInstance().de(value[0], d);
                if (type === protocol_1.ValueType.TYPE_ADDRESS) {
                    d = '0x' + d;
                }
                else if (type === protocol_1.ValueType.TYPE_VEC_ADDRESS) {
                    d = d.map(function (v) { return ('0x' + v); });
                }
                else if (type === protocol_1.ValueType.TYPE_BOOL) {
                    d = d ? 'True' : 'False';
                }
            }
            ;
            return { object: (_g = (_f = (_e = (_d = v === null || v === void 0 ? void 0 : v.data) === null || _d === void 0 ? void 0 : _d.content) === null || _e === void 0 ? void 0 : _e.fields) === null || _f === void 0 ? void 0 : _f.id) === null || _g === void 0 ? void 0 : _g.id, id: (_m = (_l = (_k = (_j = (_h = v === null || v === void 0 ? void 0 : v.data) === null || _h === void 0 ? void 0 : _h.content) === null || _j === void 0 ? void 0 : _j.fields) === null || _k === void 0 ? void 0 : _k.name) === null || _l === void 0 ? void 0 : _l.fields) === null || _m === void 0 ? void 0 : _m.id,
                name: (_s = (_r = (_q = (_p = (_o = v === null || v === void 0 ? void 0 : v.data) === null || _o === void 0 ? void 0 : _o.content) === null || _p === void 0 ? void 0 : _p.fields) === null || _q === void 0 ? void 0 : _q.name) === null || _r === void 0 ? void 0 : _r.fields) === null || _s === void 0 ? void 0 : _s.key,
                data: d, dataType: (0, utils_1.ValueTypeConvert)(type) };
        });
        return rep;
    };
    Repository.DataType2ValueType = function (data) {
        try {
            var value = BigInt(data);
            var t = protocol_1.ValueType.TYPE_U8;
            if (value <= utils_2.MAX_U8) {
            }
            else if (value <= utils_2.MAX_U64) {
                t = protocol_1.ValueType.TYPE_U64;
            }
            else if (value <= utils_2.MAX_U128) {
                t = protocol_1.ValueType.TYPE_U128;
            }
            else if (value <= utils_2.MAX_U256) {
                t = protocol_1.ValueType.TYPE_U256;
            }
            else {
                return undefined;
            }
        }
        catch (e) {
            console.log(e);
        }
        return undefined;
    };
    Repository.MAX_POLICY_COUNT = 120;
    Repository.MAX_KEY_LENGTH = 128;
    Repository.MAX_VALUE_LENGTH = 204800;
    Repository.MAX_REFERENCE_COUNT = 100;
    Repository.IsValidName = function (key) {
        return key.length <= Repository.MAX_KEY_LENGTH && key.length != 0;
    };
    Repository.IsValidValue = function (value) {
        return value.length < Repository.MAX_VALUE_LENGTH;
    };
    Repository.parseObjectType = function (chain_type) {
        return (0, utils_2.parseObjectType)(chain_type, 'repository::Repository<');
    };
    Repository.ResolveRepositoryData = function (dataType, data) {
        if (dataType === protocol_1.RepositoryValueType.String) {
            return { type: protocol_1.ValueType.TYPE_STRING, data: utils_1.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_VEC_U8, new TextEncoder().encode(data.toString())) };
        }
        else if (dataType === protocol_1.RepositoryValueType.PositiveNumber) {
            var t = Repository.DataType2ValueType(data);
            if (!t)
                return undefined;
            return { type: t, data: utils_1.Bcs.getInstance().ser(t, data) };
        }
        else if (dataType === protocol_1.RepositoryValueType.Address) {
            if (!(0, utils_1.IsValidAddress)(data))
                return undefined;
            return { type: protocol_1.ValueType.TYPE_ADDRESS, data: utils_1.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_ADDRESS, data) };
        }
        else if (dataType === protocol_1.RepositoryValueType.Address_Vec) {
            for (var i = 0; i < data.length; ++i) {
                if (!(0, utils_1.IsValidAddress)(data[i]))
                    return undefined;
            }
            return { type: protocol_1.ValueType.TYPE_VEC_ADDRESS, data: utils_1.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_VEC_ADDRESS, data) };
        }
        else if (dataType === protocol_1.RepositoryValueType.PositiveNumber_Vec) {
            var type = protocol_1.ValueType.TYPE_U8;
            for (var i = 0; i < data.length; ++i) {
                var t = Repository.DataType2ValueType(data);
                if (!t)
                    return undefined;
                if (t > type)
                    type = t;
            }
            if (type === protocol_1.ValueType.TYPE_U8) {
                type = protocol_1.ValueType.TYPE_VEC_U8;
            }
            else if (type === protocol_1.ValueType.TYPE_U64) {
                type = protocol_1.ValueType.TYPE_VEC_U64;
            }
            else if (type === protocol_1.ValueType.TYPE_U128) {
                type = protocol_1.ValueType.TYPE_VEC_U128;
            }
            else {
                type = protocol_1.ValueType.TYPE_VEC_U256;
            }
            return { type: type, data: utils_1.Bcs.getInstance().ser(type, data) };
        }
        else if (dataType === protocol_1.RepositoryValueType.String_Vec) {
            var r = data.map(function (v) {
                return new TextEncoder().encode(v);
            });
            return { type: protocol_1.ValueType.TYPE_VEC_STRING, data: utils_1.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_VEC_VEC_U8, r) };
        }
        else if (dataType === protocol_1.RepositoryValueType.Bool) {
            if (typeof (data) !== 'boolean')
                return undefined;
            return { type: protocol_1.ValueType.TYPE_BOOL, data: utils_1.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_BOOL, data) };
        }
        return undefined;
    };
    return Repository;
}());
exports.Repository = Repository;
