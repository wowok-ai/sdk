import { Protocol } from './protocol';
import { Machine } from './machine';
import { array_unique, IsValidName, IsValidAddress, IsValidArray, IsValidInt, IsValidDesription, IsValidTokenType } from './utils';
import { ERROR, Errors } from './exception';
export class Progress {
    permission;
    machine;
    object;
    txb;
    get_object() { return this.object; }
    constructor(txb, machine, permission) {
        this.permission = permission;
        this.txb = txb;
        this.machine = machine;
        this.object = '';
    }
    static From(txb, machine, permission, object) {
        let p = new Progress(txb, machine, permission);
        p.object = Protocol.TXB_OBJECT(txb, object);
        return p;
    }
    static New(txb, machine, permission, task, passport) {
        if (!Protocol.IsValidObjects([machine, permission])) {
            ERROR(Errors.IsValidObjects, 'machine & permission');
        }
        let p = new Progress(txb, machine, permission);
        let t = txb.pure.option('address', task ? task : undefined);
        if (passport) {
            p.object = txb.moveCall({
                target: Protocol.Instance().ProgressFn('new_with_passport'),
                arguments: [passport, t, Protocol.TXB_OBJECT(txb, machine), Protocol.TXB_OBJECT(txb, permission)],
            });
        }
        else {
            p.object = txb.moveCall({
                target: Protocol.Instance().ProgressFn('new'),
                arguments: [t, Protocol.TXB_OBJECT(txb, machine), Protocol.TXB_OBJECT(txb, permission)],
            });
        }
        return p;
    }
    launch() {
        return this.txb.moveCall({
            target: Protocol.Instance().ProgressFn('create'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object)],
        });
    }
    launch_as_child(parent, parent_next) {
        if (!Protocol.IsValidObjects([parent])) {
            ERROR(Errors.IsValidObjects, 'parent');
        }
        if (!Progress.IsValidProgressNext(parent_next)) {
            ERROR(Errors.InvalidParam, 'parent_next');
        }
        return this.txb.moveCall({
            target: Protocol.Instance().ProgressFn('create_as_child'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, parent),
                this.txb.pure.string(parent_next.next_node_name), this.txb.pure.string(parent_next.forward)],
        });
    }
    set_namedOperator(name, addresses, passport) {
        if (!IsValidName(name)) {
            ERROR(Errors.IsValidName, 'name');
        }
        if (name === Machine.OPERATOR_ORDER_PAYER) {
            ERROR(Errors.InvalidParam, 'name cannot be ' + Machine.OPERATOR_ORDER_PAYER);
        }
        if (addresses.length > Progress.MAX_NAMED_OPERATOR_COUNT || !IsValidArray(addresses, IsValidAddress)) {
            ERROR(Errors.InvalidParam, 'addresses');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().ProgressFn('namedOperator_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name),
                    this.txb.pure.vector('address', array_unique(addresses)),
                    Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().ProgressFn('namedOperator_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name),
                    this.txb.pure.vector('address', array_unique(addresses)),
                    Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    }
    bind_task(task_address, passport) {
        if (!IsValidAddress(task_address)) {
            ERROR(Errors.IsValidAddress);
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().ProgressFn('task_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.address(task_address), Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().ProgressFn('task_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(task_address),
                    Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    }
    set_context_repository(repository, passport) {
        if (repository && !Protocol.IsValidObjects([repository])) {
            ERROR(Errors.IsValidObjects, 'repository');
        }
        if (passport) {
            if (repository) {
                this.txb.moveCall({
                    target: Protocol.Instance().ProgressFn('context_repository_set_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, repository),
                        Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().ProgressFn('context_repository_none_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                        Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                });
            }
        }
        else {
            if (repository) {
                this.txb.moveCall({
                    target: Protocol.Instance().ProgressFn('context_repository_set'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, repository),
                        Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                });
            }
            else {
                this.txb.moveCall({
                    target: Protocol.Instance().ProgressFn('context_repository_none'),
                    arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
                });
            }
        }
    }
    unhold(next, passport) {
        if (!Progress.IsValidProgressNext(next)) {
            ERROR(Errors.InvalidParam, 'unhold');
        }
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().ProgressFn('unhold_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                    Protocol.TXB_OBJECT(this.txb, this.machine), this.txb.pure.string(next.next_node_name),
                    this.txb.pure.string(next.forward), Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().ProgressFn('unhold'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine),
                    this.txb.pure.string(next.next_node_name), this.txb.pure.string(next.forward),
                    Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            });
        }
    }
    parent_none(passport) {
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().ProgressFn('parent_none_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object),
                    Protocol.TXB_OBJECT(this.txb, this.machine), Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().ProgressFn('parent_none'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    }
    parent(parent, passport) {
        if (!IsValidAddress(parent.parent_id) || !IsValidInt(parent.parent_session_id)) {
            ERROR(Errors.InvalidParam, 'parent');
        }
        if (!parent.next_node || !parent.forward) {
            ERROR(Errors.InvalidParam, 'parent');
        }
        if (passport) {
            this.txb.moveCall({
                target: Protocol.Instance().ProgressFn('parent_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine),
                    this.txb.object(parent.parent_id),
                    this.txb.pure.u64(parent.parent_session_id),
                    this.txb.pure.string(parent.next_node),
                    this.txb.pure.string(parent.forward),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().ProgressFn('parent_set'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine),
                    this.txb.object(parent.parent_id),
                    this.txb.pure.u64(parent.parent_session_id),
                    this.txb.pure.string(parent.next_node),
                    this.txb.pure.string(parent.forward),
                    Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    }
    deliverable(deliverable) {
        if (!IsValidDesription(deliverable.msg)) {
            ERROR(Errors.IsValidDesription, 'deliverable.msg');
        }
        if (deliverable.orders.length > 0 && !Protocol.IsValidObjects(deliverable.orders.map(v => v.object))) {
            ERROR(Errors.IsValidObjects, 'deliverable.orders');
        }
        const d = this.txb.moveCall({
            target: Protocol.Instance().ProgressFn('deliverable_new'),
            arguments: [this.txb.pure.string(deliverable.msg)],
        });
        deliverable.orders.forEach(v => {
            if (!IsValidTokenType(v.pay_token_type)) {
                ERROR(Errors.IsValidTokenType, 'deliverable.orders:' + v.object);
            }
            this.txb.moveCall({
                target: Protocol.Instance().OrderFn('as_deliverable'),
                arguments: [this.txb.object(v.object), d],
                typeArguments: [v.pay_token_type]
            });
        });
        return d;
    }
    next(next, deliverable, passport) {
        if (!Progress.IsValidProgressNext(next)) {
            ERROR(Errors.InvalidParam, 'next');
        }
        const d = this.deliverable(deliverable);
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        if (passport) {
            return this.txb.moveCall({
                target: Protocol.Instance().ProgressFn('next_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine),
                    this.txb.pure.string(next.next_node_name),
                    this.txb.pure.string(next.forward), d,
                    Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            });
        }
        else {
            return this.txb.moveCall({
                target: Protocol.Instance().ProgressFn('next'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), this.txb.pure.string(next.next_node_name),
                    this.txb.pure.string(next.forward), d, Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            });
        }
    }
    hold(next, hold) {
        if (!Progress.IsValidProgressNext(next)) {
            ERROR(Errors.InvalidParam, 'hold');
        }
        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        return this.txb.moveCall({
            target: Protocol.Instance().ProgressFn('hold'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, this.machine), this.txb.pure.string(next.next_node_name),
                this.txb.pure.string(next.forward), this.txb.pure.bool(hold), Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
        });
    }
    static rpc_de_sessions = (session) => {
        let sessions = [];
        session?.fields?.contents?.forEach((v) => {
            var s = { next_node: v.fields.key, holders: [], weights: v.fields.value.fields.weights, threshold: v.fields.value.fields.threshold };
            v.fields.value.fields.forwards.fields.contents.forEach((i) => {
                s.holders.push({ forward: i.fields.key, accomplished: i.fields.value.fields.accomplished, time: i.fields.value.fields.time,
                    who: i.fields.value.fields.who, deliverable: { msg: i.fields.value.fields.msg, orders: i.fields.value.fields.orders ?? [] },
                });
            });
            sessions.push(s);
        });
        return sessions;
    };
    static rpc_de_histories = (fields) => {
        return fields?.map((v) => {
            return Progress.rpc_de_history(v?.data?.content?.fields);
        });
    };
    static rpc_de_history = (data) => {
        return { id: parseInt(data?.name), node: data?.value?.fields?.node, next_node: data?.value?.fields?.next_node,
            sessions: Progress.rpc_de_sessions(data?.value.fields?.session), time: data?.value?.fields?.time
        };
    };
    static MAX_NAMED_OPERATOR_COUNT = 20;
    static MAX_DELEVERABLE_ORDER_COUNT = 20;
    static IsValidProgressNext = (next) => {
        return IsValidName(next.forward) && IsValidName(next.next_node_name);
    };
}
