import { Protocol, GuardAddress, Data_Type, MODULES, ContextType, ValueType, OperatorType, VariableType } from './protocol';
export type GuardVariable = Map<number, Guard_Vriable>;
export interface Guard_Vriable {
    type: VariableType;
    value?: Uint8Array;
    witness?: Uint8Array;
}
export declare class Guard {
    static MAX_INPUT_LENGTH: number;
    static launch(protocol: Protocol, description: string, maker: GuardMaker): GuardAddress;
    static signer_guard(protocol: Protocol): GuardAddress;
    static everyone_guard(protocol: Protocol): GuardAddress;
    static QUERIES: any[];
}
export declare class GuardVariableHelper {
    static IsValidIndentifier: (identifier: number) => boolean;
    static get_variable_value(variables: GuardVariable, identifier: number, type: VariableType): Uint8Array | undefined;
    static get_variable_witness(variables: GuardVariable, identifier: number): Uint8Array | undefined;
    static add_future_variable(variables: GuardVariable, identifier: number, witness: any, value?: any, bNeedSerialize?: boolean): void;
    static add_variable(variables: GuardVariable, identifier: number, type: ValueType, value: any, bNeedSerialize?: boolean): false | undefined;
}
export declare class GuardMaker {
    protected data: Uint8Array[];
    protected type_validator: Data_Type[];
    protected variable: GuardVariable;
    private static index;
    private static get_index;
    constructor();
    add_variable(type: VariableType, value: any, bNeedSerialize?: boolean): number;
    add_param(type: ValueType | ContextType, param?: any): GuardMaker;
    add_query(module: MODULES, query_name: string, object_address_from: string | number, bWitness?: boolean): GuardMaker;
    add_logic(type: OperatorType): GuardMaker;
    build(bNot?: boolean): GuardMaker;
    IsReady(): boolean;
    combine(otherBuilt: GuardMaker, bAnd?: boolean, bCombinVariable?: boolean): GuardMaker;
    get_variable(): GuardVariable;
    get_input(): Uint8Array[];
    static input_combine(input1: Uint8Array, input2: Uint8Array, bAnd?: boolean): Uint8Array;
    static input_not(input: Uint8Array): Uint8Array;
    static match_u128(type: number): boolean;
}
//# sourceMappingURL=guard.d.ts.map