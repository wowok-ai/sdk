import { bcs, BCS, toHEX, fromHEX, getSuiMoveConfig, TypeName, StructTypeDefinition } from '@mysten/bcs';
import { TransactionBlock, Inputs, TransactionResult, TransactionArgument } from '@mysten/sui.js/transactions';
import { ERROR, Errors } from './exception';
import { isValidSuiAddress, isValidSuiObjectId } from '@mysten/sui.js/utils'
import { ValueType } from './protocol'

export const OPTION_NONE = 0;
export const readOption = (arr: number[], de:ValueType) : {bNone:boolean, value:any}=> {
    let o = arr.splice(0, 1);
    if (o[0] == 1) { // true
        return {bNone:false,  value:Bcs.getInstance().de(de, Uint8Array.from(arr))};
    } else if (o[0] == 0) {
        return {bNone:true, value:OPTION_NONE};
    } else {
        ERROR(Errors.Fail, 'readOption: option invalid')
        return {bNone:true, value:OPTION_NONE}
    }
}

export const readOptionString = (arr: number[]) : {bNone:boolean, value:any}=> {
    let o = arr.splice(0, 1);
    if (o[0] == 1) { // true
        let r = ulebDecode(Uint8Array.from(arr));
        let value = Bcs.getInstance().de(ValueType.TYPE_STRING, Uint8Array.from(arr));
        arr.splice(0, r.value+r.length);
        return {bNone:false,  value:value};
    } else if (o[0] == 0) {
        return {bNone:true, value:OPTION_NONE};
    } else {
        ERROR(Errors.Fail, 'readOption: option invalid')
        return {bNone:true, value:OPTION_NONE}
    }
}

export const ulebDecode = (arr: Uint8Array) : {value: number, length: number} => {
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
}

export const readVec = (arr: any[], cb:(arr:any[], i:number, length:number) => any) : any[] => {
    let r = ulebDecode(Uint8Array.from(arr));
    arr.splice(0, r.length) ;

    let result = [];
    for (let i = 0; i < r.value; i++) {
        result.push(cb(arr, i, r.value));
    }    
    return result;
}

export const cb_U8 = (arr:any[], i:number, length:number) : any => {
    return arr.shift();
}
export const cb_U64 = (arr:any[], i:number, length:number) : any => {
    return arr.splice(0, 8);
}
export const cb_U128 = (arr:any[], i:number, length:number) : any => {
    return arr.splice(0, 16);
}
export const cb_U256 = (arr:any[], i:number, length:number) : any => {
    return arr.splice(0, 32);
}

export const concatenate = (resultConstructor:any, ...arrays:any[]) => {
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
}

export const array_equal =  (arr1: any[], arr2: any[]) => {
    // Array.some(): 有一项不满足，返回false
    if (arr1.length !== arr2.length) {
      return false;
    }
    return !arr1.some((item) => !arr2.includes(item));
}

export const array_unique = (arr:any[]) : any[] =>  {
    var newArr = [];
    for(var i = 0; i < arr.length; i++) {
        if(newArr.indexOf(arr[i]) == -1) {
            newArr.push(arr[i]);
        }
    }
    return newArr;
}

export function capitalize (s:string) : string { 
    return s && s[0].toUpperCase() + s.slice(1)
}

// for: "0xsdjfkskf<0x2::sui::coin<xxx>, 0xfdfff<>>"
export function parse_object_type(object_data:string) : string[] {
    var object_type : string[] = [];
    let type_pos = object_data.indexOf('<');
    if (type_pos >= 0) { 
        let t = object_data.slice((type_pos+1), object_data.length-1);
        object_type = t.split(',');
    }
    return object_type;
}

