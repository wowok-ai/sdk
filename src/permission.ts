import { BCS } from '@mysten/bcs';
import { FnCallType, TxbObject, PermissionObject, PermissionAddress, GuardObject, Protocol} from './protocol';
import { array_unique, IsValidAddress, IsValidArray,  IsValidDesription, IsValidUint, Bcs} from './utils';
import { ERROR, Errors } from './exception';
import { Resource } from './resource';

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
    service_set_payee = 205,
    service_repository_add = 206,
    service_repository_remove = 207,
    service_add_withdraw_guards = 208,
    service_remove_withdraw_guards  = 209,
    service_add_refund_guards = 210,
    service_remove_refund_guards = 211,
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
    
    get_object() { this.object }
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

    add_entity(entities:Permission_Entity[])  {
        if (!entities) {
            ERROR(Errors.InvalidParam, 'entities');
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
            if (indexes.length > 0) {
                txb.moveCall({
                    target:this.protocol.PermissionFn('add_batch') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(entity.entity_address, BCS.ADDRESS), 
                        txb.pure(indexes, 'vector<u64>')]
                })            
            }
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
        }
        ;
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
                txb.pure(Bcs.getInstance().ser_vector_u64(array_unique(index)))]
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