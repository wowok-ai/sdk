"use strict";
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
exports.query_object = exports.isValidHttpUrl = exports.toFixed = exports.insertAtHead = exports.ParseType = exports.ResolveBalance = exports.ResolveU64 = exports.IsValidArray = exports.IsValidPercent = exports.IsValidInt = exports.IsValidArgType = exports.IsValidTokenType = exports.IsValidU256 = exports.IsValidU128 = exports.IsValidU64 = exports.IsValidU8 = exports.IsValidBigint = exports.IsValidAddress = exports.IsValidEndpoint = exports.IsValidName_AllowEmpty = exports.IsValidName = exports.IsValidDesription = exports.MAX_ENDPOINT_LENGTH = exports.MAX_NAME_LENGTH = exports.MAX_DESCRIPTION_LENGTH = exports.deepClone = exports.isArr = exports.numToUint8Array = exports.stringToUint8Array = exports.Bcs = exports.parse_object_type = exports.capitalize = exports.array_unique = exports.array_equal = exports.parseObjectType = exports.concatenate = exports.cb_U256 = exports.cb_U128 = exports.cb_U64 = exports.cb_U8 = exports.readVec = exports.ulebDecode = exports.readOptionString = exports.readOption = exports.ValueTypeConvert = exports.OPTION_NONE = exports.MAX_U256 = exports.MAX_U128 = exports.MAX_U64 = exports.MAX_U8 = void 0;
exports.FirstLetterUppercase = void 0;
var bcs_1 = require("@mysten/bcs");
var exception_1 = require("./exception");
var utils_1 = require("@mysten/sui/utils");
var protocol_1 = require("./protocol");
exports.MAX_U8 = BigInt('255');
exports.MAX_U64 = BigInt('18446744073709551615');
exports.MAX_U128 = BigInt('340282366920938463463374607431768211455');
exports.MAX_U256 = BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935');
exports.OPTION_NONE = 0;
var ValueTypeConvert = function (type) {
    if (type === protocol_1.ValueType.TYPE_U8 || type === protocol_1.ValueType.TYPE_U64 || type === protocol_1.ValueType.TYPE_U128 ||
        type === protocol_1.ValueType.TYPE_U256) {
        return protocol_1.RepositoryValueType.PositiveNumber;
    }
    else if (type === protocol_1.ValueType.TYPE_VEC_U8 || type === protocol_1.ValueType.TYPE_VEC_U64 || type === protocol_1.ValueType.TYPE_VEC_U128 ||
        type === protocol_1.ValueType.TYPE_VEC_U256 || type === protocol_1.ValueType.TYPE_VEC_BOOL) {
        return protocol_1.RepositoryValueType.PositiveNumber_Vec;
    }
    else if (type === protocol_1.ValueType.TYPE_ADDRESS) {
        return protocol_1.RepositoryValueType.Address;
    }
    else if (type === protocol_1.ValueType.TYPE_VEC_ADDRESS) {
        return protocol_1.RepositoryValueType.Address_Vec;
    }
    else if (type === protocol_1.ValueType.TYPE_STRING) {
        return protocol_1.RepositoryValueType.String;
    }
    else if (type === protocol_1.ValueType.TYPE_VEC_STRING) {
        return protocol_1.RepositoryValueType.String_Vec;
    }
    else if (type === protocol_1.ValueType.TYPE_BOOL) {
        return protocol_1.RepositoryValueType.Bool;
    }
    return -1;
};
exports.ValueTypeConvert = ValueTypeConvert;
var readOption = function (arr, de) {
    var o = arr.splice(0, 1);
    if (o[0] == 1) { // true
        return { bNone: false, value: Bcs.getInstance().de(de, Uint8Array.from(arr)) };
    }
    else if (o[0] == 0) {
        return { bNone: true, value: exports.OPTION_NONE };
    }
    else {
        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'readOption: option invalid');
        return { bNone: true, value: exports.OPTION_NONE };
    }
};
exports.readOption = readOption;
var readOptionString = function (arr) {
    var o = arr.splice(0, 1);
    if (o[0] == 1) { // true
        var r = (0, exports.ulebDecode)(Uint8Array.from(arr));
        var value = Bcs.getInstance().de(protocol_1.ValueType.TYPE_STRING, Uint8Array.from(arr));
        arr.splice(0, r.value + r.length);
        return { bNone: false, value: value };
    }
    else if (o[0] == 0) {
        return { bNone: true, value: exports.OPTION_NONE };
    }
    else {
        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'readOption: option invalid');
        return { bNone: true, value: exports.OPTION_NONE };
    }
};
exports.readOptionString = readOptionString;
var ulebDecode = function (arr) {
    var total = 0;
    var shift = 0;
    var len = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        var byte = arr[len];
        len += 1;
        total |= (byte & 0x7f) << shift;
        if ((byte & 0x80) === 0) {
            break;
        }
        shift += 7;
    }
    return {
        value: total,
        length: len,
    };
};
exports.ulebDecode = ulebDecode;
var readVec = function (arr, cb) {
    var r = (0, exports.ulebDecode)(Uint8Array.from(arr));
    arr.splice(0, r.length);
    var result = [];
    for (var i = 0; i < r.value; i++) {
        result.push(cb(arr, i, r.value));
    }
    return result;
};
exports.readVec = readVec;
var cb_U8 = function (arr, i, length) {
    return arr.shift();
};
exports.cb_U8 = cb_U8;
var cb_U64 = function (arr, i, length) {
    return arr.splice(0, 8);
};
exports.cb_U64 = cb_U64;
var cb_U128 = function (arr, i, length) {
    return arr.splice(0, 16);
};
exports.cb_U128 = cb_U128;
var cb_U256 = function (arr, i, length) {
    return arr.splice(0, 32);
};
exports.cb_U256 = cb_U256;
var concatenate = function (resultConstructor) {
    var e_1, _a, e_2, _b;
    var arrays = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        arrays[_i - 1] = arguments[_i];
    }
    var totalLength = 0;
    try {
        for (var arrays_1 = __values(arrays), arrays_1_1 = arrays_1.next(); !arrays_1_1.done; arrays_1_1 = arrays_1.next()) {
            var arr = arrays_1_1.value;
            totalLength += arr.length;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (arrays_1_1 && !arrays_1_1.done && (_a = arrays_1.return)) _a.call(arrays_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var result = new resultConstructor(totalLength);
    var offset = 0;
    try {
        for (var arrays_2 = __values(arrays), arrays_2_1 = arrays_2.next(); !arrays_2_1.done; arrays_2_1 = arrays_2.next()) {
            var arr = arrays_2_1.value;
            result.set(arr, offset);
            offset += arr.length;
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (arrays_2_1 && !arrays_2_1.done && (_b = arrays_2.return)) _b.call(arrays_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return result;
};
exports.concatenate = concatenate;
var parseObjectType = function (chain_type, header) {
    if (header === void 0) { header = 'payment::Payment<'; }
    if (chain_type) {
        var i = chain_type.indexOf(header);
        if (i > 0) {
            var r = chain_type.slice(i + header.length, chain_type.length - 1);
            return r;
        }
    }
    return '';
};
exports.parseObjectType = parseObjectType;
var array_equal = function (arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    return !arr1.some(function (item) { return !arr2.includes(item); });
};
exports.array_equal = array_equal;
var array_unique = function (arr) {
    var newArr = [];
    for (var i = 0; i < arr.length; i++) {
        if (newArr.indexOf(arr[i]) == -1) {
            newArr.push(arr[i]);
        }
    }
    return newArr;
};
exports.array_unique = array_unique;
function capitalize(s) {
    return s && s[0].toUpperCase() + s.slice(1);
}
exports.capitalize = capitalize;
// for: "0xsdjfkskf<0x2::sui::coin<xxx>, 0xfdfff<>>"
function parse_object_type(object_data) {
    var object_type = [];
    var type_pos = object_data.indexOf('<');
    if (type_pos >= 0) {
        var t = object_data.slice((type_pos + 1), object_data.length - 1);
        object_type = t.split(',');
    }
    return object_type;
}
exports.parse_object_type = parse_object_type;
var Bcs = /** @class */ (function () {
    function Bcs() {
        this.bcs = new bcs_1.BCS((0, bcs_1.getSuiMoveConfig)());
        this.bcs.registerEnumType('Option<T>', {
            'none': null,
            'some': 'T',
        });
        this.bcs.registerStructType('EntStruct', {
            'avatar': 'vector<u8>',
            'resource': "Option<address>",
            "safer_name": "vector<string>",
            "safer_value": "vector<string>",
            'like': bcs_1.BCS.U32,
            'dislike': bcs_1.BCS.U32,
        });
        this.bcs.registerStructType('PersonalInfo', {
            'name': 'vector<u8>',
            'description': 'vector<u8>',
            'avatar': bcs_1.BCS.STRING,
            'twitter': bcs_1.BCS.STRING,
            'discord': bcs_1.BCS.STRING,
            'homepage': bcs_1.BCS.STRING,
        });
        this.bcs.registerStructType('OptionAddress', {
            'address': 'Option<address>',
        });
        this.bcs.registerStructType('Guards', {
            'guards': 'vector<OptionAddress>',
        });
    }
    Bcs.getInstance = function () {
        if (!Bcs._instance) {
            Bcs._instance = new Bcs();
        }
        ;
        return Bcs._instance;
    };
    Bcs.prototype.ser_option_u32 = function (data) {
        return this.bcs.ser('Option<u32>', { 'some': data }).toBytes();
    };
    Bcs.prototype.ser = function (type, data) {
        if (typeof (type) === 'string') {
            return this.bcs.ser(type, data).toBytes();
        }
        switch (type) {
            case protocol_1.ValueType.TYPE_BOOL:
                return this.bcs.ser(bcs_1.BCS.BOOL, data).toBytes();
            case protocol_1.ValueType.TYPE_ADDRESS:
                return this.bcs.ser(bcs_1.BCS.ADDRESS, data).toBytes();
            case protocol_1.ValueType.TYPE_U64:
                return this.bcs.ser(bcs_1.BCS.U64, data).toBytes();
            case protocol_1.ValueType.TYPE_U8:
                return this.bcs.ser(bcs_1.BCS.U8, data).toBytes();
            case protocol_1.ValueType.TYPE_VEC_U8:
                return this.bcs.ser('vector<u8>', data).toBytes();
            case protocol_1.ValueType.TYPE_U128:
                return this.bcs.ser(bcs_1.BCS.U128, data).toBytes();
            case protocol_1.ValueType.TYPE_VEC_ADDRESS:
                return this.bcs.ser('vector<address>', data).toBytes();
            case protocol_1.ValueType.TYPE_VEC_BOOL:
                return this.bcs.ser('vector<bool>', data).toBytes();
            case protocol_1.ValueType.TYPE_VEC_VEC_U8:
                return this.bcs.ser('vector<vector<u8>>', data).toBytes();
            case protocol_1.ValueType.TYPE_VEC_U64:
                return this.bcs.ser('vector<u64>', data).toBytes();
            case protocol_1.ValueType.TYPE_VEC_U128:
                return this.bcs.ser('vector<u128>', data).toBytes();
            case protocol_1.ValueType.TYPE_OPTION_ADDRESS:
                return this.bcs.ser('Option<address>', { 'some': data }).toBytes();
            case protocol_1.ValueType.TYPE_OPTION_BOOL:
                return this.bcs.ser('Option<bool>', { 'some': data }).toBytes();
            case protocol_1.ValueType.TYPE_OPTION_U8:
                return this.bcs.ser('Option<u8>', { 'some': data }).toBytes();
            case protocol_1.ValueType.TYPE_OPTION_U64:
                return this.bcs.ser('Option<u64>', { 'some': data }).toBytes();
            case protocol_1.ValueType.TYPE_OPTION_U128:
                return this.bcs.ser('Option<u128>', { 'some': data }).toBytes();
            case protocol_1.ValueType.TYPE_OPTION_U256:
                return this.bcs.ser('Option<u256>', { 'some': data }).toBytes();
            case protocol_1.ValueType.TYPE_OPTION_STRING:
                return this.bcs.ser('Option<string>', { 'some': data }).toBytes();
            case protocol_1.ValueType.TYPE_VEC_U256:
                return this.bcs.ser('vector<u256>', data).toBytes();
            case protocol_1.ValueType.TYPE_U256:
                return this.bcs.ser(bcs_1.BCS.U256, data).toBytes();
            case protocol_1.ValueType.TYPE_STRING:
                var d = new TextEncoder().encode(data);
                return this.bcs.ser('vector<u8>', d).toBytes();
            case protocol_1.ValueType.TYPE_VEC_STRING:
                return this.bcs.ser('vector<vector<u8>>', data.map(function (v) { return new TextEncoder().encode(v); })).toBytes();
            default:
                (0, exception_1.ERROR)(exception_1.Errors.bcsTypeInvalid, 'ser');
        }
        return new Uint8Array();
    };
    Bcs.prototype.de = function (type, data) {
        if (typeof (type) === 'string') {
            return this.bcs.de(type, data);
        }
        switch (type) {
            case protocol_1.ValueType.TYPE_BOOL:
                return this.bcs.de(bcs_1.BCS.BOOL, data);
            case protocol_1.ValueType.TYPE_ADDRESS:
                return this.bcs.de(bcs_1.BCS.ADDRESS, data);
            case protocol_1.ValueType.TYPE_U64:
                return this.bcs.de(bcs_1.BCS.U64, data);
            case protocol_1.ValueType.TYPE_U8:
                return this.bcs.de(bcs_1.BCS.U8, data);
            case protocol_1.ValueType.TYPE_VEC_U8:
                return this.bcs.de('vector<u8>', data);
            case protocol_1.ValueType.TYPE_U128:
                return this.bcs.de(bcs_1.BCS.U128, data);
            case protocol_1.ValueType.TYPE_VEC_ADDRESS:
                return this.bcs.de('vector<address>', data);
            case protocol_1.ValueType.TYPE_VEC_BOOL:
                return this.bcs.de('vector<bool>', data);
            case protocol_1.ValueType.TYPE_VEC_VEC_U8:
                return this.bcs.de('vector<vector<u8>>', data);
            case protocol_1.ValueType.TYPE_VEC_U64:
                return this.bcs.de('vector<u64>', data);
            case protocol_1.ValueType.TYPE_VEC_U128:
                return this.bcs.de('vector<u128>', data);
            case protocol_1.ValueType.TYPE_OPTION_ADDRESS:
                return this.bcs.de('Option<address>', data);
            case protocol_1.ValueType.TYPE_OPTION_BOOL:
                return this.bcs.de('Option<bool>', data);
            case protocol_1.ValueType.TYPE_OPTION_U8:
                return this.bcs.de('Option<u8>', data);
            case protocol_1.ValueType.TYPE_OPTION_U64:
                return this.bcs.de('Option<u64>', data);
            case protocol_1.ValueType.TYPE_OPTION_U128:
                return this.bcs.de('Option<u128>', data);
            case protocol_1.ValueType.TYPE_OPTION_U256:
                return this.bcs.de('Option<u256>', data);
            case protocol_1.ValueType.TYPE_OPTION_STRING:
                return this.bcs.de('Option<string>', data);
            case protocol_1.ValueType.TYPE_VEC_U256:
                return this.bcs.de('vector<u256>', data);
            case protocol_1.ValueType.TYPE_STRING:
                var r = new TextDecoder().decode(Uint8Array.from(this.bcs.de('vector<u8>', data)));
                return r;
            case protocol_1.ValueType.TYPE_VEC_STRING:
                return this.bcs.de('vector<string>', data);
            case protocol_1.ValueType.TYPE_U256:
                return this.bcs.de(bcs_1.BCS.U256, data);
            default:
                (0, exception_1.ERROR)(exception_1.Errors.bcsTypeInvalid, 'de');
        }
    };
    Bcs.prototype.de_ent = function (data) {
        if (!data || data.length < 2)
            return '';
        var struct_vec = this.bcs.de('vector<u8>', data);
        return this.bcs.de('EntStruct', Uint8Array.from(struct_vec));
    };
    Bcs.prototype.de_entInfo = function (data) {
        if (!data || data.length === 0)
            return undefined;
        var r = this.bcs.de('PersonalInfo', data);
        r.name = new TextDecoder().decode(Uint8Array.from(r.name));
        r.description = new TextDecoder().decode(Uint8Array.from(r.description));
        return r;
    };
    Bcs.prototype.de_guards = function (data) {
        var _a;
        if (!data || data.length < 1)
            return '';
        var r = this.bcs.de('Guards', data);
        return (_a = r === null || r === void 0 ? void 0 : r.guards) === null || _a === void 0 ? void 0 : _a.map(function (v) {
            var _a, _b;
            if ((_a = v === null || v === void 0 ? void 0 : v.address) === null || _a === void 0 ? void 0 : _a.none)
                return undefined;
            return (_b = v === null || v === void 0 ? void 0 : v.address) === null || _b === void 0 ? void 0 : _b.some;
        });
    };
    return Bcs;
}());
exports.Bcs = Bcs;
function stringToUint8Array(str) {
    var encoder = new TextEncoder();
    var view = encoder.encode(str);
    return new Uint8Array(view.buffer);
}
exports.stringToUint8Array = stringToUint8Array;
function numToUint8Array(num) {
    if (!num)
        return new Uint8Array(0);
    var a = [];
    a.unshift(num & 255);
    while (num >= 256) {
        num = num >>> 8;
        a.unshift(num & 255);
    }
    return new Uint8Array(a);
}
exports.numToUint8Array = numToUint8Array;
var isArr = function (origin) {
    var str = '[object Array]';
    return Object.prototype.toString.call(origin) == str ? true : false;
};
exports.isArr = isArr;
var deepClone = function (origin, target) {
    var tar = target || {};
    for (var key in origin) {
        if (Object.prototype.hasOwnProperty.call(origin, key)) {
            if (typeof origin[key] === 'object' && origin[key] !== null) {
                tar[key] = (0, exports.isArr)(origin[key]) ? [] : {};
                (0, exports.deepClone)(origin[key], tar[key]);
            }
            else {
                tar[key] = origin[key];
            }
        }
    }
    return tar;
};
exports.deepClone = deepClone;
exports.MAX_DESCRIPTION_LENGTH = 1024;
exports.MAX_NAME_LENGTH = 64;
exports.MAX_ENDPOINT_LENGTH = 1024;
// export const OptionNone = (txb:TransactionBlock) : TransactionArgument => { return txb.pure([], BCS.U8) };
var IsValidDesription = function (description) { return (description === null || description === void 0 ? void 0 : description.length) <= exports.MAX_DESCRIPTION_LENGTH; };
exports.IsValidDesription = IsValidDesription;
var IsValidName = function (name) { if (!name)
    return false; return name.length <= exports.MAX_NAME_LENGTH && name.length != 0; };
exports.IsValidName = IsValidName;
var IsValidName_AllowEmpty = function (name) { return name.length <= exports.MAX_NAME_LENGTH; };
exports.IsValidName_AllowEmpty = IsValidName_AllowEmpty;
var IsValidEndpoint = function (endpoint) {
    return (endpoint.length > 0 && endpoint.length <= exports.MAX_ENDPOINT_LENGTH && isValidHttpUrl(endpoint));
};
exports.IsValidEndpoint = IsValidEndpoint;
var IsValidAddress = function (addr) {
    if (!addr || !(0, utils_1.isValidSuiAddress)(addr)) {
        return false;
    }
    return true;
};
exports.IsValidAddress = IsValidAddress;
var IsValidBigint = function (value, max, min) {
    if (max === void 0) { max = exports.MAX_U256; }
    if (value === '' || value === undefined)
        return false;
    try {
        var v = BigInt(value);
        if (v <= max) {
            if (min !== undefined) {
                return v >= min;
            }
            return true;
        }
    }
    catch (e) {
    }
    ;
    return false;
};
exports.IsValidBigint = IsValidBigint;
var IsValidU8 = function (value, min) {
    if (min === void 0) { min = 0; }
    return (0, exports.IsValidBigint)(value, exports.MAX_U8, BigInt(min));
};
exports.IsValidU8 = IsValidU8;
var IsValidU64 = function (value, min) {
    if (min === void 0) { min = 0; }
    return (0, exports.IsValidBigint)(value, exports.MAX_U64, BigInt(min));
};
exports.IsValidU64 = IsValidU64;
var IsValidU128 = function (value, min) {
    if (min === void 0) { min = 0; }
    return (0, exports.IsValidBigint)(value, exports.MAX_U128, BigInt(min));
};
exports.IsValidU128 = IsValidU128;
var IsValidU256 = function (value, min) {
    if (min === void 0) { min = 0; }
    return (0, exports.IsValidBigint)(value, exports.MAX_U256, BigInt(min));
};
exports.IsValidU256 = IsValidU256;
var IsValidTokenType = function (argType) {
    if (!argType || argType.length === 0) {
        return false;
    }
    var arr = argType.split('::');
    if (arr.length !== 3) {
        return false;
    }
    if ((!(0, exports.IsValidAddress)(arr[0]) && arr[0] != '0x2') || arr[1].length === 0 || arr[2].length === 0) {
        return false;
    }
    return true;
};
exports.IsValidTokenType = IsValidTokenType;
var IsValidArgType = function (argType) {
    if (!argType || argType.length === 0) {
        return false;
    }
    var arr = argType.split('::');
    if (arr.length < 3) {
        return false;
    }
    return true;
};
exports.IsValidArgType = IsValidArgType;
var IsValidInt = function (value) {
    if (typeof (value) === 'string') {
        value = parseInt(value);
    }
    return Number.isSafeInteger(value);
};
exports.IsValidInt = IsValidInt;
var IsValidPercent = function (value) {
    return (0, exports.IsValidBigint)(value, BigInt(100), BigInt(0));
};
exports.IsValidPercent = IsValidPercent;
var IsValidArray = function (arr, validFunc) {
    for (var i = 0; i < arr.length; i++) {
        if (!validFunc(arr[i])) {
            return false;
        }
    }
    return true;
};
exports.IsValidArray = IsValidArray;
var ResolveU64 = function (value) {
    var max = exports.MAX_U64;
    if (value > max) {
        return max;
    }
    else {
        return value;
    }
};
exports.ResolveU64 = ResolveU64;
function removeTrailingZeros(numberString) {
    var trimmedString = numberString.trim();
    var decimalIndex = trimmedString.indexOf('.');
    if (decimalIndex !== -1) {
        var endIndex = trimmedString.length - 1;
        while (trimmedString[endIndex] === '0') {
            endIndex--;
        }
        if (trimmedString[endIndex] === '.') {
            endIndex--; // 如果小数点后面全是零，也去掉小数点
        }
        return trimmedString.slice(0, endIndex + 1);
    }
    return trimmedString;
}
var ResolveBalance = function (balance, decimals) {
    if (!balance)
        return '';
    if (balance === '0')
        return '0';
    if (decimals <= 0)
        return balance;
    var pos = decimals - balance.length;
    if (pos === 0) {
        return removeTrailingZeros('.' + (balance));
    }
    else if (pos < 0) {
        var start = balance.slice(0, Math.abs(pos));
        var end = balance.slice(Math.abs(pos));
        return removeTrailingZeros(start + '.' + end);
    }
    else {
        return removeTrailingZeros('.' + balance.padStart(decimals, '0'));
    }
};
exports.ResolveBalance = ResolveBalance;
var ParseType = function (type) {
    if (type) {
        var COIN = '0x2::coin::Coin<';
        var i = type.indexOf(COIN);
        if (i >= 0) {
            var coin = type.slice(i + COIN.length, type.length - 1);
            if (coin.indexOf('<') === -1) {
                while (coin[coin.length - 1] == '>') {
                    coin = coin.slice(0, -1);
                }
                ;
                var t = coin.lastIndexOf('::');
                return { isCoin: true, coin: coin, token: coin.slice(t + 2) };
            }
        }
    }
    return { isCoin: false, coin: '', token: '' };
};
exports.ParseType = ParseType;
function insertAtHead(array, value) {
    var newLength = array.length + 1;
    var newArray = new Uint8Array(newLength);
    newArray.set([value], 0);
    newArray.set(array, 1);
    return newArray;
}
exports.insertAtHead = insertAtHead;
function toFixed(x) {
    var res = '';
    if (Math.abs(x) < 1.0) {
        var e = parseInt(x.toString().split('e-')[1]);
        if (e) {
            x *= Math.pow(10, e - 1);
            res = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
        }
    }
    else {
        var e = parseInt(x.toString().split('+')[1]);
        if (e > 20) {
            e -= 20;
            x /= Math.pow(10, e);
            res = x + (new Array(e + 1)).join('0');
        }
    }
    return res;
}
exports.toFixed = toFixed;
function isValidHttpUrl(url) {
    var r;
    try {
        r = new URL(url);
    }
    catch (_) {
        return false;
    }
    return r.protocol === "http:" || r.protocol === "https:" || r.protocol === 'ipfs:';
}
exports.isValidHttpUrl = isValidHttpUrl;
var query_object = function (param) {
    if (param.id) {
        if (param === null || param === void 0 ? void 0 : param.onBegin)
            param.onBegin(param.id);
        protocol_1.Protocol.Client().getObject({ id: param.id, options: { showContent: true, showType: true, showOwner: true } }).then(function (res) {
            if (res.error) {
                if (param === null || param === void 0 ? void 0 : param.onObjectErr)
                    param.onObjectErr(param.id, res.error);
            }
            else {
                if (param === null || param === void 0 ? void 0 : param.onObjectRes)
                    param.onObjectRes(param.id, res);
            }
        }).catch(function (err) {
            console.log(err);
            if (param === null || param === void 0 ? void 0 : param.onObjectErr)
                param.onObjectErr(param.id, err);
        });
        protocol_1.Protocol.Client().getDynamicFields({ parentId: param.id }).then(function (res) {
            if (param === null || param === void 0 ? void 0 : param.onDynamicRes)
                param.onDynamicRes(param.id, res);
            if (res.data.length > 0) {
                protocol_1.Protocol.Client().multiGetObjects({ ids: res.data.map(function (v) { return v.objectId; }), options: { showContent: true } }).then(function (fields) {
                    if (param === null || param === void 0 ? void 0 : param.onFieldsRes)
                        param.onFieldsRes(param.id, fields);
                }).catch(function (err) {
                    console.log(err);
                    if (param === null || param === void 0 ? void 0 : param.onFieldsErr)
                        param.onFieldsErr(param.id, err);
                });
            }
        }).catch(function (err) {
            console.log(err);
            if (param === null || param === void 0 ? void 0 : param.onDynamicErr)
                param.onDynamicErr(param.id, err);
        });
    }
};
exports.query_object = query_object;
var FirstLetterUppercase = function (str) {
    if (!str)
        return '';
    return str.substring(0, 1).toUpperCase() + str.substring(1);
};
exports.FirstLetterUppercase = FirstLetterUppercase;
