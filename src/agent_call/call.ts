/**
 * Provide a call interface for AI
 * 
 */

import { Transaction as TransactionBlock,  } from '@mysten/sui/transactions';
import { MODULES, DemandObject, PermissionObject, Protocol, ServiceObject, PassportObject, TxbObject, } from '../protocol';
import { Bcs, IsValidAddress, IsValidArgType, IsValidU64, parseObjectType, IsValidU8 } from '../utils'
import { Errors, ERROR}  from '../exception'
import { MultiGetObjectsParams } from '@mysten/sui/client';
import { Permission, Permission_Entity, Permission_Index, PermissionIndex, UserDefinedIndex } from '../permission';
import { BCS } from '@mysten/bcs';
import { PermissionAnswerItem, PermissionIndexType } from '../permission';
import { Entity } from '../entity';
import { Repository, Repository_Policy, Repository_Policy_Data, Repository_Policy_Data2, Repository_Policy_Data_Remove, Repository_Policy_Mode, } from '../repository';
import { Demand } from '../demand';
import { Machine, Machine_Forward, Machine_Node } from '../machine';
import { BuyRequiredEnum, Customer_RequiredInfo, DicountDispatch, Service, Service_Buy, Service_Guard_Percent, Service_Sale } from '../service';
import { Treasury } from '../treasury';

export interface CallBase {
    object: string | 'new';
    type_parameter?: string;
    permission?: string;
    //type_raw?: string;
}
export interface CallRepository extends CallBase {
    permission_new?: string; // change permission or 'new' object with permission specified.
    description?: string;
    policy_mode?: Repository_Policy_Mode; // default: 'Relax' (POLICY_MODE_FREE) 
    reference?: {op:'set' | 'add' | 'remove' ; addresses:string[]} | {op:'removeall'};
    policy?: {op:'add' | 'set'; data:Repository_Policy[]} | {op:'remove'; data:string[]} | {op:'removeall'} | {op:'rename'; data:{old:string; new:string}[]};
    data?: {op:'add', data: Repository_Policy_Data | Repository_Policy_Data2} | {op:'remove'; data: Repository_Policy_Data_Remove};
}

export interface CallPermission extends CallBase {
    builder?: string;
    admin?: {op:'add' | 'remove' | 'set', admins:string[]};
    description?: string;
    entity?: {op:'add entity'; entities:Permission_Entity[]} | {op:'add permission'; permissions:Permission_Index[]} 
        | {op:'remove entity'; addresses:string[]} | {op:'remove permission'; address:string; index:PermissionIndexType[]} 
        | {op:'transfer permission', from_address: string; to_address: string};
    biz_permission?: {op:'add'; data: UserDefinedIndex[]} | {op:'remove'; permissions: PermissionIndexType[]};
}

export interface CallDemand extends CallBase {
    permission_new?: string;
    guard?: {address:string; service_id_in_guard?:number};
    description?: string;
    time_expire?: {op: 'duration'; minutes:number} | {op:'set'; time:number};
    bounty?: {op:'add'; object?:string; balance:string} | {op:'refund'} | {op:'reward'; service:string};
    present?: {service: string | number; recommend_words:string; service_pay_type:string};
}

export interface CallMachine extends CallBase { //@ todo self-owned node operate
    permission_new?: string;
    bPaused?: boolean;
    bPublished?: boolean;
    consensus_repository?: {op:'set' | 'add' | 'remove' ; repositories:string[]} | {op:'removeall'};
    description?: string;
    endpoint?: string;
    clone_new?: boolean;
    nodes?: {op: 'add'; data: Machine_Node[]} | {op: 'remove'; names: string[], bTransferMyself?:boolean} 
        | {op:'rename node'; data:{old:string; new:string}[]} | {op:'add from myself'; addresses: string[]}
        | {op:'remove pair'; pairs: {prior_node_name:string; node_name:string}[]}
        | {op:'add forward'; data: {prior_node_name:string; node_name:string; forward:Machine_Forward; threshold?:number; old_need_remove?:string}[]}
        | {op:'remove forward'; data:{prior_node_name:string; node_name:string; forward_name:string}[]}
}       

