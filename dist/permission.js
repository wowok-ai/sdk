import { BCS } from '@mysten/bcs';
import { Protocol } from './protocol';
import { array_unique, IsValidAddress, IsValidArray, IsValidDesription, IsValidUint, Bcs } from './utils';
import { ERROR, Errors } from './exception';
export var PermissionIndex;
(function (PermissionIndex) {
    PermissionIndex[PermissionIndex["repository"] = 100] = "repository";
    PermissionIndex[PermissionIndex["repository_set_description_set"] = 101] = "repository_set_description_set";
    PermissionIndex[PermissionIndex["repository_set_policy_mode"] = 102] = "repository_set_policy_mode";
    PermissionIndex[PermissionIndex["repository_add_policies"] = 103] = "repository_add_policies";
    PermissionIndex[PermissionIndex["repository_remove_policies"] = 104] = "repository_remove_policies";
    PermissionIndex[PermissionIndex["repository_set_policy_description"] = 105] = "repository_set_policy_description";
    PermissionIndex[PermissionIndex["repository_set_policy_permission"] = 106] = "repository_set_policy_permission";
    PermissionIndex[PermissionIndex["vote"] = 150] = "vote";
    PermissionIndex[PermissionIndex["vote_set_description"] = 151] = "vote_set_description";
    PermissionIndex[PermissionIndex["vote_set_reference"] = 152] = "vote_set_reference";
    PermissionIndex[PermissionIndex["vote_add_guard"] = 153] = "vote_add_guard";
    PermissionIndex[PermissionIndex["vote_remove_guard"] = 154] = "vote_remove_guard";
    PermissionIndex[PermissionIndex["vote_add_option"] = 155] = "vote_add_option";
    PermissionIndex[PermissionIndex["vote_remove_option"] = 156] = "vote_remove_option";
    PermissionIndex[PermissionIndex["vote_set_max_choice_count"] = 157] = "vote_set_max_choice_count";
    PermissionIndex[PermissionIndex["vote_open_voting"] = 158] = "vote_open_voting";
    PermissionIndex[PermissionIndex["vote_lock_deadline"] = 159] = "vote_lock_deadline";
    PermissionIndex[PermissionIndex["vote_expand_deadline"] = 160] = "vote_expand_deadline";
    PermissionIndex[PermissionIndex["vote_lock_guard"] = 161] = "vote_lock_guard";
    PermissionIndex[PermissionIndex["service"] = 200] = "service";
    PermissionIndex[PermissionIndex["service_set_description"] = 201] = "service_set_description";
    PermissionIndex[PermissionIndex["service_set_price"] = 202] = "service_set_price";
    PermissionIndex[PermissionIndex["service_set_stock"] = 203] = "service_set_stock";
    PermissionIndex[PermissionIndex["service_add_stock"] = 203] = "service_add_stock";
    PermissionIndex[PermissionIndex["service_reduce_stock"] = 203] = "service_reduce_stock";
    PermissionIndex[PermissionIndex["service_set_payee"] = 205] = "service_set_payee";
    PermissionIndex[PermissionIndex["service_repository_add"] = 206] = "service_repository_add";
    PermissionIndex[PermissionIndex["service_repository_remove"] = 207] = "service_repository_remove";
    PermissionIndex[PermissionIndex["service_add_withdraw_guards"] = 208] = "service_add_withdraw_guards";
    PermissionIndex[PermissionIndex["service_remove_withdraw_guards"] = 209] = "service_remove_withdraw_guards";
    PermissionIndex[PermissionIndex["service_add_refund_guards"] = 210] = "service_add_refund_guards";
    PermissionIndex[PermissionIndex["service_remove_refund_guards"] = 211] = "service_remove_refund_guards";
    PermissionIndex[PermissionIndex["service_add_sales"] = 212] = "service_add_sales";
    PermissionIndex[PermissionIndex["service_remove_sales"] = 213] = "service_remove_sales";
    PermissionIndex[PermissionIndex["service_discount_transfer"] = 214] = "service_discount_transfer";
    PermissionIndex[PermissionIndex["service_withdraw"] = 216] = "service_withdraw";
    PermissionIndex[PermissionIndex["service_set_buy_guard"] = 217] = "service_set_buy_guard";
    PermissionIndex[PermissionIndex["service_set_machine"] = 218] = "service_set_machine";
    PermissionIndex[PermissionIndex["service_set_endpoint"] = 219] = "service_set_endpoint";
    PermissionIndex[PermissionIndex["service_publish"] = 220] = "service_publish";
    PermissionIndex[PermissionIndex["service_clone"] = 221] = "service_clone";
    PermissionIndex[PermissionIndex["service_set_customer_required"] = 222] = "service_set_customer_required";
    PermissionIndex[PermissionIndex["service_remove_customer_required"] = 222] = "service_remove_customer_required";
    PermissionIndex[PermissionIndex["service_change_required_pubkey"] = 222] = "service_change_required_pubkey";
    PermissionIndex[PermissionIndex["service_change_order_required_pubkey"] = 224] = "service_change_order_required_pubkey";
    PermissionIndex[PermissionIndex["service_pause"] = 225] = "service_pause";
    PermissionIndex[PermissionIndex["reward"] = 240] = "reward";
    PermissionIndex[PermissionIndex["reward_refund"] = 241] = "reward_refund";
    PermissionIndex[PermissionIndex["reward_expand_time"] = 242] = "reward_expand_time";
    PermissionIndex[PermissionIndex["reward_add_guard"] = 243] = "reward_add_guard";
    PermissionIndex[PermissionIndex["reward_remove_guard"] = 244] = "reward_remove_guard";
    PermissionIndex[PermissionIndex["reward_set_description"] = 245] = "reward_set_description";
    PermissionIndex[PermissionIndex["reward_lock_guards"] = 246] = "reward_lock_guards";
    PermissionIndex[PermissionIndex["demand"] = 260] = "demand";
    PermissionIndex[PermissionIndex["demand_refund"] = 261] = "demand_refund";
    PermissionIndex[PermissionIndex["demand_expand_time"] = 262] = "demand_expand_time";
    PermissionIndex[PermissionIndex["demand_set_guard"] = 263] = "demand_set_guard";
    PermissionIndex[PermissionIndex["demand_set_description"] = 264] = "demand_set_description";
    PermissionIndex[PermissionIndex["demand_yes"] = 265] = "demand_yes";
    PermissionIndex[PermissionIndex["machine"] = 600] = "machine";
    PermissionIndex[PermissionIndex["machine_set_description"] = 601] = "machine_set_description";
    PermissionIndex[PermissionIndex["machine_add_repository"] = 602] = "machine_add_repository";
    PermissionIndex[PermissionIndex["machine_remove_repository"] = 603] = "machine_remove_repository";
    PermissionIndex[PermissionIndex["machine_clone"] = 604] = "machine_clone";
    PermissionIndex[PermissionIndex["machine_add_node"] = 606] = "machine_add_node";
    PermissionIndex[PermissionIndex["machine_add_node2"] = 606] = "machine_add_node2";
    PermissionIndex[PermissionIndex["machine_remove_node"] = 607] = "machine_remove_node";
    PermissionIndex[PermissionIndex["machine_set_endpoint"] = 608] = "machine_set_endpoint";
    PermissionIndex[PermissionIndex["machine_pause"] = 609] = "machine_pause";
    PermissionIndex[PermissionIndex["machine_publish"] = 610] = "machine_publish";
    PermissionIndex[PermissionIndex["progress"] = 650] = "progress";
    PermissionIndex[PermissionIndex["progress_set_namedOperator"] = 651] = "progress_set_namedOperator";
    PermissionIndex[PermissionIndex["progress_bind_task"] = 652] = "progress_bind_task";
    PermissionIndex[PermissionIndex["progress_set_context_repository"] = 653] = "progress_set_context_repository";
    PermissionIndex[PermissionIndex["progress_unhold"] = 654] = "progress_unhold";
    PermissionIndex[PermissionIndex["user_defined_start"] = 10000] = "user_defined_start";
})(PermissionIndex || (PermissionIndex = {}));
export class Permission {
    protocol;
    object;
    get_object() { this.object; }
    constructor(protocol) {
        this.protocol = protocol;
        this.object = '';
    }
    static From(protocol, object) {
        let p = new Permission(protocol);
        p.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), object);
        return p;
    }
    static New(protocol, description) {
        let p = new Permission(protocol);
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        let txb = protocol.CurrentSession();
        p.object = txb.moveCall({
            target: protocol.PermissionFn('new'),
            arguments: [txb.pure(description)]
        });
        return p;
    }
    launch() {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target: this.protocol.PermissionFn('create'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object)]
        });
    }
    destroy() {
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.PermissionFn('destroy'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
        });
    }
    add_entity(entities) {
        if (!entities) {
            ERROR(Errors.InvalidParam, 'entities');
        }
        let bValid = true;
        let e = entities.forEach((v) => {
            if (!IsValidAddress(v.entity_address))
                bValid = false;
            v.permissions.forEach((p) => {
                if (!Permission.IsValidPermissionIndex(p.index))
                    bValid = false;
                if (p?.guard && !Protocol.IsValidObjects([p.guard]))
                    bValid = false;
            });
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'entities');
        }
        let txb = this.protocol.CurrentSession();
        let guards = [];
        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];
            let indexes = [];
            for (let j = 0; j < entity.permissions.length; j++) {
                let index = entity.permissions[j];
                if (!Permission.IsValidPermissionIndex(index.index)) {
                    continue;
                }
                if (!indexes.includes(index.index)) {
                    indexes.push(index.index);
                    if (index?.guard) {
                        guards.push({ entity_address: entity.entity_address, index: index.index, guard: index.guard });
                    }
                }
            }
            if (indexes.length > 0) {
                txb.moveCall({
                    target: this.protocol.PermissionFn('add_batch'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(entity.entity_address, BCS.ADDRESS),
                        txb.pure(indexes, 'vector<u64>')]
                });
            }
        }
        // set guards
        guards.forEach(({ entity_address, index, guard }) => {
            txb.moveCall({
                target: this.protocol.PermissionFn('guard_set'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(entity_address, BCS.ADDRESS),
                    txb.pure(index, BCS.U64), Protocol.TXB_OBJECT(txb, guard)]
            });
        });
    }
    // guard: undefine to set none
    set_guard(entity_address, index, guard) {
        if (!IsValidAddress(entity_address)) {
            ERROR(Errors.IsValidAddress, 'entity_address');
        }
        if (!Permission.IsValidPermissionIndex(index)) {
            ERROR(Errors.IsValidPermissionIndex, 'index');
        }
        let txb = this.protocol.CurrentSession();
        if (guard) {
            txb.moveCall({
                target: this.protocol.PermissionFn('guard_set'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(entity_address, BCS.ADDRESS),
                    txb.pure(index, BCS.U64), Protocol.TXB_OBJECT(txb, guard)]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.PermissionFn('guard_none'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(entity_address, BCS.ADDRESS),
                    txb.pure(index, BCS.U64)]
            });
        }
        ;
    }
    remove_index(entity_address, index) {
        if (!IsValidAddress(entity_address)) {
            ERROR(Errors.IsValidAddress);
        }
        if (!index || !(IsValidArray(index, Permission.IsValidPermissionIndex))) {
            ERROR(Errors.InvalidParam, 'index');
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.PermissionFn('remove_index'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(entity_address, BCS.ADDRESS),
                txb.pure(Bcs.getInstance().ser_vector_u64(array_unique(index)))]
        });
    }
    remove_entity(entity_address) {
        if (!entity_address || !IsValidArray(entity_address, IsValidAddress)) {
            ERROR(Errors.IsValidArray);
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.PermissionFn('remove'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(entity_address), 'vector<address>')]
        });
    }
    set_description(description) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.PermissionFn('description_set'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(description)]
        });
    }
    add_admin(admin) {
        if (!admin || !IsValidArray(admin, IsValidAddress)) {
            ERROR(Errors.IsValidArray);
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.PermissionFn('admin_add_batch'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(admin), 'vector<address>')]
        });
        ;
    }
    remove_admin(admin, removeall) {
        if (!removeall && !admin) {
            ERROR(Errors.AllInvalid, 'admin & removeall');
        }
        if (admin && !IsValidArray(admin, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'admin');
        }
        let txb = this.protocol.CurrentSession();
        if (removeall) {
            txb.moveCall({
                target: this.protocol.PermissionFn('admins_clear'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object)]
            });
        }
        else if (admin) {
            txb.moveCall({
                target: this.protocol.PermissionFn('admin_remove_batch'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(admin), 'vector<address>')]
            });
        }
    }
    change_owner(new_owner) {
        if (!IsValidAddress(new_owner)) {
            ERROR(Errors.IsValidAddress);
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.PermissionFn('builder_set'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(new_owner, BCS.ADDRESS)]
        });
    }
    static MAX_ADMIN_COUNT = 64;
    static MAX_ENTITY_COUNT = 2000;
    static MAX_PERMISSION_INDEX_COUNT = 200;
    static IsValidUserDefinedIndex = (index) => {
        return index >= PermissionIndex.user_defined_start && IsValidUint(index);
    };
    static IsValidPermissionIndex = (index) => {
        //console.log(index)
        if (Object.values(PermissionIndex).includes(index)) {
            return true;
        }
        //console.log(Object.keys(PermissionIndex))
        return Permission.IsValidUserDefinedIndex(index);
    };
}
