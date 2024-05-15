import { type TransactionObjectInput } from '@mysten/sui.js/transactions';
import { FnCallType, GuardObject, Protocol } from './protocol';
export type Guard_Query_Object = {
    target: FnCallType;
    object: TransactionObjectInput;
    types: string[];
    id: string;
};
interface FutrueInfo {
    identifier: number;
    type: number;
    value_or_witness: string;
    futrue?: string;
}
interface GuardInfo {
    id: string;
    query_list: (string | {
        identifier: number;
        type: number;
        witness: string;
    })[];
    variable_or_future_list: FutrueInfo[];
}
interface FutrueFill {
    guard: string;
    identifier: number;
    future: string;
}
interface PassportQuery {
    query: Guard_Query_Object[];
    witness: Guard_Query_Object[];
}
export declare class GuardParser {
    protected guard_list: GuardInfo[];
    protected protocol: Protocol;
    private constructor();
    guardlist: () => GuardInfo[];
    static CreateAsync: (protocol: Protocol, guards: string[]) => Promise<GuardParser>;
    parse_future: (info: GuardInfo, variables: any) => void;
    parse_bcs: (info: GuardInfo, chain_bytes: Uint8Array) => void;
    done: (fill?: FutrueFill[]) => Promise<PassportQuery>;
    private object_query;
}
export declare class Passport {
    static MAX_GUARD_COUNT: number;
    protected passport: import("@mysten/sui.js/transactions").TransactionResult;
    protected protocol: Protocol;
    get_object(): import("@mysten/sui.js/transactions").TransactionResult;
    constructor(protocol: Protocol, guards: GuardObject[], query?: PassportQuery);
    destroy(): void;
    freeze(): void;
}
export {};
//# sourceMappingURL=passport.d.ts.map