export class Bcs {
    bcs = new BCS(getSuiMoveConfig());
    private static _instance : any;
    private constructor() {
        this.bcs.registerEnumType('Option<T>', {
            'none': null,
            'some': 'T',
        });
    }
    static getInstance() : Bcs { 
        if (!Bcs._instance) {
            Bcs._instance =  new Bcs();
        };
        return Bcs._instance;
     }
    ser(type:ValueType, data:Uint8Array | any) : Uint8Array {
        switch(type) {
            case ValueType.TYPE_BOOL:
                return this.bcs.ser(BCS.BOOL, data).toBytes();
            case ValueType.TYPE_ADDRESS:
                return this.bcs.ser(BCS.ADDRESS, data).toBytes();
            case ValueType.TYPE_U64:
                return this.bcs.ser(BCS.U64, data).toBytes();
            case ValueType.TYPE_U8:
                return this.bcs.ser(BCS.U8, data).toBytes();
            case ValueType.TYPE_VEC_U8:
                return this.bcs.ser('vector<u8>', data).toBytes();
            case ValueType.TYPE_U128:
                return this.bcs.ser(BCS.U128, data).toBytes();
            case ValueType.TYPE_VEC_ADDRESS:
                return this.bcs.ser('vector<address>', data).toBytes();
            case ValueType.TYPE_VEC_BOOL:
                return this.bcs.ser('vector<bool>', data).toBytes();
            case ValueType.TYPE_VEC_VEC_U8:
                return this.bcs.ser('vector<vector<u8>>', data).toBytes();
            case ValueType.TYPE_VEC_U64:
                return this.bcs.ser('vector<u64>', data).toBytes();
            case ValueType.TYPE_VEC_U128:
                return this.bcs.ser('vector<u128>', data).toBytes();
            case ValueType.TYPE_OPTION_ADDRESS:
                return this.bcs.ser('Option<address>', {'some': data}).toBytes();
            case ValueType.TYPE_OPTION_BOOL:
                return this.bcs.ser('Option<bool>', {'some': data}).toBytes();
            case ValueType.TYPE_OPTION_U8:
                return this.bcs.ser('Option<u8>', {'some': data}).toBytes();
            case ValueType.TYPE_OPTION_U64:
                return this.bcs.ser('Option<u64>', {'some': data}).toBytes();
            case ValueType.TYPE_OPTION_U128:
                return this.bcs.ser('Option<u128>', {'some': data}).toBytes();
            case ValueType.TYPE_OPTION_U256:
                return this.bcs.ser('Option<u256>', {'some': data}).toBytes();
            case ValueType.TYPE_OPTION_STRING:
                return this.bcs.ser('Option<string>', {'some': data}).toBytes();
            case ValueType.TYPE_VEC_U256:
                return this.bcs.ser('vector<u256>', data).toBytes();
            case ValueType.TYPE_U256:
                return this.bcs.ser(BCS.U256, data).toBytes();
            case ValueType.TYPE_STRING:
                return this.bcs.ser(BCS.STRING, data).toBytes();
            case ValueType.TYPE_VEC_STRING:
                return this.bcs.ser('vector<string>', data).toBytes();
            default:
                ERROR(Errors.bcsTypeInvalid, 'ser');
        }
        return new Uint8Array();
    }

    de(type:ValueType, data:Uint8Array | any) : any {
        switch(type) {
            case ValueType.TYPE_BOOL:
                return this.bcs.de(BCS.BOOL, data);
            case ValueType.TYPE_ADDRESS:
                return this.bcs.de(BCS.ADDRESS, data);
            case ValueType.TYPE_U64:
                return this.bcs.de(BCS.U64, data);
            case ValueType.TYPE_U8:
                return this.bcs.de(BCS.U8, data);
            case ValueType.TYPE_VEC_U8:
                return this.bcs.de('vector<u8>', data);
            case ValueType.TYPE_U128:
                return this.bcs.de(BCS.U128, data);
            case ValueType.TYPE_VEC_ADDRESS:
                return this.bcs.de('vector<address>', data);
            case ValueType.TYPE_VEC_BOOL:
                return this.bcs.de('vector<bool>', data);
            case ValueType.TYPE_VEC_VEC_U8:
                return this.bcs.de('vector<vector<u8>>', data);
            case ValueType.TYPE_VEC_U64:
                return this.bcs.de('vector<u64>', data);
            case ValueType.TYPE_VEC_U128:
                return this.bcs.de('vector<u128>', data);
            case ValueType.TYPE_OPTION_ADDRESS:
                return this.bcs.de('Option<address>', data);
            case ValueType.TYPE_OPTION_BOOL:
                return this.bcs.de('Option<bool>', data);
            case ValueType.TYPE_OPTION_U8:
                return this.bcs.de('Option<u8>', data);
            case ValueType.TYPE_OPTION_U64:
                return this.bcs.de('Option<u64>', data);
            case ValueType.TYPE_OPTION_U128:
                return this.bcs.de('Option<u128>', data);
            case ValueType.TYPE_OPTION_U256:
                return this.bcs.de('Option<u256>', data);
            case ValueType.TYPE_OPTION_STRING:
                return this.bcs.de('Option<string>', data);
            case ValueType.TYPE_VEC_U256:
                return this.bcs.de('vector<u256>', data);
            case ValueType.TYPE_STRING:
                return this.bcs.de(BCS.STRING, data);
            case ValueType.TYPE_VEC_STRING:
                return this.bcs.de('vector<string>', data);
            case ValueType.TYPE_U256:
                return this.bcs.de(BCS.U256, data);
            default:
                ERROR(Errors.bcsTypeInvalid, 'de');
        }
    }
}

