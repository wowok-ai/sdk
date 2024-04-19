"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepClone = exports.isArr = exports.numToUint8Array = exports.stringToUint8Array = exports.objectids_from_response = exports.Object_Type_Extra = exports.BCS_CONVERT = exports.Bcs = exports.parse_object_type = exports.capitalize = exports.array_unique = exports.array_equal = exports.concatenate = exports.ulebDecode = void 0;
const bcs_1 = require("@mysten/bcs");
const protocol_1 = require("./protocol");
const ulebDecode = (arr) => {
    let total = 0;
    let shift = 0;
    let len = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        let byte = arr[len];
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
const concatenate = (resultConstructor, ...arrays) => {
    let totalLength = 0;
    for (const arr of arrays) {
        totalLength += arr.length;
    }
    const result = new resultConstructor(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
};
exports.concatenate = concatenate;
const array_equal = (arr1, arr2) => {
    // Array.some(): 有一项不满足，返回false
    if (arr1.length !== arr2.length) {
        return false;
    }
    return !arr1.some((item) => !arr2.includes(item));
};
exports.array_equal = array_equal;
const array_unique = (arr) => {
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
    let type_pos = object_data.indexOf('<');
    if (type_pos >= 0) {
        let t = object_data.slice((type_pos + 1), object_data.length - 1);
        object_type = t.split(',');
    }
    return object_type;
}
exports.parse_object_type = parse_object_type;
class Bcs {
    bcs = new bcs_1.BCS((0, bcs_1.getSuiMoveConfig)());
    constructor() {
        this.bcs.registerEnumType('Option<T>', {
            'none': null,
            'some': 'T',
        });
    }
    ser_option_string(data) {
        return this.bcs.ser('Option<string>', { 'some': data }).toBytes();
    }
    ser_option_u64(data) {
        return this.bcs.ser('Option<u64>', { 'some': data }).toBytes();
    }
    ser_option_address(data) {
        return this.bcs.ser('Option<address>', { 'some': data }).toBytes();
    }
    ser_vector_string(data) {
        return this.bcs.ser('vector<string>', data).toBytes();
    }
    ser_vector_vector_u8(data) {
        return this.bcs.ser('vector<vector<u8>>', data).toBytes();
    }
    ser_vector_u64(data) {
        return this.bcs.ser('vector<u64>', data).toBytes();
    }
    ser_vector_u8(data) {
        return this.bcs.ser('vector<u8>', data).toBytes();
    }
    ser_address(data) {
        return this.bcs.ser(bcs_1.BCS.ADDRESS, data).toBytes();
    }
    ser_bool(data) {
        return this.bcs.ser(bcs_1.BCS.BOOL, data).toBytes();
    }
    ser_u8(data) {
        return this.bcs.ser(bcs_1.BCS.U8, data).toBytes();
    }
    ser_u64(data) {
        return this.bcs.ser(bcs_1.BCS.U64, data).toBytes();
    }
    ser_string(data) {
        return this.bcs.ser(bcs_1.BCS.STRING, data).toBytes();
    }
    de(type, data) {
        return this.bcs.de(type, data);
    }
}
exports.Bcs = Bcs;
exports.BCS_CONVERT = new Bcs();
const Object_Type_Extra = () => {
    let names = Object.keys(protocol_1.MODULES).map((key) => { return key + '::' + capitalize(key); });
    names.push('order::Discount');
    return names;
};
exports.Object_Type_Extra = Object_Type_Extra;
const objectids_from_response = (response, concat_result) => {
    let ret = new Map();
    if (response?.objectChanges) {
        response.objectChanges.forEach((change) => {
            (0, exports.Object_Type_Extra)().forEach((name) => {
                let type = protocol_1.PROTOCOL.Package() + '::' + name;
                if (change.type == 'created' && change.objectType.includes(type)) {
                    if (ret.has(name)) {
                        ret.get(name)?.push(change.objectId);
                    }
                    else {
                        ret.set(name, [change.objectId]);
                    }
                }
            });
        });
    }
    if (concat_result) {
        ret.forEach((value, key) => {
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
exports.objectids_from_response = objectids_from_response;
function stringToUint8Array(str) {
    var arr = [];
    for (var i = 0, j = str.length; i < j; ++i) {
        arr.push(str.charCodeAt(i));
    }
    var tmpUint8Array = new Uint8Array(arr);
    return tmpUint8Array;
}
exports.stringToUint8Array = stringToUint8Array;
function numToUint8Array(num) {
    if (!num)
        return new Uint8Array(0);
    const a = [];
    a.unshift(num & 255);
    while (num >= 256) {
        num = num >>> 8;
        a.unshift(num & 255);
    }
    return new Uint8Array(a);
}
exports.numToUint8Array = numToUint8Array;
// 判断是否为数组
const isArr = (origin) => {
    let str = '[object Array]';
    return Object.prototype.toString.call(origin) == str ? true : false;
};
exports.isArr = isArr;
const deepClone = (origin, target) => {
    let tar = target || {};
    for (const key in origin) {
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
