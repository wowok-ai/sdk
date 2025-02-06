import { Protocol } from './protocol';
import { IsValidInt, Bcs, array_unique, IsValidArray, IsValidAddress, IsValidName, IsValidName_AllowEmpty, IsValidEndpoint, IsValidDesription, IsValidU64, IsValidTokenType } from './utils';
import { Permission } from './permission';
import { Errors, ERROR } from './exception';
export class Machine {
    txb;
    object;
    permission;
    get_object() { return this.object; }
    static From(txb, permission, object) {
        let d = new Machine(txb, permission);
        d.object = Protocol.TXB_OBJECT(txb, object);
        return d;
    }
    constructor(txb, permission) {
        this.txb = txb;
        this.permission = permission;
        this.object = '';
    }
    static New(txb, permission, description, endpoint, passport) {
        if (!Protocol.IsValidObjects([permission])) {
            ERROR(Errors.IsValidObjects, 'permission');
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        if (endpoint && !IsValidEndpoint(endpoint)) {
            ERROR(Errors.IsValidEndpoint);
        }
        let m = new Machine(txb, permission);
        let ep = txb.pure.option('string', endpoint ? endpoint : undefined);
        if (passport) {
            m.object = txb.moveCall({
                target: Protocol.Instance().MachineFn('new_with_passport'),
                arguments: [passport, txb.pure.string(description), ep, Protocol.TXB_OBJECT(txb, permission)],
            });
        }
        else {
            m.object = txb.moveCall({
                target: Protocol.Instance().MachineFn('new'),
                arguments: [txb.pure.string(description), ep, Protocol.TXB_OBJECT(txb, permission)],
            });
        }
        return m;
    }
    // create new nodes for machine
    add_node(nodes, passport) {
        if (nodes.length === 0)
            return;
        let bValid = true;
        nodes.forEach((node) => {
            if (!IsValidName(node.name)) {
                bValid = false;
            }
            node.pairs.forEach((p) => {
                if (!IsValidName_AllowEmpty(p.prior_node)) {
                    bValid = false;
                }
                if (p?.threshold && !IsValidInt(p.threshold)) {
                    bValid = false;
                }
                p.forwards.forEach((f) => {
                    if (Machine.checkValidForward(f) !== '')
                        bValid = false;
                });
            });
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'add_node');
        }
        let new_nodes = [];
        nodes.forEach((node) => {
            let n = this.txb.moveCall({
                target: Protocol.Instance().MachineFn('node_new'),
                arguments: [this.txb.pure.string(node.name)]
            });
            node.pairs.forEach((pair) => {
                let threshold = this.txb.pure.option('u32', pair?.threshold);
                pair.forwards.forEach((forward) => {
                    this.txb.moveCall({
                        target: Protocol.Instance().MachineFn('forward_add'),
                        arguments: [n, this.txb.pure.string(pair.prior_node), this.txb.pure.string(forward.name), threshold, this.forward(forward)]
                    });
                });
                if (pair.forwards.length === 0) {
                    this.txb.moveCall({
                        target: Protocol.Instance().MachineFn('forward_add_none'),
                        arguments: [n, this.txb.pure.string(pair.prior_node), threshold]
                    });
                }
            });
            new_nodes.push(n);
        });
        this.add_node2(new_nodes, passport);
    }
    forward(forward) {
        let weight = forward?.weight ? forward.weight : 1;
        let f;
        // namedOperator first.
        if (forward?.namedOperator && IsValidName(forward.namedOperator)) {
            if (forward?.guard) {
                f = this.txb.moveCall({
                    target: Protocol.Instance().MachineFn('forward'),
                    arguments: [this.txb.pure.string(forward.namedOperator), this.txb.pure.u16(weight), this.txb.object(Protocol.TXB_OBJECT(this.txb, forward.guard))]
                });
            }
            else {
                f = this.txb.moveCall({
                    target: Protocol.Instance().MachineFn('forward2'),
                    arguments: [this.txb.pure.string(forward.namedOperator), this.txb.pure.u16(weight)]
                });
            }
        }
        else if (forward?.permission !== undefined && IsValidU64(forward.permission)) {
            if (forward?.guard) {
                f = this.txb.moveCall({
                    target: Protocol.Instance().MachineFn('forward3'),
                    arguments: [this.txb.pure.u64(forward.permission), this.txb.pure.u16(weight), this.txb.object(Protocol.TXB_OBJECT(this.txb, forward.guard))]
                });
            }
            else {
                f = this.txb.moveCall({
                    target: Protocol.Instance().MachineFn('forward4'),
                    arguments: [this.txb.pure.u64(forward.permission), this.txb.pure.u16(weight)]
                });
            }
        }
        else {
            ERROR(Errors.InvalidParam, 'forward');
        }
        forward?.suppliers?.forEach((v) => {
            if (!IsValidTokenType(v.pay_token_type)) {
                ERROR(Errors.IsValidTokenType, 'forward.suppliers:' + v.object);
            }
            this.txb.moveCall({
                target: Protocol.Instance().ServiceFn('add_to'),
                arguments: [this.txb.object(v.object), this.txb.pure.bool(v.bOptional), f],
                typeArguments: [v.pay_token_type]
            });
        });
        return f;
    }
    // move MachineNodeObject to the machine from signer-owned MachineNode object 
    add_node2(nodes, passport) {
        if (nodes.length === 0)
            return;
        let n = nodes.map((v) => Protocol.TXB_OBJECT(this.txb, v));
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().MachineFn('node_add_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.makeMoveVec({ elements: n }), Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().MachineFn('node_add'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.makeMoveVec({ elements: n }), Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
    }
    fetch_node(node_name, passport) {
        if (!IsValidName(node_name)) {
            ERROR(Errors.IsValidName, 'fetch_node');
        }
        if (passport) {
            return this.txb.moveCall({
                target: Protocol.Instance().MachineFn('node_fetch_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node_name),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            return this.txb.moveCall({
                target: Protocol.Instance().MachineFn('node_fetch'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node_name), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    }
    rename_node(node_name, new_name, passport) {
        if (node_name === new_name)
            return;
        if (!IsValidName(node_name))
            ERROR(Errors.IsValidName, 'rename_node');
        if (!IsValidName(new_name))
            ERROR(Errors.IsValidName, 'rename_node');
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().MachineFn('node_rename_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.string(node_name), this.txb.pure.string(new_name),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().MachineFn('node_rename'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.string(node_name), this.txb.pure.string(new_name),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    }
    // move MachineNodeObject from  this.object to signer-owned MachineNode object 
    remove_node(nodes_name, bTransferMyself = false, passport) {
        if (nodes_name.length === 0)
            return;
        if (!IsValidArray(nodes_name, IsValidName)) {
            ERROR(Errors.IsValidArray, 'nodes_name');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().MachineFn('node_remove_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', nodes_name),
                    this.txb.pure.bool(bTransferMyself), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().MachineFn('node_remove'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', nodes_name),
                    this.txb.pure.bool(bTransferMyself), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    }
    launch() {
        return this.txb.moveCall({
            target: Protocol.Instance().MachineFn('create'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object)],
        });
    }
    set_description(description, passport) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().MachineFn('description_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().MachineFn('description_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    }
    add_repository(repository, passport) {
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().MachineFn('repository_add_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, repository), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().MachineFn('repository_add'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, repository), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    }
    remove_repository(repositories, removeall, passport) {
        if (!removeall && repositories.length === 0) {
            return;
        }
        if (!IsValidArray(repositories, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'remove_repository');
        }
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target: Protocol.Instance().MachineFn('repository_remove_all_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.object)],
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().MachineFn('repository_remove_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(repositories)),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                });
            }
        }
        else {
            if (removeall) {
                this.txb.moveCall({
                    target: Protocol.Instance().MachineFn('repository_remove_all'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().MachineFn('repository_remove'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', array_unique(repositories)),
                        Protocol.TXB_OBJECT(this.txb, this.permission)],
                });
            }
        }
    }
    clone(passport) {
        if (passport) {
            return this.txb.moveCall({
                target: Protocol.Instance().MachineFn('clone_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            return this.txb.moveCall({
                target: Protocol.Instance().MachineFn('clone'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    }
    set_endpoint(endpoint, passport) {
        if (endpoint && !IsValidEndpoint(endpoint)) {
            ERROR(Errors.IsValidEndpoint);
        }
        let ep = this.txb.pure.option('string', endpoint ? endpoint : undefined);
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().MachineFn('endpoint_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), ep, Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().MachineFn('endpoint_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), ep, Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    }
    pause(bPaused, passport) {
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().MachineFn('pause_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(bPaused), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().MachineFn('pause'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(bPaused), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    }
    publish(passport) {
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().MachineFn('publish_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().MachineFn('publish'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    }
    change_permission(new_permission) {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects, 'new_permission');
        }
        this.txb.moveCall({
            target: Protocol.Instance().MachineFn('permission_set'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.permission), Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments: []
        });
        this.permission = new_permission;
    }
    add_forward(node_prior, node_name, foward, threshold, old_forward_name, passport) {
        if (!IsValidName_AllowEmpty(node_prior))
            ERROR(Errors.IsValidName_AllowEmpty, 'add_forward');
        if (!IsValidName(node_name))
            ERROR(Errors.IsValidName, 'add_forward');
        const err = Machine.checkValidForward(foward);
        if (err)
            ERROR(Errors.InvalidParam, err);
        let n;
        if (passport) {
            n = this.txb.moveCall({
                target: Protocol.Instance().MachineFn('node_fetch_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node_name), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            n = this.txb.moveCall({
                target: Protocol.Instance().MachineFn('node_fetch'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node_name), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        const f = this.forward(foward);
        const t = this.txb.pure.option('u32', threshold);
        this.txb.moveCall({
            target: Protocol.Instance().MachineFn('forward_add'),
            arguments: [n, this.txb.pure.string(node_prior), this.txb.pure.string(foward.name), t, f],
        });
        if (old_forward_name && old_forward_name !== foward.name) {
            this.txb.moveCall({
                target: Protocol.Instance().MachineFn('forward_remove'),
                arguments: [n, this.txb.pure.string(node_prior), this.txb.pure.string(old_forward_name)],
            });
        }
        this.add_node2([n], passport);
    }
    remove_pair(node_prior, node_name, passport) {
        if (!IsValidName_AllowEmpty(node_prior))
            ERROR(Errors.IsValidName_AllowEmpty, 'remove_pair');
        if (!IsValidName(node_name))
            ERROR(Errors.IsValidName, 'remove_pair');
        let n;
        if (passport) {
            n = this.txb.moveCall({
                target: Protocol.Instance().MachineFn('node_fetch_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node_name), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            n = this.txb.moveCall({
                target: Protocol.Instance().MachineFn('node_fetch'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node_name), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        this.txb.moveCall({
            target: Protocol.Instance().MachineFn('pair_remove'),
            arguments: [n, this.txb.pure.string(node_prior)],
        });
        this.add_node2([n], passport);
    }
    remove_forward(node_prior, node_name, foward_name, passport) {
        if (!IsValidName_AllowEmpty(node_prior))
            ERROR(Errors.IsValidName_AllowEmpty, 'remove_forward');
        if (!IsValidName(node_name))
            ERROR(Errors.IsValidName, 'remove_forward');
        let n;
        if (passport) {
            n = this.txb.moveCall({
                target: Protocol.Instance().MachineFn('node_fetch_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node_name), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            n = this.txb.moveCall({
                target: Protocol.Instance().MachineFn('node_fetch'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node_name), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        this.txb.moveCall({
            target: Protocol.Instance().MachineFn('forward_remove'),
            arguments: [n, this.txb.pure.string(node_prior), this.txb.pure.string(foward_name)],
        });
        this.add_node2([n], passport);
    }
    static rpc_de_nodes(fields) {
        const machine_nodes = [];
        fields.forEach((n) => {
            machine_nodes.push({ name: n.data.content.fields.name, pairs: Machine.rpc_de_pair(n?.data.content.fields.value) });
        });
        return machine_nodes;
    }
    static rpc_de_pair(data) {
        let pairs = [];
        data.fields.value.fields.contents.forEach((p) => {
            let forwards = [];
            p.fields.value.fields.forwards.fields.contents.forEach((f) => {
                let forward_name = f.fields.key;
                let forward_weight = f.fields.value.fields.weight;
                let forward_guard = f.fields.value.fields.guard;
                let forward_namedOperator = f.fields.value.fields.namedOperator;
                let forward_permission_index = f.fields.value.fields.permission_index;
                forwards.push({ name: forward_name, namedOperator: forward_namedOperator, permission: forward_permission_index,
                    weight: forward_weight, guard: forward_guard ? forward_guard : '', suppliers: f.fields.value.fields.suppliers.fields.contents.map((v) => {
                        return { object: v.fields.key, bOptional: v.fields.value, pay_token_type: '' };
                    }) }); //@ NOTICE...
            });
            pairs.push({ prior_node: p.fields.key, threshold: p.fields.value.fields.threshold, forwards: forwards });
        });
        return pairs;
    }
    static namedOperators(nodes) {
        let ret = [];
        nodes.forEach((v) => {
            v.pairs.forEach((i) => {
                i.forwards.forEach((k) => {
                    if (k?.namedOperator && !ret.find((x) => x === k.namedOperator)) {
                        ret.push(k.namedOperator);
                    }
                });
            });
        });
        return ret;
    }
    static checkValidForward(forward) {
        if (!IsValidName(forward.name))
            return 'Forward name invalid';
        if (forward?.namedOperator && !IsValidName_AllowEmpty(forward?.namedOperator))
            return 'Progress Operator invalid';
        if (forward?.permission && !Permission.IsValidPermissionIndex(forward?.permission))
            return 'Permission index invalid';
        if (!forward?.permission && !forward?.namedOperator)
            return 'Business-Permissions invalid';
        if (forward?.weight && !IsValidU64(forward.weight))
            return 'Weight invalid';
        return '';
    }
    QueryForwardGuard(sender, node, prior_node, forward, onGuard) {
        if (!node || !forward) { // prior_node maybe ''
            ERROR(Errors.InvalidParam, 'QueryForwardGuard');
            return;
        }
        this.txb.moveCall({
            target: Protocol.Instance().MachineFn('query_guard'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node),
                this.txb.pure.string(prior_node), this.txb.pure.string(forward)],
        });
        Protocol.Client().devInspectTransactionBlock({ sender: sender, transactionBlock: this.txb }).then((res) => {
            if (res.results?.length === 1 && res.results[0].returnValues?.length === 1) {
                const guard = Bcs.getInstance().de('Option<address>', Uint8Array.from(res.results[0].returnValues[0][0]));
                onGuard({ node: node, prior_node: prior_node, forward: forward, guard: guard?.some ? ('0x' + guard?.some) : '', txb: this.txb });
            }
        }).catch(e => {
            console.log(e);
        });
    }
    static INITIAL_NODE_NAME = '';
    static OPERATOR_ORDER_PAYER = 'OrderPayer';
}
