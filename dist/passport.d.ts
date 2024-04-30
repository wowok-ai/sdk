import { SuiObjectResponse, SuiObjectDataOptions } from '@mysten/sui.js/client';
import { type TransactionObjectInput } from '@mysten/sui.js/transactions';
import { FnCallType, Query_Param, GuardObject, Protocol, ContextType, OperatorType, Data_Type, MODULES } from './protocol';
import { VariableType } from './guard';
export type Guard_Query_Object = {
    target: FnCallType;
    object: TransactionObjectInput;
    types: string[];
    id: string;
};
export type GUARD_QUERIES_TYPE = {
    module: MODULES;
    name: string;
    cmd: number;
    params: Data_Type[];
    result: Data_Type;
};
export type FutureValueRequest = {
    guardid: string;
    identifier: number;
    type: ContextType | OperatorType;
    witness: string;
    value: string;
};
export declare class GuardParser {
    static guard_futures: (protocol: Protocol, guards: string[]) => Promise<FutureValueRequest[]>;
    static parse_futures(result: FutureValueRequest[], guardid: string, chain_sense_bsc: Uint8Array, variable?: VariableType): boolean;
    static guard_queries: (protocol: Protocol, guards: string[], futures?: FutureValueRequest[]) => Promise<Guard_Query_Object[]>;
    static parse_sense_bsc(result: string[], guardid: string, chain_sense_bsc: Uint8Array, variable?: VariableType): boolean;
    static rpc_sense_objects_fn: (protocol: Protocol, response: SuiObjectResponse, param: Query_Param, option: SuiObjectDataOptions) => void;
    static rpc_query_cmd_fn: (protocol: Protocol, response: SuiObjectResponse, param: Query_Param, option: SuiObjectDataOptions) => void;
}
export declare class Passport {
    static MAX_GUARD_COUNT: number;
    protected passport: import("@mysten/sui.js/transactions").TransactionResult;
    protected protocol: Protocol;
    get_object(): import("@mysten/sui.js/transactions").TransactionResult;
    constructor(protocol: Protocol, guards: GuardObject[], guard_queries: Guard_Query_Object[], future_values?: FutureValueRequest[]);
    destroy(): void;
    freeze(): void;
}
//# sourceMappingURL=passport.d.ts.map