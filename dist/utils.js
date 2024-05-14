import { BCS, getSuiMoveConfig } from '@mysten/bcs';
export const ulebDecode = (arr) => {
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
export const concatenate = (resultConstructor, ...arrays) => {
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
export const array_equal = (arr1, arr2) => {
    // Array.some(): 有一项不满足，返回false
    if (arr1.length !== arr2.length) {
        return false;
    }
    return !arr1.some((item) => !arr2.includes(item));
};
export const array_unique = (arr) => {
    var newArr = [];
    for (var i = 0; i < arr.length; i++) {
        if (newArr.indexOf(arr[i]) == -1) {
            newArr.push(arr[i]);
        }
    }
    return newArr;
};
export function capitalize(s) {
    return s && s[0].toUpperCase() + s.slice(1);
}
// for: "0xsdjfkskf<0x2::sui::coin<xxx>, 0xfdfff<>>"
export function parse_object_type(object_data) {
    var object_type = [];
    let type_pos = object_data.indexOf('<');
    if (type_pos >= 0) {
        let t = object_data.slice((type_pos + 1), object_data.length - 1);
        object_type = t.split(',');
    }
    return object_type;
}
export class Bcs {
    bcs = new BCS(getSuiMoveConfig());
    static _instance;
    constructor() {
        this.bcs.registerEnumType('Option<T>', {
            'none': null,
            'some': 'T',
        });
    }
    static getInstance() {
        if (!Bcs._instance) {
            Bcs._instance = new Bcs();
        }
        ;
        return Bcs._instance;
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
        return this.bcs.ser(BCS.ADDRESS, data).toBytes();
    }
    ser_bool(data) {
        return this.bcs.ser(BCS.BOOL, data).toBytes();
    }
    ser_u8(data) {
        return this.bcs.ser(BCS.U8, data).toBytes();
    }
    ser_u64(data) {
        return this.bcs.ser(BCS.U64, data).toBytes();
    }
    ser_string(data) {
        return this.bcs.ser(BCS.STRING, data).toBytes();
    }
    de(type, data) {
        return this.bcs.de(type, data);
    }
}
export function stringToUint8Array(str) {
    var arr = [];
    for (var i = 0, j = str.length; i < j; ++i) {
        arr.push(str.charCodeAt(i));
    }
    var tmpUint8Array = new Uint8Array(arr);
    return tmpUint8Array;
}
export function numToUint8Array(num) {
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
// 判断是否为数组
export const isArr = (origin) => {
    let str = '[object Array]';
    return Object.prototype.toString.call(origin) == str ? true : false;
};
export const deepClone = (origin, target) => {
    let tar = target || {};
    for (const key in origin) {
        if (Object.prototype.hasOwnProperty.call(origin, key)) {
            if (typeof origin[key] === 'object' && origin[key] !== null) {
                tar[key] = isArr(origin[key]) ? [] : {};
                deepClone(origin[key], tar[key]);
            }
            else {
                tar[key] = origin[key];
            }
        }
    }
    return tar;
};
export const MAX_DESCRIPTION_LENGTH = 1024;
export const MAX_NAME_LENGTH = 64;
export const MAX_ENDPOINT_LENGTH = 1024;
// export const OptionNone = (txb:TransactionBlock) : TransactionArgument => { return txb.pure([], BCS.U8) };
export const IsValidDesription = (description) => { return description?.length <= MAX_DESCRIPTION_LENGTH; };
export const IsValidName = (name) => { if (!name)
    return false; return name.length <= MAX_NAME_LENGTH && name.length != 0; };
export const IsValidName_AllowEmpty = (name) => { return name.length <= MAX_NAME_LENGTH; };
export const IsValidEndpoint = (endpoint) => { if (!endpoint)
    return false; return endpoint.length <= MAX_ENDPOINT_LENGTH; };
export const IsValidAddress = (addr) => { if (!addr)
    return false; return true; };
export const IsValidArgType = (argType) => { if (!argType)
    return false; return argType.length != 0; };
export const IsValidUint = (value) => { return Number.isSafeInteger(value) && value != 0; };
export const IsValidInt = (value) => { return Number.isSafeInteger(value); };
export const IsValidPercent = (value) => { return Number.isSafeInteger(value) && value > 0 && value <= 100; };
export const IsValidArray = (arr, validFunc) => {
    let bValid = true;
    arr.forEach((v) => {
        if (!validFunc(v)) {
            bValid = false;
        }
    });
    return bValid;
};
export const OptionNone = (txb) => { return txb.pure([], BCS.U8); };
export const ParseType = (type) => {
    let i = type.indexOf('<');
    if (i > 0 && type.length > 12) {
        let c = type.slice(0, i);
        if (c === '0x2::coin::Coin' || c === '0x0000000000000000000000000000000000000000000000000000000000000002::coin::Coin') {
            let coin = type.slice(i + 1, type.length - 1); // < >>
            let t = coin.lastIndexOf('::');
            return { isCoin: true, coin: coin, token: coin.slice(t + 2) };
        }
    }
    return { isCoin: false, coin: '', token: '' };
};
export function toFixed(x) {
    let res = '';
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
