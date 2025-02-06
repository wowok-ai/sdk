/**
 * Provide a call interface for AI
 *
 */
import { DemandObject } from '../protocol';
export type FUNC_TYPE = string | number | boolean | 'DemandObject' | 'PermissionObject';
export interface AgentFuncParameter {
    name: string;
    description?: string;
    required: boolean;
    type: FUNC_TYPE;
    value?: FUNC_TYPE;
}
export interface AgentFuncReturn {
    type: DemandObject;
    name: string;
    description: string;
}
export interface AgentFunc {
    name: string;
    description?: string;
    module?: string;
    permissionIndex: number;
    parameter: AgentFuncParameter[];
    return?: AgentFuncReturn;
}
export declare const AGENT_FUNC: AgentFunc[];
export declare namespace Call {
}
//# sourceMappingURL=call.d.ts.map