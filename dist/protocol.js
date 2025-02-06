"use strict";
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RpcResultParser = exports.Protocol = exports.ENTRYPOINT = exports.SER_VALUE = exports.ContextType = exports.IsNumberType = exports.IsValidValueType = exports.IsValidOperatorType = exports.ValueTypeArray = exports.OperatorTypeArray = exports.RepositoryValueTypeInfo = exports.RepositoryValueType = exports.ValueType = exports.LogicsInfo = exports.OperatorType = exports.MODULES = void 0;
var client_1 = require("@mysten/sui/client");
var ed25519_1 = require("@mysten/sui/keypairs/ed25519");
var bcs_1 = require("@mysten/bcs");
var transactions_1 = require("@mysten/sui/transactions");
var utils_1 = require("./utils");
var utils_2 = require("@mysten/sui/utils");
var MODULES;
(function (MODULES) {
    MODULES["machine"] = "machine";
    MODULES["progress"] = "progress";
    MODULES["repository"] = "repository";
    MODULES["permission"] = "permission";
    MODULES["passport"] = "passport";
    MODULES["guard"] = "guard";
    MODULES["demand"] = "demand";
    MODULES["order"] = "order";
    MODULES["service"] = "service";
    MODULES["resource"] = "resource";
    MODULES["entity"] = "entity";
    MODULES["wowok"] = "wowok";
    MODULES["treasury"] = "treasury";
    MODULES["payment"] = "payment";
    MODULES["arbitration"] = "arbitration";
    MODULES["arb"] = "arb";
})(MODULES || (exports.MODULES = MODULES = {}));
var OperatorType;
(function (OperatorType) {
    OperatorType[OperatorType["TYPE_QUERY"] = 1] = "TYPE_QUERY";
    OperatorType[OperatorType["TYPE_NUMBER_ADD"] = 2] = "TYPE_NUMBER_ADD";
    OperatorType[OperatorType["TYPE_NUMBER_SUBTRACT"] = 3] = "TYPE_NUMBER_SUBTRACT";
    OperatorType[OperatorType["TYPE_NUMBER_MULTIPLY"] = 4] = "TYPE_NUMBER_MULTIPLY";
    OperatorType[OperatorType["TYPE_NUMBER_DEVIDE"] = 5] = "TYPE_NUMBER_DEVIDE";
    OperatorType[OperatorType["TYPE_NUMBER_MOD"] = 6] = "TYPE_NUMBER_MOD";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_GREATER"] = 11] = "TYPE_LOGIC_AS_U256_GREATER";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_GREATER_EQUAL"] = 12] = "TYPE_LOGIC_AS_U256_GREATER_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_LESSER"] = 13] = "TYPE_LOGIC_AS_U256_LESSER";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_LESSER_EQUAL"] = 14] = "TYPE_LOGIC_AS_U256_LESSER_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_AS_U256_EQUAL"] = 15] = "TYPE_LOGIC_AS_U256_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_EQUAL"] = 16] = "TYPE_LOGIC_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_HAS_SUBSTRING"] = 17] = "TYPE_LOGIC_HAS_SUBSTRING";
    OperatorType[OperatorType["TYPE_LOGIC_ALWAYS_TRUE"] = 18] = "TYPE_LOGIC_ALWAYS_TRUE";
    OperatorType[OperatorType["TYPE_LOGIC_NOT"] = 19] = "TYPE_LOGIC_NOT";
    OperatorType[OperatorType["TYPE_LOGIC_AND"] = 20] = "TYPE_LOGIC_AND";
    OperatorType[OperatorType["TYPE_LOGIC_OR"] = 21] = "TYPE_LOGIC_OR";
})(OperatorType || (exports.OperatorType = OperatorType = {}));
exports.LogicsInfo = [
    [OperatorType.TYPE_LOGIC_AS_U256_GREATER, 'Unsigned Integer >', 'The first item > anything that follows'],
    [OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL, 'Unsigned Integer >=', 'The first item >= anything that follows'],
    [OperatorType.TYPE_LOGIC_AS_U256_LESSER, 'Unsigned Integer <', 'The first item < anything that follows'],
    [OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL, 'Unsigned Integer <=', 'The first item <= anything that follows'],
    [OperatorType.TYPE_LOGIC_AS_U256_EQUAL, 'Unsigned Integer =', 'The first item = anything that follows'],
    [OperatorType.TYPE_LOGIC_EQUAL, 'Equal', 'Data and type are exactly equal for all items'],
    [OperatorType.TYPE_LOGIC_HAS_SUBSTRING, 'Has Sub String', 'The first item contains anything that follows'],
    [OperatorType.TYPE_LOGIC_ALWAYS_TRUE, 'Always True', 'Always True'],
    [OperatorType.TYPE_LOGIC_NOT, 'Not', 'Not operation'],
    [OperatorType.TYPE_LOGIC_AND, 'And', 'All Items And operations'],
    [OperatorType.TYPE_LOGIC_OR, 'Or', 'All Items Or operations'],
];
var ValueType;
(function (ValueType) {
    ValueType[ValueType["TYPE_BOOL"] = 100] = "TYPE_BOOL";
    ValueType[ValueType["TYPE_ADDRESS"] = 101] = "TYPE_ADDRESS";
    ValueType[ValueType["TYPE_U8"] = 102] = "TYPE_U8";
    ValueType[ValueType["TYPE_U64"] = 103] = "TYPE_U64";
    ValueType[ValueType["TYPE_VEC_U8"] = 104] = "TYPE_VEC_U8";
    ValueType[ValueType["TYPE_U128"] = 105] = "TYPE_U128";
    ValueType[ValueType["TYPE_VEC_ADDRESS"] = 106] = "TYPE_VEC_ADDRESS";
    ValueType[ValueType["TYPE_VEC_BOOL"] = 107] = "TYPE_VEC_BOOL";
    ValueType[ValueType["TYPE_VEC_VEC_U8"] = 108] = "TYPE_VEC_VEC_U8";
    ValueType[ValueType["TYPE_VEC_U64"] = 109] = "TYPE_VEC_U64";
    ValueType[ValueType["TYPE_VEC_U128"] = 110] = "TYPE_VEC_U128";
    ValueType[ValueType["TYPE_OPTION_ADDRESS"] = 111] = "TYPE_OPTION_ADDRESS";
    ValueType[ValueType["TYPE_OPTION_BOOL"] = 112] = "TYPE_OPTION_BOOL";
    ValueType[ValueType["TYPE_OPTION_U8"] = 113] = "TYPE_OPTION_U8";
    ValueType[ValueType["TYPE_OPTION_U64"] = 114] = "TYPE_OPTION_U64";
    ValueType[ValueType["TYPE_OPTION_U128"] = 115] = "TYPE_OPTION_U128";
    ValueType[ValueType["TYPE_OPTION_U256"] = 116] = "TYPE_OPTION_U256";
    ValueType[ValueType["TYPE_OPTION_STRING"] = 117] = "TYPE_OPTION_STRING";
    ValueType[ValueType["TYPE_OPTION_VEC_U8"] = 118] = "TYPE_OPTION_VEC_U8";
    ValueType[ValueType["TYPE_VEC_U256"] = 119] = "TYPE_VEC_U256";
    ValueType[ValueType["TYPE_STRING"] = 120] = "TYPE_STRING";
    ValueType[ValueType["TYPE_VEC_STRING"] = 121] = "TYPE_VEC_STRING";
    ValueType[ValueType["TYPE_U256"] = 122] = "TYPE_U256";
})(ValueType || (exports.ValueType = ValueType = {}));
var RepositoryValueType;
(function (RepositoryValueType) {
    RepositoryValueType[RepositoryValueType["Address"] = 200] = "Address";
    RepositoryValueType[RepositoryValueType["Address_Vec"] = 201] = "Address_Vec";
    RepositoryValueType[RepositoryValueType["PositiveNumber"] = 202] = "PositiveNumber";
    RepositoryValueType[RepositoryValueType["PositiveNumber_Vec"] = 203] = "PositiveNumber_Vec";
    RepositoryValueType[RepositoryValueType["String"] = 204] = "String";
    RepositoryValueType[RepositoryValueType["String_Vec"] = 205] = "String_Vec";
    RepositoryValueType[RepositoryValueType["Bool"] = 206] = "Bool";
})(RepositoryValueType || (exports.RepositoryValueType = RepositoryValueType = {}));
exports.RepositoryValueTypeInfo = [
    { type: RepositoryValueType.String, name: 'string', description: 'String.' },
    { type: RepositoryValueType.Address, name: 'address', description: 'Object id or Personal address.' },
    { type: RepositoryValueType.PositiveNumber, name: 'unsigned integer', description: 'Including u8, u16 ,..., u256' },
    { type: RepositoryValueType.String_Vec, name: 'string vector', description: 'Vector of string.' },
    { type: RepositoryValueType.Address_Vec, name: 'address vector', description: 'Vector of address.' },
    { type: RepositoryValueType.PositiveNumber_Vec, name: 'unsigned integer vector', description: 'Vector of unsigned integer' },
    { type: RepositoryValueType.Bool, name: 'bool', description: 'True or False.' },
];
exports.OperatorTypeArray = Object.values(OperatorType).filter(function (v) { return typeof (v) === 'number'; });
exports.ValueTypeArray = Object.values(ValueType).filter(function (v) { return typeof (v) === 'number'; });
var IsValidOperatorType = function (type) { return exports.OperatorTypeArray.includes(type); };
exports.IsValidOperatorType = IsValidOperatorType;
var IsValidValueType = function (type) { return exports.ValueTypeArray.includes(type); };
exports.IsValidValueType = IsValidValueType;
var IsNumberType = function (type) {
    return type === ValueType.TYPE_U128 || type === ValueType.TYPE_U256 ||
        type === ValueType.TYPE_U64 || type === ValueType.TYPE_U8;
};
exports.IsNumberType = IsNumberType;
var ContextType;
(function (ContextType) {
    ContextType[ContextType["TYPE_SIGNER"] = 60] = "TYPE_SIGNER";
    ContextType[ContextType["TYPE_CLOCK"] = 61] = "TYPE_CLOCK";
    ContextType[ContextType["TYPE_GUARD"] = 62] = "TYPE_GUARD";
    //TYPE_STACK_ADDRESS = 63, // object queried from current stack top
    ContextType[ContextType["TYPE_CONSTANT"] = 80] = "TYPE_CONSTANT";
})(ContextType || (exports.ContextType = ContextType = {}));
exports.SER_VALUE = [
    { type: ValueType.TYPE_BOOL, name: 'bool', description: 'boolean. eg:true or false', validator: function (value) { return (value === true || value === false); } },
    { type: ValueType.TYPE_ADDRESS, name: 'address', description: 'address or object-id. eg:0x6789af', validator: utils_1.IsValidAddress },
    { type: ContextType.TYPE_SIGNER, name: 'txn signer', description: "signer address of the transaction" },
    { type: ContextType.TYPE_GUARD, name: 'guard address', description: "current guard address" },
    { type: ContextType.TYPE_CLOCK, name: 'txn time', description: "unsigned-64 number for the transaction time" },
    { type: ValueType.TYPE_U64, name: 'number', description: 'unsigned-64 number. eg:23870233', validator: utils_1.IsValidU64 },
    { type: ValueType.TYPE_U8, name: 'number', description: 'unsigned-8 number. eg:255', validator: utils_1.IsValidU8 },
    { type: ValueType.TYPE_VEC_U8, name: 'string', description: 'string or unsigned-8 number array. eg:"[1,2,3]"' },
    { type: ValueType.TYPE_U128, name: 'number', description: 'unsigned-8 number. eg:12348900999', validator: utils_1.IsValidU128 },
    { type: ValueType.TYPE_VEC_ADDRESS, name: '[address]', description: 'address array. eg:[0x2277f2, 0x3344af]' },
    { type: ValueType.TYPE_VEC_BOOL, name: '[bool]', description: 'boolean array. eg:[true, false, true]' },
    { type: ValueType.TYPE_VEC_VEC_U8, name: '[[number]]', description: 'array of unsigned-8 number array. eg:["i", "like", "wowok"]' },
    { type: ValueType.TYPE_VEC_U64, name: '[number]', description: 'unsigned-64 number array. eg:[123, 778888, 42312]' },
    { type: ValueType.TYPE_VEC_U128, name: '[number]', description: 'unsigned-128 number array. eg:[123, 778888, 42312]' },
    { type: ValueType.TYPE_OPTION_ADDRESS, name: 'option', description: 'option of address. eg:none or address' },
    { type: ValueType.TYPE_OPTION_BOOL, name: 'option', description: 'option of bool. eg:none or boolean value' },
    { type: ValueType.TYPE_OPTION_U8, name: 'option', description: 'option of u8. eg:none or u8 value' },
    { type: ValueType.TYPE_OPTION_U64, name: 'option', description: 'option of u64. eg:none or u64 value' },
    { type: ValueType.TYPE_OPTION_U128, name: 'option', description: 'option of u128. eg:none or u128 value' },
    { type: ValueType.TYPE_OPTION_U256, name: 'option', description: 'option of u256. eg:none or u256 value' },
    { type: ValueType.TYPE_VEC_U256, name: '[number]', description: 'unsigned-256 number array. eg:[123, 778888, 42312]' },
    { type: ValueType.TYPE_VEC_STRING, name: '[string]', description: 'ascii string array. eg:["abc", "hi"]' },
    { type: ValueType.TYPE_STRING, name: 'string', description: 'eg:"wowok"', },
    { type: ValueType.TYPE_OPTION_STRING, name: 'option', description: 'option of string. eg:none or string value' },
    { type: ValueType.TYPE_U256, name: 'number', description: 'unsigned-256 number. eg:12345678901233', validator: utils_1.IsValidU256 },
];
var ENTRYPOINT;
(function (ENTRYPOINT) {
    ENTRYPOINT["mainnet"] = "mainnet";
    ENTRYPOINT["testnet"] = "testnet";
    ENTRYPOINT["devnet"] = "devnet";
    ENTRYPOINT["localnet"] = "localnet";
})(ENTRYPOINT || (exports.ENTRYPOINT = ENTRYPOINT = {}));
/*
const TESTNET = {
    wowok: "0xbd3d0929072f7647e521bf72851ccdc7e2169052b22bfdc5b49439c48cfb119a",
    wowok_object: '0xb0a521a287e9d5e08932b3984dbe6ce159e836179c41bd08c556ef77ecdb7439',
    entity_object: '0x16aab98920e7341d1dc19631031253234b2b71fc2ab8c32d65ee3ded8072acef',
    treasury_cap:'0xb75a2ca2f651755c134ad521175f33f9e3f9008ad44340f76b3229e1f30cfdff',
}
*/
var TESTNET = {
    wowok: "0x5091944f647fdcd1a5a90016933a9eac13b2c1dc41291d1ce31ed7a0cd664a02",
    wowok_origin: '0x5091944f647fdcd1a5a90016933a9eac13b2c1dc41291d1ce31ed7a0cd664a02',
    base: '0x75eae2a5c8e9bcee76ff8f684bcc38e49a26530526ef8c32703dc0b4a4281f93',
    base_origin: '0x75eae2a5c8e9bcee76ff8f684bcc38e49a26530526ef8c32703dc0b4a4281f93',
    wowok_object: '0x6cfe6ee9f53b33eed11a6d4d1e09fb43278f222ced15aef7246243ecadf3c00f',
    entity_object: '0x5469d38103ab78f91222338b489b512f9de86932edde064f7d2d77a6e78cf7a9',
    treasury_cap: '0x9f415c863f0c26103e70fc4a739fea479ff20544057a3c5665db16c0b8650f7c',
    oracle_object: '0x6c7d9b8ab0e9d21291e0128ca3e0d550b30f375f1e008381f2fbeef6753e6dcf',
};
var MAINNET = {
    wowok: "",
    wowok_origin: "",
    base: "",
    base_origin: "",
    wowok_object: '',
    entity_object: '',
    treasury_cap: '',
    oracle_object: '',
};
var Protocol = /** @class */ (function () {
    function Protocol(network) {
        var _this = this;
        if (network === void 0) { network = ENTRYPOINT.testnet; }
        this.network = '';
        this.package = new Map();
        this.signer = '';
        this.wowok_object = '';
        this.entity_object = '';
        this.treasury_cap = '';
        this.oracle_object = '';
        this.graphql = '';
        this.MachineFn = function (fn) { return "".concat(_this.package.get('wowok'), "::").concat(MODULES.machine, "::").concat(fn); };
        this.ProgressFn = function (fn) { return "".concat(_this.package.get('wowok'), "::").concat(MODULES.progress, "::").concat(fn); };
        this.RepositoryFn = function (fn) { return "".concat(_this.package.get('wowok'), "::").concat(MODULES.repository, "::").concat(fn); };
        this.PermissionFn = function (fn) { return "".concat(_this.package.get('wowok'), "::").concat(MODULES.permission, "::").concat(fn); };
        this.PassportFn = function (fn) { return "".concat(_this.package.get('wowok'), "::").concat(MODULES.passport, "::").concat(fn); };
        this.DemandFn = function (fn) { return "".concat(_this.package.get('wowok'), "::").concat(MODULES.demand, "::").concat(fn); };
        this.OrderFn = function (fn) { return "".concat(_this.package.get('wowok'), "::").concat(MODULES.order, "::").concat(fn); };
        this.ServiceFn = function (fn) { return "".concat(_this.package.get('wowok'), "::").concat(MODULES.service, "::").concat(fn); };
        this.ResourceFn = function (fn) { return "".concat(_this.package.get('wowok'), "::").concat(MODULES.resource, "::").concat(fn); };
        this.EntityFn = function (fn) { return "".concat(_this.package.get('wowok'), "::").concat(MODULES.entity, "::").concat(fn); };
        this.WowokFn = function (fn) { return "".concat(_this.package.get('wowok'), "::").concat(MODULES.wowok, "::").concat(fn); };
        this.TreasuryFn = function (fn) { return "".concat(_this.package.get('wowok'), "::").concat(MODULES.treasury, "::").concat(fn); };
        this.PaymentFn = function (fn) { return "".concat(_this.package.get('wowok'), "::").concat(MODULES.payment, "::").concat(fn); };
        this.GuardFn = function (fn) { return "".concat(_this.package.get('base'), "::").concat(MODULES.guard, "::").concat(fn); };
        this.BaseWowokFn = function (fn) { return "".concat(_this.package.get('base'), "::").concat(MODULES.wowok, "::").concat(fn); };
        this.ArbitrationFn = function (fn) { return "".concat(_this.package.get('wowok'), "::").concat(MODULES.arbitration, "::").concat(fn); };
        this.ArbFn = function (fn) { return "".concat(_this.package.get('wowok'), "::").concat(MODULES.arb, "::").concat(fn); };
        this.Query = function (objects, options) {
            if (options === void 0) { options = { showContent: true }; }
            return __awaiter(_this, void 0, void 0, function () {
                var client, ids, res, ret, _loop_1, i;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            client = new client_1.SuiClient({ url: this.NetworkUrl() });
                            ids = objects.map(function (value) { return value.objectid; });
                            return [4 /*yield*/, client.call('sui_multiGetObjects', [ids, options])];
                        case 1:
                            res = _a.sent();
                            ret = [];
                            _loop_1 = function (i) {
                                objects.forEach(function (object) {
                                    object.callback(_this, res[i], object, options);
                                });
                            };
                            for (i = 0; i < res.length; i++) {
                                _loop_1(i);
                            }
                            return [2 /*return*/, res];
                    }
                });
            });
        };
        this.Query_Raw = function (objects, options) {
            if (options === void 0) { options = { showContent: true }; }
            return __awaiter(_this, void 0, void 0, function () {
                var client;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            client = new client_1.SuiClient({ url: this.NetworkUrl() });
                            return [4 /*yield*/, client.call('sui_multiGetObjects', [objects, options])];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        this.NewSession = function () {
            _this.txb = new transactions_1.Transaction();
            return _this.txb;
        };
        this.CurrentSession = function () { return _this.txb ? _this.txb : _this.NewSession(); };
        this.SignExcute = function (exes, priv_key, param, options) {
            if (options === void 0) { options = { showObjectChanges: true }; }
            return __awaiter(_this, void 0, void 0, function () {
                var client, privkey, keypair, response;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            client = new client_1.SuiClient({ url: this.NetworkUrl() });
                            exes.forEach(function (e) { e(_this, param); });
                            privkey = (0, bcs_1.fromHEX)(priv_key);
                            keypair = ed25519_1.Ed25519Keypair.fromSecretKey(privkey);
                            return [4 /*yield*/, client.signAndExecuteTransaction({
                                    transaction: this.CurrentSession(),
                                    signer: keypair,
                                    options: options,
                                })];
                        case 1:
                            response = _a.sent();
                            this.txb = undefined; // reset the txb to undefine
                            return [2 /*return*/, response];
                    }
                });
            });
        };
        this.WOWOK_TOKEN_TYPE = function () { return _this.package.get('base') + '::wowok::WOWOK'; };
        this.WOWOK_COIN_TYPE = function () { return '0x2::coin::Coin<' + _this.package.get('base') + '::wowok::WOWOK>'; };
        this.COINS_TYPE = function () {
            switch (_this.network) {
                case ENTRYPOINT.testnet:
                    return _this.CoinTypes_Testnet.filter(function (v) { return v.alias !== true; });
                case ENTRYPOINT.mainnet:
                    return _this.CoinTypes_Mainnet.filter(function (v) { return v.alias !== true; });
            }
            ;
            return [];
        };
        this.Update_CoinType = function (token_type, decimals, symbol) {
            if (!symbol || !token_type)
                return;
            switch (_this.network) {
                case ENTRYPOINT.testnet:
                    var r = _this.CoinTypes_Testnet.filter(function (v) { return (v === null || v === void 0 ? void 0 : v.type) !== token_type; });
                    r.push({ symbol: symbol, type: token_type, decimals: decimals });
                    _this.CoinTypes_Testnet = r;
                    break;
                case ENTRYPOINT.mainnet:
                    var r = _this.CoinTypes_Mainnet.filter(function (v) { return (v === null || v === void 0 ? void 0 : v.type) !== token_type; });
                    r.push({ symbol: symbol, type: token_type, decimals: decimals });
                    _this.CoinTypes_Mainnet = r;
                    break;
            }
            ;
        };
        this.ExplorerUrl = function (objectid, type) {
            if (type === void 0) { type = 'object'; }
            if (_this.network === ENTRYPOINT.testnet) {
                return 'https://testnet.suivision.xyz/' + type + '/' + objectid;
            }
            else if (_this.network === ENTRYPOINT.mainnet) {
                return 'https://suivision.xyz/' + type + '/' + objectid;
            }
            ;
            return '';
        };
        this.CoinTypes_Testnet = [
            { symbol: 'SUI', type: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI', decimals: 9, alias: true },
            { symbol: 'SUI', type: '0x2::sui::SUI', decimals: 9, },
            { symbol: 'WOW', type: TESTNET.base + '::wowok::WOWOK', decimals: 9 },
        ];
        this.CoinTypes_Mainnet = [
            { symbol: 'SUI', type: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI', decimals: 9, alias: true },
            { symbol: 'SUI', type: '0x2::sui::SUI', decimals: 9, },
            { symbol: 'WOW', type: TESTNET.base + '::wowok::WOWOK', decimals: 9 },
            { symbol: 'USDT', type: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN', decimals: 6 },
            { symbol: 'USDC', type: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN', decimals: 6 },
            { symbol: 'WETH', type: '0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN', decimals: 8 },
            { symbol: 'WBNB', type: '0xb848cce11ef3a8f62eccea6eb5b35a12c4c2b1ee1af7755d02d7bd6218e8226f::coin::COIN', decimals: 8 },
        ];
        this.GetCoinTypeInfo = function (token_type, handler) {
            if (!token_type)
                return 'loading';
            var r = _this.COINS_TYPE().find(function (v) { return (v === null || v === void 0 ? void 0 : v.type) === token_type; });
            if (!r) {
                Protocol.Client().getCoinMetadata({ coinType: token_type }).then(function (res) {
                    if ((res === null || res === void 0 ? void 0 : res.decimals) && (res === null || res === void 0 ? void 0 : res.symbol)) {
                        _this.Update_CoinType(token_type, res === null || res === void 0 ? void 0 : res.decimals, res === null || res === void 0 ? void 0 : res.symbol);
                        handler({ symbol: res.symbol, decimals: res.decimals, type: token_type });
                    }
                }).catch(function (e) {
                    console.log(e);
                });
            }
            else {
                return r;
            }
            ;
            return 'loading';
        };
        this.WOWOK_OBJECTS_TYPE = function () { return Object.keys(MODULES).map(function (key) { var i = (key === MODULES.guard ? _this.package.get('base') : _this.package.get('wowok')) + '::' + key + '::'; return i + (0, utils_1.capitalize)(key); }); };
        this.WOWOK_OBJECTS_PREFIX_TYPE = function () { return Object.keys(MODULES).map(function (key) { return (key === MODULES.guard ? _this.package.get('base') : _this.package.get('wowok')) + '::' + key + '::'; }); };
        this.object_name_from_type_repr = function (type_repr) {
            if (!type_repr)
                return '';
            var i = type_repr.indexOf('::');
            if (i > 0 && _this.hasPackage(type_repr.slice(0, i))) {
                i = type_repr.indexOf('<');
                if (i > 0) {
                    type_repr = type_repr.slice(0, i);
                }
                var n = type_repr.lastIndexOf('::');
                if (n > 0) {
                    return type_repr.slice(n + 2);
                }
            }
            return '';
        };
        this.module_object_name_from_type_repr = function (type_repr) {
            if (!type_repr)
                return '';
            var i = type_repr.indexOf('::');
            if (i > 0 && _this.hasPackage(type_repr.slice(0, i))) {
                i = type_repr.indexOf('<');
                if (i > 0) {
                    type_repr = type_repr.slice(0, i);
                }
                var n = type_repr.indexOf('::');
                if (n > 0) {
                    return type_repr.slice(n + 2);
                }
            }
            return '';
        };
        this.UseNetwork(network);
        this.NewSession();
    }
    Protocol.Instance = function () {
        if (!Protocol._instance) {
            Protocol._instance = new Protocol();
        }
        ;
        return Protocol._instance;
    };
    Protocol.Client = function () {
        return new client_1.SuiClient({ url: Protocol.Instance().NetworkUrl() });
    };
    Protocol.prototype.client = function () { return new client_1.SuiClient({ url: this.NetworkUrl() }); };
    Protocol.prototype.UseNetwork = function (network) {
        if (network === void 0) { network = ENTRYPOINT.testnet; }
        this.network = network;
        switch (network) {
            case ENTRYPOINT.localnet:
                break;
            case ENTRYPOINT.devnet:
                break;
            case ENTRYPOINT.testnet:
                this.package.set('wowok', TESTNET.wowok);
                this.package.set('base', TESTNET.base);
                this.package.set('wowok_origin', TESTNET.wowok_origin); //@ orgin package!!!
                this.package.set('base_origin', TESTNET.base_origin);
                this.wowok_object = TESTNET.wowok_object;
                this.entity_object = TESTNET.entity_object;
                this.treasury_cap = TESTNET.treasury_cap;
                this.graphql = 'https://sui-testnet.mystenlabs.com/graphql';
                this.oracle_object = TESTNET.oracle_object;
                break;
            case ENTRYPOINT.mainnet:
                this.package.set('wowok', MAINNET.wowok);
                this.package.set('base', MAINNET.base);
                this.package.set('wowok_origin', MAINNET.wowok_origin); //@ orgin package!!!
                this.package.set('base_origin', MAINNET.base_origin);
                this.wowok_object = MAINNET.wowok_object;
                this.entity_object = MAINNET.entity_object;
                this.treasury_cap = MAINNET.treasury_cap;
                this.graphql = 'https://sui-mainnet.mystenlabs.com/graphql';
                this.oracle_object = MAINNET.oracle_object;
                break;
        }
        ;
    };
    Protocol.prototype.Package = function (type) {
        var _a;
        return (_a = this.package.get(type)) !== null && _a !== void 0 ? _a : '';
    };
    Protocol.prototype.WowokObject = function () { return this.wowok_object; };
    Protocol.prototype.EntityObject = function () { return this.entity_object; };
    Protocol.prototype.OracleObject = function () { return this.oracle_object; };
    Protocol.prototype.TreasuryCap = function () { return this.treasury_cap; };
    Protocol.prototype.GraphqlUrl = function () { return this.graphql; };
    Protocol.prototype.NetworkUrl = function () {
        switch (this.network) {
            case ENTRYPOINT.localnet:
                return "http://127.0.0.1:9000";
            case ENTRYPOINT.devnet:
                return "https://fullnode.devnet.sui.io:443";
            case ENTRYPOINT.testnet:
                return "https://fullnode.testnet.sui.io:443";
            case ENTRYPOINT.mainnet:
                return "https://fullnode.mainnet.sui.io:443";
        }
        ;
        return "";
    };
    ;
    Protocol.TXB_OBJECT = function (txb, arg) {
        if (typeof (arg) == 'string')
            return txb.object(arg);
        return arg;
    };
    Protocol.prototype.hasPackage = function (pack) {
        var e_1, _a;
        try {
            for (var _b = __values(this.package.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var value = _c.value;
                if (pack.includes(value)) {
                    return true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return false;
    };
    // used in service, discount, order, because service has COIN wrapper for TOKEN
    Protocol.SUI_TOKEN_TYPE = '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'; // TOKEN_TYPE
    // used in demand, reward, ...
    Protocol.SUI_COIN_TYPE = '0x0000000000000000000000000000000000000000000000000000000000000002::coin::Coin<0x2::sui::SUI>'; // COIN TYPE
    Protocol.CLOCK_OBJECT = { objectId: '0x6', mutable: false, initialSharedVersion: 1 };
    Protocol.IsValidObjects = function (arr) {
        return (0, utils_1.IsValidArray)(arr, function (v) {
            if (!v)
                return false;
            if (typeof (v) === 'string' && !(0, utils_2.isValidSuiObjectId)(v)) {
                return false;
            }
            return true;
        });
    };
    return Protocol;
}());
exports.Protocol = Protocol;
var RpcResultParser = /** @class */ (function () {
    function RpcResultParser() {
    }
    RpcResultParser.Object_Type_Extra = function () {
        var names = Object.keys(MODULES).map(function (key) { return key + '::' + (0, utils_1.capitalize)(key); });
        names.push('order::Discount');
        return names;
    };
    RpcResultParser.objectids_from_response = function (protocol, response, concat_result) {
        //console.log(response)
        var ret = new Map();
        if (response === null || response === void 0 ? void 0 : response.objectChanges) {
            response.objectChanges.forEach(function (change) {
                RpcResultParser.Object_Type_Extra().forEach(function (name) {
                    var _a;
                    if (change.type == 'created' && protocol.module_object_name_from_type_repr(change.objectType) === name) {
                        if (ret.has(name)) {
                            (_a = ret.get(name)) === null || _a === void 0 ? void 0 : _a.push(change.objectId);
                        }
                        else {
                            ret.set(name, [change.objectId]);
                        }
                    }
                });
            });
        }
        if (concat_result) {
            ret.forEach(function (value, key) {
                if (concat_result.has(key)) {
                    concat_result.set(key, concat_result.get(key).concat(value));
                }
                else {
                    concat_result.set(key, value);
                }
            });
        }
        return ret;
    };
    return RpcResultParser;
}());
exports.RpcResultParser = RpcResultParser;
