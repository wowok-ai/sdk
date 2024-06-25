import { BCS } from '@mysten/bcs';
import { FnCallType, TxbObject, PermissionObject, PermissionAddress, GuardObject, Protocol} from './protocol';
import { array_unique, IsValidAddress, IsValidArray,  IsValidDesription, IsValidUint, Bcs, IsValidName} from './utils';
import { ERROR, Errors } from './exception';
import { ValueType } from './protocol';

export enum PermissionIndex {
    repository = 100,
    repository_set_description_set = 101,
    repository_set_policy_mode = 102,
    repository_add_policies = 103,
    repository_remove_policies = 104,
    repository_set_policy_description = 105,
    repository_set_policy_permission = 106,
    repository_reference_add = 107,
    repository_reference_remove = 108,
    repository_reference_removeall = 108,

    vote = 150,
    vote_set_description = 151,
    vote_set_reference = 152, 
    vote_add_guard = 153,
    vote_remove_guard = 154,
    vote_add_option = 155,
    vote_remove_option = 156,
    vote_set_max_choice_count = 157,
    vote_open_voting = 158,
    vote_lock_deadline = 159,
    vote_expand_deadline = 160,
    vote_lock_guard = 161,

    service = 200,
    service_set_description = 201,
    service_set_price = 202,
    service_set_stock = 203,
    service_add_stock = 203,
    service_reduce_stock = 203,
    service_set_sale_endpoint = 204,
    service_set_payee = 205,
    service_repository_add = 206,
    service_repository_remove = 207,
    service_add_withdraw_guards = 208,
    service_remove_withdraw_guards  = 208,
    service_removeall_withdraw_guards  = 208,
    service_add_refund_guards = 210,
    service_remove_refund_guards = 210,
    service_removeall_refund_guards = 210,
    service_add_sales = 212,
    service_remove_sales = 213,
    service_discount_transfer = 214,
    service_withdraw = 216,
    service_set_buy_guard = 217,
    service_set_machine = 218,
    service_set_endpoint = 219,
    service_publish = 220,
    service_clone = 221,
    service_set_customer_required = 222,
    service_remove_customer_required = 222,
    service_change_required_pubkey = 222,
    service_change_order_required_pubkey = 224,
    service_pause = 225,

    reward = 240,
    reward_refund = 241,
    reward_expand_time = 242,
    reward_add_guard = 243,
    reward_remove_guard = 244,
    reward_set_description = 245,
    reward_lock_guards = 246,
    demand = 260,
    demand_refund = 261,
    demand_expand_time = 262,
    demand_set_guard = 263,
    demand_set_description = 264,
    demand_yes = 265,
    machine = 600,
    machine_set_description = 601,
    machine_add_repository = 602,
    machine_remove_repository = 603,
    machine_clone =  604,
    machine_add_node = 606,
    machine_add_node2 = 606,
    machine_remove_node = 607,
    machine_set_endpoint = 608,
    machine_pause = 609,
    machine_publish = 610,
    progress = 650,
    progress_set_namedOperator = 651,
    progress_bind_task = 652,
    progress_set_context_repository = 653,
    progress_unhold = 654,
    user_defined_start = 10000,
}

export interface PermissionInfoType {
    index: number;
    name:string;
    description:string;
    module: string;
    guard?: string;
}

