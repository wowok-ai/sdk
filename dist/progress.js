"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Progress = void 0;
var protocol_1 = require("./protocol");
var machine_1 = require("./machine");
var utils_1 = require("./utils");
var exception_1 = require("./exception");
var Progress = /** @class */ (function () {
    function Progress(txb, machine, permission) {
        this.permission = permission;
        this.txb = txb;
        this.machine = machine;
        this.object = '';
    }
    Progress.prototype.get_object = function () { return this.object; };
    Progress.From = function (txb, machine, permission, object) {
        var p = new Progress(txb, machine, permission);
        p.object = protocol_1.Protocol.TXB_OBJECT(txb, object);
        return p;
    };
    Progress.New = function (txb, machine, permission, task, passport) {
        if (!protocol_1.Protocol.IsValidObjects([machine, permission])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'machine & permission');
        }
        var p = new Progress(txb, machine, permission);
        var t = txb.pure.option('address', task ? task : undefined);
        if (passport) {
            p.object = txb.moveCall({
                target: protocol_1.Protocol.Instance().ProgressFn('new_with_passport'),
                arguments: [passport, t, protocol_1.Protocol.TXB_OBJECT(txb, machine), protocol_1.Protocol.TXB_OBJECT(txb, permission)],
            });
        }
        else {
            p.object = txb.moveCall({
                target: protocol_1.Protocol.Instance().ProgressFn('new'),
                arguments: [t, protocol_1.Protocol.TXB_OBJECT(txb, machine), protocol_1.Protocol.TXB_OBJECT(txb, permission)],
            });
        }
        return p;
    };
    Progress.prototype.launch = function () {
        return this.txb.moveCall({
            target: protocol_1.Protocol.Instance().ProgressFn('create'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object)],
        });
    };
    Progress.prototype.launch_as_child = function (parent, parent_next) {
        if (!protocol_1.Protocol.IsValidObjects([parent])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'parent');
        }
        if (!Progress.IsValidProgressNext(parent_next)) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'parent_next');
        }
        return this.txb.moveCall({
            target: protocol_1.Protocol.Instance().ProgressFn('create_as_child'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, parent),
                this.txb.pure.string(parent_next.next_node_name), this.txb.pure.string(parent_next.forward)],
        });
    };
    Progress.prototype.set_namedOperator = function (name, addresses, passport) {
        if (!(0, utils_1.IsValidName)(name)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName, 'name');
        }
        if (name === machine_1.Machine.OPERATOR_ORDER_PAYER) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'name cannot be ' + machine_1.Machine.OPERATOR_ORDER_PAYER);
        }
        if (addresses.length > Progress.MAX_NAMED_OPERATOR_COUNT || !(0, utils_1.IsValidArray)(addresses, utils_1.IsValidAddress)) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'addresses');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ProgressFn('namedOperator_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name),
                    this.txb.pure.vector('address', (0, utils_1.array_unique)(addresses)),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.machine), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ProgressFn('namedOperator_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name),
                    this.txb.pure.vector('address', (0, utils_1.array_unique)(addresses)),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.machine), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    };
    Progress.prototype.bind_task = function (task_address, passport) {
        if (!(0, utils_1.IsValidAddress)(task_address)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress);
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ProgressFn('task_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.address(task_address), protocol_1.Protocol.TXB_OBJECT(this.txb, this.machine), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ProgressFn('task_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(task_address),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.machine), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    };
    Progress.prototype.set_context_repository = function (repository, passport) {
        if (repository && !protocol_1.Protocol.IsValidObjects([repository])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'repository');
        }
        if (passport) {
            if (repository) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ProgressFn('context_repository_set_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, repository),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.machine), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ProgressFn('context_repository_none_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.machine), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                });
            }
        }
        else {
            if (repository) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ProgressFn('context_repository_set'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, repository),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.machine), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ProgressFn('context_repository_none'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.machine), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                });
            }
        }
    };
    Progress.prototype.unhold = function (next, passport) {
        if (!Progress.IsValidProgressNext(next)) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'unhold');
        }
        var clock = this.txb.sharedObjectRef(protocol_1.Protocol.CLOCK_OBJECT);
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ProgressFn('unhold_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.machine), this.txb.pure.string(next.next_node_name),
                    this.txb.pure.string(next.forward), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ProgressFn('unhold'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.machine),
                    this.txb.pure.string(next.next_node_name), this.txb.pure.string(next.forward),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            });
        }
    };
    Progress.prototype.parent_none = function (passport) {
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ProgressFn('parent_none_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.machine), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ProgressFn('parent_none'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.machine),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    };
    Progress.prototype.parent = function (parent, passport) {
        if (!(0, utils_1.IsValidAddress)(parent.parent_id) || !(0, utils_1.IsValidInt)(parent.parent_session_id)) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'parent');
        }
        if (!parent.next_node || !parent.forward) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'parent');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ProgressFn('parent_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.machine),
                    this.txb.object(parent.parent_id),
                    this.txb.pure.u64(parent.parent_session_id),
                    this.txb.pure.string(parent.next_node),
                    this.txb.pure.string(parent.forward),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ProgressFn('parent_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.machine),
                    this.txb.object(parent.parent_id),
                    this.txb.pure.u64(parent.parent_session_id),
                    this.txb.pure.string(parent.next_node),
                    this.txb.pure.string(parent.forward),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    };
    Progress.prototype.deliverable = function (deliverable) {
        var _this = this;
        if (!(0, utils_1.IsValidDesription)(deliverable.msg)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription, 'deliverable.msg');
        }
        if (deliverable.orders.length > 0 && !protocol_1.Protocol.IsValidObjects(deliverable.orders.map(function (v) { return v.object; }))) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'deliverable.orders');
        }
        var d = this.txb.moveCall({
            target: protocol_1.Protocol.Instance().ProgressFn('deliverable_new'),
            arguments: [this.txb.pure.string(deliverable.msg)],
        });
        deliverable.orders.forEach(function (v) {
            if (!(0, utils_1.IsValidTokenType)(v.pay_token_type)) {
                (0, exception_1.ERROR)(exception_1.Errors.IsValidTokenType, 'deliverable.orders:' + v.object);
            }
            _this.txb.moveCall({
                target: protocol_1.Protocol.Instance().OrderFn('as_deliverable'),
                arguments: [_this.txb.object(v.object), d],
                typeArguments: [v.pay_token_type]
            });
        });
        return d;
    };
    Progress.prototype.next = function (next, deliverable, passport) {
        if (!Progress.IsValidProgressNext(next)) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'next');
        }
        var d = this.deliverable(deliverable);
        var clock = this.txb.sharedObjectRef(protocol_1.Protocol.CLOCK_OBJECT);
        if (passport) {
            return this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ProgressFn('next_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.machine),
                    this.txb.pure.string(next.next_node_name),
                    this.txb.pure.string(next.forward), d,
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            });
        }
        else {
            return this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ProgressFn('next'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.machine), this.txb.pure.string(next.next_node_name),
                    this.txb.pure.string(next.forward), d, protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
            });
        }
    };
    Progress.prototype.hold = function (next, hold) {
        if (!Progress.IsValidProgressNext(next)) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'hold');
        }
        var clock = this.txb.sharedObjectRef(protocol_1.Protocol.CLOCK_OBJECT);
        return this.txb.moveCall({
            target: protocol_1.Protocol.Instance().ProgressFn('hold'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.machine), this.txb.pure.string(next.next_node_name),
                this.txb.pure.string(next.forward), this.txb.pure.bool(hold), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission), this.txb.object(clock)],
        });
    };
    Progress.rpc_de_sessions = function (session) {
        var _a, _b;
        var sessions = [];
        (_b = (_a = session === null || session === void 0 ? void 0 : session.fields) === null || _a === void 0 ? void 0 : _a.contents) === null || _b === void 0 ? void 0 : _b.forEach(function (v) {
            var s = { next_node: v.fields.key, holders: [], weights: v.fields.value.fields.weights, threshold: v.fields.value.fields.threshold };
            v.fields.value.fields.forwards.fields.contents.forEach(function (i) {
                var _a;
                s.holders.push({ forward: i.fields.key, accomplished: i.fields.value.fields.accomplished, time: i.fields.value.fields.time,
                    who: i.fields.value.fields.who, deliverable: { msg: i.fields.value.fields.msg, orders: (_a = i.fields.value.fields.orders) !== null && _a !== void 0 ? _a : [] },
                });
            });
            sessions.push(s);
        });
        return sessions;
    };
    Progress.rpc_de_histories = function (fields) {
        return fields === null || fields === void 0 ? void 0 : fields.map(function (v) {
            var _a, _b;
            return Progress.rpc_de_history((_b = (_a = v === null || v === void 0 ? void 0 : v.data) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.fields);
        });
    };
    Progress.rpc_de_history = function (data) {
        var _a, _b, _c, _d, _e, _f, _g;
        return { id: parseInt(data === null || data === void 0 ? void 0 : data.name), node: (_b = (_a = data === null || data === void 0 ? void 0 : data.value) === null || _a === void 0 ? void 0 : _a.fields) === null || _b === void 0 ? void 0 : _b.node, next_node: (_d = (_c = data === null || data === void 0 ? void 0 : data.value) === null || _c === void 0 ? void 0 : _c.fields) === null || _d === void 0 ? void 0 : _d.next_node,
            sessions: Progress.rpc_de_sessions((_e = data === null || data === void 0 ? void 0 : data.value.fields) === null || _e === void 0 ? void 0 : _e.session), time: (_g = (_f = data === null || data === void 0 ? void 0 : data.value) === null || _f === void 0 ? void 0 : _f.fields) === null || _g === void 0 ? void 0 : _g.time
        };
    };
    Progress.MAX_NAMED_OPERATOR_COUNT = 20;
    Progress.MAX_DELEVERABLE_ORDER_COUNT = 20;
    Progress.IsValidProgressNext = function (next) {
        return (0, utils_1.IsValidName)(next.forward) && (0, utils_1.IsValidName)(next.next_node_name);
    };
    return Progress;
}());
exports.Progress = Progress;