export interface CallService extends CallBase {
    permission_new?: string;
    bPaused?: boolean;
    bPublished?: boolean;
    description?: string;
    gen_discount?: DicountDispatch[];
    buy?: {buy_items:Service_Buy[], coin_object?:string, discount?:string, machine?:string, customer_info_crypto?: Customer_RequiredInfo}
    arbitration: {op:'set' | 'add'; arbitrations:{address:string, token_type:string}[]} 
        | {op:'removeall'} | {op:'remove', addresses:string[]};
    buy_guard?: string;
    endpoint?: string;
    extern_withdraw_treasury: {op:'set' | 'add'; treasuries:{address:string, token_type:string}[]} 
        | {op:'removeall'} | {op:'remove', addresses:string[]};
    machine?: string;
    payee_treasury?:string;
    clone_new?: {token_type_new?:string};
    repository: {op:'set' | 'add' | 'remove' ; repositories:string[]} | {op:'removeall'};
    withdraw_guard?: {op:'add' | 'set'; guards:Service_Guard_Percent[]} 
        | {op:'removeall'} | {op:'remove', addresses:string[]};
    refund_guard?: {op:'add' | 'set'; guards:Service_Guard_Percent[]} 
        | {op:'removeall'} | {op:'remove', addresses:string[]};
    customer_required_info?: {pubkey:string; required_info:(string | BuyRequiredEnum)[]};
    sales: {op:'add', sales:Service_Sale[]} | {op:'remove'; sales_name:string[]}
}


export namespace Call {
    export const repository = (call: CallRepository, txb:TransactionBlock, passport?:PassportObject) => {
        let obj : Repository | undefined ; let permission: any;
        if (call.object === 'new') {
            if (!call?.permission || !IsValidAddress(call?.permission)) {
                permission = Permission.New(txb, '');
            }
            
            obj = Repository.New(txb, permission ?? call?.permission, call?.description??'', call?.policy_mode, permission?undefined:passport)
        } else {
            if (IsValidAddress(call.object) && call.permission && IsValidAddress(call?.permission)) {
                obj = Repository.From(txb, call.permission, call.object)
            }
        }

        if (obj) {
            if (call?.permission_new !== undefined ) {
                obj.change_permission(call.permission_new);
            }
            if (call?.description !== undefined && call.object !== 'new') {
                obj.set_description(call.description, passport);
            }
            if (call?.policy_mode !== undefined && call.object !== 'new') {
                obj.set_policy_mode(call.policy_mode, passport)
            }
            if (call?.reference !== undefined) {
                switch (call.reference.op) {
                    case 'set':
                        obj.remove_reference([], true, passport);
                        obj.add_reference(call.reference.addresses, passport);
                        break;
                    case 'add':
                        obj.add_reference(call.reference.addresses, passport);
                        break;
                    case 'remove':
                        obj.remove_reference(call.reference.addresses, false, passport);
                        break;
                    case 'removeall':
                        obj.remove_reference([], true, passport);
                        break;
                }
            }
            if (call?.policy !== undefined) {
                switch(call.policy.op) {
                    case 'set':
                        obj.remove_policies([], true, passport);
                        obj.add_policies(call.policy.data, passport);
                        break;
                    case 'add':
                        obj.add_policies(call.policy.data, passport);
                        break;
                    case 'remove':
                        obj.remove_policies(call.policy.data, false, passport);
                        break;
                    case 'removeall':
                        obj.remove_policies([], true, passport);
                        break;
                    case 'rename':
                        call.policy.data.forEach((v) => {
                            obj.rename_policy(v.old, v.new, passport);
                        })
                }
            }
            if (call?.data !== undefined) {
                switch(call.data.op) {
                    case 'add':
                        if ((call.data?.data as any)?.key !== undefined) {
                            obj.add_data(call.data.data as Repository_Policy_Data);
                        } else if ((call.data?.data as any)?.address !== undefined) {
                            obj.add_data2(call.data.data as Repository_Policy_Data2);
                        }
                        break;
                    case 'remove':
                        obj.remove(call.data.data.address, call.data.data.key);
                        break;
                }
            }
            if (permission) {
                permission.launch();
            }
            if (call.object === 'new') {
                obj.launch();
            }
        }
    }

