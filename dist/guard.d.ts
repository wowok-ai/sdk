import { Protocol, GuardAddress, Data_Type, MODULES, ContextType, ValueType, OperatorType } from './protocol';
export type VariableType = Map<number, Guard_Vriable>;
export interface Guard_Vriable {
    type: ContextType | OperatorType;
    value?: Uint8Array;
    witness?: Uint8Array;
}
export type Guard_Creation = {
    description: string;
    variables?: VariableType;
    input: Uint8Array;
};
export declare class Guard {
    static MAX_INPUT_LENGTH: number;
    static IsValidGuardVirableType: (type: OperatorType | ContextType) => boolean;
    static IsValidIndentifier: (identifier: number) => boolean;
    static get_variable_value(variables: VariableType, identifier: number, type: OperatorType | ContextType): Uint8Array | boolean;
    static get_variable_witness(variables: VariableType, identifier: number, type: OperatorType | ContextType): Uint8Array | boolean;
    static add_future_variable(variables: VariableType, identifier: number, type: OperatorType | ContextType, witness: any, value?: any, bNeedSerialize?: boolean): boolean;
    static add_variable(variables: VariableType, identifier: number, type: OperatorType | ContextType, value: any, bNeedSerialize?: boolean): boolean;
    static launch(protocol: Protocol, creation: Guard_Creation): GuardAddress;
    static signer_guard(protocol: Protocol): GuardAddress;
    static everyone_guard(protocol: Protocol): GuardAddress;
    static QUERIES: any[];
}
export declare class GuardInputMaker {
    protected data: Uint8Array[];
    protected type_validator: Data_Type[];
    constructor();
    add_param(type: ValueType | ContextType, param?: any, variable?: VariableType): false | undefined;
    static query_index(module: MODULES, query_name: string): number;
    add_future_query(identifier: number, module: MODULES, query_name: string, variable: VariableType): void;
    add_query(module: MODULES, query_name: string, object_address_from: string | number): void;
    add_logic(type: OperatorType): void;
    make(bNot?: boolean): Uint8Array;
    static combine(input1: Uint8Array, input2: Uint8Array, bAnd?: boolean): Uint8Array;
    static match_u128(type: number): boolean;
}
//# sourceMappingURL=guard.d.ts.map