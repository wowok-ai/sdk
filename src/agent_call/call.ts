/**
 * Provide a call interface for AI
 * 
 */

import { Transaction as TransactionBlock,  } from '@mysten/sui/transactions';
import { MODULES, DemandObject, PermissionObject, Protocol, ServiceObject, } from '../protocol';
import { Bcs, IsValidAddress, IsValidArgType, IsValidU64, parseObjectType, IsValidU8 } from '../utils'
import { Errors, ERROR}  from '../exception'
import { MultiGetObjectsParams } from '@mysten/sui/client';
import { Permission, PermissionIndex } from '../permission';
import { BCS } from '@mysten/bcs';
import { PermissionAnswerItem, PermissionIndexType } from '../permission';
import { Entity } from '../entity';
import { Repository_Policy_Mode } from '../repository';
import { LargeNumberLike } from 'crypto';

export interface AgentOperate_Parameter {
    name: string;
    required: boolean;
    description?: string;
    value?: any;
}
export interface AgentOperate {
    module: MODULES;
    name: string;
    object?: any;
    description?: string;
    permissionIndex?: number;
    parameter: AgentOperate_Parameter[];
    needLaunch?: boolean;
    return?: any;
}

enum FUNCNAME {
    Repository_New = 'New',
    Repository_Description = 'Description',
    Repository_PolicyMode = 'Policy mode',
    Repository_AddPolicy = 'Add policies',
    Repository_RemovePolicy = 'Remove policies',
    Repository_RenamePolicy = 'Rename policy',
    Repository_PolicyDescription = 'Policy description',
    Repository_PolicyPermission = 'Policy Permission',
    Repository_AddReference = 'Add references',
    Repository_RemoveReference = 'Remove references',
    Repository_AddData= 'Add data',
    Repository_RemoveData = 'Rmove data',
}
export const AGENT_FUNC: AgentOperate[] = [
    {permissionIndex:PermissionIndex.repository, name:FUNCNAME.Repository_New, description:'New Repository', module: MODULES.repository, parameter:[
        {name:'Permission object', description:'Permission address or object', required:true},
        {name:'Policy mode', description:'Relax mode: Allows entry of data other than policy. Used for informal, non-consensus situations.\nStrict mode: Prohibits entry of data beyond policy. Used in formal, fully consensus contexts.', required:false}, 
    ], needLaunch:true},
    {permissionIndex:PermissionIndex.repository_description, name:FUNCNAME.Repository_Description, description:'Set Repository description', module:MODULES.repository, parameter:[
        {name:'Repository object', description:'Repository address or object', required:true},
        {name:'Description', description:'Repository description', required:true},
    ]},
    {permissionIndex:PermissionIndex.repository_policy_mode, name:FUNCNAME.Repository_PolicyMode, description:'Set Repository policy mode', module: MODULES.repository, parameter:[
        {name:'Repository object', description:'Repository address or object', required:true},
        {name:'Policy mode', description:'Relax mode: Allows entry of data other than policy. Used for informal, non-consensus situations.\nStrict mode: Prohibits entry of data beyond policy. Used in formal, fully consensus contexts.', required:false}, 
    ]},
    {permissionIndex:PermissionIndex.repository_policies, name:FUNCNAME.Repository_AddPolicy, description:'Add Repository policies', module: MODULES.repository, parameter:[
        {name:'Repository object', description:'Repository address or object', required:true},
        {name:'Policies', description:'Repository policy struct lists', required:true},
    ]},
    {permissionIndex:PermissionIndex.repository_policies, name:FUNCNAME.Repository_RenamePolicy, description:'Remove Repository policies', module: MODULES.repository, parameter:[
        {name:'Repository object', description:'Repository address or object', required:true},
        {name:'Policy names', description:'The names of the Repository policies to be removed', required:true},
    ]},
    {permissionIndex:PermissionIndex.repository_policies, name:FUNCNAME.Repository_RenamePolicy, description:'Rename a Repository policy', module: MODULES.repository, parameter:[
        {name:'Repository object', description:'Repository address or object', required:true},
        {name:'policy name', description:'The name of the Repository policy to be renamed', required:true},
        {name:'The changed policy name', description:'The changed policy name', required:true},
    ]},
    {permissionIndex:PermissionIndex.repository_policy_description, name:FUNCNAME.Repository_PolicyDescription, description:'Set Repository policy description', module: MODULES.repository, parameter:[
        {name:'Repository object', description:'Repository address or object', required:true},
        {name:'Policy name', description:'The name of the Repository policy to be set', required:true},
        {name:'Policy description', description:'Policy description', required:true}, 
    ]},
    {permissionIndex:PermissionIndex.repository_policy_permission, name:FUNCNAME.Repository_PolicyPermission, description:'Set Repository policy permission',  module: MODULES.repository, parameter:[
        {name:'Repository object', description:'Repository address or object', required:true},
        {name:'Policy name', description:'The name of the Repository policy to be set', required:true},
        {name:'Policy permission index', description:'Policy permission index', required:true}, 
    ]},
    {permissionIndex:PermissionIndex.repository_reference, name:FUNCNAME.Repository_AddReference, description:'Add Repository references', module: MODULES.repository, parameter:[
        {name:'Repository object', description:'Repository address or object', required:true},
        {name:'Reference addresses', description:'object addresses list that use the Repository to be added', required:true},
    ]},
    {permissionIndex:PermissionIndex.repository_reference, name:FUNCNAME.Repository_RemoveReference, description:'Remove Repository references', module: MODULES.repository, parameter:[
        {name:'Repository object', description:'Repository address or object', required:true},
        {name:'Reference addresses', description:'object addresses list that use the Repository to be removed', required:true},
    ]},
    {name:FUNCNAME.Repository_AddData, description:'Add Repository data. Notice:Operation permissions depend on the policy.', module: MODULES.repository, parameter:[
        {name:'Repository object', description:'Repository address or object', required:true},
        {name:'Data', description:'The data struct to be added', required:true},
    ]},
    {name:FUNCNAME.Repository_RemoveData, description:'Remove Repository data. Notice:Operation permissions depend on the policy.', module: MODULES.repository, parameter:[
        {name:'Repository object', description:'Repository address or object', required:true},
        {name:'Policy name', description:'The name of the Repository policy where the data is located', required:true},
        {name:'Address', description:'The address where the data belongs', required:true},
    ]},
    {permissionIndex:PermissionIndex.service, name:'Service', description:'Launch new Service', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_description, name:'Description', description:'Set Service description', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_price, name:'Price', description:'Set Service item price', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_stock, name:'Inventory', description:'Set Service item inventory', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_payee, name:'Payee', description:'Set Service payee', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_repository, name:'Repository', description:'Set Service repositories', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_withdraw_guards, name:'Withdraw Guard', description:'Set Service withdraw guards', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_refund_guards, name:'Refund Guard', description:'Set Service refund guards', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_add_sales, name:'Add sales', description:'Add sale items for Service', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_remove_sales, name:'Remove sales', description:'Remove sale items for Service', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_discount_transfer, name:'Discount', description:'Launch discounts for Service', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_withdraw, name:'Withdraw', description:'Widthraw from Service orders', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_buyer_guard, name:'Buyer Guard', description:'Set Guard of buying for Service', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_machine, name:'Machine', description:'Set Machine for Service', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_endpoint, name:'Endpoint', description:'Set Service endpoint', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_publish, name:'Publish', description:'Allowing the creation of Order', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_clone, name:'Clone', description:'Clone Service', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_customer_required, name:'Buyer info', description:'Set Service buyer info required', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_pause, name:'Pause', description:'Pause/Unpause Service', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_treasury, name:'Treasury', description:'Externally withdrawable treasury for compensation or rewards', module: MODULES.service, parameter:[]},
    {permissionIndex:PermissionIndex.service_arbitration, name:'Arbitration', description:'Add/Remove arbitration that allows refunds from orders at any time based on arbitration results', module: MODULES.service, parameter:[]},

    {permissionIndex:PermissionIndex.demand, name:'Demand', description:'Launch new Demand', module: MODULES.demand, parameter:[]},
    {permissionIndex:PermissionIndex.demand_refund, name:'Refund', description:'Refund from Demand', module: MODULES.demand, parameter:[]},
    {permissionIndex:PermissionIndex.demand_expand_time, name:'Expand deadline', description:'Expand Demand deadline', module: MODULES.demand, parameter:[]},
    {permissionIndex:PermissionIndex.demand_guard, name:'Guard', description:'Set Demand guard', module: MODULES.demand, parameter:[]},
    {permissionIndex:PermissionIndex.demand_description, name:'Description', description:'Set Demand description', module: MODULES.demand, parameter:[]},
    {permissionIndex:PermissionIndex.demand_yes, name:'Yes', description:'Pick the Deamand serice', module: MODULES.demand, parameter:[]},

    {permissionIndex:PermissionIndex.machine, name: 'Machine', description:'Launch new Machine', module: MODULES.machine, parameter:[]},
    {permissionIndex:PermissionIndex.machine_description, name: 'Description', description:'Set Machine description', module: MODULES.machine, parameter:[]},
    {permissionIndex:PermissionIndex.machine_repository, name: 'Repository', description:'Set Machine repository', module: MODULES.machine, parameter:[]},
    {permissionIndex:PermissionIndex.machine_clone, name: 'Clone', description:'Clone Machine', module: MODULES.machine, parameter:[]},
    {permissionIndex:PermissionIndex.machine_node, name: 'Node', description:'Set Machine nodes', module: MODULES.machine, parameter:[]},
    {permissionIndex:PermissionIndex.machine_endpoint, name: 'Endpoint', description:'Set Machine endpoint', module: MODULES.machine, parameter:[]},
    {permissionIndex:PermissionIndex.machine_pause, name: 'Pause', description:'Pause/Unpause Machine', module: MODULES.machine, parameter:[]},
    {permissionIndex:PermissionIndex.machine_publish, name: 'Publish', description:'Allowing the creation of Progress', module: MODULES.machine, parameter:[]},

    {permissionIndex:PermissionIndex.progress, name: 'Progress', description:'Launch new Progress', module: MODULES.progress, parameter:[]},
    {permissionIndex:PermissionIndex.progress_namedOperator, name: 'Operator', description:'Set Progress operators', module: MODULES.progress, parameter:[]},
    {permissionIndex:PermissionIndex.progress_bind_task, name: 'Bind', description:'Set Progress task', module: MODULES.progress, parameter:[]},
    {permissionIndex:PermissionIndex.progress_context_repository, name: 'Repository', description:'Set Progress repository', module: MODULES.progress, parameter:[]},
    {permissionIndex:PermissionIndex.progress_unhold, name: 'Unhold', description:'Release Progress holdings', module: MODULES.progress, parameter:[]},
    {permissionIndex:PermissionIndex.progress_parent, name: 'Parent', description:'Set Progress parent', module: MODULES.progress, parameter:[]},
    
    {permissionIndex:PermissionIndex.treasury, name: 'Treasury', description:'Launch new Treasury', module: MODULES.treasury, parameter:[]},
    {permissionIndex:PermissionIndex.treasury_deposit, name: 'Deposit', description:'Deposit coins', module: MODULES.treasury, parameter:[]},
    {permissionIndex:PermissionIndex.treasury_receive, name: 'Receive', description:'Receive coins from some address sent', module: MODULES.treasury, parameter:[]},
    {permissionIndex:PermissionIndex.treasury_withdraw, name: 'Withdraw', description:'Withdraw coins', module: MODULES.treasury, parameter:[]},
    {permissionIndex:PermissionIndex.treasury_withdraw_guard, name: 'Withdraw Guard', description:'Add/Remove Treasury withdraw guard', module: MODULES.treasury, parameter:[]},
    {permissionIndex:PermissionIndex.treasury_withdraw_mode, name: 'Withdraw mode', description:'Set Treasury withdraw mode', module: MODULES.treasury, parameter:[]},
    {permissionIndex:PermissionIndex.treasury_deposit_guard, name: 'Deposit Guard', description:'Set Treasury deposit guard', module: MODULES.treasury, parameter:[]},
    {permissionIndex:PermissionIndex.treasury_descritption, name: 'Description', description:'Set Treasury description', module: MODULES.treasury, parameter:[]},

    {permissionIndex:PermissionIndex.arbitration, name: 'Arbitration', description:'Launch new Arbitration', module: MODULES.arbitration, parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_description, name: 'Description', description:'Set Arbitration description', module: MODULES.arbitration, parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_endpoint, name: 'Endpoint', description:'Set Arbitration endpoint', module: MODULES.arbitration, parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_fee, name: 'Fee', description:'Set Arbitration fee', module: MODULES.arbitration, parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_guard, name: 'Guard', description:'Set Guard to apply for arbitration', module: MODULES.arbitration, parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_arbitration, name: 'Arbitrate', description:'Determine the outcome of arbitration', module: MODULES.arbitration, parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_pause, name: 'Pause', description:'Allowing/forbidding the creation of Arb', module: MODULES.arbitration, parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_voting_guard, name: 'Voting Guard', description:'Add/Remove voting Guard', module: MODULES.arbitration, parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_vote, name: 'Vote', description:'Vote on the application for arbitration', module: MODULES.arbitration, parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_withdraw, name: 'Withdraw', description:'Withdraw the arbitration fee', module: MODULES.arbitration, parameter:[]},
    {permissionIndex:PermissionIndex.arbitration_treasury, name: 'Withdraw', description:'Set Treasury that fees was collected at the time of withdrawal', module: MODULES.arbitration, parameter:[]},
]
export namespace Call {
    export const calls = async (funcs: AgentOperate[]) => {
        const needLaunch: any[] = [];

        // build operations
        try {
            funcs.forEach((v) => {
                switch (v.module){
                    case MODULES.repository:
                        repository_call(v, needLaunch);
                        break;
                }
            })            
        } catch (e) {

        }
    }

    const repository_call = (func:AgentOperate, needLaunch:any[]) => {
        switch(func.name) {
            case FUNCNAME.Repository_New:
                
                break;
            case FUNCNAME.Repository_AddData:
                break;
            case FUNCNAME.Repository_AddPolicy:
                break;
            case FUNCNAME.Repository_AddReference:
                break;
            case FUNCNAME.Repository_Description:
                break;
            case FUNCNAME.Repository_PolicyDescription:
                break;
            case FUNCNAME.Repository_PolicyMode:
                break;
            case FUNCNAME.Repository_PolicyPermission:
                break;
            case FUNCNAME.Repository_RemoveData:
                break;
            case FUNCNAME.Repository_RemovePolicy:
                break;
            case FUNCNAME.Repository_RemoveReference:
                break;
            case FUNCNAME.Repository_RenamePolicy:
                break;
        }
    }
}