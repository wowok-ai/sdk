"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Arbitration = void 0;
var utils_1 = require("./utils");
var protocol_1 = require("./protocol");
var exception_1 = require("./exception");
var Arbitration = /** @class */ (function () {
    function Arbitration(txb, pay_token_type, permission) {
        this.pay_token_type = pay_token_type;
        this.txb = txb;
        this.permission = permission;
        this.object = '';
    }
    //static token2coin = (token:string) => { return '0x2::coin::Coin<' + token + '>'};
    Arbitration.prototype.get_pay_type = function () { return this.pay_token_type; };
    Arbitration.prototype.get_object = function () { return this.object; };
    Arbitration.From = function (txb, token_type, permission, object) {
        var s = new Arbitration(txb, token_type, permission);
        s.object = protocol_1.Protocol.TXB_OBJECT(txb, object);
        return s;
    };
    Arbitration.New = function (txb, token_type, permission, description, fee, withdrawTreasury, passport) {
        if (!protocol_1.Protocol.IsValidObjects([permission, withdrawTreasury])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects);
        }
        if (!(0, utils_1.IsValidTokenType)(token_type)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidTokenType, 'New.token_type');
        }
        if (!(0, utils_1.IsValidDesription)(description)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription);
        }
        if (!(0, utils_1.IsValidU64)(fee)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidU64, 'New.fee');
        }
        var pay_token_type = token_type;
        var obj = new Arbitration(txb, pay_token_type, permission);
        if (passport) {
            obj.object = txb.moveCall({
                target: protocol_1.Protocol.Instance().ArbitrationFn('new_with_passport'),
                arguments: [passport, txb.pure.string(description), txb.pure.u64(fee), txb.object(withdrawTreasury), protocol_1.Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [pay_token_type],
            });
        }
        else {
            obj.object = txb.moveCall({
                target: protocol_1.Protocol.Instance().ArbitrationFn('new'),
                arguments: [txb.pure.string(description), txb.pure.u64(fee), txb.object(withdrawTreasury), protocol_1.Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [pay_token_type],
            });
        }
        return obj;
    };
    Arbitration.prototype.launch = function () {
        return this.txb.moveCall({
            target: protocol_1.Protocol.Instance().ArbitrationFn('create'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object)],
            typeArguments: [this.pay_token_type]
        });
    };
    Arbitration.prototype.set_description = function (description, passport) {
        if (!(0, utils_1.IsValidDesription)(description)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription, 'set_description.description');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ArbitrationFn('description_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ArbitrationFn('description_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(description), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Arbitration.prototype.set_fee = function (fee, passport) {
        if (!(0, utils_1.IsValidU64)(fee)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidU64, 'set_fee.fee');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ArbitrationFn('fee_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u64(fee), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ArbitrationFn('fee_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.u64(fee), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Arbitration.prototype.set_endpoint = function (endpoint, passport) {
        if (endpoint && !(0, utils_1.IsValidEndpoint)(endpoint)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidEndpoint, 'set_endpoint.endpoint');
        }
        if (passport) {
            if (endpoint) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('endpoint_set_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(endpoint), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('endpoint_none_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (endpoint) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('endpoint_set'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(endpoint), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('endpoint_none'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    };
    Arbitration.prototype.add_voting_guard = function (guard, passport) {
        var _this = this;
        if (guard.length === 0)
            return;
        if (!(0, utils_1.IsValidArray)(guard, function (g) { return protocol_1.Protocol.IsValidObjects([g.guard]) && (0, utils_1.IsValidU64)(g.voting_weight); })) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'add_voting_guard.guard');
        }
        if (passport) {
            guard.forEach(function (v) {
                _this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('voting_guard_add_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.object), _this.txb.object(v.guard),
                        _this.txb.pure.u64(v.voting_weight), protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.permission)],
                    typeArguments: [_this.pay_token_type]
                });
            });
        }
        else {
            guard.forEach(function (v) {
                _this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('voting_guard_add'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.object), _this.txb.object(v.guard),
                        _this.txb.pure.u64(v.voting_weight), protocol_1.Protocol.TXB_OBJECT(_this.txb, _this.permission)],
                    typeArguments: [_this.pay_token_type]
                });
            });
        }
    };
    Arbitration.prototype.remove_voting_guard = function (guard, removeall, passport) {
        if (!removeall && guard.length === 0)
            return;
        if (!(0, utils_1.IsValidArray)(guard, utils_1.IsValidAddress)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'remove_voting_guard.guard');
        }
        if (passport) {
            if (removeall) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('voting_guard_removeall_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('voting_guard_remove_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', guard),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (removeall) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('voting_guard_removeall'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('voting_guard_remove'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('address', guard),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    };
    Arbitration.prototype.set_guard = function (apply_guard, passport) {
        if (apply_guard && !(0, utils_1.IsValidAddress)(apply_guard)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'set_guard.apply_guard');
        }
        if (passport) {
            if (apply_guard) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('usage_guard_set_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(apply_guard), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('usage_guard_none_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (apply_guard) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('usage_guard_set'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(apply_guard), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('usage_guard_none'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    };
    Arbitration.prototype.pause = function (pause, passport) {
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ArbitrationFn('pause_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(pause), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ArbitrationFn('pause'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.bool(pause), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Arbitration.prototype.vote = function (param, passport) {
        if (param.voting_guard && !protocol_1.Protocol.IsValidObjects([param.voting_guard])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'vote.param.voting_guard');
        }
        if (!(0, utils_1.IsValidArray)(param.agrees, function (v) { return (0, utils_1.IsValidU64)(v) && v < Arbitration.MAX_PROPOSITION_COUNT; })) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'vote.param.agrees');
        }
        if (!protocol_1.Protocol.IsValidObjects([param.arb])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'vote.param.arb');
        }
        var clock = this.txb.sharedObjectRef(protocol_1.Protocol.CLOCK_OBJECT);
        if (passport) {
            if (param.voting_guard) {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('vote_with_passport'),
                    arguments: [passport, this.txb.object(param.voting_guard), protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                        this.txb.object(param.arb), this.txb.pure.vector('u8', param.agrees),
                        this.txb.object(clock), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('vote2_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(param.arb), this.txb.pure.vector('u8', param.agrees),
                        this.txb.object(clock), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ArbitrationFn('vote'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(param.arb), this.txb.pure.vector('u8', param.agrees),
                    this.txb.object(clock), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Arbitration.prototype.arbitration = function (param, passport) {
        if (!(0, utils_1.IsValidDesription)(param.feedback)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription, 'arbitration.param.feedback');
        }
        if (!protocol_1.Protocol.IsValidObjects([param.arb])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'arbitration.param.arb');
        }
        if (param.indemnity && !(0, utils_1.IsValidU64)(param.indemnity)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidU64, 'arbitration.param.indemnity');
        }
        var ind = this.txb.pure.option('u64', param.indemnity ? param.indemnity : undefined);
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ArbitrationFn('arbitration_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.object(param.arb), this.txb.pure.string(param.feedback), ind, protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ArbitrationFn('arbitration'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.object(param.arb), this.txb.pure.string(param.feedback), ind, protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Arbitration.prototype.withdraw_fee = function (arb, param, passport) {
        if (!protocol_1.Protocol.IsValidObjects([arb, param.treasury])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'withdraw_fee.arb or treasury');
        }
        if ((param === null || param === void 0 ? void 0 : param.for_guard) && !protocol_1.Protocol.IsValidObjects([param.for_guard])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'withdraw_fee.param.for_guard');
        }
        if ((param === null || param === void 0 ? void 0 : param.for_object) && !(0, utils_1.IsValidAddress)(param.for_object)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'withdraw_fee.param.for_object');
        }
        if (!(0, utils_1.IsValidDesription)(param.remark)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription, 'withdraw_fee.param.remark');
        }
        if (!(0, utils_1.IsValidU64)(param.index)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidU64, 'withdraw_fee.param.index');
        }
        var for_obj = this.txb.pure.option('address', param.for_object ? param.for_object : undefined);
        var clock = this.txb.sharedObjectRef(protocol_1.Protocol.CLOCK_OBJECT);
        if (passport) {
            if (param.for_guard) {
                return this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('withdraw_forGuard_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(arb), this.txb.object(param.treasury),
                        for_obj, this.txb.object(param.for_guard), this.txb.pure.u64(param.index), this.txb.pure.string(param.remark), this.txb.object(clock),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                return this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('withdraw_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(arb), this.txb.object(param.treasury),
                        for_obj, this.txb.pure.u64(param.index), this.txb.pure.string(param.remark), this.txb.object(clock), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
        else {
            if (param.for_guard) {
                return this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('withdraw_forGuard'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(arb), this.txb.object(param.treasury),
                        for_obj, this.txb.object(param.for_guard), this.txb.pure.u64(param.index), this.txb.pure.string(param.remark), this.txb.object(clock),
                        protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
            else {
                return this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('withdraw'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(arb), this.txb.object(param.treasury),
                        for_obj, this.txb.pure.u64(param.index), this.txb.pure.string(param.remark), this.txb.object(clock), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                    typeArguments: [this.pay_token_type]
                });
            }
        }
    };
    Arbitration.prototype.set_withdrawTreasury = function (treasury, passport) {
        if (!protocol_1.Protocol.IsValidObjects([treasury])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'set_withdrawTreasury.treasury');
        }
        if (passport) {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ArbitrationFn('withdraw_treasury_set_with_passport'),
                arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.object(treasury), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
        else {
            this.txb.moveCall({
                target: protocol_1.Protocol.Instance().ArbitrationFn('withdraw_treasury_set'),
                arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object),
                    this.txb.object(treasury), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission)],
                typeArguments: [this.pay_token_type]
            });
        }
    };
    Arbitration.prototype.dispute = function (param, passport) {
        if (!protocol_1.Protocol.IsValidObjects([param.order])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects, 'dispute.param.order');
        }
        if (!(0, utils_1.IsValidTokenType)(param.order_token_type)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidTokenType, 'dispute.param.order_token_type');
        }
        if (!(0, utils_1.IsValidDesription)(param.description)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription, 'dispute.param.description');
        }
        if (!(0, utils_1.IsValidArray)(param.votable_proposition, utils_1.IsValidName)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidArray, 'dispute.param.votable_proposition');
        }
        if (passport) {
            if (param.fee) {
                return this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('dispute_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(param.order), this.txb.pure.string(param.description),
                        this.txb.pure.vector('string', (0, utils_1.array_unique)(param.votable_proposition)), this.txb.object(param.fee)],
                    typeArguments: [this.pay_token_type, param.order_token_type]
                });
            }
            else {
                return this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('free_dispute_with_passport'),
                    arguments: [passport, protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(param.order), this.txb.pure.string(param.description),
                        this.txb.pure.vector('string', (0, utils_1.array_unique)(param.votable_proposition))],
                    typeArguments: [this.pay_token_type, param.order_token_type]
                });
            }
        }
        else {
            if (param.fee) {
                return this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('dispute'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(param.order), this.txb.pure.string(param.description),
                        this.txb.pure.vector('string', (0, utils_1.array_unique)(param.votable_proposition)), this.txb.object(param.fee)],
                    typeArguments: [this.pay_token_type, param.order_token_type]
                });
            }
            else {
                return this.txb.moveCall({
                    target: protocol_1.Protocol.Instance().ArbitrationFn('free_dispute'),
                    arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), this.txb.object(param.order), this.txb.pure.string(param.description),
                        this.txb.pure.vector('string', (0, utils_1.array_unique)(param.votable_proposition))],
                    typeArguments: [this.pay_token_type, param.order_token_type]
                });
            }
        }
    };
    Arbitration.prototype.change_permission = function (new_permission) {
        if (!protocol_1.Protocol.IsValidObjects([new_permission])) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidObjects);
        }
        this.txb.moveCall({
            target: protocol_1.Protocol.Instance().ArbitrationFn('permission_set'),
            arguments: [protocol_1.Protocol.TXB_OBJECT(this.txb, this.object), protocol_1.Protocol.TXB_OBJECT(this.txb, this.permission), protocol_1.Protocol.TXB_OBJECT(this.txb, new_permission)],
            typeArguments: [this.pay_token_type]
        });
        this.permission = new_permission;
    };
    Arbitration.parseObjectType = function (chain_type) {
        return (0, utils_1.parseObjectType)(chain_type, 'arbitration::Arbitration<');
    };
    Arbitration.parseArbObjectType = function (chain_type) {
        return (0, utils_1.parseObjectType)(chain_type, 'arb::Arb<');
    };
    Arbitration.queryArbVoted = function () {
    };
    Arbitration.MAX_PROPOSITION_COUNT = 16;
    Arbitration.MAX_VOTING_GUARD_COUNT = 16;
    return Arbitration;
}());
exports.Arbitration = Arbitration;