export function stringToUint8Array(str:string) : Uint8Array {
    var arr = [];
    for (var i = 0, j = str.length; i < j; ++i) {
      arr.push(str.charCodeAt(i));
    }
    var tmpUint8Array = new Uint8Array(arr);
    return tmpUint8Array
}

export function numToUint8Array(num:number) : Uint8Array {
    if (!num) return new Uint8Array(0)
    const a = [];
    a.unshift(num & 255)
    while (num >= 256) {
        num = num >>> 8
        a.unshift(num & 255)
    }
    return new Uint8Array(a)
} 

// 判断是否为数组
export const isArr = (origin: any): boolean => {
    let str = '[object Array]'
    return Object.prototype.toString.call(origin) == str ? true : false
}


export const deepClone = <T>(origin: T, target?: Record<string, any> | T ): T => {
    let tar = target || {}

    for (const key in origin) {
        if (Object.prototype.hasOwnProperty.call(origin, key)) {
            if (typeof origin[key] === 'object' && origin[key] !== null) {
                tar[key] = isArr(origin[key]) ? [] : {}
                deepClone(origin[key], tar[key])
            } else {
                tar[key] = origin[key]
            }

        }
    }

    return tar as T
}

export const MAX_DESCRIPTION_LENGTH = 1024;
export const MAX_NAME_LENGTH = 64;
export const MAX_ENDPOINT_LENGTH = 1024;
// export const OptionNone = (txb:TransactionBlock) : TransactionArgument => { return txb.pure([], BCS.U8) };

export const IsValidDesription = (description:string) : boolean => { return description?.length <= MAX_DESCRIPTION_LENGTH }
export const IsValidName = (name:string) : boolean => { if(!name) return false; return name.length <= MAX_NAME_LENGTH && name.length != 0 }
export const IsValidName_AllowEmpty = (name:string) : boolean => { return name.length <= MAX_NAME_LENGTH }
export const IsValidEndpoint = (endpoint:string) : boolean => { if (!endpoint) return false; return endpoint.length <= MAX_ENDPOINT_LENGTH }
export const IsValidAddress = (addr:string) : boolean => { 
    if (!addr || !isValidSuiAddress(addr)) {
        return false; 
    }
    return true
}
export const IsValidArgType = (argType: string) : boolean => { 
    if (!argType || argType.length === 0) {
        return false; 
    }
    let arr = argType.split('::');
    if (arr.length !== 3) {
        return false;
    } 
    if (!IsValidAddress(arr[0]) || arr[1].length === 0 || arr[2].length === 0) {
        return false;
    }
    return true;
}

export const IsValidUint = (value: number | string) : boolean => { 
    if (typeof(value) === 'string') {
        value = parseInt(value as string);
    }
    return Number.isSafeInteger(value) && value > 0 
}
export const IsValidInt = (value: number | string) : boolean => { 
    if (typeof(value) === 'string') {
        value = parseInt(value as string);
    }
    return Number.isSafeInteger(value) 
}
export const IsValidPercent = (value: number | string) : boolean => { 
    if (typeof(value) === 'string') {
        value = parseInt(value as string);
    }
    return Number.isSafeInteger(value) && value > 0 && value <= 100 
}
export const IsValidArray = (arr: any[], validFunc:any) : boolean => {
    let bValid = true;
    arr.forEach((v) => {
        if (!validFunc(v)) {
            bValid = false; 
        }
    })
    return bValid;
}

export const OptionNone = (txb:TransactionBlock) : TransactionArgument => { return txb.pure([], BCS.U8) };

export type ArgType = {
    isCoin: boolean;
    coin: string;
    token: string;
}
export const ParseType = (type:string) : ArgType => {
    if (type) {
        const COIN = '0x0000000000000000000000000000000000000000000000000000000000000002::coin::Coin<';
        let i = type.indexOf(COIN);
        if (i > 0) {
            let coin = type.slice(i+COIN.length, type.length-1);
            if (coin.indexOf('<') === -1) {
                while (coin[coin.length-1] == '>') {
                    coin = coin.slice(0, -1);
                };
                let t = coin.lastIndexOf('::');      
                return {isCoin:true, coin:coin, token:coin.slice(t+2)}         
            }
        }
    }
    return  {isCoin:false, coin:'', token:''}
}

export function toFixed(x:number) {
    let res = '';
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split('e-')[1]);
      if (e) {
          x *= Math.pow(10,e-1);
          res = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
          e -= 20;
          x /= Math.pow(10,e);
          res = x + (new Array(e+1)).join('0');
      }
    }
    return res;
  }

export function isValidHttpUrl(url:string) : boolean {
    let r:any;
    try {
      r = new URL(url);
    } catch (_) {
      return false;  
    }
  
    return r.protocol === "http:" || r.protocol === "https:";
}