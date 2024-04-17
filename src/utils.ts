import { SuiTransactionBlockResponse, SuiObjectChange } from '@mysten/sui.js/client';
import { bcs, BCS, toHEX, fromHEX, getSuiMoveConfig, TypeName, StructTypeDefinition } from '@mysten/bcs';
import { PROTOCOL, MODULES, OBJECTS_TYPE } from './protocol';

export const ulebDecode = (arr: number[] | Uint8Array) : {value: number, length: number} => {
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
    constructor() {
        this.bcs.registerEnumType('Option<T>', {
            'none': null,
            'some': 'T',
        });
    }
    ser_option_string(data:string) : Uint8Array {
        return this.bcs.ser('Option<string>', {'some': data}).toBytes();
    }
    ser_option_u64(data:number) : Uint8Array {
        return this.bcs.ser('Option<u64>', {'some': data}).toBytes();
    }
    ser_option_address(data:string) : Uint8Array {
        return this.bcs.ser('Option<address>', {'some': data}).toBytes();
    }
    ser_vector_string(data:string[]) : Uint8Array {
        return this.bcs.ser('vector<string>', data).toBytes();
    }
    ser_vector_vector_u8(data:string[]) : Uint8Array {
        return this.bcs.ser('vector<vector<u8>>', data).toBytes();
    }
    ser_vector_u64(data:number[]) : Uint8Array {
        return this.bcs.ser('vector<u64>', data).toBytes();
    }
    ser_vector_u8(data:number[])  : Uint8Array {
        return this.bcs.ser('vector<u8>', data).toBytes();
    }
    ser_address(data:string) : Uint8Array {
        return this.bcs.ser(BCS.ADDRESS, data).toBytes();
    }
    ser_bool(data:boolean) : Uint8Array {
        return this.bcs.ser(BCS.BOOL, data).toBytes();
    }
    ser_u8(data:number) : Uint8Array {
        return this.bcs.ser(BCS.U8, data).toBytes();
    }
    ser_u64(data:number) : Uint8Array {
        return this.bcs.ser(BCS.U64, data).toBytes();
    }
    ser_string(data:string) : Uint8Array {
        return this.bcs.ser(BCS.STRING, data).toBytes();
    }
    de(type:TypeName | StructTypeDefinition, data:Uint8Array) {
        return this.bcs.de(type, data)
    }
}

export const BCS_CONVERT = new Bcs();


export const Object_Type_Extra = () => {
    let names = (Object.keys(MODULES) as Array<keyof typeof MODULES>).map((key) => { return key + '::' + capitalize(key); });
    names.push('order::Discount');
    return names;
}

export const objectids_from_response = (response:SuiTransactionBlockResponse, concat_result?:Map<string, string[]>): Map<string, string[]> => {
    let ret = new Map<string, string[]>();
    console.log(0)
    if (response?.objectChanges) {
        response.objectChanges.forEach((change) => {
            Object_Type_Extra().forEach((name) => {
                let type = PROTOCOL.Package() + '::' + name;
                if (change.type == 'created' && change.objectType.includes(type)) {
                    if (ret.has(name)) {
                        ret.get(name)?.push(change.objectId);
                    } else {
                        ret.set(name, [change.objectId]);
                    }
                }                    
            })
        });    
    }
    console.log(1)
    if (concat_result) {
        ret.forEach((value, key) => {
            if (concat_result.has(key)) {
                concat_result.set(key, concat_result.get(key)!.concat(value));
            } else {
                concat_result.set(key, value);
            }
        })
    }
    console.log(2)
    return ret;
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