    export const permission = (call: CallPermission, txb:TransactionBlock) => {
        let obj : Permission | undefined ; 
        if (call.object === 'new') {
            obj = Permission.New(txb, call?.description??'');
        } else {
            if (IsValidAddress(call.object)) {
                obj = Permission.From(txb, call.object)
            }
        }

        if (obj) {
            if (call?.builder !== undefined ) {
                obj.change_owner(call.builder);
            }
            if (call?.admin !== undefined) {
                switch(call.admin.op) {
                    case 'add':
                        obj.add_admin(call.admin.admins);
                        break;
                    case 'remove':
                        obj.remove_admin(call.admin.admins);
                        break;
                    case 'set':
                        obj.remove_admin([], true);
                        obj.add_admin(call.admin.admins);
                        break
                }
            }
            if (call?.description !== undefined && call.object !== 'new') {
                obj.set_description(call.description)
            }
            if (call?.entity !== undefined) {
                switch (call.entity.op) {
                    case 'add entity':
                        obj.add_entity(call.entity.entities);
                        break;
                    case 'add permission':
                        obj.add_entity3(call.entity.permissions);
                        break;
                    case 'remove entity':
                        obj.remove_entity(call.entity.addresses);
                        break;
                    case 'remove permission':
                        obj.remove_index(call.entity.address, call.entity.index);
                        break;
                    case 'transfer permission':
                        obj.transfer_permission(call.entity.from_address, call.entity.to_address);
                        break;
                }
            }
            if (call?.biz_permission !== undefined) {
                switch(call.biz_permission.op) {
                    case 'add':
                        call.biz_permission.data.forEach(v => {
                            obj.add_userdefine(v.index, v.name);
                        })
                        break;
                    case 'remove':
                        call.biz_permission.permissions.forEach(v => {
                            obj.remove_userdefine(v);
                        })
                        break;
                }
            }
            if (call.object === 'new') {
                obj.launch();
            }
        }
    }

    export const demand = (call: CallDemand, txb:TransactionBlock, passport?: PassportObject) => {
        let obj : Demand | undefined ; let permission: any;
        if (call.object === 'new' && call?.type_parameter) {
            if (!call?.permission || !IsValidAddress(call?.permission)) {
                permission = Permission.New(txb, '');
            }
            
            if (call.time_expire !== undefined) {
                obj = Demand.New(txb, call?.type_parameter, call.time_expire?.op === 'duration' ? true : false, 
                    call.time_expire?.op === 'duration' ? call.time_expire.minutes : call.time_expire?.time,
                    permission ?? call?.permission, call?.description??'', call.type_parameter, permission?undefined:passport)
            } else {
                obj = Demand.New(txb, call?.type_parameter, true, 30*24*60, // 30days default
                    permission ?? call?.permission, call?.description??'', call.type_parameter, permission?undefined:passport)
            }
        } else {
            if (IsValidAddress(call.object) && call.type_parameter && call.permission && IsValidAddress(call?.permission)) {
                obj = Demand.From(txb, call.type_parameter, call.permission, call.object)
            }
        }

        if (obj) {
            if (call?.permission_new !== undefined ) {
                obj.change_permission(call.permission_new);
            }
            if (call?.description !== undefined && call.object !== 'new') {
                obj.set_description(call.description, passport);
            }
            if (call?.guard !== undefined) {
                obj.set_guard(call.guard.address, call.guard?.service_id_in_guard ?? undefined, passport)
            }
            if (call?.time_expire !== undefined && call.object !== 'new') {
                obj.expand_time(call.time_expire.op === 'duration' ? true : false, 
                    call.time_expire.op === 'duration' ? call.time_expire.minutes : call.time_expire.time, passport)
            }
            if (call?.bounty !== undefined) {
                if (call.bounty.op === 'add') {
                    let deposit : any | undefined; let b = BigInt(call.bounty.balance);
                    if (b > BigInt(0)) {
                        if (call?.type_parameter === '0x2::sui::SUI' || call?.type_parameter === '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI') {
                            deposit = txb.splitCoins(txb.gas, [b])[0];
                        } else if (call?.bounty?.object) {
                            deposit = txb.splitCoins(call.bounty.object, [b])[0];
                        }
                        if (deposit) {
                            obj.deposit(deposit);                              
                        }
                    }
                } else if (call.bounty.op === 'refund') {
                    obj.refund(passport);
                } else if (call.bounty.op === 'reward') {
                    obj.yes(call.bounty.service, passport);
                }
            }
            if (call?.present !== undefined) {
                //@ demand guard
                obj.present(call.present.service, call.present.service_pay_type, call.present.recommend_words, passport);
            }
            if (permission) {
                permission.launch();
            }
            if (call.object === 'new') {
                obj.launch();
            }
        }
    }