export const PermissionInfo : PermissionInfoType[] = [
    {index:PermissionIndex.repository, name:'Repository', description:'repository', module: 'repository'},
    {index:PermissionIndex.repository_set_description_set, name:'Description', description:'repository_set_description_set', module: 'repository'},
    {index:PermissionIndex.repository_set_policy_mode, name:'Policy mode', description:'repository_set_policy_mode', module: 'repository'},
    {index:PermissionIndex.repository_add_policies, name:'Add Policy', description:'brepository_add_policies', module: 'repository'},
    {index:PermissionIndex.repository_remove_policies, name:'Remove Policy', description:'build machine', module: 'repository'},
    {index:PermissionIndex.repository_set_policy_description, name:'Policy Description', description:'build machine', module: 'repository'},
    {index:PermissionIndex.repository_set_policy_permission, name:'Policy Permission', description:'build machine',  module: 'repository'},
    {index:PermissionIndex.repository_reference_add, name:'Add Reference', description:'build machine', module: 'repository'},
    {index:PermissionIndex.repository_reference_remove, name:'Remove Reference', description:'build machine', module: 'repository'},

    {index:PermissionIndex.vote, name:'Vote', description:'build machine', module: 'vote'},
    {index:PermissionIndex.vote_set_description, name:'Description', description:'build machine', module: 'vote'},
    {index:PermissionIndex.vote_set_reference, name:'Reference', description:'build machine', module: 'vote'},
    {index:PermissionIndex.vote_add_guard, name:'Add Guard', description:'build machine', module: 'vote'},
    {index:PermissionIndex.vote_remove_guard, name:'Remove Guard', description:'build machine', module: 'vote'},
    {index:PermissionIndex.vote_add_option, name:'Add Option', description:'build machine', module: 'vote'},
    {index:PermissionIndex.vote_remove_option, name:'Remove Option', description:'build machine', module: 'vote'},
    {index:PermissionIndex.vote_set_max_choice_count, name:'Choice count', description:'build machine', module: 'vote'},
    {index:PermissionIndex.vote_open_voting, name:'Open voting', description:'build machine', module: 'vote'},
    {index:PermissionIndex.vote_lock_deadline, name:'Lock deadline', description:'build machine', module: 'vote'},
    {index:PermissionIndex.vote_expand_deadline, name:'Expand deadline', description:'build machine', module: 'vote'},
    {index:PermissionIndex.vote_lock_guard, name:'Lock Guard', description:'build machine', module: 'vote'},

    {index:PermissionIndex.service, name:'Service', description:'build machine', module: 'service'},
    {index:PermissionIndex.service_set_description, name:'Description', description:'build machine', module: 'service'},
    {index:PermissionIndex.service_set_price, name:'Price', description:'build machine', module: 'service'},
    {index:PermissionIndex.service_set_stock, name:'Inventory', description:'build machine', module: 'service'},
    {index:PermissionIndex.service_set_payee, name:'Payee', description:'build machine', module: 'service'},
    {index:PermissionIndex.service_repository_add, name:'Add Repository', description:'build machine', module: 'service'},
    {index:PermissionIndex.service_repository_remove, name:'Remove Repository', description:'build machine', module: 'service'},
    {index:PermissionIndex.service_add_withdraw_guards, name:'Withdraw Guard', description:'Add, remove withdraw guards', module: 'service'},
    {index:PermissionIndex.service_add_refund_guards, name:'Refund Guard', description:'Add, remove refund guards', module: 'service'},
    {index:PermissionIndex.service_remove_refund_guards, name:'Remove Refund Guard', description:'build machine', module: 'service'},
    {index:PermissionIndex.service_add_sales, name:'Add sales', description:'build machine', module: 'service'},
    {index:PermissionIndex.service_remove_sales, name:'Remove sales', description:'build machine', module: 'service'},
    {index:PermissionIndex.service_discount_transfer, name:'Discount', description:'build machine', module: 'service'},
    {index:PermissionIndex.service_withdraw, name:'Withdraw', description:'build machine', module: 'service'},
    {index:PermissionIndex.service_set_buy_guard, name:'Buyer Guard', description:'build machine', module: 'service'},
    {index:PermissionIndex.service_set_machine, name:'Machine', description:'build machine', module: 'service'},
    {index:PermissionIndex.service_set_endpoint, name:'Endpoint', description:'build machine', module: 'service'},
    {index:PermissionIndex.service_publish, name:'Publish', description:'build machine', module: 'service'},
    {index:PermissionIndex.service_clone, name:'Clone', description:'build machine', module: 'service'},
    {index:PermissionIndex.service_set_customer_required, name:'Buyer info', description:'build machine', module: 'service'},
    {index:PermissionIndex.service_change_order_required_pubkey, name:'Order pubkey', description:'build machine', module: 'service'},
    {index:PermissionIndex.service_pause, name:'Pause', description:'build machine', module: 'service'},

    {index:PermissionIndex.reward, name:'Reward', description:'build machine', module: 'reward'},
    {index:PermissionIndex.reward_refund, name:'Refund', description:'build machine', module: 'reward'},
    {index:PermissionIndex.reward_expand_time, name:'Expand deadline', description:'build machine', module: 'reward'},
    {index:PermissionIndex.reward_add_guard, name:'Add Guard', description:'build machine', module: 'reward'},
    {index:PermissionIndex.reward_remove_guard, name:'Remove Guard', description:'build machine', module: 'reward'},
    {index:PermissionIndex.reward_set_description, name:'Description', description:'build machine', module: 'reward'},
    {index:PermissionIndex.reward_lock_guards, name:'Lock Guard', description:'build machine', module: 'reward'},

    {index:PermissionIndex.demand, name:'Demand', description:'build machine', module: 'demand'},
    {index:PermissionIndex.demand_refund, name:'Refund', description:'build machine', module: 'demand'},
    {index:PermissionIndex.demand_expand_time, name:'Expand deadline', description:'build machine', module: 'demand'},
    {index:PermissionIndex.demand_set_guard, name:'Guard', description:'build machine', module: 'demand'},
    {index:PermissionIndex.demand_set_description, name:'Description', description:'build machine', module: 'demand'},
    {index:PermissionIndex.demand_yes, name:'Yes', description:'build machine', module: 'demand'},

    {index:PermissionIndex.machine, name: 'Machine', description:'build machine', module: 'machine'},
    {index:PermissionIndex.machine_set_description, name: 'Description', description:'machine_set_description', module: 'machine'},
    {index:PermissionIndex.machine_add_repository, name: 'Add Repository', description:'machine_add_repository', module: 'machine'},
    {index:PermissionIndex.machine_remove_repository, name: 'Remove Repository', description:'machine_remove_repository', module: 'machine'},
    {index:PermissionIndex.machine_clone, name: 'Clone', description:'machine_clone', module: 'machine'},
    {index:PermissionIndex.machine_add_node, name: 'Add node', description:'machine_add_node/2', module: 'machine'},
    {index:PermissionIndex.machine_remove_node, name: 'Remove node', description:'machine_remove_node', module: 'machine'},
    {index:PermissionIndex.machine_set_endpoint, name: 'Endpoint', description:'machine_set_endpoint', module: 'machine'},
    {index:PermissionIndex.machine_pause, name: 'Pause', description:'machine_pause', module: 'machine'},
    {index:PermissionIndex.machine_publish, name: 'Publish', description:'machine_publish', module: 'machine'},

    {index:PermissionIndex.progress, name: 'Progress', description:'build progress', module: 'progress'},
    {index:PermissionIndex.progress_set_namedOperator, name: 'Operator', description:'progress_set_namedOperator', module: 'progress'},
    {index:PermissionIndex.progress_bind_task, name: 'Bind', description:'progress_bind_task', module: 'progress'},
    {index:PermissionIndex.progress_set_context_repository, name: 'Repository', description:'progress_set_context_repository', module: 'progress'},
    {index:PermissionIndex.progress_unhold, name: 'Unhold', description:'progress_unhold', module: 'progress'},
]

