import { BCS, TypeName, StructTypeDefinition } from '@mysten/bcs';
import { TransactionBlock } from '@mysten/sui.js/transactions';
export declare const ulebDecode: (arr: number[] | Uint8Array) => {
    value: number;
    length: number;
};
export declare const concatenate: (resultConstructor: any, ...arrays: any[]) => any;
export declare const array_equal: (arr1: any[], arr2: any[]) => boolean;
export declare const array_unique: (arr: any[]) => any[];
export declare function capitalize(s: string): string;
export declare function parse_object_type(object_data: string): string[];
export declare class Bcs {
    bcs: BCS;
    constructor();
    ser_option_string(data: string): Uint8Array;
    ser_option_u64(data: number): Uint8Array;
    ser_option_address(data: string): Uint8Array;
    ser_vector_string(data: string[]): Uint8Array;
    ser_vector_vector_u8(data: string[]): Uint8Array;
    ser_vector_u64(data: number[]): Uint8Array;
    ser_vector_u8(data: number[]): Uint8Array;
    ser_address(data: string): Uint8Array;
    ser_bool(data: boolean): Uint8Array;
    ser_u8(data: number): Uint8Array;
    ser_u64(data: number): Uint8Array;
    ser_string(data: string): Uint8Array;
    de(type: TypeName | StructTypeDefinition, data: Uint8Array): any;
}
export declare const BCS_CONVERT: Bcs;
export declare function stringToUint8Array(str: string): Uint8Array;
export declare function numToUint8Array(num: number): Uint8Array;
export declare const isArr: (origin: any) => boolean;
export declare const deepClone: <T>(origin: T, target?: T | Record<string, any> | undefined) => T;
export declare const MAX_DESCRIPTION_LENGTH = 1024;
export declare const MAX_NAME_LENGTH = 64;
export declare const MAX_ENDPOINT_LENGTH = 1024;
export declare const IsValidDesription: (description: string) => boolean;
export declare const IsValidName: (name: string) => boolean;
export declare const IsValidName_AllowEmpty: (name: string) => boolean;
export declare const IsValidEndpoint: (endpoint: string) => boolean;
export declare const IsValidAddress: (addr: string) => boolean;
export declare const IsValidArgType: (argType: string) => boolean;
export declare const IsValidUint: (value: number) => boolean;
export declare const IsValidInt: (value: number) => boolean;
export declare const IsValidPercent: (value: number) => boolean;
export declare const IsValidArray: (arr: any[], validFunc: any) => boolean;
export declare const OptionNone: (txb: TransactionBlock) => Infer<Struct<{
    index: number;
    kind: "Input";
    value?: any;
    type?: "object" | undefined;
} | {
    index: number;
    kind: "Input";
    type: "pure";
    value?: any;
} | {
    kind: "GasCoin";
} | {
    index: number;
    kind: "Result";
} | {
    index: number;
    resultIndex: number;
    kind: "NestedResult";
}, null>>;
//# sourceMappingURL=utils.d.ts.map