    export const machine = (call: CallMachine, txb:TransactionBlock, passport?: PassportObject) => {
        let obj : Machine | undefined ; let permission: any;
        if (call.object === 'new' && call?.type_parameter) {
            if (!call?.permission || !IsValidAddress(call?.permission)) {
                permission = Permission.New(txb, '');
            }
            obj = Machine.New(txb, permission ?? call?.permission, call?.description??'', call?.endpoint ?? '', permission?undefined:passport);
        } else {
            if (IsValidAddress(call.object) && call.type_parameter && call.permission && IsValidAddress(call?.permission)) {
                obj = Machine.From(txb, call.permission, call.object)
            }
        }

        if (obj) {
            if (call?.permission_new !== undefined ) {
                obj.change_permission(call.permission_new);
            }
            if (call?.description !== undefined && call.object !== 'new') {
                obj.set_description(call.description, passport);
            }
            if (call?.endpoint !== undefined && call.object !== 'new') {
                obj.set_endpoint(call.endpoint, passport)
            }
            if (call?.bPaused !== undefined) {
                obj.pause(call.bPaused, passport)
            }
            if (call?.bPublished ) {
                obj.publish(passport)
            }
            if (call?.clone_new) {
                obj.clone(true, passport)
            }
            if (call?.consensus_repository !== undefined) {
                switch (call.consensus_repository.op) {
                    case 'add': 
                        call.consensus_repository.repositories.forEach(v=>obj.add_repository(v, passport)) ;
                        break;
                    case 'remove': 
                        obj.remove_repository(call.consensus_repository.repositories, false, passport);
                        break;
                    case 'removeall': 
                        obj.remove_repository([], true, passport);
                        break;
                    case 'set':
                        obj.remove_repository([], true, passport);
                        call.consensus_repository.repositories.forEach(v=>obj.add_repository(v, passport)) ;
                        break;
                }
            }
            if (call?.nodes !== undefined) {
                switch (call?.nodes?.op) {
                    case 'add':
                        obj.add_node(call.nodes.data, passport)
                        break;
                    case 'remove':
                        obj.remove_node(call.nodes.names, call.nodes?.bTransferMyself, passport)
                        break;
                    case 'rename node':
                        call.nodes.data.forEach(v => obj.rename_node(v.old, v.new, passport));
                        break;
                    case 'add from myself':
                        obj.add_node2(call.nodes.addresses, passport);
                        break;
                    case 'add forward':
                        call.nodes.data.forEach(v => obj.add_forward(v.prior_node_name, v.node_name, v.forward, v.threshold, v.old_need_remove, passport))
                        break;
                    case 'remove forward':
                        call.nodes.data.forEach(v => obj.remove_forward(v.prior_node_name, v.node_name, v.forward_name, passport))
                        break;
                    }
            }
            if (permission) {
                permission.launch();
            }
            if (call.object === 'new') {
                obj.launch();
            }
        }
    }