export type PermissionIndexType = PermissionIndex | number;

export type Permission_Index = {
    index: PermissionIndexType;
    guard?: TxbObject;
}

export type Permission_Entity = {
    entity_address:string;
    permissions:Permission_Index[];
}

export class  Permission {
    protected protocol;
    protected object : TxbObject;
    
    get_object()  { return this.object }
    private constructor(protocol:Protocol) {
        this.protocol = protocol;
        this.object = '';
    }
    static From(protocol:Protocol, object:TxbObject) : Permission {
        let p =  new Permission(protocol);
        p.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), object);
        return p
    }

    static New(protocol:Protocol, description:string) : Permission {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        let p = new Permission(protocol);
        let txb = protocol.CurrentSession();
        p.object = txb.moveCall({
            target: protocol.PermissionFn('new') as FnCallType,
            arguments: [txb.pure(description)]
        });
        return p
    }

    launch() : PermissionAddress {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({ // address returned
            target:this.protocol.PermissionFn('create')  as FnCallType,
            arguments:[ Protocol.TXB_OBJECT(txb, this.object) ]        
        })
    }

    destroy()  {
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.PermissionFn('destroy') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
        })  
    }
    add_userdefine(index: number, name:string) {
        if (!Permission.IsValidUserDefinedIndex(index)) {
            ERROR(Errors.IsValidUserDefinedIndex, 'add_userdefine');
        }

        if (!IsValidName(name)) {
            ERROR(Errors.IsValidName, 'add_userdefine');
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.PermissionFn('user_define_add') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(index, BCS.U64), txb.pure(name, BCS.STRING)]
        })   
    }
    
    remove_userdefine(index: number) {
        if (!Permission.IsValidUserDefinedIndex(index)) {
            ERROR(Errors.IsValidUserDefinedIndex, 'add_userdefine');
        }

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.PermissionFn('user_define_remove') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(index, BCS.U64)]
        })   
    }

    change_entity(old_entity: string, new_entity: string) {
        if (!IsValidAddress(old_entity) || !IsValidAddress(new_entity)) {
            ERROR(Errors.IsValidAddress, 'change_entity')
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.PermissionFn('change_entity') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(old_entity, BCS.ADDRESS), 
                txb.pure(new_entity, BCS.ADDRESS) ]
        })     
    }

    add_entity2(entities: string[], index?:PermissionIndexType) {
        if (!entities) {
            ERROR(Errors.InvalidParam, 'add_entity2');
        }
        if (!IsValidArray(entities, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'add_entity2');
        }

        let txb = this.protocol.CurrentSession();
        if (index) {
            txb.moveCall({
                target:this.protocol.PermissionFn('add_with_index') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(index, BCS.U64),
                    txb.pure(array_unique(entities), 'vector<address>')]
            })       
        } else {
            txb.moveCall({
                target:this.protocol.PermissionFn('add') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(entities), 'vector<address>')]
            })                   
        }
    }

    add_entity(entities:Permission_Entity[])  {
        if (!entities) {
            ERROR(Errors.InvalidParam, 'add_entity');
        }

        let bValid = true;
        let e = entities.forEach((v) => {
            if (!IsValidAddress(v.entity_address)) bValid = false;
            v.permissions.forEach((p) => {
                if (!Permission.IsValidPermissionIndex(p.index)) bValid = false;
                if (p?.guard && !Protocol.IsValidObjects([p.guard])) bValid = false;
            })
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'entities');
        }

        let txb = this.protocol.CurrentSession();
        let guards:any[]  = [];

        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            let indexes :number[] = [];

            for (let j = 0; j <  entity.permissions.length; j++) {
                let index = entity.permissions[j];
                if (!Permission.IsValidPermissionIndex(index.index)) {
                    continue;
                }
                
                if (!indexes.includes(index.index))   {
                    indexes.push(index.index);
                    if (index?.guard) {
                        guards.push({entity_address:entity.entity_address, index:index.index, guard:index.guard});
                    }
                }      
            }    
            //if (indexes.length > 0) {
                txb.moveCall({
                    target:this.protocol.PermissionFn('add_batch') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(entity.entity_address, BCS.ADDRESS), 
                        txb.pure(indexes, 'vector<u64>')]
                })            
            //}
        } 
        // set guards
        guards.forEach(({entity_address, index, guard}) => {
            txb.moveCall({
                target:this.protocol.PermissionFn('guard_set') as FnCallType,
                arguments:[ Protocol.TXB_OBJECT(txb, this.object), txb.pure(entity_address, BCS.ADDRESS), 
                    txb.pure(index, BCS.U64), Protocol.TXB_OBJECT(txb, guard)]
            })
        })
    }

    // guard: undefine to set none
    set_guard(entity_address:string, index:PermissionIndexType, guard?:GuardObject)  {
        if (!IsValidAddress(entity_address)) {
            ERROR(Errors.IsValidAddress, 'entity_address')
        }
        if(!Permission.IsValidPermissionIndex(index)) {
            ERROR(Errors.IsValidPermissionIndex, 'index')
        }

        let txb = this.protocol.CurrentSession();
        if (guard) {
            txb.moveCall({
                target:this.protocol.PermissionFn('guard_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(entity_address, BCS.ADDRESS), 
                    txb.pure(index, BCS.U64), Protocol.TXB_OBJECT(txb, guard)]
            })    
        } else {
            txb.moveCall({
                target:this.protocol.PermissionFn('guard_none') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(entity_address, BCS.ADDRESS), 
                    txb.pure(index, BCS.U64)]
            })       
        };
    }

    remove_index(entity_address:string, index:PermissionIndexType[])  {
        if (!IsValidAddress(entity_address)) {
            ERROR(Errors.IsValidAddress)
        }
        if (!index || !(IsValidArray(index, Permission.IsValidPermissionIndex))) {
            ERROR(Errors.InvalidParam, 'index')
        }

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.PermissionFn('remove_index') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(entity_address, BCS.ADDRESS), 
                txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_U64, array_unique(index)))]
        })            
    }
    remove_entity(entity_address:string[])  {
        if (!entity_address || !IsValidArray(entity_address, IsValidAddress)) {
            ERROR(Errors.IsValidArray)
        }

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.PermissionFn('remove') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(entity_address), 'vector<address>')]
        })           
        ;
    }
    set_description(description:string)  {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.PermissionFn('description_set') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(description)]
        })
        ;
    }

    add_admin(admin:string[])  {
        if (!admin || !IsValidArray(admin, IsValidAddress)) {
            ERROR(Errors.IsValidArray)
        }

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.PermissionFn('admin_add_batch')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(admin), 'vector<address>')]
        });           
        ;
    }

    remove_admin(admin?:string[], removeall?:boolean)  {
        if (!removeall && !admin) {
            ERROR(Errors.AllInvalid,  'admin & removeall')
        }

        if (admin && !IsValidArray(admin, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'admin')
        }

        let txb = this.protocol.CurrentSession();
        if (removeall) {
            txb.moveCall({
                target:this.protocol.PermissionFn('admins_clear')  as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object)]
            });    
        } else if (admin) {
            txb.moveCall({
                target:this.protocol.PermissionFn('admin_remove_batch')  as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(admin), 'vector<address>')]
            });            
        }
        
    }

    change_owner(new_owner:string) {
        if (!IsValidAddress(new_owner)) {
            ERROR(Errors.IsValidAddress)
        }

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.PermissionFn('builder_set')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(new_owner, BCS.ADDRESS)]
        });        
    }

    static MAX_ADMIN_COUNT = 64;
    static MAX_ENTITY_COUNT = 2000;
    static MAX_PERMISSION_INDEX_COUNT = 200;
    static MAX_PERSONAL_PERMISSION_COUNT = 200; 
    static IsValidUserDefinedIndex = (index:number)  => { 
        return index >= PermissionIndex.user_defined_start && IsValidUint(index)
    }
    
    static IsValidPermissionIndex = (index:PermissionIndexType) : boolean  => {
        //console.log(index)
        if (Object.values(PermissionIndex).includes(index)) {
            return true
        }
        //console.log(Object.keys(PermissionIndex))
        return Permission.IsValidUserDefinedIndex(index);
    }
}