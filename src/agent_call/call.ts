/**
 * Provide a call interface for AI
 * 
 */

import { Transaction as TransactionBlock,  } from '@mysten/sui/transactions';
import { DemandObject, PermissionObject, Protocol, ServiceObject, } from '../protocol';
import { Bcs, IsValidAddress, IsValidArgType, IsValidU64, parseObjectType, IsValidU8 } from '../utils'
import { Errors, ERROR}  from '../exception'
import { MultiGetObjectsParams } from '@mysten/sui/client';
import { Permission, PermissionIndex } from '../permission';
import { BCS } from '@mysten/bcs';
import { PermissionAnswerItem, PermissionIndexType } from '../permission';
import { Entity } from '../entity';
import { Repository_Policy_Mode } from '../repository';
import { LargeNumberLike } from 'crypto';

export type FUNC_TYPE = string | number | boolean | 'DemandObject' | 'PermissionObject';
export interface AgentFuncParameter {
    name: string;
    description?: string;
    required: boolean;
    type: FUNC_TYPE;
    value?: FUNC_TYPE;
}

export interface AgentFuncReturn {
    type: DemandObject ;
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

export const AGENT_FUNC: AgentFunc[] = [
    {permissionIndex:PermissionIndex.repository, name:'Repository', description:'Launch new Repository', module: 'repository', parameter:[
        {type: 'PermissionObject' , name:'permission', description:'Permission address or object', required:true},
        {type: '"Relax mode" or  "Strict mode"', name:'mode', description:'Relax mode: Allows entry of data other than policy. Used for informal, non-consensus situations.\nStrict mode: Prohibits entry of data beyond policy. Used in formal, fully consensus contexts.', required:false}, 
    ]},
    {permissionIndex:PermissionIndex.repository_description, name:'Description', description:'Set Repository description', module: 'repository', parameter:[
        {type:'DemandObject', name:'demand', description:'Demand address or object', required:true},
        {type:'string', name:'description', description:'Demand description', required:true},
    ]},
    {permissionIndex:PermissionIndex.repository_policy_mode, name:'Policy mode', description:'Set Repository policy mode', module: 'repository', parameter:[]},
    {permissionIndex:PermissionIndex.repository_policies, name:'Policy', description:'Add/Remove/Edit Repository policy', module: 'repository', parameter:[]},
    {permissionIndex:PermissionIndex.repository_policy_description, name:'Policy Description', description:'Set Repository policy description', module: 'repository', parameter:[]},
    {permissionIndex:PermissionIndex.repository_policy_permission, name:'Policy Permission', description:'Set Repository policy permission',  module: 'repository', parameter:[]},
    {permissionIndex:PermissionIndex.repository_reference, name:'Reference', description:'Set Repository reference', module: 'repository', parameter:[]},

    {permissionIndex:PermissionIndex.service, name:'Service', description:'Launch new Service', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_description, name:'Description', description:'Set Service description', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_price, name:'Price', description:'Set Service item price', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_stock, name:'Inventory', description:'Set Service item inventory', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_payee, name:'Payee', description:'Set Service payee', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_repository, name:'Repository', description:'Set Service repositories', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_withdraw_guards, name:'Withdraw Guard', description:'Set Service withdraw guards', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_refund_guards, name:'Refund Guard', description:'Set Service refund guards', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_add_sales, name:'Add sales', description:'Add sale items for Service', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_remove_sales, name:'Remove sales', description:'Remove sale items for Service', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_discount_transfer, name:'Discount', description:'Launch discounts for Service', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_withdraw, name:'Withdraw', description:'Widthraw from Service orders', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_buyer_guard, name:'Buyer Guard', description:'Set Guard of buying for Service', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_machine, name:'Machine', description:'Set Machine for Service', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_endpoint, name:'Endpoint', description:'Set Service endpoint', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_publish, name:'Publish', description:'Allowing the creation of Order', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_clone, name:'Clone', description:'Clone Service', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_customer_required, name:'Buyer info', description:'Set Service buyer info required', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_pause, name:'Pause', description:'Pause/Unpause Service', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_treasury, name:'Treasury', description:'Externally withdrawable treasury for compensation or rewards', module: 'service', parameter:[]},
    {permissionIndex:PermissionIndex.service_arbitration, name:'Arbitration', description:'Add/Remove arbitration that allows refunds from orders at any time based on arbitration results', module: 'service', parameter:[]},

    {permissionIndex:PermissionIndex.demand, name:'Demand', description:'Launch new Demand', module: 'demand', parameter:[]},
    {permissionIndex:PermissionIndex.demand_refund, name:'Refund', description:'Refund from Demand', module: 'demand', parameter:[]},
    {permissionIndex:PermissionIndex.demand_expand_time, name:'Expand deadline', description:'Expand Demand deadline', module: 'demand', parameter:[]},
    {permissionIndex:PermissionIndex.demand_guard, name:'Guard', description:'Set Demand guard', module: 'demand', parameter:[]},
    {permissionIndex:PermissionIndex.demand_description, name:'Description', description:'Set Demand description', module: 'demand', parameter:[]},
    {permissionIndex:PermissionIndex.demand_yes, name:'Yes', description:'Pick the Deamand serice', module: 'demand', parameter:[]},

    {permissionIndex:PermissionIndex.machine, name: 'Machine', description:'Launch new Machine', module: 'machine', parameter:[]},
    {permissionIndex:PermissionIndex.machine_description, name: 'Description', description:'Set Machine description', module: 'machine', parameter:[]},
    {permissionIndex:PermissionIndex.machine_repository, name: 'Repository', description:'Set Machine repository', module: 'machine', parameter:[]},
    {permissionIndex:PermissionIndex.machine_clone, name: 'Clone', description:'Clone Machine', module: 'machine', parameter:[]},
    {permissionIndex:PermissionIndex.machine_node, name: 'Node', description:'Set Machine nodes', module: 'machine', parameter:[]},
    {permissionIndex:PermissionIndex.machine_endpoint, name: 'Endpoint', description:'Set Machine endpoint', module: 'machine', parameter:[]},
    {permissionIndex:PermissionIndex.machine_pause, name: 'Pause', description:'Pause/Unpause Machine', module: 'machine', parameter:[]},
    {permissionIndex:PermissionIndex.machine_publish, name: 'Publish', description:'Allowing the creation of Progress', module: 'machine', parameter:[]},

    {permissionIndex:PermissionIndex.progress, name: 'Progress', description:'Launch new Progress', module: 'progress', parameter:[]},
    {permissionIndex:PermissionIndex.progress_namedOperator, name: 'Operator', description:'Set Progress operators', module: 'progress', parameter:[]},
    {permissionIndex:PermissionIndex.progress_bind_task, name: 'Bind', description:'Set Progress task', module: 'progress', parameter:[]},
    {permissionIndex:PermissionIndex.progress_context_repository, name: 'Repository', description:'Set Progress repository', module: 'progress', parameter:[]},
    {permissionIndex:PermissionIndex.progress_unhold, name: 'Unhold', description:'Release Progress holdings', module: 'progress', parameter:[]},
    {permissionIndex:PermissionIndex.progress_parent, name: 'Parent', description:'Set Progress parent', module: 'progress', parameter:[]},
    
    {permissionIndex:PermissionIndex.treasury, name: 'Treasury', description:'Launch new Treasury', module: 'treasury', parameter:[]},
    {permissionIndex:PermissionIndex.treasury_deposit, name: 'Deposit', description:'Deposit coins', module: 'treasury', parameter:[]},
    {permissionIndex:PermissionIndex.treasury_receive, name: 'Receive', description:'Receive coins from some address sent', module: 'treasury', parameter:[]},
    {permissionIndex:PermissionIndex.treasury_withdraw, name: 'Withdraw', description:'Withdraw coins', module: 'treasury', parameter:[]},
    {permissionIndex:PermissionIndex.treasury_withdraw_guard, name: 'Withdraw Guard', description:'Add/Remove Treasury withdraw guard', module: 'treasury', parameter:[]},
    {permissionIndex:PermissionIndex.treasury_withdraw_mode, name: 'Withdraw mode', description:'Set Treasury withdraw mode', module: 'treasury', parameter:[]},
    {permissionIndex:PermissionIndex.treasury_deposit_guard, name: 'Deposit Guard', description:'Set Treasury deposit guard', module: 'treasury', parameter:[]},
    {permissionIndex:PermissionIndex.treasury_descritption, name: 'Description', description:'Set Treasury description', module: 'treasury', parameter:[]},

    {permissionIndex:PermissionIndex.arbitration, name: 'Arbitration', description:'Launch new Arbitration', module: 'arbitration', parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_description, name: 'Description', description:'Set Arbitration description', module: 'arbitration', parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_endpoint, name: 'Endpoint', description:'Set Arbitration endpoint', module: 'arbitration', parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_fee, name: 'Fee', description:'Set Arbitration fee', module: 'arbitration', parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_guard, name: 'Guard', description:'Set Guard to apply for arbitration', module: 'arbitration', parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_arbitration, name: 'Arbitrate', description:'Determine the outcome of arbitration', module: 'arbitration', parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_pause, name: 'Pause', description:'Allowing/forbidding the creation of Arb', module: 'arbitration', parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_voting_guard, name: 'Voting Guard', description:'Add/Remove voting Guard', module: 'arbitration', parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_vote, name: 'Vote', description:'Vote on the application for arbitration', module: 'arbitration', parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_withdraw, name: 'Withdraw', description:'Withdraw the arbitration fee', module: 'arbitration', parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_treasury, name: 'Withdraw', description:'Set Treasury that fees was collected at the time of withdrawal', module: 'arbitration', parameter:[]},
]
export namespace Call {
    
}