    export const service = (call: CallService, txb:TransactionBlock, passport?: PassportObject) => {
        let obj : Service | undefined ; let permission: any;  let payee: any;
        if (call.object === 'new' && call?.type_parameter) {
            if (!call?.permission || !IsValidAddress(call?.permission)) {
                permission = Permission.New(txb, '');
            }
            if (!call?.payee_treasury || !IsValidAddress(call?.payee_treasury)) {
                payee = Treasury.New(txb, call?.type_parameter, permission ?? call?.permission, '', permission?undefined:passport);
            }
            obj = Service.New(txb, call.type_parameter, permission ?? call?.permission, call?.description??'', payee, permission?undefined:passport)
        } else {
            if (IsValidAddress(call.object) && call.type_parameter && call.permission && IsValidAddress(call?.permission)) {
                obj = Service.From(txb, call.type_parameter, call.permission, call.object)
            }
        }

        if (obj) {
            if (call?.permission_new !== undefined) {
                obj.change_permission(call.permission_new);
            }
            if (call?.description !== undefined && call.object !== 'new') {
                obj.set_description(call.description, passport);
            }
            if (call?.payee_treasury !== undefined && call.object !== 'new') {
                obj.set_payee(call.payee_treasury, passport);
            }
            if (call?.endpoint !== undefined) {
                obj.set_endpoint(call.endpoint, passport)
            }
            if (call?.buy_guard !== undefined) {
                obj.set_buy_guard(call.buy_guard, passport)
            }
            if (call?.bPaused !== undefined) {
                obj.pause(call.bPaused, passport)
            }
            if (call?.bPublished) {
                obj.publish(passport)
            }
            if (call?.clone_new !== undefined) {
                obj.clone(call.clone_new?.token_type_new, true, passport)
            }
            if (call?.machine !== undefined) {
                obj.set_machine(call.machine, passport)
            }
            if (call?.repository !== undefined) {
                switch (call.repository.op) {
                    case 'add':
                        call.repository.repositories.forEach(v => obj.add_repository(v, passport))
                        break;
                    case 'remove':
                        obj.remove_repository(call.repository.repositories, false, passport)
                        break;
                    case 'set':
                        obj.remove_repository([], true, passport)
                        call.repository.repositories.forEach(v => obj.add_repository(v, passport))
                        break;
                    case 'removeall':
                        obj.remove_repository([], true, passport)
                        break;
                }
            }
            if (call?.extern_withdraw_treasury !== undefined) {
                switch(call.extern_withdraw_treasury.op) {
                    case 'add':
                        call.extern_withdraw_treasury.treasuries.forEach(v=>obj.add_treasury(v.token_type, v.address, passport))
                        break;
                    case 'set':
                        obj.remove_treasury([], true, passport)
                        call.extern_withdraw_treasury.treasuries.forEach(v=>obj.add_treasury(v.token_type, v.address, passport))
                        break;
                    case 'remove':
                        obj.remove_treasury(call.extern_withdraw_treasury.addresses, false, passport)
                        break;
                    case 'removeall':
                        obj.remove_treasury([], false, passport)
                        break;
                }
            }
            if (call?.arbitration !== undefined) {
                switch(call.arbitration.op) {
                    case 'add':
                        call.arbitration.arbitrations.forEach(v=>obj.add_arbitration(v.address, v.token_type, passport))
                        break;
                    case 'set':
                        obj.remove_arbitration([], true, passport)
                        call.arbitration.arbitrations.forEach(v=>obj.add_arbitration(v.address, v.token_type, passport))
                        break;
                    case 'remove':
                        obj.remove_arbitration(call.arbitration.addresses, false, passport)
                        break;
                    case 'removeall':
                        obj.remove_arbitration([], false, passport)
                        break;
                }
            }
            if (call?.customer_required_info !== undefined) {
                obj.set_customer_required(call.customer_required_info.pubkey, call.customer_required_info.required_info, passport);
            }
            if (call?.refund_guard !== undefined) {
                switch(call.refund_guard.op) {
                    case 'add':
                        obj.add_refund_guards(call.refund_guard.guards, passport)
                        break;
                    case 'set':
                        obj.remove_refund_guards([], true, passport)
                        obj.add_refund_guards(call.refund_guard.guards, passport)
                        break;
                    case 'remove':
                        obj.remove_refund_guards(call.refund_guard.addresses, false, passport)
                        break;
                    case 'removeall':
                        obj.remove_refund_guards([], true, passport)
                        break;
                }
            }
            if (call?.gen_discount !== undefined) {
                obj.discount_transfer(call.gen_discount, passport)
            }
            if (call?.withdraw_guard !== undefined) {
                switch(call.withdraw_guard.op) {
                    case 'add':
                        obj.add_withdraw_guards(call.withdraw_guard.guards, passport)
                        break;
                    case 'set':
                        obj.remove_withdraw_guards([], true, passport)
                        obj.add_withdraw_guards(call.withdraw_guard.guards, passport)
                        break;
                    case 'remove':
                        obj.remove_withdraw_guards(call.withdraw_guard.addresses, false, passport)
                        break;
                    case 'removeall':
                        obj.remove_withdraw_guards([], true, passport)
                        break;
                }
            }
            if (call?.sales !== undefined) {
                switch(call.sales.op) {
                    case 'add':
                        obj.add_sales(call.sales.sales, false, passport)
                        break;
                    case 'remove':
                        obj.remove_sales(call.sales.sales_name, passport)
                        break;
                }
            }
            if (call?.buy !== undefined) {
                let b = BigInt(0); let coin : any;
                call.buy.buy_items.forEach(v => {
                    b += BigInt(v.max_price) * BigInt(v.count)
                })
                if (b > BigInt(0)) {
                    if (call?.type_parameter === '0x2::sui::SUI' || call?.type_parameter === '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI') {
                        coin = txb.splitCoins(txb.gas, [b])[0];
                    } else if (call?.buy.coin_object) {
                        coin = txb.splitCoins(call.buy.coin_object, [b])[0];
                    }                    
                }

                if (coin) {
                    //@ crypto tools support
                    obj.buy(call.buy.buy_items, coin, call.buy.discount, call.buy.machine, call.buy.customer_info_crypto, passport)                    
                }
            }
            if (permission) {
                permission.launch();
            }
            if (payee) {
                payee.launch();
            }
            if (call.object === 'new') {
                obj.launch();
            }
        }
    }
}