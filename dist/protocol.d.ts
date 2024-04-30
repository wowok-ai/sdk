import { SuiObjectResponse, SuiObjectDataOptions, SuiTransactionBlockResponseOptions, SuiTransactionBlockResponse } from '@mysten/sui.js/client';
import { TransactionBlock, TransactionResult } from '@mysten/sui.js/transactions';
import { VariableType } from './guard';
export declare enum MODULES {
    machine = "machine",
    node = "node",
    progress = "progress",
    community = "community",
    repository = "repository",
    permission = "permission",
    passport = "passport",
    guard = "guard",
    vote = "vote",
    demand = "demand",
    order = "order",
    reward = "reward",
    service = "service",
    wowok = "wowok"
}
export type PermissionAddress = TransactionResult;
export type PermissionObject = TransactionResult | string;
export type RepositoryAddress = TransactionResult;
export type RepositoryObject = TransactionResult | string;
export type GuardAddress = TransactionResult;
export type GuardObject = TransactionResult | string;
export type MachineAddress = TransactionResult;
export type MachineObject = TransactionResult | string;
export type PassportObject = TransactionResult;
export type DemandAddress = TransactionResult;
export type DemandObject = TransactionResult | string;
export type ServiceObject = TransactionResult | string;
export type ServiceAddress = TransactionResult;
export type ProgressObject = TransactionResult | string;
export type ProgressAddress = TransactionResult;
export type RewardObject = TransactionResult | string;
export type RewardAddress = TransactionResult;
export type OrderObject = TransactionResult | string;
export type OrderAddress = TransactionResult;
export type DiscountObject = TransactionResult | string;
export type CoinObject = TransactionResult | string;
export type VoteObject = TransactionResult | string;
export type VoteAddress = TransactionResult;
export type TxbObject = string | TransactionResult | GuardObject | RepositoryObject | PermissionObject | MachineObject | PassportObject | DemandObject | ServiceObject | RewardObject | OrderObject | DiscountObject | VoteObject | DemandObject;
export type WowokObject = TransactionResult;
export type FnCallType = `${string}::${string}::${string}`;
export declare enum OperatorType {
    TYPE_QUERY = 1,
    TYPE_FUTURE_QUERY = 2,
    TYPE_QUERY_FROM_CONTEXT = 3,
    TYPE_LOGIC_OPERATOR_U128_GREATER = 11,
    TYPE_LOGIC_OPERATOR_U128_GREATER_EQUAL = 12,
    TYPE_LOGIC_OPERATOR_U128_LESSER = 13,
    TYPE_LOGIC_OPERATOR_U128_LESSER_EQUAL = 14,
    TYPE_LOGIC_OPERATOR_U128_EQUAL = 15,
    TYPE_LOGIC_OPERATOR_EQUAL = 16,
    TYPE_LOGIC_OPERATOR_HAS_SUBSTRING = 17,
    TYPE_LOGIC_ALWAYS_TRUE = 18
}
export declare enum ContextType {
    TYPE_CONTEXT_SIGNER = 60,
    TYPE_CONTEXT_CLOCK = 61,
    TYPE_CONTEXT_FUTURE_ID = 62,
    TYPE_CONTEXT_bool = 70,
    TYPE_CONTEXT_address = 71,
    TYPE_CONTEXT_u64 = 72,
    TYPE_CONTEXT_u8 = 73,
    TYPE_CONTEXT_vec_u8 = 74
}
export declare enum ValueType {
    TYPE_STATIC_bool = 100,
    TYPE_STATIC_address = 101,
    TYPE_STATIC_u64 = 102,
    TYPE_STATIC_u8 = 103,
    TYPE_STATIC_vec_u8 = 104,
    TYPE_STATIC_u128 = 105,
    TYPE_STATIC_vec_address = 106,
    TYPE_STATIC_vec_bool = 107,
    TYPE_STATIC_vec_vec_u8 = 108,
    TYPE_STATIC_vec_u64 = 109,
    TYPE_STATIC_vec_u128 = 110,
    TYPE_STATIC_option_address = 111,
    TYPE_STATIC_option_bool = 112,
    TYPE_STATIC_option_u8 = 113,
    TYPE_STATIC_option_u64 = 114,
    TYPE_STATIC_option_u128 = 115
}
export type Data_Type = ValueType | OperatorType | ContextType;
export declare enum ENTRYPOINT {
    mainnet = "mainnet",
    testnet = "testnet",
    devnet = "devnet",
    localnet = "localnet"
}
export declare class Protocol {
    protected network: string;
    protected package: string;
    protected signer: string;
    protected everyone_guard: string;
    protected graphql: string;
    protected txb: TransactionBlock | undefined;
    constructor(network: ENTRYPOINT, signer_address: string);
    UseNetwork(network?: ENTRYPOINT): void;
    Package(): string;
    EveryoneGuard(): string;
    GraphqlUrl(): string;
    NetworkUrl(): string;
    MachineFn: (fn: any) => string;
    NodeFn: (fn: any) => string;
    ProgressFn: (fn: any) => string;
    CommunityFn: (fn: any) => string;
    RepositoryFn: (fn: any) => string;
    PermissionFn: (fn: any) => string;
    PassportFn: (fn: any) => string;
    GuardFn: (fn: any) => string;
    VoteFn: (fn: any) => string;
    DemandFn: (fn: any) => string;
    OrderFn: (fn: any) => string;
    RewardFn: (fn: any) => string;
    ServiceFn: (fn: any) => string;
    WowokFn: (fn: any) => string;
    Query: (objects: Query_Param[], options?: SuiObjectDataOptions) => Promise<SuiObjectResponse[]>;
    NewSession: () => TransactionBlock;
    CurrentSession: () => TransactionBlock;
    SignExcute: (exes: ((protocol: Protocol, param: any) => void)[], priv_key: string, param?: any, options?: SuiTransactionBlockResponseOptions) => Promise<SuiTransactionBlockResponse>;
    static SUI_TOKEN_TYPE: string;
    static SUI_COIN_TYPE: string;
    WOWOK_TOKEN_TYPE: () => string;
    WOWOK_COIN_TYPE: () => string;
    static CLOCK_OBJECT: {
        Object: {
            ImmOrOwned: {
                digest: string;
                objectId: string;
                version: string | number | bigint;
            };
        } | {
            Shared: {
                objectId: string;
                initialSharedVersion: string | number;
                mutable: boolean;
            };
        } | {
            Receiving: {
                digest: string;
                objectId: string;
                version: string | number | bigint;
            };
        };
    };
    static TXB_OBJECT(txb: TransactionBlock, arg: TxbObject): TransactionResult;
    static IsValidObjects: (arr: TxbObject[]) => boolean;
    WOWOK_OBJECTS_TYPE: () => string[];
    WOWOK_OBJECTS_PREFIX_TYPE: () => string[];
    object_name_from_type_repr: (type_repr: string) => string;
}
export declare class RpcResultParser {
    static Object_Type_Extra: () => string[];
    static objectids_from_response: (protocol: Protocol, response: SuiTransactionBlockResponse, concat_result?: Map<string, TxbObject[]>) => Map<string, TxbObject[]>;
}
export type Query_Param = {
    objectid: string;
    callback: (protocol: Protocol, response: SuiObjectResponse, param: Query_Param, option: SuiObjectDataOptions) => void;
    parser?: (result: any[], guardid: string, chain_sense_bsc: Uint8Array, variable?: VariableType) => boolean;
    data?: any;
    variables?: VariableType;
};
//# sourceMappingURL=protocol.d.ts.map