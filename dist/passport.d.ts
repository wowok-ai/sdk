import { type TransactionObjectInput } from '@mysten/sui.js/transactions';
import { FnCallType, GuardObject, Protocol } from './protocol';
export type Guard_Query_Object = {
    target: FnCallType;
    object: TransactionObjectInput;
    types: string[];
    id: string;
};
interface QueryInfo {
    identifier?: number;
    index: number;
    type: number;
    value_or_witness: string;
    future?: string;
}
interface GuardInfo {
    id: string;
    query_list: (string | QueryInfo)[];
    constant: QueryInfo[];
    input_witness: QueryInfo[];
}
interface DeGuardConstant {
    type: number;
    value: any;
    identifier?: number;
}
interface DeGuardData {
    type: number;
    value?: any;
    identifier?: number;
    cmd?: number;
    child: DeGuardData[];
    ret_type?: number;
}
interface FutrueFill {
    guard: string;
    index: number;
    future: string;
}
interface PassportQuery {
    guard: GuardObject[];
    query: Guard_Query_Object[];
    witness: Guard_Query_Object[];
}
export declare class GuardParser {
    protected guard_list: GuardInfo[];
    protected protocol: Protocol;
    protected guards: GuardObject[];
    private index;
    private get_index;
    private constructor();
    guardlist: () => GuardInfo[];
    static DeGuardObject: (protocol: Protocol, guard: string) => Promise<{
        object: DeGuardData;
        constant: DeGuardConstant[];
    }>;
    static ResolveData: (constants: DeGuardConstant[], stack: DeGuardData[], current: DeGuardData) => void;
    static CreateAsync: (protocol: Protocol, guards: string[]) => Promise<GuardParser>;
    parse_constant: (info: GuardInfo, constants: any) => void;
    parse_bcs: (info: GuardInfo, chain_bytes: Uint8Array) => void;
    private get_object;
    done: (fill?: FutrueFill[]) => Promise<PassportQuery>;
    private object_query;
}
export declare class Passport {
    static MAX_GUARD_COUNT: number;
    protected passport: import("@mysten/sui.js/transactions").TransactionResult;
    protected protocol: Protocol;
    get_object(): import("@mysten/sui.js/transactions").TransactionResult;
    constructor(protocol: Protocol, query: PassportQuery);
    destroy(): void;
    freeze(): void;
}
export {};
//# sourceMappingURL=passport.d.ts.map