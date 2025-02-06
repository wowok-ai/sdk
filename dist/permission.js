import { Protocol } from './protocol';
import { array_unique, IsValidAddress, IsValidArray, IsValidDesription, Bcs, IsValidName, IsValidU64 } from './utils';
import { ERROR, Errors } from './exception';
import { BCS } from '@mysten/bcs';
export var PermissionIndex;
(function (PermissionIndex) {
    PermissionIndex[PermissionIndex["repository"] = 100] = "repository";
    PermissionIndex[PermissionIndex["repository_description"] = 101] = "repository_description";
    PermissionIndex[PermissionIndex["repository_policy_mode"] = 102] = "repository_policy_mode";
    PermissionIndex[PermissionIndex["repository_policies"] = 103] = "repository_policies";
    PermissionIndex[PermissionIndex["repository_policy_description"] = 105] = "repository_policy_description";
    PermissionIndex[PermissionIndex["repository_policy_permission"] = 106] = "repository_policy_permission";
    PermissionIndex[PermissionIndex["repository_reference"] = 107] = "repository_reference";
    /*
        vote = 150,
        vote_description = 151,
        vote_reference = 152,
        vote_guard = 153,
        vote_option = 155,
        vote_max_choice_count = 157,
        vote_open_voting = 158,
        vote_lock_deadline = 159,
        vote_expand_deadline = 160,
        vote_lock_guard = 161,
    */
    PermissionIndex[PermissionIndex["service"] = 200] = "service";
    PermissionIndex[PermissionIndex["service_description"] = 201] = "service_description";
    PermissionIndex[PermissionIndex["service_price"] = 202] = "service_price";
    PermissionIndex[PermissionIndex["service_stock"] = 203] = "service_stock";
    PermissionIndex[PermissionIndex["service_sale_endpoint"] = 204] = "service_sale_endpoint";
    PermissionIndex[PermissionIndex["service_payee"] = 205] = "service_payee";
    PermissionIndex[PermissionIndex["service_repository"] = 206] = "service_repository";
    PermissionIndex[PermissionIndex["service_withdraw_guards"] = 208] = "service_withdraw_guards";
    PermissionIndex[PermissionIndex["service_refund_guards"] = 210] = "service_refund_guards";
    PermissionIndex[PermissionIndex["service_add_sales"] = 212] = "service_add_sales";
    PermissionIndex[PermissionIndex["service_remove_sales"] = 213] = "service_remove_sales";
    PermissionIndex[PermissionIndex["service_discount_transfer"] = 214] = "service_discount_transfer";
    PermissionIndex[PermissionIndex["service_withdraw"] = 216] = "service_withdraw";
    PermissionIndex[PermissionIndex["service_buyer_guard"] = 217] = "service_buyer_guard";
    PermissionIndex[PermissionIndex["service_machine"] = 218] = "service_machine";
    PermissionIndex[PermissionIndex["service_endpoint"] = 219] = "service_endpoint";
    PermissionIndex[PermissionIndex["service_publish"] = 220] = "service_publish";
    PermissionIndex[PermissionIndex["service_clone"] = 221] = "service_clone";
    PermissionIndex[PermissionIndex["service_customer_required"] = 222] = "service_customer_required";
    //service_change_order_required_pubkey = 224,
    PermissionIndex[PermissionIndex["service_pause"] = 225] = "service_pause";
    PermissionIndex[PermissionIndex["service_treasury"] = 226] = "service_treasury";
    PermissionIndex[PermissionIndex["service_arbitration"] = 227] = "service_arbitration";
    /*
        reward = 240,
        reward_refund = 241,
        reward_expand_time = 242,
        reward_guard = 243,
        reward_description = 245,
        reward_lock_guards = 246,
        reward_claim_repeatably = 247,
        reward_allow_claiming = 248,
    */
    PermissionIndex[PermissionIndex["demand"] = 260] = "demand";
    PermissionIndex[PermissionIndex["demand_refund"] = 261] = "demand_refund";
    PermissionIndex[PermissionIndex["demand_expand_time"] = 262] = "demand_expand_time";
    PermissionIndex[PermissionIndex["demand_guard"] = 263] = "demand_guard";
    PermissionIndex[PermissionIndex["demand_description"] = 264] = "demand_description";
    PermissionIndex[PermissionIndex["demand_yes"] = 265] = "demand_yes";
    PermissionIndex[PermissionIndex["machine"] = 600] = "machine";
    PermissionIndex[PermissionIndex["machine_description"] = 601] = "machine_description";
    PermissionIndex[PermissionIndex["machine_repository"] = 602] = "machine_repository";
    PermissionIndex[PermissionIndex["machine_clone"] = 604] = "machine_clone";
    PermissionIndex[PermissionIndex["machine_node"] = 606] = "machine_node";
    PermissionIndex[PermissionIndex["machine_endpoint"] = 608] = "machine_endpoint";
    PermissionIndex[PermissionIndex["machine_pause"] = 609] = "machine_pause";
    PermissionIndex[PermissionIndex["machine_publish"] = 610] = "machine_publish";
    PermissionIndex[PermissionIndex["progress"] = 650] = "progress";
    PermissionIndex[PermissionIndex["progress_namedOperator"] = 651] = "progress_namedOperator";
    PermissionIndex[PermissionIndex["progress_bind_task"] = 652] = "progress_bind_task";
    PermissionIndex[PermissionIndex["progress_context_repository"] = 653] = "progress_context_repository";
    PermissionIndex[PermissionIndex["progress_unhold"] = 654] = "progress_unhold";
    PermissionIndex[PermissionIndex["progress_parent"] = 655] = "progress_parent";
    PermissionIndex[PermissionIndex["treasury"] = 700] = "treasury";
    PermissionIndex[PermissionIndex["treasury_receive"] = 701] = "treasury_receive";
    PermissionIndex[PermissionIndex["treasury_deposit"] = 702] = "treasury_deposit";
    PermissionIndex[PermissionIndex["treasury_withdraw"] = 703] = "treasury_withdraw";
    PermissionIndex[PermissionIndex["treasury_descritption"] = 704] = "treasury_descritption";
    PermissionIndex[PermissionIndex["treasury_deposit_guard"] = 705] = "treasury_deposit_guard";
    PermissionIndex[PermissionIndex["treasury_withdraw_mode"] = 706] = "treasury_withdraw_mode";
    PermissionIndex[PermissionIndex["treasury_withdraw_guard"] = 707] = "treasury_withdraw_guard";
    PermissionIndex[PermissionIndex["arbitration"] = 800] = "arbitration";
    PermissionIndex[PermissionIndex["arbitration_description"] = 801] = "arbitration_description";
    PermissionIndex[PermissionIndex["arbitration_fee"] = 802] = "arbitration_fee";
    PermissionIndex[PermissionIndex["arbitration_voting_guard"] = 803] = "arbitration_voting_guard";
    PermissionIndex[PermissionIndex["arbitration_endpoint"] = 804] = "arbitration_endpoint";
    PermissionIndex[PermissionIndex["arbitration_guard"] = 805] = "arbitration_guard";
    PermissionIndex[PermissionIndex["arbitration_pause"] = 806] = "arbitration_pause";
    PermissionIndex[PermissionIndex["arbitration_vote"] = 807] = "arbitration_vote";
    PermissionIndex[PermissionIndex["arbitration_arbitration"] = 808] = "arbitration_arbitration";
    PermissionIndex[PermissionIndex["arbitration_withdraw"] = 809] = "arbitration_withdraw";
    PermissionIndex[PermissionIndex["arbitration_treasury"] = 810] = "arbitration_treasury";
    PermissionIndex[PermissionIndex["user_defined_start"] = 1000] = "user_defined_start";
})(PermissionIndex || (PermissionIndex = {}));
export const PermissionInfo = [
    { index: PermissionIndex.repository, name: 'Repository', description: 'Launch new Repository', module: 'repository' },
    { index: PermissionIndex.repository_description, name: 'Description', description: 'Set Repository description', module: 'repository' },
    { index: PermissionIndex.repository_policy_mode, name: 'Policy mode', description: 'Set Repository policy mode', module: 'repository' },
    { index: PermissionIndex.repository_policies, name: 'Policy', description: 'Add/Remove/Edit Repository policy', module: 'repository' },
    { index: PermissionIndex.repository_policy_description, name: 'Policy Description', description: 'Set Repository policy description', module: 'repository' },
    { index: PermissionIndex.repository_policy_permission, name: 'Policy Permission', description: 'Set Repository policy permission', module: 'repository' },
    { index: PermissionIndex.repository_reference, name: 'Reference', description: 'Set Repository reference', module: 'repository' },
    /*
        {index:PermissionIndex.vote, name:'Vote', description:'Launch new Vote', module: 'vote'},
        {index:PermissionIndex.vote_description, name:'Description', description:'Set Vote description', module: 'vote'},
        {index:PermissionIndex.vote_reference, name:'Reference', description:'Set Vote reference', module: 'vote'},
        {index:PermissionIndex.vote_guard, name:'Guard', description:'Set Vote guards', module: 'vote'},
        {index:PermissionIndex.vote_option, name:'Option', description:'Set Vote options', module: 'vote'},
        {index:PermissionIndex.vote_max_choice_count, name:'Choice count', description:'Set Vote max choice count', module: 'vote'},
        {index:PermissionIndex.vote_open_voting, name:'Open voting', description:'Open voting', module: 'vote'},
        {index:PermissionIndex.vote_lock_deadline, name:'Lock deadline', description:'Set Vote deadline immutable', module: 'vote'},
        {index:PermissionIndex.vote_expand_deadline, name:'Expand deadline', description:'Expand Vote deadline', module: 'vote'},
        {index:PermissionIndex.vote_lock_guard, name:'Lock Guard', description:'Set Vote guards immutable', module: 'vote'},
    */
    { index: PermissionIndex.service, name: 'Service', description: 'Launch new Service', module: 'service' },
    { index: PermissionIndex.service_description, name: 'Description', description: 'Set Service description', module: 'service' },
    { index: PermissionIndex.service_price, name: 'Price', description: 'Set Service item price', module: 'service' },
    { index: PermissionIndex.service_stock, name: 'Inventory', description: 'Set Service item inventory', module: 'service' },
    { index: PermissionIndex.service_payee, name: 'Payee', description: 'Set Service payee', module: 'service' },
    { index: PermissionIndex.service_repository, name: 'Repository', description: 'Set Service repositories', module: 'service' },
    { index: PermissionIndex.service_withdraw_guards, name: 'Withdraw Guard', description: 'Set Service withdraw guards', module: 'service' },
    { index: PermissionIndex.service_refund_guards, name: 'Refund Guard', description: 'Set Service refund guards', module: 'service' },
    { index: PermissionIndex.service_add_sales, name: 'Add sales', description: 'Add sale items for Service', module: 'service' },
    { index: PermissionIndex.service_remove_sales, name: 'Remove sales', description: 'Remove sale items for Service', module: 'service' },
    { index: PermissionIndex.service_discount_transfer, name: 'Discount', description: 'Launch discounts for Service', module: 'service' },
    { index: PermissionIndex.service_withdraw, name: 'Withdraw', description: 'Widthraw from Service orders', module: 'service' },
    { index: PermissionIndex.service_buyer_guard, name: 'Buyer Guard', description: 'Set Guard of buying for Service', module: 'service' },
    { index: PermissionIndex.service_machine, name: 'Machine', description: 'Set Machine for Service', module: 'service' },
    { index: PermissionIndex.service_endpoint, name: 'Endpoint', description: 'Set Service endpoint', module: 'service' },
    { index: PermissionIndex.service_publish, name: 'Publish', description: 'Allowing the creation of Order', module: 'service' },
    { index: PermissionIndex.service_clone, name: 'Clone', description: 'Clone Service', module: 'service' },
    { index: PermissionIndex.service_customer_required, name: 'Buyer info', description: 'Set Service buyer info required', module: 'service' },
    //{index:PermissionIndex.service_change_order_required_pubkey, name:'Order pubkey', description:'Update Serivce order pubkey', module: 'service'},
    { index: PermissionIndex.service_pause, name: 'Pause', description: 'Pause/Unpause Service', module: 'service' },
    { index: PermissionIndex.service_treasury, name: 'Treasury', description: 'Externally withdrawable treasury for compensation or rewards', module: 'service' },
    { index: PermissionIndex.service_arbitration, name: 'Arbitration', description: 'Add/Remove arbitration that allows refunds from orders at any time based on arbitration results', module: 'service' },
    /*
    {index:PermissionIndex.reward, name:'reward', description:'Launch new reward', module: 'reward'},
    {index:PermissionIndex.reward_refund, name:'Refund', description:'Refund from reward', module: 'reward'},
    {index:PermissionIndex.reward_expand_time, name:'Expand deadline', description:'Expand reward deadline', module: 'reward'},
    {index:PermissionIndex.reward_guard, name:'Guard', description:'Set reward guard', module: 'reward'},
    {index:PermissionIndex.reward_description, name:'Description', description:'Set reward description', module: 'reward'},
    {index:PermissionIndex.reward_lock_guards, name:'Lock Guard', description:'Set reward guard immutable', module: 'reward'},
    {index:PermissionIndex.reward_claim_repeatably, name:'Claim repeatably', description:'Allow claimming repeatably', module: 'reward'},
    {index:PermissionIndex.reward_allow_claiming, name:'Allow claiming', description:'Allow claiming', module: 'reward'},
*/
    { index: PermissionIndex.demand, name: 'Demand', description: 'Launch new Demand', module: 'demand' },
    { index: PermissionIndex.demand_refund, name: 'Refund', description: 'Refund from Demand', module: 'demand' },
    { index: PermissionIndex.demand_expand_time, name: 'Expand deadline', description: 'Expand Demand deadline', module: 'demand' },
    { index: PermissionIndex.demand_guard, name: 'Guard', description: 'Set Demand guard', module: 'demand' },
    { index: PermissionIndex.demand_description, name: 'Description', description: 'Set Demand description', module: 'demand' },
    { index: PermissionIndex.demand_yes, name: 'Yes', description: 'Pick the Deamand serice', module: 'demand' },
    { index: PermissionIndex.machine, name: 'Machine', description: 'Launch new Machine', module: 'machine' },
    { index: PermissionIndex.machine_description, name: 'Description', description: 'Set Machine description', module: 'machine' },
    { index: PermissionIndex.machine_repository, name: 'Repository', description: 'Set Machine repository', module: 'machine' },
    { index: PermissionIndex.machine_clone, name: 'Clone', description: 'Clone Machine', module: 'machine' },
    { index: PermissionIndex.machine_node, name: 'Node', description: 'Set Machine nodes', module: 'machine' },
    { index: PermissionIndex.machine_endpoint, name: 'Endpoint', description: 'Set Machine endpoint', module: 'machine' },
    { index: PermissionIndex.machine_pause, name: 'Pause', description: 'Pause/Unpause Machine', module: 'machine' },
    { index: PermissionIndex.machine_publish, name: 'Publish', description: 'Allowing the creation of Progress', module: 'machine' },
    { index: PermissionIndex.progress, name: 'Progress', description: 'Launch new Progress', module: 'progress' },
    { index: PermissionIndex.progress_namedOperator, name: 'Operator', description: 'Set Progress operators', module: 'progress' },
    { index: PermissionIndex.progress_bind_task, name: 'Bind', description: 'Set Progress task', module: 'progress' },
    { index: PermissionIndex.progress_context_repository, name: 'Repository', description: 'Set Progress repository', module: 'progress' },
    { index: PermissionIndex.progress_unhold, name: 'Unhold', description: 'Release Progress holdings', module: 'progress' },
    { index: PermissionIndex.progress_parent, name: 'Parent', description: 'Set Progress parent', module: 'progress' },
    { index: PermissionIndex.treasury, name: 'Treasury', description: 'Launch new Treasury', module: 'treasury' },
    { index: PermissionIndex.treasury_deposit, name: 'Deposit', description: 'Deposit coins', module: 'treasury' },
    { index: PermissionIndex.treasury_receive, name: 'Receive', description: 'Receive coins from some address sent', module: 'treasury' },
    { index: PermissionIndex.treasury_withdraw, name: 'Withdraw', description: 'Withdraw coins', module: 'treasury' },
    { index: PermissionIndex.treasury_withdraw_guard, name: 'Withdraw Guard', description: 'Add/Remove Treasury withdraw guard', module: 'treasury' },
    { index: PermissionIndex.treasury_withdraw_mode, name: 'Withdraw mode', description: 'Set Treasury withdraw mode', module: 'treasury' },
    { index: PermissionIndex.treasury_deposit_guard, name: 'Deposit Guard', description: 'Set Treasury deposit guard', module: 'treasury' },
    { index: PermissionIndex.treasury_descritption, name: 'Description', description: 'Set Treasury description', module: 'treasury' },
    { index: PermissionIndex.arbitration, name: 'Arbitration', description: 'Launch new Arbitration', module: 'arbitration' },
    { index: PermissionIndex.arbitration_description, name: 'Description', description: 'Set Arbitration description', module: 'arbitration' },
    { index: PermissionIndex.arbitration_endpoint, name: 'Endpoint', description: 'Set Arbitration endpoint', module: 'arbitration' },
    { index: PermissionIndex.arbitration_fee, name: 'Fee', description: 'Set Arbitration fee', module: 'arbitration' },
    { index: PermissionIndex.arbitration_guard, name: 'Guard', description: 'Set Guard to apply for arbitration', module: 'arbitration' },
    { index: PermissionIndex.arbitration_arbitration, name: 'Arbitrate', description: 'Determine the outcome of arbitration', module: 'arbitration' },
    { index: PermissionIndex.arbitration_pause, name: 'Pause', description: 'Allowing/forbidding the creation of Arb', module: 'arbitration' },
    { index: PermissionIndex.arbitration_voting_guard, name: 'Voting Guard', description: 'Add/Remove voting Guard', module: 'arbitration' },
    { index: PermissionIndex.arbitration_vote, name: 'Vote', description: 'Vote on the application for arbitration', module: 'arbitration' },
    { index: PermissionIndex.arbitration_withdraw, name: 'Withdraw', description: 'Withdraw the arbitration fee', module: 'arbitration' },
    { index: PermissionIndex.arbitration_treasury, name: 'Withdraw', description: 'Set Treasury that fees was collected at the time of withdrawal', module: 'arbitration' },
];
export class Permission {
    txb;
    object;
    get_object() { return this.object; }
    constructor(txb) {
        this.txb = txb;
        this.object = '';
    }
    static From(txb, object) {
        let p = new Permission(txb);
        p.object = Protocol.TXB_OBJECT(txb, object);
        return p;
    }
    static New(txb, description) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        let p = new Permission(txb);
        p.object = txb.moveCall({
            target: Protocol.Instance().PermissionFn('new'),
            arguments: [txb.pure.string(description)]
        });
        return p;
    }
    launch() {
        return this.txb.moveCall({
            target: Protocol.Instance().PermissionFn('create'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object)]
        });
    }
    add_userdefine(index, name) {
        if (!Permission.IsValidUserDefinedIndex(index)) {
            ERROR(Errors.IsValidUserDefinedIndex, 'add_userdefine');
        }
        if (!IsValidName(name)) {
            ERROR(Errors.IsValidName, 'add_userdefine');
        }
        this.txb.moveCall({
            target: Protocol.Instance().PermissionFn('user_define_add'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u64(index), this.txb.pure.string(name)]
        });
    }
    remove_userdefine(index) {
        if (!Permission.IsValidUserDefinedIndex(index)) {
            ERROR(Errors.IsValidUserDefinedIndex, 'add_userdefine');
        }
        this.txb.moveCall({
            target: Protocol.Instance().PermissionFn('user_define_remove'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u64(index)]
        });
    }
    change_entity(old_entity, new_entity) {
        if (!IsValidAddress(old_entity) || !IsValidAddress(new_entity)) {
            ERROR(Errors.IsValidAddress, 'change_entity');
        }
        this.txb.moveCall({
            target: Protocol.Instance().PermissionFn('change_entity'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(old_entity),
                this.txb.pure.address(new_entity)]
        });
    }
    add_entity2(entities, index) {
        if (entities.length === 0)
            return;
        if (!IsValidArray(entities, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'add_entity2');
        }
        if (index !== undefined) {
            this.txb.moveCall({
                target: Protocol.Instance().PermissionFn('add_with_index'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u64(index),
                    this.txb.pure.vector('address', array_unique(entities))]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().PermissionFn('add'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(entities))]
            });
        }
    }
    add_entity(entities) {
        if (entities.length === 0)
            return;
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
                this.txb.moveCall({
                    target: Protocol.Instance().PermissionFn('add_batch'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(entity.entity_address),
                        this.txb.pure.vector('u64', indexes)]
                });
            }
        }
        // set guards
        guards.forEach(({ entity_address, index, guard }) => {
            this.txb.moveCall({
                target: Protocol.Instance().PermissionFn('guard_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(entity_address),
                    this.txb.pure.u64(index), Protocol.TXB_OBJECT(this.txb, guard)]
            });
        });
    }
    // guard: undefine to set none
    set_guard(entity_address, index, guard) {
        if (!IsValidAddress(entity_address)) {
            ERROR(Errors.IsValidAddress, 'entity_address');
        }
        if (!Permission.IsValidPermissionIndex(index) && !Permission.IsValidUserDefinedIndex(index)) {
            ERROR(Errors.IsValidPermissionIndex, 'index');
        }
        if (guard) {
            this.txb.moveCall({
                target: Protocol.Instance().PermissionFn('guard_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(entity_address),
                    this.txb.pure.u64(index), Protocol.TXB_OBJECT(this.txb, guard)]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().PermissionFn('guard_none'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(entity_address),
                    this.txb.pure.u64(index)]
            });
        }
        ;
    }
    remove_index(entity_address, index) {
        if (!IsValidAddress(entity_address)) {
            ERROR(Errors.IsValidAddress);
        }
        if (index.length === 0)
            return;
        if (!(IsValidArray(index, Permission.IsValidPermissionIndex))) {
            ERROR(Errors.InvalidParam, 'index');
        }
        this.txb.moveCall({
            target: Protocol.Instance().PermissionFn('remove_index'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(entity_address),
                this.txb.pure.vector('u64', array_unique(index))]
        });
    }
    remove_entity(entity_address) {
        if (entity_address.length === 0)
            return;
        if (!IsValidArray(entity_address, IsValidAddress)) {
            ERROR(Errors.IsValidArray);
        }
        this.txb.moveCall({
            target: Protocol.Instance().PermissionFn('remove'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(entity_address))]
        });
    }
    set_description(description) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        this.txb.moveCall({
            target: Protocol.Instance().PermissionFn('description_set'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description)]
        });
    }
    add_admin(admin) {
        if (admin.length === 0)
            return;
        if (!IsValidArray(admin, IsValidAddress)) {
            ERROR(Errors.IsValidArray);
        }
        this.txb.moveCall({
            target: Protocol.Instance().PermissionFn('admin_add_batch'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(admin))]
        });
    }
    remove_admin(admin, removeall) {
        if (!removeall && admin.length === 0)
            return;
        if (!IsValidArray(admin, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'admin');
        }
        if (removeall) {
            this.txb.moveCall({
                target: Protocol.Instance().PermissionFn('admins_clear'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object)]
            });
        }
        else if (admin) {
            this.txb.moveCall({
                target: Protocol.Instance().PermissionFn('admin_remove_batch'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(admin))]
            });
        }
    }
    change_owner(new_owner) {
        if (!IsValidAddress(new_owner)) {
            ERROR(Errors.IsValidAddress);
        }
        this.txb.moveCall({
            target: Protocol.Instance().PermissionFn('builder_set'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(new_owner)]
        });
    }
    // query all permissions for address
    query_permissions_all(address_queried) {
        if (!IsValidAddress(address_queried)) {
            ERROR(Errors.InvalidParam, 'query_permissions');
        }
        this.txb.moveCall({
            target: Protocol.Instance().PermissionFn('query_permissions_all'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(address_queried)]
        });
    }
    QueryPermissions(permission, address_queried, onPermissionAnswer, sender) {
        //@ be the same txb
        this.query_permissions_all(address_queried);
        Protocol.Client().devInspectTransactionBlock({ sender: sender ?? address_queried, transactionBlock: this.txb }).then((res) => {
            if (res.results && res.results[0].returnValues && res.results[0].returnValues.length !== 3) {
                onPermissionAnswer({ who: address_queried, object: permission });
                return;
            }
            const perm = Bcs.getInstance().de(BCS.U8, Uint8Array.from(res.results[0].returnValues[0][0]));
            if (perm === Permission.PERMISSION_ADMIN || perm === Permission.PERMISSION_OWNER_AND_ADMIN) {
                onPermissionAnswer({ who: address_queried, admin: true, owner: perm % 2 === 1, items: [], object: permission });
            }
            else {
                const perms = Bcs.getInstance().de('vector<u64>', Uint8Array.from(res.results[0].returnValues[1][0]));
                const guards = Bcs.getInstance().de_guards(Uint8Array.from(res.results[0].returnValues[2][0]));
                const items = [];
                for (let i = 0; i < perms.length; ++i) {
                    items.push({ query: perms[i], permission: true, guard: guards[i] ? ('0x' + guards[i]) : undefined });
                }
                onPermissionAnswer({ who: address_queried, admin: false, owner: perm % 2 === 1, items: items, object: permission });
            }
        }).catch((e) => {
            console.log(e);
            onPermissionAnswer({ who: address_queried, object: permission });
        });
    }
    static HasPermission(answer, index, bStrict = false) {
        if (answer) {
            if (answer.admin)
                return { has: true, owner: answer.owner }; // admin
            let i = answer.items?.find((v) => v.query == index); // index maybe string, so ==
            if (i) {
                return { has: i.permission, guard: i.guard, owner: answer.owner };
            }
            else {
                return { has: false, guard: undefined, owner: answer?.owner };
            }
        }
        if (bStrict) {
            return { has: false, guard: undefined, owner: false };
        }
        return undefined; // basic: !== false ; otherwise: !
    }
    static MAX_ADMIN_COUNT = 64;
    static MAX_ENTITY_COUNT = 2000;
    static MAX_PERMISSION_INDEX_COUNT = 200;
    static MAX_PERSONAL_PERMISSION_COUNT = 200;
    static PERMISSION_NORMAL = 0;
    static PERMISSION_OWNER = 1;
    static PERMISSION_ADMIN = 2;
    static PERMISSION_OWNER_AND_ADMIN = 3;
    static BUSINESS_PERMISSIONS_START = PermissionIndex.user_defined_start;
    static IsValidUserDefinedIndex = (index) => {
        return index >= Permission.BUSINESS_PERMISSIONS_START && IsValidU64(index);
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
