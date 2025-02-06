"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Machine = void 0;
var protocol_1 = require("./protocol");
var utils_1 = require("./utils");
var permission_1 = require("./permission");
var exception_1 = require("./exception");
var Machine = /** @class */ (function () {
    function Machine(txb, permission) {
        this.txb = txb;
        this.permission = permission;
        this.object = '';
    }
    Machine.prototype.get_object = function () { return this.object; };
    Machine.From = function (txb, permission, object) {
        var d = new Machine(txb, permission);
        d.object = protocol_1.Protocol.TXB_OBJECT(txb, object);
        return d;
    };
    Machine.New = function (txb, permission, description, endpoint, passport) {
        if (!protocol_1.Protocol.IsValidObjects([permission])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'permission');
        }
        if (!(0, utils_1.IsValidDesription)(description)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription);
        }
        if (endpoint && !(0, utils_1.IsValidEndpoint)(endpoint)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidEndpoint);
        }
        var m = new Machine(txb, permission);
        var ep = txb.pure.option('string', endpoint ? endpoint : undefined);
        if (passport) {
            m.object = txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('new_with_passport'),
                arguments: [passport, txb.pure.string(description), ep, protocol_1.Protocol.TXB_OBJECT(txb, permission)],
            });
        }
        else {
            m.object = txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('new'),
                arguments: [txb.pure.string(description), ep, protocol_1.Protocol.TXB_OBJECT(txb, permission)],
            });
        }
        return m;
    };
    // create new nodes for machine
    Machine.prototype.add_node = function (nodes, passport) {
        var _this = this;
        if (nodes.length === 0)
            return;
        var bValid = true;
        nodes.forEach(function (node) {
            if (!(0, utils_1.IsValidName)(node.name)) {
                bValid = false;
            }
            node.pairs.forEach(function (p) {
                if (!(0, utils_1.IsValidName_AllowEmpty)(p.prior_node)) {
                    bValid = false;
                }
                if ((p === null || p === void 0 ? void 0 : p.threshold) && !(0, utils_1.IsValidInt)(p.threshold)) {
                    bValid = false;
                }
                p.forwards.forEach(function (f) {
                    if (Machine.checkValidForward(f) !== '')
                        bValid = false;
                });
            });
        });
        if (!bValid) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'add_node');
        }
        var new_nodes = [];
        nodes.forEach(function (node) {
            var n = _this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('node_new'),
                arguments: [_this.txb.pure.string(node.name)]
            });
            node.pairs.forEach(function (pair) {
                var threshold = _this.txb.pure.option('u32', pair === null || pair === void 0 ? void 0 : pair.threshold);
                pair.forwards.forEach(function (forward) {
                    _this.txb.moveCall({
                        target: protocol_1.Protocol.Instance().MachineFn('forward_add'),
                        arguments: [n, _this.txb.pure.string(pair.prior_node), _this.txb.pure.string(forward.name), threshold, _this.forward(forward)]
                    });
                });
                if (pair.forwards.length === 0) {
                    _this.txb.moveCall({
                        target: protocol_1.Protocol.Instance().MachineFn('forward_add_none'),
                        arguments: [n, _this.txb.pure.string(pair.prior_node), threshold]
                    });
                }
            });
            new_nodes.push(n);
        });
        this.add_node2(new_nodes, passport);
    };
    Machine.prototype.forward = function (forward) {
        var _this = this;
        var _a;
        var weight = (forward === null || forward === void 0 ? void 0 : forward.weight) ? forward.weight : 1;
        var f;
        // namedOperator first.
        if ((forward === null || forward === void 0 ? void 0 : forward.namedOperator) && (0, utils_1.IsValidName)(forward.namedOperator)) {
            if (forward === null || forward === void 0 ? void 0 : forward.guard) {
                f = this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().MachineFn('forward'),
                    arguments: [this.txb.pure.string(forward.namedOperator), this.txb.pure.u16(weight), this.txb.object(protocol_1.Protocol.TXB_OBJECT(this.txb, forward.guard))]
                });
            }
            else {
                f = this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().MachineFn('forward2'),
                    arguments: [this.txb.pure.string(forward.namedOperator), this.txb.pure.u16(weight)]
                });
            }
        }
        else if ((forward === null || forward === void 0 ? void 0 : forward.permission) !== undefined && (0, utils_1.IsValidU64)(forward.permission)) {
            if (forward === null || forward === void 0 ? void 0 : forward.guard) {
                f = this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().MachineFn('forward3'),
                    arguments: [this.txb.pure.u64(forward.permission), this.txb.pure.u16(weight), this.txb.object(protocol_1.Protocol.TXB_OBJECT(this.txb, forward.guard))]
                });
            }
            else {
                f = this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().MachineFn('forward4'),
                    arguments: [this.txb.pure.u64(forward.permission), this.txb.pure.u16(weight)]
                });
            }
        }
        else {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'forward');
        }
        (_a = forward === null || forward === void 0 ? void 0 : forward.suppliers) === null || _a === void 0 ? void 0 : _a.forEach(function (v) {
            if (!(0, utils_1.IsValidTokenType)(v.pay_token_type)) {
                (0, exception_1.ERROR)(exception_1.Errors.IsValidTokenType, 'forward.suppliers:' + v.object);
            }
            _this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ServiceFn('add_to'),
                arguments: [_this.txb.object(v.object), _this.txb.pure.bool(v.bOptional), f],
                typeArguments: [v.pay_token_type]
            });
        });
        return f;
    };
    // move MachineNodeObject to the machine from signer-owned MachineNode object 
    Machine.prototype.add_node2 = function (nodes, passport) {
        var _this = this;
        if (nodes.length === 0)
            return;
        var n = nodes.map(function (v) { return protocol_1.Protocol.TXB_OBJECT(_this.txb, v); });
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('node_add_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.makeMoveVec({ elements: n }), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('node_add'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.makeMoveVec({ elements: n }), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)]
            });
        }
    };
    Machine.prototype.fetch_node = function (node_name, passport) {
        if (!(0, utils_1.IsValidName)(node_name)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName, 'fetch_node');
        }
        if (passport) {
            return this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('node_fetch_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node_name),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            return this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('node_fetch'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node_name), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    };
    Machine.prototype.rename_node = function (node_name, new_name, passport) {
        if (node_name === new_name)
            return;
        if (!(0, utils_1.IsValidName)(node_name))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName, 'rename_node');
        if (!(0, utils_1.IsValidName)(new_name))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName, 'rename_node');
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('node_rename_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.string(node_name), this.txb.pure.string(new_name),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('node_rename'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.pure.string(node_name), this.txb.pure.string(new_name),
                    protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    };
    // move MachineNodeObject from  this.object to signer-owned MachineNode object 
    Machine.prototype.remove_node = function (nodes_name, bTransferMyself, passport) {
        if (bTransferMyself === void 0) { bTransferMyself = false; }
        if (nodes_name.length === 0)
            return;
        if (!(0, utils_1.IsValidArray)(nodes_name, utils_1.IsValidName)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'nodes_name');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('node_remove_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', nodes_name),
                    this.txb.pure.bool(bTransferMyself), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('node_remove'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', nodes_name),
                    this.txb.pure.bool(bTransferMyself), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    };
    Machine.prototype.launch = function () {
        return this.txb.moveCall({
            target: protocol_1.Protocol.Instance().MachineFn('create'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object)],
        });
    };
    Machine.prototype.set_description = function (description, passport) {
        if (!(0, utils_1.IsValidDesription)(description)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription);
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('description_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('description_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    };
    Machine.prototype.add_repository = function (repository, passport) {
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('repository_add_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, repository), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('repository_add'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, repository), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    };
    Machine.prototype.remove_repository = function (repositories, removeall, passport) {
        if (!removeall && repositories.length === 0) {
            return;
        }
        if (!(0, utils_1.IsValidArray)(repositories, utils_1.IsValidAddress)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'remove_repository');
        }
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().MachineFn('repository_remove_all_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.object)],
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().MachineFn('repository_remove_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', (0, utils_1.array_unique)(repositories)),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                });
            }
        }
        else {
            if (removeall) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().MachineFn('repository_remove_all'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().MachineFn('repository_remove'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', (0, utils_1.array_unique)(repositories)),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                });
            }
        }
    };
    Machine.prototype.clone = function (passport) {
        if (passport) {
            return this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('clone_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            return this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('clone'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    };
    Machine.prototype.set_endpoint = function (endpoint, passport) {
        if (endpoint && !(0, utils_1.IsValidEndpoint)(endpoint)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidEndpoint);
        }
        var ep = this.txb.pure.option('string', endpoint ? endpoint : undefined);
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('endpoint_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), ep, protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('endpoint_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), ep, protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    };
    Machine.prototype.pause = function (bPaused, passport) {
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('pause_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(bPaused), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('pause'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(bPaused), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    };
    Machine.prototype.publish = function (passport) {
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('publish_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('publish'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
    };
    Machine.prototype.change_permission = function (new_permission) {
        if (!protocol_1.Protocol.IsValidObjects([new_permission])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'new_permission');
        }
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().MachineFn('permission_set'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission), protocol_1.Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments: []
        });
        this.permission = new_permission;
    };
    Machine.prototype.add_forward = function (node_prior, node_name, foward, threshold, old_forward_name, passport) {
        if (!(0, utils_1.IsValidName_AllowEmpty)(node_prior))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName_AllowEmpty, 'add_forward');
        if (!(0, utils_1.IsValidName)(node_name))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName, 'add_forward');
        var err = Machine.checkValidForward(foward);
        if (err)
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, err);
        var n;
        if (passport) {
            n = this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('node_fetch_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node_name), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            n = this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('node_fetch'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node_name), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        var f = this.forward(foward);
        var t = this.txb.pure.option('u32', threshold);
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().MachineFn('forward_add'),
            arguments: [n, this.txb.pure.string(node_prior), this.txb.pure.string(foward.name), t, f],
        });
        if (old_forward_name && old_forward_name !== foward.name) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('forward_remove'),
                arguments: [n, this.txb.pure.string(node_prior), this.txb.pure.string(old_forward_name)],
            });
        }
        this.add_node2([n], passport);
    };
    Machine.prototype.remove_pair = function (node_prior, node_name, passport) {
        if (!(0, utils_1.IsValidName_AllowEmpty)(node_prior))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName_AllowEmpty, 'remove_pair');
        if (!(0, utils_1.IsValidName)(node_name))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName, 'remove_pair');
        var n;
        if (passport) {
            n = this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('node_fetch_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node_name), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            n = this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('node_fetch'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node_name), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().MachineFn('pair_remove'),
            arguments: [n, this.txb.pure.string(node_prior)],
        });
        this.add_node2([n], passport);
    };
    Machine.prototype.remove_forward = function (node_prior, node_name, foward_name, passport) {
        if (!(0, utils_1.IsValidName_AllowEmpty)(node_prior))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName_AllowEmpty, 'remove_forward');
        if (!(0, utils_1.IsValidName)(node_name))
            (0, exception_1.ERROR)(exception_1.Errors.IsValidName, 'remove_forward');
        var n;
        if (passport) {
            n = this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('node_fetch_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node_name), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        else {
            n = this.txb.moveCall({
                target: protocol_1.Protocol.Instance().MachineFn('node_fetch'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node_name), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
            });
        }
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().MachineFn('forward_remove'),
            arguments: [n, this.txb.pure.string(node_prior), this.txb.pure.string(foward_name)],
        });
        this.add_node2([n], passport);
    };
    Machine.rpc_de_nodes = function (fields) {
        var machine_nodes = [];
        fields.forEach(function (n) {
            machine_nodes.push({ name: n.data.content.fields.name, pairs: Machine.rpc_de_pair(n === null || n === void 0 ? void 0 : n.data.content.fields.value) });
        });
        return machine_nodes;
    };
    Machine.rpc_de_pair = function (data) {
        var pairs = [];
        data.fields.value.fields.contents.forEach(function (p) {
            var forwards = [];
            p.fields.value.fields.forwards.fields.contents.forEach(function (f) {
                var forward_name = f.fields.key;
                var forward_weight = f.fields.value.fields.weight;
                var forward_guard = f.fields.value.fields.guard;
                var forward_namedOperator = f.fields.value.fields.namedOperator;
                var forward_permission_index = f.fields.value.fields.permission_index;
                forwards.push({ name: forward_name, namedOperator: forward_namedOperator, permission: forward_permission_index,
                    weight: forward_weight, guard: forward_guard ? forward_guard : '', suppliers: f.fields.value.fields.suppliers.fields.contents.map(function (v) {
                        return { object: v.fields.key, bOptional: v.fields.value, pay_token_type: '' };
                    }) }); //@ NOTICE...
            });
            pairs.push({ prior_node: p.fields.key, threshold: p.fields.value.fields.threshold, forwards: forwards });
        });
        return pairs;
    };
    Machine.namedOperators = function (nodes) {
        var ret = [];
        nodes.forEach(function (v) {
            v.pairs.forEach(function (i) {
                i.forwards.forEach(function (k) {
                    if ((k === null || k === void 0 ? void 0 : k.namedOperator) && !ret.find(function (x) { return x === k.namedOperator; })) {
                        ret.push(k.namedOperator);
                    }
                });
            });
        });
        return ret;
    };
    Machine.checkValidForward = function (forward) {
        if (!(0, utils_1.IsValidName)(forward.name))
            return 'Forward name invalid';
        if ((forward === null || forward === void 0 ? void 0 : forward.namedOperator) && !(0, utils_1.IsValidName_AllowEmpty)(forward === null || forward === void 0 ? void 0 : forward.namedOperator))
            return 'Progress Operator invalid';
        if ((forward === null || forward === void 0 ? void 0 : forward.permission) && !permission_1.Permission.IsValidPermissionIndex(forward === null || forward === void 0 ? void 0 : forward.permission))
            return 'Permission index invalid';
        if (!(forward === null || forward === void 0 ? void 0 : forward.permission) && !(forward === null || forward === void 0 ? void 0 : forward.namedOperator))
            return 'Business-Permissions invalid';
        if ((forward === null || forward === void 0 ? void 0 : forward.weight) && !(0, utils_1.IsValidU64)(forward.weight))
            return 'Weight invalid';
        return '';
    };
    Machine.prototype.QueryForwardGuard = function (sender, node, prior_node, forward, onGuard) {
        var _this = this;
        if (!node || !forward) { // prior_node maybe ''
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'QueryForwardGuard');
            return;
        }
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().MachineFn('query_guard'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(node),
                this.txb.pure.string(prior_node), this.txb.pure.string(forward)],
        });
        protocol_1.Protocol.Client().devInspectTransactionBlock({ sender: sender, transactionBlock: this.txb }).then(function (res) {
            var _a, _b;
            if (((_a = res.results) === null || _a === void 0 ? void 0 : _a.length) === 1 && ((_b = res.results[0].returnValues) === null || _b === void 0 ? void 0 : _b.length) === 1) {
                var guard = utils_1.Bcs.getInstance().de('Option<address>', Uint8Array.from(res.results[0].returnValues[0][0]));
                onGuard({ node: node, prior_node: prior_node, forward: forward, guard: (guard === null || guard === void 0 ? void 0 : guard.some) ? ('0x' + (guard === null || guard === void 0 ? void 0 : guard.some)) : '', txb: _this.txb });
            }
        }).catch(function (e) {
            console.log(e);
        });
    };
    Machine.INITIAL_NODE_NAME = '';
    Machine.OPERATOR_ORDER_PAYER = 'OrderPayer';
    return Machine;
}());
exports.Machine = Machine;
