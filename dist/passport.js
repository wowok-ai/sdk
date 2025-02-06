"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
exports.Passport = exports.GuardParser = void 0;
var transactions_1 = require("@mysten/sui/transactions");
var protocol_1 = require("./protocol");
var utils_1 = require("./utils");
var exception_1 = require("./exception");
var guard_1 = require("./guard");
var GuardParser = /** @class */ (function () {
    function GuardParser(guards) {
        var _this = this;
        this.guard_list = [];
        this.index = 0;
        this.guardlist = function () { return _this.guard_list; };
        this.future_fills = function () {
            var ret = [];
            _this.guard_list.forEach(function (g) {
                // cmd already in query_list, so filter it out.
                //console.log(g.constant); console.log(g.input)
                g.constant.filter(function (i) { return i.bWitness; }).forEach(function (v) {
                    var cmd = g.input.filter(function (k) { return k.identifier === v.identifier && k.cmd !== undefined; }).map(function (k) { return k.cmd; });
                    var cited = 0;
                    g.input.forEach(function (k) {
                        if (k.identifier === v.identifier)
                            cited++;
                    });
                    ret.push({ guard: g.id, witness: undefined, identifier: v.identifier, type: v.type, cmd: cmd !== null && cmd !== void 0 ? cmd : [], cited: cited });
                });
            });
            return ret;
        };
        this.done = function (fill, onPassportQueryReady) { return __awaiter(_this, void 0, void 0, function () {
            var objects, res;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        objects = [];
                        // check all witness and get all objects to query.
                        this.guard_list.forEach(function (g) {
                            g.constant.forEach(function (v) {
                                if (v.bWitness) {
                                    var value = fill === null || fill === void 0 ? void 0 : fill.find(function (i) { return i.identifier === v.identifier; });
                                    if (!value) {
                                        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'done: invalid witness ' + v.identifier);
                                    }
                                    else {
                                        v.value = value.witness;
                                    }
                                }
                            });
                            g.input.filter(function (v) { return v.cmd !== undefined; }).forEach(function (i) {
                                if (i.identifier !== undefined) {
                                    var value = g.constant.find(function (c) { return c.identifier === i.identifier && c.type === protocol_1.ValueType.TYPE_ADDRESS; });
                                    if (!value || !(0, utils_1.IsValidAddress)(value.value))
                                        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'done: invalid identifier ' + i.identifier);
                                    objects.push(value.value);
                                }
                                else {
                                    objects.push(i.value);
                                }
                            });
                        });
                        if (!onPassportQueryReady) return [3 /*break*/, 1];
                        if (objects.length === 0) {
                            onPassportQueryReady(this.done_helper([]));
                            return [2 /*return*/];
                        }
                        protocol_1.Protocol.Instance().Query_Raw((0, utils_1.array_unique)(objects), { showType: true }).then(function (res) {
                            onPassportQueryReady(_this.done_helper(res));
                        }).catch(function (e) {
                            console.log(e);
                            onPassportQueryReady(undefined);
                        });
                        return [2 /*return*/, undefined];
                    case 1:
                        res = [];
                        if (!(objects.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, protocol_1.Protocol.Instance().Query_Raw((0, utils_1.array_unique)(objects), { showType: true })];
                    case 2:
                        res = _b.sent();
                        _b.label = 3;
                    case 3: return [2 /*return*/, this.done_helper(res)];
                }
            });
        }); };
        // create onchain query for objects : object, movecall-types, id
        this.object_query = function (data, method) {
            if (method === void 0) { method = 'guard_query'; }
            for (var k = 0; k < protocol_1.Protocol.Instance().WOWOK_OBJECTS_TYPE().length; k++) {
                if (data.type.includes(protocol_1.Protocol.Instance().WOWOK_OBJECTS_TYPE()[k])) { // type: pack::m::Object<...>
                    return { target: protocol_1.Protocol.Instance().WOWOK_OBJECTS_PREFIX_TYPE()[k] + method,
                        object: transactions_1.Inputs.SharedObjectRef({
                            objectId: data.objectId,
                            mutable: false,
                            initialSharedVersion: data.version,
                        }),
                        types: (0, utils_1.parse_object_type)(data.type),
                        id: data.objectId, };
                }
            }
        };
        this.guards = guards;
    }
    GuardParser.prototype.get_index = function () { return this.index++; };
    GuardParser.Parse_Guard_Helper = function (guards, res) {
        var protocol = protocol_1.Protocol.Instance();
        var me = new _a(guards);
        res.forEach(function (r) {
            var _b, _c, _d, _e, _f;
            var c = (_b = r.data) === null || _b === void 0 ? void 0 : _b.content;
            if (!c)
                (0, exception_1.ERROR)(exception_1.Errors.Fail, 'Parse_Guard_Helper invalid content');
            var index = protocol.WOWOK_OBJECTS_TYPE().findIndex(function (v) { return v.includes('guard::Guard') && v == c.type; });
            if (index === -1)
                (0, exception_1.ERROR)(exception_1.Errors.Fail, 'Parse_Guard_Helper invalid type: ' + c.type);
            if (c.fields.input.type === (protocol.Package('base') + '::bcs::BCS')) {
                var constants = _a.parse_constant(c.fields.constants); // MUST first
                var inputs = _a.parse_bcs(constants, Uint8Array.from(c.fields.input.fields.bytes));
                me.guard_list.push({ id: c.fields.id.id, input: __spreadArray([], __read(inputs), false), constant: __spreadArray([], __read(constants), false), digest: (_d = (_c = r.data) === null || _c === void 0 ? void 0 : _c.digest) !== null && _d !== void 0 ? _d : '', version: (_f = (_e = r.data) === null || _e === void 0 ? void 0 : _e.version) !== null && _f !== void 0 ? _f : '' });
            }
            else {
                (0, exception_1.ERROR)(exception_1.Errors.Fail, 'Parse_Guard_Helper invalid package: ' + c.fields.input.type);
            }
        });
        return me;
    };
    GuardParser.prototype.done_helper = function (res) {
        var _this = this;
        var query = [];
        var guards = [];
        this.guard_list.forEach(function (g) {
            guards.push(g.id);
            g.input.filter(function (v) { return v.cmd !== undefined; }).forEach(function (q) {
                var _b;
                var id = q.value;
                if (!id && q.identifier !== undefined) {
                    id = (_b = g.constant.find(function (i) { return i.identifier == q.identifier; })) === null || _b === void 0 ? void 0 : _b.value;
                }
                var r = res.find(function (r) { var _b; return ((_b = r.data) === null || _b === void 0 ? void 0 : _b.objectId) == id; });
                if (!r) {
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'query object not match');
                }
                var object = _this.object_query(r.data); // build passport query objects
                if (!object) {
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'query object fail');
                }
                query.push(object);
            });
        });
        return { query: query, info: this.guard_list };
    };
    var _a;
    _a = GuardParser;
    GuardParser.DeGuardObject_FromData = function (guard_constants, guard_input_bytes) {
        var constants = _a.parse_constant(guard_constants);
        // console.log(constants)
        var inputs = _a.parse_bcs(constants, guard_input_bytes);
        // console.log(data);
        if (!inputs || inputs.length == 0)
            (0, exception_1.ERROR)(exception_1.Errors.Fail, 'GuardObject: data parsed error');
        var stack = [];
        inputs.forEach(function (d) {
            _a.ResolveData(constants, stack, __assign(__assign({}, d), { child: [] }));
        });
        if (stack.length != 1) {
            (0, exception_1.ERROR)(exception_1.Errors.Fail, 'GuardObject: parse error');
        }
        return { object: stack.pop(), constant: constants };
    };
    /// convert guard-on-chain to js object
    GuardParser.DeGuardObject = function (protocol, guard) { return __awaiter(void 0, void 0, void 0, function () {
        var res, content;
        var _b;
        return __generator(_a, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(0, utils_1.IsValidAddress)(guard)) {
                        (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'GuardObject guard');
                    }
                    return [4 /*yield*/, protocol.Query_Raw([guard])];
                case 1:
                    res = _c.sent();
                    if (res.length == 0 || !res[0].data || ((_b = res[0].data) === null || _b === void 0 ? void 0 : _b.objectId) != guard) {
                        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'GuardObject query error');
                    }
                    content = res[0].data.content;
                    if ((content === null || content === void 0 ? void 0 : content.type) != protocol.Package('base') + '::guard::Guard') {
                        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'GuardObject object invalid');
                    }
                    return [2 /*return*/, _a.DeGuardObject_FromData(content.fields.constants, content.fields.input.fields.bytes)];
            }
        });
    }); };
    GuardParser.ResolveData = function (constants, stack, current) {
        switch (current.type) {
            case protocol_1.OperatorType.TYPE_LOGIC_ALWAYS_TRUE:
                current.ret_type = protocol_1.ValueType.TYPE_BOOL;
                stack.push(current);
                return;
            case protocol_1.OperatorType.TYPE_LOGIC_NOT:
                current.ret_type = protocol_1.ValueType.TYPE_BOOL;
                if (stack.length < 1)
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'ResolveData: TYPE_LOGIC_NOT');
                var param = stack.pop();
                if (!param.ret_type || param.ret_type != protocol_1.ValueType.TYPE_BOOL) {
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'ResolveData: TYPE_LOGIC_NOT type invalid');
                }
                current.child.push(param);
                stack.push(current);
                return;
            case protocol_1.OperatorType.TYPE_LOGIC_AS_U256_GREATER:
            case protocol_1.OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_AS_U256_LESSER:
            case protocol_1.OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_AS_U256_EQUAL:
            case protocol_1.OperatorType.TYPE_NUMBER_ADD:
            case protocol_1.OperatorType.TYPE_NUMBER_DEVIDE:
            case protocol_1.OperatorType.TYPE_NUMBER_MOD:
            case protocol_1.OperatorType.TYPE_NUMBER_MULTIPLY:
            case protocol_1.OperatorType.TYPE_NUMBER_SUBTRACT:
                if (current.type === protocol_1.OperatorType.TYPE_LOGIC_AS_U256_GREATER || current.type === protocol_1.OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL ||
                    current.type === protocol_1.OperatorType.TYPE_LOGIC_AS_U256_LESSER || current.type === protocol_1.OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL ||
                    current.type === protocol_1.OperatorType.TYPE_LOGIC_AS_U256_EQUAL) {
                    current.ret_type = protocol_1.ValueType.TYPE_BOOL;
                }
                else {
                    current.ret_type = protocol_1.ValueType.TYPE_U256;
                }
                if (stack.length < current.value || current.value < 2)
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'ResolveData: ' + current.type);
                for (var i = 0; i < current.value; ++i) {
                    var p = stack.pop();
                    if (!p.ret_type || !guard_1.GuardMaker.match_u256(p.ret_type))
                        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'ResolveData: ' + current.type + ' INVALID param type');
                    current.child.push(p);
                }
                stack.push(current);
                return;
            case protocol_1.OperatorType.TYPE_LOGIC_EQUAL:
                current.ret_type = protocol_1.ValueType.TYPE_BOOL;
                if (stack.length < current.value || current.value < 2)
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'ResolveData: ' + current.type);
                var p0 = stack.pop();
                current.child.push(p0);
                for (var i = 1; i < current.value; ++i) {
                    var p = stack.pop();
                    if (!p.ret_type || (p.ret_type != p0.ret_type))
                        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'ResolveData: ' + current.type + ' INVALID param type');
                    current.child.push(p);
                }
                stack.push(current);
                return;
            case protocol_1.OperatorType.TYPE_LOGIC_HAS_SUBSTRING:
                current.ret_type = protocol_1.ValueType.TYPE_BOOL;
                if (stack.length < current.value || current.value < 2)
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'ResolveData: ' + current.type);
                for (var i = 0; i < current.value; ++i) {
                    var p = stack.pop();
                    if (!p.ret_type || (p.ret_type != protocol_1.ValueType.TYPE_STRING))
                        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'ResolveData: ' + current.type + ' INVALID param type');
                    current.child.push(p);
                }
                stack.push(current);
                return;
            case protocol_1.OperatorType.TYPE_LOGIC_AND:
            case protocol_1.OperatorType.TYPE_LOGIC_OR:
                current.ret_type = protocol_1.ValueType.TYPE_BOOL;
                if (stack.length < current.value || current.value < 2)
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'ResolveData: ' + current.type);
                for (var i = 0; i < current.value; ++i) {
                    var p = stack.pop();
                    if (!p.ret_type || (p.ret_type != protocol_1.ValueType.TYPE_BOOL))
                        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'ResolveData: ' + current.type + ' INVALID param type');
                    current.child.push(p);
                }
                stack.push(current);
                return;
            case protocol_1.OperatorType.TYPE_QUERY:
                if (!(current === null || current === void 0 ? void 0 : current.cmd))
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'OperateParamCount: cmd invalid ' + current.type);
                var r = guard_1.Guard.GetCmd(current.cmd);
                if (!r)
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'OperateParamCount: cmd not supported ' + current.type);
                current.ret_type = r[4];
                if (stack.length < r[3].length)
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'OperateParamCount: cmd param lost ' + current.type);
                r[3].forEach(function (e) {
                    var d = stack.pop();
                    if (!(d === null || d === void 0 ? void 0 : d.ret_type) || d.ret_type != e) {
                        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'OperateParamCount: cmd param not match ' + current.type);
                    }
                    current.child.push(d);
                });
                stack.push(current);
                return;
            case protocol_1.ValueType.TYPE_ADDRESS:
            case protocol_1.ValueType.TYPE_BOOL:
            case protocol_1.ValueType.TYPE_U128:
            case protocol_1.ValueType.TYPE_U256:
            case protocol_1.ValueType.TYPE_U64:
            case protocol_1.ValueType.TYPE_U8:
            case protocol_1.ValueType.TYPE_VEC_ADDRESS:
            case protocol_1.ValueType.TYPE_VEC_BOOL:
            case protocol_1.ValueType.TYPE_VEC_U128:
            case protocol_1.ValueType.TYPE_VEC_U256:
            case protocol_1.ValueType.TYPE_VEC_U64:
            case protocol_1.ValueType.TYPE_VEC_U8:
            case protocol_1.ValueType.TYPE_VEC_VEC_U8:
            case protocol_1.ValueType.TYPE_OPTION_ADDRESS:
            case protocol_1.ValueType.TYPE_OPTION_BOOL:
            case protocol_1.ValueType.TYPE_OPTION_U128:
            case protocol_1.ValueType.TYPE_OPTION_U256:
            case protocol_1.ValueType.TYPE_OPTION_U64:
            case protocol_1.ValueType.TYPE_OPTION_U8:
            case protocol_1.ValueType.TYPE_STRING:
                current.ret_type = current.type;
                stack.push(current);
                return;
            case protocol_1.ContextType.TYPE_CLOCK:
                current.ret_type = protocol_1.ValueType.TYPE_U64;
                stack.push(current);
                return;
            case protocol_1.ContextType.TYPE_SIGNER:
                current.ret_type = protocol_1.ValueType.TYPE_ADDRESS;
                stack.push(current);
                return;
            case protocol_1.ContextType.TYPE_GUARD:
                current.ret_type = protocol_1.ValueType.TYPE_ADDRESS;
                stack.push(current);
                return;
            case protocol_1.ContextType.TYPE_CONSTANT:
                var v = constants.find(function (e) { return e.identifier == (current === null || current === void 0 ? void 0 : current.identifier); });
                if (!v)
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'OperateParamCount: identifier  invalid ' + current.type);
                current.ret_type = v === null || v === void 0 ? void 0 : v.type;
                stack.push(current);
                return;
        }
        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'OperateParamCount: type  invalid ' + current.type);
    };
    GuardParser.Create = function (guards, onGuardInfo) { return __awaiter(void 0, void 0, void 0, function () {
        var guard_list, res;
        return __generator(_a, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(0, utils_1.IsValidArray)(guards, utils_1.IsValidAddress)) {
                        if (onGuardInfo)
                            onGuardInfo(undefined);
                        return [2 /*return*/, undefined];
                    }
                    guard_list = (0, utils_1.array_unique)(guards);
                    if (!onGuardInfo) return [3 /*break*/, 1];
                    protocol_1.Protocol.Instance().Query_Raw(guard_list)
                        .then(function (res) {
                        onGuardInfo(_a.Parse_Guard_Helper(guards, res));
                    }).catch(function (e) {
                        console.log(e);
                        onGuardInfo(undefined);
                    });
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, protocol_1.Protocol.Instance().Query_Raw(guard_list)];
                case 2:
                    res = _b.sent();
                    return [2 /*return*/, _a.Parse_Guard_Helper(guards, res)];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    GuardParser.parse_constant = function (constants) {
        var ret = [];
        constants.forEach(function (c) {
            var _b;
            var v = (_b = c === null || c === void 0 ? void 0 : c.fields) !== null && _b !== void 0 ? _b : c; // graphql dosnot 'fields', but rpcall has.
            var data = Uint8Array.from(v.value);
            var type = data.slice(0, 1)[0];
            if (v.bWitness) { //@ witness
                ret.push({ identifier: v.identifier, type: type, bWitness: v.bWitness, value: undefined });
                return;
            }
            var value = data.slice(1);
            switch (type) {
                case protocol_1.ValueType.TYPE_ADDRESS:
                    value = '0x' + utils_1.Bcs.getInstance().de(protocol_1.ValueType.TYPE_ADDRESS, Uint8Array.from(value)).toString();
                    break;
                case protocol_1.ValueType.TYPE_BOOL:
                case protocol_1.ValueType.TYPE_U8:
                case protocol_1.ValueType.TYPE_U64:
                case protocol_1.ValueType.TYPE_U128:
                case protocol_1.ValueType.TYPE_U256:
                case protocol_1.ValueType.TYPE_VEC_U8:
                case protocol_1.ValueType.TYPE_VEC_U64:
                case protocol_1.ValueType.TYPE_VEC_U128:
                case protocol_1.ValueType.TYPE_VEC_ADDRESS:
                case protocol_1.ValueType.TYPE_VEC_BOOL:
                case protocol_1.ValueType.TYPE_VEC_VEC_U8:
                case protocol_1.ValueType.TYPE_OPTION_ADDRESS:
                case protocol_1.ValueType.TYPE_OPTION_BOOL:
                case protocol_1.ValueType.TYPE_OPTION_U128:
                case protocol_1.ValueType.TYPE_OPTION_U8:
                case protocol_1.ValueType.TYPE_OPTION_U64:
                case protocol_1.ValueType.TYPE_OPTION_U256:
                case protocol_1.ValueType.TYPE_VEC_U256:
                case protocol_1.ValueType.TYPE_STRING:
                case protocol_1.ValueType.TYPE_OPTION_STRING:
                case protocol_1.ValueType.TYPE_OPTION_VEC_U8:
                case protocol_1.ValueType.TYPE_VEC_STRING:
                    var de = protocol_1.SER_VALUE.find(function (s) { return s.type == type; });
                    if (!de)
                        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'GuardObject de error');
                    value = utils_1.Bcs.getInstance().de(type, Uint8Array.from(value));
                    break;
                default:
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'GuardObject constant type invalid:' + type);
            }
            ret.push({ identifier: v.identifier, type: type, bWitness: v.bWitness, value: value });
        });
        return ret;
    };
    GuardParser.parse_bcs = function (constants, chain_bytes) {
        var bytes = Uint8Array.from(chain_bytes);
        var arr = [].slice.call(bytes.reverse());
        var data = [];
        var _loop_1 = function () {
            var type = arr.shift();
            var value = void 0;
            var cmd = void 0;
            var identifier = void 0;
            switch (type) {
                case protocol_1.ContextType.TYPE_SIGNER:
                case protocol_1.ContextType.TYPE_CLOCK:
                case protocol_1.ContextType.TYPE_GUARD:
                case protocol_1.OperatorType.TYPE_LOGIC_ALWAYS_TRUE:
                case protocol_1.OperatorType.TYPE_LOGIC_NOT:
                    break;
                case protocol_1.OperatorType.TYPE_LOGIC_AS_U256_GREATER:
                case protocol_1.OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL:
                case protocol_1.OperatorType.TYPE_LOGIC_AS_U256_LESSER:
                case protocol_1.OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL:
                case protocol_1.OperatorType.TYPE_LOGIC_AS_U256_EQUAL:
                case protocol_1.OperatorType.TYPE_LOGIC_EQUAL:
                case protocol_1.OperatorType.TYPE_LOGIC_HAS_SUBSTRING:
                case protocol_1.OperatorType.TYPE_NUMBER_ADD:
                case protocol_1.OperatorType.TYPE_NUMBER_DEVIDE:
                case protocol_1.OperatorType.TYPE_NUMBER_MOD:
                case protocol_1.OperatorType.TYPE_NUMBER_MULTIPLY:
                case protocol_1.OperatorType.TYPE_NUMBER_SUBTRACT:
                case protocol_1.OperatorType.TYPE_LOGIC_AND: //@ with logics count
                case protocol_1.OperatorType.TYPE_LOGIC_OR:
                    value = arr.shift();
                    break;
                case protocol_1.ContextType.TYPE_CONSTANT:
                    identifier = arr.shift(); // identifier
                    break;
                case protocol_1.ValueType.TYPE_ADDRESS:
                    value = '0x' + utils_1.Bcs.getInstance().de(protocol_1.ValueType.TYPE_ADDRESS, Uint8Array.from(arr)).toString();
                    arr.splice(0, 32); // address     
                    break;
                case protocol_1.ValueType.TYPE_BOOL:
                case protocol_1.ValueType.TYPE_U8:
                    value = utils_1.Bcs.getInstance().de(type, Uint8Array.from(arr));
                    arr.shift();
                    break;
                case protocol_1.ValueType.TYPE_U64:
                    value = utils_1.Bcs.getInstance().de(type, Uint8Array.from(arr));
                    arr.splice(0, 8);
                    break;
                case protocol_1.ValueType.TYPE_U128:
                    value = utils_1.Bcs.getInstance().de(type, Uint8Array.from(arr));
                    arr.splice(0, 16);
                    break;
                case protocol_1.ValueType.TYPE_U256:
                    value = utils_1.Bcs.getInstance().de(type, Uint8Array.from(arr));
                    arr.splice(0, 32);
                    break;
                case protocol_1.ValueType.TYPE_VEC_U8:
                case protocol_1.ValueType.TYPE_VEC_BOOL:
                case protocol_1.ValueType.TYPE_STRING:
                    var r = (0, utils_1.ulebDecode)(Uint8Array.from(arr));
                    value = utils_1.Bcs.getInstance().de(type, Uint8Array.from(arr));
                    arr.splice(0, r.value + r.length);
                    break;
                case protocol_1.ValueType.TYPE_VEC_ADDRESS:
                    r = (0, utils_1.ulebDecode)(Uint8Array.from(arr));
                    value = utils_1.Bcs.getInstance().de(type, Uint8Array.from(arr));
                    arr.splice(0, r.value * 32 + r.length);
                    break;
                case protocol_1.ValueType.TYPE_VEC_U128:
                    r = (0, utils_1.ulebDecode)(Uint8Array.from(arr));
                    value = utils_1.Bcs.getInstance().de(type, Uint8Array.from(arr));
                    arr.splice(0, r.value * 16 + r.length);
                    break;
                case protocol_1.ValueType.TYPE_VEC_U256:
                    r = (0, utils_1.ulebDecode)(Uint8Array.from(arr));
                    value = utils_1.Bcs.getInstance().de(type, Uint8Array.from(arr));
                    arr.splice(0, r.value * 32 + r.length);
                    break;
                case protocol_1.ValueType.TYPE_VEC_U64:
                    r = (0, utils_1.ulebDecode)(Uint8Array.from(arr));
                    value = utils_1.Bcs.getInstance().de(type, Uint8Array.from(arr));
                    arr.splice(0, r.value * 8 + r.length);
                    break;
                case protocol_1.ValueType.TYPE_VEC_VEC_U8:
                case protocol_1.ValueType.TYPE_VEC_STRING:
                    r = (0, utils_1.ulebDecode)(Uint8Array.from(arr));
                    arr.splice(0, r.length);
                    var res = [];
                    for (var i = 0; i < r.value; i++) {
                        var r2 = (0, utils_1.ulebDecode)(Uint8Array.from(arr));
                        res.push(utils_1.Bcs.getInstance().de(protocol_1.ValueType.TYPE_VEC_U8, Uint8Array.from(arr)));
                        arr.splice(0, r2.length + r2.value);
                    }
                    value = res;
                    break;
                case protocol_1.OperatorType.TYPE_QUERY:
                    var t = arr.splice(0, 1); // data-type
                    if (t[0] == protocol_1.ValueType.TYPE_ADDRESS) {
                        var addr = '0x' + utils_1.Bcs.getInstance().de(protocol_1.ValueType.TYPE_ADDRESS, Uint8Array.from(arr)).toString();
                        arr.splice(0, 32); // address            
                        value = addr;
                        cmd = utils_1.Bcs.getInstance().de('u16', Uint8Array.from(arr.splice(0, 2))); // cmd(u16)
                    }
                    else if (t[0] == protocol_1.ContextType.TYPE_CONSTANT) {
                        var id_1 = arr.splice(0, 1); // key
                        var v = constants.find(function (v) {
                            return (v.identifier == id_1[0]) &&
                                ((v.type == protocol_1.ValueType.TYPE_ADDRESS));
                        });
                        if (!v) {
                            (0, exception_1.ERROR)(exception_1.Errors.Fail, 'GuardObject: indentifier not in  constant');
                        }
                        identifier = id_1[0];
                        cmd = utils_1.Bcs.getInstance().de('u16', Uint8Array.from(arr.splice(0, 2))); // cmd(u16)
                    }
                    else {
                        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'GuardObject: constant type invalid');
                    }
                    break;
                case protocol_1.ValueType.TYPE_OPTION_ADDRESS:
                    var read = (0, utils_1.readOption)(arr, protocol_1.ValueType.TYPE_ADDRESS);
                    value = read.value;
                    if (!read.bNone)
                        arr.splice(0, 32);
                    break;
                case protocol_1.ValueType.TYPE_OPTION_BOOL:
                    read = (0, utils_1.readOption)(arr, protocol_1.ValueType.TYPE_BOOL);
                    value = read.value;
                    if (!read.bNone)
                        arr.splice(0, 1);
                    break;
                case protocol_1.ValueType.TYPE_OPTION_U8:
                    read = (0, utils_1.readOption)(arr, protocol_1.ValueType.TYPE_U8);
                    value = read.value;
                    if (!read.bNone)
                        arr.splice(0, 1);
                    break;
                case protocol_1.ValueType.TYPE_OPTION_U128:
                    read = (0, utils_1.readOption)(arr, protocol_1.ValueType.TYPE_U128);
                    value = read.value;
                    if (!read.bNone)
                        arr.splice(0, 16);
                    break;
                case protocol_1.ValueType.TYPE_OPTION_U256:
                    read = (0, utils_1.readOption)(arr, protocol_1.ValueType.TYPE_U256);
                    value = read.value;
                    if (!read.bNone)
                        arr.splice(0, 32);
                    break;
                case protocol_1.ValueType.TYPE_OPTION_U64:
                    read = (0, utils_1.readOption)(arr, protocol_1.ValueType.TYPE_U64);
                    value = read.value;
                    if (!read.bNone)
                        arr.splice(0, 8);
                    break;
                case protocol_1.ValueType.TYPE_OPTION_STRING:
                    read = (0, utils_1.readOptionString)(arr); // splice in it
                    value = read.value;
                    break;
                default:
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'GuardObject: parse_bcs types ' + type);
            }
            data.push({ type: type, value: value, cmd: cmd, identifier: identifier });
        };
        while (arr.length > 0) {
            _loop_1();
        }
        return data;
    };
    return GuardParser;
}());
exports.GuardParser = GuardParser;
var Passport = /** @class */ (function () {
    // return passport object used
    // bObject(true) in cmd env; (false) in service env
    function Passport(txb, query, bObject) {
        var _this = this;
        if (bObject === void 0) { bObject = false; }
        this.query_result_async = function (sender) { return __awaiter(_this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.txb.moveCall({
                            target: protocol_1.Protocol.Instance().PassportFn('query_result'),
                            arguments: [this.passport]
                        });
                        return [4 /*yield*/, protocol_1.Protocol.Client().devInspectTransactionBlock({ sender: sender, transactionBlock: this.txb })];
                    case 1:
                        res = _b.sent();
                        return [2 /*return*/, Passport.ResolveQueryRes(this.txb, res)];
                }
            });
        }); };
        if (query.info.length === 0 || query.info.length > Passport.MAX_GUARD_COUNT) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'guards');
        }
        this.txb = txb;
        this.passport = this.txb.moveCall({
            target: protocol_1.Protocol.Instance().PassportFn('new'),
            arguments: []
        });
        // add others guards, if any
        query.info.forEach(function (g) {
            var ids = g.constant.filter(function (i) { return i.bWitness; }).map(function (v) { return v.identifier; });
            var values = g.constant.filter(function (i) { return i.bWitness; }).map(function (v) {
                var bcs = utils_1.Bcs.getInstance().ser(v.type, v.value);
                var r = new Uint8Array(bcs.length + 1);
                r.set([v.type], 0);
                r.set(bcs, 1);
                return [].slice.call(r);
            });
            var guard = g.version !== undefined && g.digest !== undefined ?
                txb.objectRef({ objectId: g.id, version: g.version, digest: g.digest }) :
                txb.object(g.id);
            //console.log(ids); console.log(values)
            _this.txb.moveCall({
                target: protocol_1.Protocol.Instance().PassportFn('guard_add'),
                arguments: [_this.passport, guard, _this.txb.pure.vector('u8', [].slice.call(ids)),
                    _this.txb.pure(utils_1.Bcs.getInstance().ser('vector<vector<u8>>', __spreadArray([], __read(values), false)))]
            });
        });
        var clock = this.txb.sharedObjectRef(protocol_1.Protocol.CLOCK_OBJECT);
        // rules: 'verify' & 'query' in turns; 'verify' at final end.
        query === null || query === void 0 ? void 0 : query.query.forEach(function (q) {
            _this.txb.moveCall({
                target: protocol_1.Protocol.Instance().PassportFn('passport_verify'),
                arguments: [_this.passport, _this.txb.object(clock)]
            });
            _this.txb.moveCall({
                target: q.target,
                arguments: [bObject ? _this.txb.object(q.object) : _this.txb.object(q.id), _this.passport],
                typeArguments: q.types,
            });
        });
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().PassportFn('passport_verify'),
            arguments: [this.passport, this.txb.object(clock)]
        });
    }
    Passport.prototype.get_object = function () { return this.passport; };
    Passport.prototype.destroy = function () {
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().PassportFn('destroy'),
            arguments: [this.passport]
        });
    };
    Passport.prototype.freeze = function () {
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().PassportFn('freezen'),
            arguments: [this.passport]
        });
    };
    Passport.prototype.query_result = function (sender, handleResult) {
        var _this = this;
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().PassportFn('query_result'),
            arguments: [this.passport]
        });
        protocol_1.Protocol.Client().devInspectTransactionBlock({ sender: sender, transactionBlock: this.txb }).then(function (res) {
            var r = Passport.ResolveQueryRes(_this.txb, res);
            if (r)
                handleResult(r);
        }).catch(function (e) {
            console.log(e);
        });
    };
    Passport.ResolveQueryRes = function (txb, res) {
        var _b;
        for (var i = 0; i < ((_b = res.results) === null || _b === void 0 ? void 0 : _b.length); ++i) {
            var v = res.results[i];
            if ((v === null || v === void 0 ? void 0 : v.returnValues) && v.returnValues.length === 2 &&
                v.returnValues[0][1] === 'bool' && v.returnValues[1][1] === 'vector<address>') { // (bool, vector<address>)
                var result = utils_1.Bcs.getInstance().de('bool', Uint8Array.from(v.returnValues[0][0]));
                var guards = utils_1.Bcs.getInstance().de('vector<address>', Uint8Array.from(v.returnValues[1][0])).map(function (v) { return '0x' + v; });
                return { txb: txb, result: result, guards: guards };
            }
        }
        return undefined;
    };
    Passport.MAX_GUARD_COUNT = 8;
    return Passport;
}());
exports.Passport = Passport;
