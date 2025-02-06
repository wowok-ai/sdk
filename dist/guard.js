"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuardMaker = exports.Guard = void 0;
var protocol_1 = require("./protocol");
var utils_1 = require("./utils");
var utils_2 = require("./utils");
var exception_1 = require("./exception");
var transactions_1 = require("@mysten/sui/transactions");
var Guard = /** @class */ (function () {
    function Guard(txb) {
        this.txb = txb;
        this.object = '';
    }
    Guard.prototype.get_object = function () { return this.object; };
    Guard.From = function (txb, object) {
        var d = new Guard(txb);
        d.object = protocol_1.Protocol.TXB_OBJECT(txb, object);
        return d;
    };
    Guard.New = function (txb, description, maker) {
        if (!maker.IsReady()) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'launch maker');
        }
        if (!(0, utils_2.IsValidDesription)(description)) {
            (0, exception_1.ERROR)(exception_1.Errors.IsValidDesription);
        }
        var bcs_input = maker.get_input()[0];
        var constants = maker.get_constant();
        if (bcs_input.length == 0 || bcs_input.length > Guard.MAX_INPUT_LENGTH) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'launch input');
        }
        var bValid = true;
        constants === null || constants === void 0 ? void 0 : constants.forEach(function (v, k) {
            if (!GuardMaker.IsValidIndentifier(k))
                bValid = false;
            if (v.value && v.bWitness)
                bValid = false;
            if (v.value === undefined && !v.bWitness)
                bValid = false;
        });
        if (!bValid) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'launch constants');
        }
        var input = new Uint8Array(bcs_input); // copy new uint8array to reserve!
        // reserve the  bytes for guard
        var g = new Guard(txb);
        g.object = txb.moveCall({
            target: protocol_1.Protocol.Instance().GuardFn('new'),
            arguments: [txb.pure.string(description), txb.pure.vector('u8', [].slice.call(input.reverse()))],
        });
        constants === null || constants === void 0 ? void 0 : constants.forEach(function (v, k) {
            if (v.bWitness) {
                var n = new Uint8Array(1);
                n.set([v.type], 0);
                txb.moveCall({
                    target: protocol_1.Protocol.Instance().GuardFn("constant_add"),
                    arguments: [txb.object(g.object), txb.pure.u8(k), txb.pure.bool(true), txb.pure.vector('u8', [].slice.call(n)), txb.pure.bool(true)]
                });
            }
            else {
                var n = (0, utils_2.insertAtHead)(v.value, v.type);
                txb.moveCall({
                    target: protocol_1.Protocol.Instance().GuardFn("constant_add"),
                    arguments: [txb.object(g.object), txb.pure.u8(k), txb.pure.bool(false), txb.pure.vector('u8', [].slice.call(n)), txb.pure.bool(true)]
                });
            }
        });
        return g;
    };
    Guard.prototype.launch = function () {
        return this.txb.moveCall({
            target: protocol_1.Protocol.Instance().GuardFn("create"),
            arguments: [this.txb.object(this.object)]
        });
    };
    Guard.everyone_guard = function (txb) {
        return txb.moveCall({
            target: protocol_1.Protocol.Instance().GuardFn('everyone_guard'),
            arguments: []
        });
    };
    Guard.QueryAddressIdentifiers = function (guard, onQueryAnswer, sender) {
        var txb = new transactions_1.Transaction();
        txb.moveCall({
            target: protocol_1.Protocol.Instance().GuardFn('query_address_identifiers'),
            arguments: [txb.object(guard)]
        });
        protocol_1.Protocol.Client().devInspectTransactionBlock({ sender: sender, transactionBlock: txb }).then(function (res) {
            var _a, _b, _c;
            if (res.results && ((_a = res.results[0]) === null || _a === void 0 ? void 0 : _a.returnValues) && ((_c = (_b = res.results[0]) === null || _b === void 0 ? void 0 : _b.returnValues) === null || _c === void 0 ? void 0 : _c.length) !== 1) {
                onQueryAnswer({ err: 'not match', txb: txb, identifiers: [] });
                return;
            }
            var identifiers = utils_2.Bcs.getInstance().de('vector<u8>', Uint8Array.from(res.results[0].returnValues[0][0]));
            onQueryAnswer({ identifiers: identifiers, txb: txb });
        }).catch(function (e) {
            console.log(e);
            onQueryAnswer({ err: e, txb: txb, identifiers: [] });
        });
    };
    Guard.MAX_INPUT_LENGTH = 10240;
    Guard.QUERIES = [
        // module, 'name', 'id', [input], output
        [protocol_1.MODULES.permission, 'Owner', 1, [], protocol_1.ValueType.TYPE_ADDRESS, "Owner's address."],
        [protocol_1.MODULES.permission, 'Is Admin', 2, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Is a certain address an administrator?', ['address']],
        [protocol_1.MODULES.permission, 'Has Rights', 3, [protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_U64], protocol_1.ValueType.TYPE_BOOL, 'Does an address have a certain permission(Admin always have permissions)?', ['address', 'permission index']],
        [protocol_1.MODULES.permission, 'Contains Address', 4, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Whether an address is included in the personnel permission table?', ['address']],
        [protocol_1.MODULES.permission, 'Contains Permission', 5, [protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_U64], protocol_1.ValueType.TYPE_BOOL, 'Whether a certain permission for a certain address is defined in the personnel permission table?', ['address', 'permission index']],
        [protocol_1.MODULES.permission, 'Contains Permission Guard', 6, [protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_U64], protocol_1.ValueType.TYPE_BOOL, 'Whether a permission guard for a certain address is defined in the personnel permission table?', ['address', 'permission index']],
        [protocol_1.MODULES.permission, 'Permission Guard', 7, [protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_U64], protocol_1.ValueType.TYPE_ADDRESS, 'Permission guard for a certain address.', ['address', 'permission index']],
        [protocol_1.MODULES.permission, 'Number of Entities', 8, [], protocol_1.ValueType.TYPE_U64, 'Number of entities in the personnel permission table.', []],
        [protocol_1.MODULES.permission, 'Number of Admin', 9, [], protocol_1.ValueType.TYPE_U64, 'Number of administrators.', []],
        [protocol_1.MODULES.repository, 'Permission', 100, [], protocol_1.ValueType.TYPE_ADDRESS, 'Permission object address.', []],
        [protocol_1.MODULES.repository, 'Contains Policy', 101, [protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_BOOL, 'Is a consensus policy included?', ['the filed name']],
        [protocol_1.MODULES.repository, 'Is Permission set of Policy', 102, [protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_BOOL, 'Does a certain consensus policy set data operation permissions?', ['the policy name']],
        [protocol_1.MODULES.repository, 'Permission of Policy', 103, [protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_U64, 'The permission index of a certain consensus policy in the Permission object.', ['the policy name']],
        [protocol_1.MODULES.repository, 'Value Type of Policy', 104, [protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_U8, 'Data types defined by consensus policy.', ['the policy name']],
        [protocol_1.MODULES.repository, 'Contains Data for An Address', 105, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Whether data exists at a certain address?', ['address']],
        [protocol_1.MODULES.repository, 'Contains Data', 106, [protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_BOOL, 'Does it contain data for a certain field of an address?', ['address', 'the field name']],
        [protocol_1.MODULES.repository, 'Raw data without Type', 107, [protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_VEC_U8, 'Data for a field at an address and does not contain data type information.', ['address', 'the field name']],
        [protocol_1.MODULES.repository, 'Raw data', 108, [protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_VEC_U8, 'Data for a field at an address, and the first byte contains data type information.', ['address', 'the field name']],
        [protocol_1.MODULES.repository, 'Type', 109, [], protocol_1.ValueType.TYPE_U8, 'The repository Type. 0: Normal; 1: Wowok greenee.', []],
        [protocol_1.MODULES.repository, 'Policy Mode', 110, [], protocol_1.ValueType.TYPE_U8, 'Policy Mode. 0: Free mode;  1: Strict mode.', []],
        [protocol_1.MODULES.repository, 'Reference Count', 111, [], protocol_1.ValueType.TYPE_U64, 'The number of times it is referenced by other objects.', []],
        [protocol_1.MODULES.repository, 'Is Referenced by An Object', 112, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Is it referenced by an object?', ['address']],
        [protocol_1.MODULES.repository, 'Number Data', 113, [protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_U256, 'Data for a field at an address and get unsigned integer type data.', ['address', 'the field name']],
        [protocol_1.MODULES.repository, 'String Data', 114, [protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_STRING, 'Data for a field at an address and get string type data.', ['address', 'the field name']],
        [protocol_1.MODULES.repository, 'Address Data', 115, [protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_ADDRESS, 'Data for a field at an address and get address type data.', ['address', 'the field name']],
        [protocol_1.MODULES.repository, 'Bool Data', 116, [protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_BOOL, 'Data for a field at an address and get bool type data.', ['address', 'the field name']],
        [protocol_1.MODULES.repository, 'Number Vector Data', 117, [protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_VEC_U256, 'Data for a field at an address and get unsigned integer vector type data.', ['address', 'the field name']],
        [protocol_1.MODULES.repository, 'String Vector Data', 118, [protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_VEC_STRING, 'Data for a field at an address and get string vector type data.', ['address', 'the field name']],
        [protocol_1.MODULES.repository, 'Address Vector Data', 119, [protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_VEC_ADDRESS, 'Data for a field at an address and get address vector type data.', ['address', 'the field name']],
        [protocol_1.MODULES.repository, 'Bool Vector Data', 120, [protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_VEC_BOOL, 'Data for a field at an address and get bool vector type data.', ['address', 'the field name']],
        [protocol_1.MODULES.entity, 'Has Entity', 200, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Is an entity already registered?', ['address']],
        [protocol_1.MODULES.entity, 'Likes', 201, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_U64, 'The number of likes for an address by other addresses.', ['address']],
        [protocol_1.MODULES.entity, 'Dislikes', 202, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_U64, 'The number of dislikes for an address by other addresses.', ['address']],
        [protocol_1.MODULES.entity, 'Entity Info', 203, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_VEC_U8, 'Public information about an entity.', ['address']],
        [protocol_1.MODULES.entity, 'Has Resource by Entity?', 204, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Whether an entity created a resource?', ['address']],
        [protocol_1.MODULES.entity, 'Entity Resource', 205, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_ADDRESS, 'The address of a resource object created by an entity.', ['address']],
        [protocol_1.MODULES.demand, 'Permission', 300, [], protocol_1.ValueType.TYPE_ADDRESS, 'Permission object address.', []],
        [protocol_1.MODULES.demand, 'Deadline', 302, [], protocol_1.ValueType.TYPE_U64, 'The expiration time of presenting.', []],
        [protocol_1.MODULES.demand, 'Bounty Count', 303, [], protocol_1.ValueType.TYPE_U64, 'Number of Bounties.', []],
        [protocol_1.MODULES.demand, 'Has Guard', 304, [], protocol_1.ValueType.TYPE_BOOL, 'Whether the present guard is set?', []],
        [protocol_1.MODULES.demand, 'Guard', 305, [], protocol_1.ValueType.TYPE_ADDRESS, 'The present guard address.', []],
        [protocol_1.MODULES.demand, 'Has Service Picked', 306, [], protocol_1.ValueType.TYPE_BOOL, 'Whether a service has been picked and bounties given?', []],
        [protocol_1.MODULES.demand, 'Service Picked', 307, [], protocol_1.ValueType.TYPE_ADDRESS, 'Service address that has been picked.', []],
        [protocol_1.MODULES.demand, 'Presenter Count', 308, [], protocol_1.ValueType.TYPE_U64, 'Number of presenters.', []],
        [protocol_1.MODULES.demand, 'Has Presenter', 309, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Is a certain address a presenter?', ['address']],
        [protocol_1.MODULES.demand, 'Who Got Bounty', 310, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_ADDRESS, 'The address that bounties given.', ['address']],
        [protocol_1.MODULES.service, 'Permission', 400, [], protocol_1.ValueType.TYPE_ADDRESS, 'Permission object address.', []],
        [protocol_1.MODULES.service, 'Payee', 401, [], protocol_1.ValueType.TYPE_ADDRESS, 'Payee address, that all order withdrawals will be collected to this address.', []],
        [protocol_1.MODULES.service, 'Has Buying Guard', 402, [], protocol_1.ValueType.TYPE_BOOL, 'Is the guard condition of buying set?', []],
        [protocol_1.MODULES.service, 'Buying Guard', 403, [], protocol_1.ValueType.TYPE_ADDRESS, 'Buying guard, that Purchase only if you meet the conditions of the guard.', []],
        [protocol_1.MODULES.service, 'Contains Repository', 404, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, "Is a certain repository one of the service's consensus repositories?", ['address']],
        [protocol_1.MODULES.service, 'Has Withdrawing Guard', 405, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Whether a certain guard is set when withdrawing money?', ['address']],
        [protocol_1.MODULES.service, 'Withdrawing Guard Percent', 406, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_U64, 'The percentage of withdrawals allowed by a certain withdrawal guard.', ['address']],
        [protocol_1.MODULES.service, 'Has Refunding Guard', 407, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Whether a certain guard is set when refunding money?', ['address']],
        [protocol_1.MODULES.service, 'Refunding Guard Percent', 408, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_U64, 'The percentage of refund allowed by a certain refund guard.', ['address']],
        [protocol_1.MODULES.service, 'Has Sales Item', 409, [protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_BOOL, 'Is there a sales item for the service?', ['the item name']],
        [protocol_1.MODULES.service, 'Sale Item Price', 410, [protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_U64, 'What is the price of a certain sale item?', ['the item name']],
        [protocol_1.MODULES.service, 'Sale Item Inventory', 411, [protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_U64, 'How much inventory is there for a certain sales item?', ['the item name']],
        [protocol_1.MODULES.service, 'Has Machine', 412, [], protocol_1.ValueType.TYPE_BOOL, "Has the machine(progress generator) that serves the order been set up?", []],
        [protocol_1.MODULES.service, 'Machine', 413, [], protocol_1.ValueType.TYPE_ADDRESS, 'Machine address, that generate progresses serving the execution process of order.', []],
        [protocol_1.MODULES.service, 'Paused', 414, [], protocol_1.ValueType.TYPE_BOOL, 'Pause the creation of new order?'],
        [protocol_1.MODULES.service, 'Published', 415, [], protocol_1.ValueType.TYPE_BOOL, 'Is it allowed to create orders?'],
        [protocol_1.MODULES.service, 'Has Required Info', 416, [], protocol_1.ValueType.TYPE_BOOL, 'Whether the necessary information that needs to be provided by the customer is set?', []],
        [protocol_1.MODULES.service, 'Required Info of Service-Pubkey', 417, [], protocol_1.ValueType.TYPE_STRING, 'The public key used to encrypt customer information, and only the service provider can decrypt and view customer information.', []],
        [protocol_1.MODULES.service, 'Required Info', 418, [], protocol_1.ValueType.TYPE_VEC_STRING, 'Names of the required information item that needs to be provided by the customer.', []],
        [protocol_1.MODULES.service, 'Number of Treasuries', 419, [], protocol_1.ValueType.TYPE_U64, 'The number of treasuries that can be externally withdrawn for purposes such as compensation or incentives.', []],
        [protocol_1.MODULES.service, 'Contains Treasury', 420, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Does it contain externally withdrawable Treasury for purposes such as compensation or incentives?', ['treasury address']],
        [protocol_1.MODULES.service, 'Number of Arbitrations', 421, [], protocol_1.ValueType.TYPE_U64, 'The number of arbitrations that allows a refund to be made from the order at any time based on the arbitration result.', []],
        [protocol_1.MODULES.service, 'Contains Arbitration', 422, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Does it contain an arbitration that allows a refund to be made from the order at any time based on the arbitration result.?', ['arbitration address']],
        [protocol_1.MODULES.order, 'Amount', 500, [], protocol_1.ValueType.TYPE_U64, 'Order amount.', []],
        [protocol_1.MODULES.order, 'Payer', 501, [], protocol_1.ValueType.TYPE_ADDRESS, 'Order payer.', []],
        [protocol_1.MODULES.order, 'Service', 502, [], protocol_1.ValueType.TYPE_ADDRESS, 'Service for creating orders.', []],
        [protocol_1.MODULES.order, 'Has Progress', 503, [], protocol_1.ValueType.TYPE_BOOL, 'Is there a Progress for executing the order process?', []],
        [protocol_1.MODULES.order, 'Progress', 504, [], protocol_1.ValueType.TYPE_ADDRESS, 'Progress address for executing the order process.', []],
        [protocol_1.MODULES.order, 'Required Info', 505, [], protocol_1.ValueType.TYPE_BOOL, 'Is Required Info set?', []],
        [protocol_1.MODULES.order, 'Discount Used', 506, [], protocol_1.ValueType.TYPE_BOOL, 'Discount coupon used for this order?', []],
        [protocol_1.MODULES.order, 'Discount', 507, [], protocol_1.ValueType.TYPE_ADDRESS, 'Discount address that already used.', []],
        [protocol_1.MODULES.order, 'Balance', 508, [], protocol_1.ValueType.TYPE_U64, 'The amount currently in the order.', []],
        //        [MODULES.order, 'Refunded', 509, [], ValueType.TYPE_BOOL, 'Whether a refund has occurred?', []],
        //        [MODULES.order, 'Withdrawed', 510, [], ValueType.TYPE_BOOL, 'Whether a service provider withdrawal has occurred?', []],   
        [protocol_1.MODULES.order, 'Number of Agents', 511, [], protocol_1.ValueType.TYPE_U64, 'The number of agents for the order.', []],
        [protocol_1.MODULES.order, 'Has Agent', 512, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Whether an address is an order agent?', ['agent address']],
        [protocol_1.MODULES.order, 'Number of Disputes', 513, [], protocol_1.ValueType.TYPE_U64, 'Number of arbitrations for the order.', []],
        [protocol_1.MODULES.order, 'Has Arb', 514, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Does the order contain an Arb for arbitration?', ['arb address']],
        /* @Deprecated
                [MODULES.reward, 'Permission', 600, [], ValueType.TYPE_ADDRESS, 'Permission object address.', []],
                [MODULES.reward, 'Rewards Remaining', 601, [], ValueType.TYPE_U64, 'Number of rewards to be claimed.', []],
                [MODULES.reward, 'Reward Count Supplied', 602, [], ValueType.TYPE_U64, 'Total rewards supplied.', []],
                [MODULES.reward, 'Guard Count', 603, [], ValueType.TYPE_U64, 'The number of claiming guards.', []],
                [MODULES.reward, 'Has Guard', 604, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether a claiming guard is set up?', ['address']],
                [MODULES.reward, 'Guard Portion', 605, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The portions of rewards, that can be claimed if a certain guard condition is met.', ['address']],
                [MODULES.reward, 'Deadline', 606, [], ValueType.TYPE_U64, 'The expiration time of claiming.', []],
                [MODULES.reward, 'Has Claimed by An Address', 607, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether a certain address has claimed rewards?', ['address']],
                [MODULES.reward, 'Portions Claimed by An Address', 608, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The portions of rewards that have been claimed by a certain address.', []],
                [MODULES.reward, 'Number of Addresses Claimed', 609, [], ValueType.TYPE_U64, 'Number of addresses that have claimed rewards.', []],
                [MODULES.reward, 'Is Sponsor', 620, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether an address is a sponsor of the reward pool?', ['address']],
                [MODULES.reward, 'Portions by A Sponsor', 611, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The portions of sponsorship reward pools for a certain address.', ['address']],
                [MODULES.reward, 'Number of Sponsors', 612, [], ValueType.TYPE_U64, 'Number of sponsors in the sponsorship reward pool.', []],
                [MODULES.reward, 'Allow Repeated Claims', 613, [], ValueType.TYPE_BOOL, 'Whether to allow repeated claims?', []],
        */
        [protocol_1.MODULES.machine, 'Permission', 700, [], protocol_1.ValueType.TYPE_ADDRESS, 'Permission object address.', []],
        [protocol_1.MODULES.machine, 'Paused', 701, [], protocol_1.ValueType.TYPE_BOOL, 'Pause the creation of new Progress?', []],
        [protocol_1.MODULES.machine, 'Published', 702, [], protocol_1.ValueType.TYPE_BOOL, 'Is it allowed to create Progress?', []],
        [protocol_1.MODULES.machine, 'Is Consensus Repository', 703, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Whether an address is a consensus repository?', ['adddress']],
        [protocol_1.MODULES.machine, 'Has Endpoint', 704, [], protocol_1.ValueType.TYPE_BOOL, 'Is the endpoint set?', []],
        [protocol_1.MODULES.machine, 'Endpoint', 705, [], protocol_1.ValueType.TYPE_STRING, 'Endpoint url/ipfs.', []],
        [protocol_1.MODULES.progress, 'Machine', 800, [], protocol_1.ValueType.TYPE_ADDRESS, 'The Machine object that created this Progress.', []],
        [protocol_1.MODULES.progress, 'Current Node', 801, [], protocol_1.ValueType.TYPE_STRING, 'The name of the currently running node.', []],
        [protocol_1.MODULES.progress, 'Has Parent', 802, [], protocol_1.ValueType.TYPE_BOOL, 'Is the parent Progress defined?', []],
        [protocol_1.MODULES.progress, 'Parent', 803, [], protocol_1.ValueType.TYPE_ADDRESS, 'The parent Progress, that contains some child Progress.', []],
        [protocol_1.MODULES.progress, 'Has Task', 804, [], protocol_1.ValueType.TYPE_BOOL, 'Does it contain clear task(eg. an Order)?', []],
        [protocol_1.MODULES.progress, 'Task', 805, [], protocol_1.ValueType.TYPE_ADDRESS, 'Task object address.', []],
        [protocol_1.MODULES.progress, 'Has Unique Permission', 806, [protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_BOOL, 'Does Progress define a unique operation permission?', ['operator name']],
        [protocol_1.MODULES.progress, 'Is Unique Permission Operator', 807, [protocol_1.ValueType.TYPE_STRING, protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Is an address an operator with unique permissions?', ['operator name', 'address']],
        [protocol_1.MODULES.progress, 'Has Context Repository', 808, [], protocol_1.ValueType.TYPE_BOOL, 'Whether the repository reference for Progress is set?', []],
        [protocol_1.MODULES.progress, 'Context Repository', 809, [], protocol_1.ValueType.TYPE_ADDRESS, 'Repository reference for Progress.', []],
        [protocol_1.MODULES.progress, 'Last Session Time', 810, [], protocol_1.ValueType.TYPE_U64, 'Time when the previous session was completed.', []],
        [protocol_1.MODULES.progress, 'Last Session Node', 811, [], protocol_1.ValueType.TYPE_STRING, 'The name of the last completed node.', []],
        [protocol_1.MODULES.progress, 'Current Session-id', 812, [], protocol_1.ValueType.TYPE_U64, 'The session id of ongoing node.', []],
        [protocol_1.MODULES.progress, 'Parent Session-id', 813, [], protocol_1.ValueType.TYPE_U64, 'The child process was started in the Session-id phase of the parent process.', []],
        [protocol_1.MODULES.progress, 'Parent Next Node', 814, [], protocol_1.ValueType.TYPE_STRING, 'The child process is started at the next node stage of the parent process.', []],
        [protocol_1.MODULES.progress, 'Parent Forward', 815, [], protocol_1.ValueType.TYPE_STRING, 'The child process is started in the Forward phase of the next node of the parent process.', []],
        [protocol_1.MODULES.progress, 'Parent Node', 816, [], protocol_1.ValueType.TYPE_STRING, 'The node name of the parent process where the child process is located.', []],
        [protocol_1.MODULES.progress, 'Forward Accomplished', 817, [protocol_1.ValueType.TYPE_U64, protocol_1.ValueType.TYPE_STRING, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_BOOL, 'Has the forward been accomplished?', ['session-id', 'next node name', 'forward name']],
        [protocol_1.MODULES.progress, 'Forward Operator', 818, [protocol_1.ValueType.TYPE_U64, protocol_1.ValueType.TYPE_STRING, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_ADDRESS, 'The forward operator.', ['session-id', 'next node name', 'forward name']],
        [protocol_1.MODULES.progress, 'Forward Message', 819, [protocol_1.ValueType.TYPE_U64, protocol_1.ValueType.TYPE_STRING, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_STRING, 'The forward message.', ['session-id', 'next node name', 'forward name']],
        [protocol_1.MODULES.progress, 'Forward Order Count', 820, [protocol_1.ValueType.TYPE_U64, protocol_1.ValueType.TYPE_STRING, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_U64, 'The forward Order count.', ['session-id', 'next node name', 'forward name']],
        [protocol_1.MODULES.progress, 'Forward time', 821, [protocol_1.ValueType.TYPE_U64, protocol_1.ValueType.TYPE_STRING, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_U64, 'The time when the forward was last triggered.', ['session-id', 'next node name', 'forward name']],
        [protocol_1.MODULES.progress, 'Closest Session Time', 822, [protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_U64, 'The time a node that closest time to the current node completes its session.', ['node name']],
        [protocol_1.MODULES.progress, 'Closest Forward Accomplished', 823, [protocol_1.ValueType.TYPE_STRING, protocol_1.ValueType.TYPE_STRING, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_BOOL, 'Has the forward been accomplished?', ['node name', 'next node name', 'forward name']],
        [protocol_1.MODULES.progress, 'Closest Forward Operator', 824, [protocol_1.ValueType.TYPE_STRING, protocol_1.ValueType.TYPE_STRING, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_ADDRESS, 'The operator of the forward that closest time to the current node.', ['node name', 'next node name', 'forward name']],
        [protocol_1.MODULES.progress, 'Closest Forward Message', 825, [protocol_1.ValueType.TYPE_STRING, protocol_1.ValueType.TYPE_STRING, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_STRING, 'The message of the forward that closest time to the current node.', ['node name', 'next node name', 'forward name']],
        [protocol_1.MODULES.progress, 'Closest Forward Order Count', 826, [protocol_1.ValueType.TYPE_STRING, protocol_1.ValueType.TYPE_STRING, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_U64, 'The Order count of the forward that closest time to the current node.', ['node name', 'next node name', 'forward name']],
        [protocol_1.MODULES.progress, 'Closest Forward time', 827, [protocol_1.ValueType.TYPE_STRING, protocol_1.ValueType.TYPE_STRING, protocol_1.ValueType.TYPE_STRING], protocol_1.ValueType.TYPE_U64, 'The time when the forward that closest time to the current node was last triggered.', ['node name', 'next node name', 'forward name']],
        [protocol_1.MODULES.wowok, 'Builder', 900, [], protocol_1.ValueType.TYPE_ADDRESS, 'Builder address of Wowok.', []],
        [protocol_1.MODULES.wowok, 'Everyone Guard', 901, [], protocol_1.ValueType.TYPE_ADDRESS, 'A guard that all addresses can pass through.', []],
        [protocol_1.MODULES.wowok, 'Object of Entities', 902, [], protocol_1.ValueType.TYPE_ADDRESS, 'The address of entity information object.', []],
        [protocol_1.MODULES.wowok, 'Grantor Count', 903, [], protocol_1.ValueType.TYPE_U64, 'Number of registered grantors.', []],
        [protocol_1.MODULES.wowok, 'Has Grantor', 904, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Whether an address has been registered as a grantor?', ['address']],
        [protocol_1.MODULES.wowok, 'Grantor Name', 905, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_STRING, "Name of a grantor.", ['address']],
        [protocol_1.MODULES.wowok, 'Grantor Registration Time', 906, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_U64, 'Registration time of a grantor.', ['address']],
        [protocol_1.MODULES.wowok, 'Grantor Expired Time', 907, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_U64, 'The expiration time of a grantor.', ['address']],
        [protocol_1.MODULES.wowok, 'Grantee Object for Grantor', 908, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_ADDRESS, 'Grantee repository address of a grantor.', ['address']],
        /* @Deprecated
                [MODULES.vote, 'Permission', 1101, [], ValueType.TYPE_ADDRESS, 'Permission object address.', []],
                [MODULES.vote, 'Be Voting', 1102, [], ValueType.TYPE_BOOL, 'Whether to start voting and options will not be changed?', []],
                [MODULES.vote, 'Deadline Locked', 1103, [], ValueType.TYPE_BOOL, 'Whether the deadline cannot be modified?', []],
                [MODULES.vote, 'Vote-Guard Locked', 1104, [], ValueType.TYPE_BOOL, 'Whether the Guard for voting cannot be modified?', []],
                [MODULES.vote, 'Max Choice Count', 1105, [], ValueType.TYPE_U8, 'The maximum number of options that can be selected in one vote.', []],
                [MODULES.vote, 'Deadline', 1106, [], ValueType.TYPE_U64, 'Deadline for voting.', []],
                [MODULES.vote, 'Has Reference', 1107, [], ValueType.TYPE_BOOL, 'Whether to vote for a reference Object?', []],
                [MODULES.vote, 'Reference', 1108, [], ValueType.TYPE_ADDRESS, 'Reference Object that voting for.', []],
                [MODULES.vote, 'Has Vote-Guard', 1109, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Is a certain Guard included in the Vote-Guard settings?', ['guard address']],
                [MODULES.vote, 'Vote-Guard Wight', 1110, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The voting weight corresponding to the Vote-Guard.', ['guard address']],
                [MODULES.vote, 'Has Voted by Address', 1111, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether an address has already voted?', ['address']],
                [MODULES.vote, 'Voted Weight by Address', 1112, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The weight of whether an address has been voted on.', ['adddress']],
                [MODULES.vote, 'Has Option', 1113, [ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Whether a voting option is included?', ['option content']],
                [MODULES.vote, 'Has Object of Option', 1114, [ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Whether a voting option refers to an object?', ['option content']],
                [MODULES.vote, 'Option Object', 1115, [ValueType.TYPE_STRING], ValueType.TYPE_ADDRESS, 'The object referenced by a voting option.', ['option content']],
                [MODULES.vote, 'Option Counts', 1116, [ValueType.TYPE_STRING], ValueType.TYPE_U64, 'The number of votes for the voting option.', ['option content']],
                [MODULES.vote, 'Option Votes', 1117, [ValueType.TYPE_STRING], ValueType.TYPE_U64, 'The number of voted addresses for the voting option.', ['option content']],
                [MODULES.vote, 'Address Count Voted', 1118, [], ValueType.TYPE_U64, 'Total number of addresses voted.', []],
                [MODULES.vote, 'Top1 Option by Addresses', 1119, [], ValueType.TYPE_STRING, 'The content of the voting option ranked first by the number of voting addresses.', []],
                [MODULES.vote, 'Top1 Counts by Addresses', 1120, [], ValueType.TYPE_U64, 'Number of votes for the top voting option by number of voting addresses.', []],
                [MODULES.vote, 'Top1 Option by Votes', 1121, [], ValueType.TYPE_STRING, 'The content of the voting option ranked first by the number of votes.', []],
                [MODULES.vote, 'Top1 Counts by Votes', 1122, [], ValueType.TYPE_U64, 'Number of votes for the top voting option by number of votes.', []],
                [MODULES.vote, 'Voted Time by Address', 1113, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The time of whether an address has been voted on.', ['adddress']],
        */
        [protocol_1.MODULES.payment, 'Sender', 1200, [], protocol_1.ValueType.TYPE_ADDRESS, 'Payment originator address.', []],
        [protocol_1.MODULES.payment, 'Total Amount', 1201, [], protocol_1.ValueType.TYPE_U128, "Payment amount.", []],
        [protocol_1.MODULES.payment, 'Remark', 1202, [], protocol_1.ValueType.TYPE_STRING, 'Payment remark.', ['address']],
        [protocol_1.MODULES.payment, 'Has Guard for Perpose', 1203, [], protocol_1.ValueType.TYPE_BOOL, 'Whether the payment references a Guard?', []],
        [protocol_1.MODULES.payment, 'Has Object for Perpose', 1204, [], protocol_1.ValueType.TYPE_BOOL, 'Whether the payment references an Object?', []],
        [protocol_1.MODULES.payment, 'Guard for Perpose', 1205, [], protocol_1.ValueType.TYPE_ADDRESS, 'The Guard referenced by this payment.', []],
        [protocol_1.MODULES.payment, 'Object for Perpose', 1206, [], protocol_1.ValueType.TYPE_ADDRESS, "The Object referenced by this payment.", []],
        [protocol_1.MODULES.payment, 'Number of Recipients', 1207, [], protocol_1.ValueType.TYPE_U64, 'Number of recipients to receive payment from.', []],
        [protocol_1.MODULES.payment, 'Is a Recipient', 1208, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Is a recipient received the payment?', ['address']],
        [protocol_1.MODULES.payment, 'Amount for a Recipient', 1209, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_U64, 'The amount of payment received by an address.', ['address']],
        [protocol_1.MODULES.payment, 'Time', 1210, [], protocol_1.ValueType.TYPE_U64, 'Payment time', []],
        [protocol_1.MODULES.payment, 'Is from Treasury', 1211, [], protocol_1.ValueType.TYPE_BOOL, 'Whether the payment comes from a Treasury?', []],
        [protocol_1.MODULES.payment, 'Treasury Address', 1212, [], protocol_1.ValueType.TYPE_ADDRESS, 'The Treasury from which the payment comes.', []],
        [protocol_1.MODULES.payment, 'Biz-ID', 1213, [], protocol_1.ValueType.TYPE_U64, 'Bisiness ID number of the payment.', []],
        [protocol_1.MODULES.treasury, 'Permission', 1400, [], protocol_1.ValueType.TYPE_ADDRESS, 'Permission object address.', []],
        [protocol_1.MODULES.treasury, 'Balance', 1401, [], protocol_1.ValueType.TYPE_U64, "Treasury balance.", []],
        [protocol_1.MODULES.treasury, 'Number of Flow Records', 1402, [], protocol_1.ValueType.TYPE_U64, 'Number of treasury transactions.', []],
        [protocol_1.MODULES.treasury, 'Inflow Amount', 1403, [], protocol_1.ValueType.TYPE_U128, 'Treasury inflow amount.', []],
        [protocol_1.MODULES.treasury, 'Outflow Amount', 1404, [], protocol_1.ValueType.TYPE_U128, 'Treasury outflow amount.', []],
        [protocol_1.MODULES.treasury, 'Has Deposit Guard', 1405, [], protocol_1.ValueType.TYPE_BOOL, 'Whether the deposit Guard set?', []],
        [protocol_1.MODULES.treasury, 'Deposit Guard', 1406, [], protocol_1.ValueType.TYPE_ADDRESS, 'Deposit Guard address.', []],
        [protocol_1.MODULES.treasury, 'Number of Withdraw Guards', 1407, [], protocol_1.ValueType.TYPE_U64, 'Number of withdraw guards.', []],
        [protocol_1.MODULES.treasury, 'Has Withdraw Guard', 1408, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Has a Withdraw Guard added?', ['guard address']],
        [protocol_1.MODULES.treasury, 'Withdrawal Amount with Guard', 1409, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_U64, 'withdrawal amount corresponding the Guard.', ['guard address']],
        [protocol_1.MODULES.treasury, 'Recent Time with Operation', 1410, [protocol_1.ValueType.TYPE_U8], protocol_1.ValueType.TYPE_U64, 'Time of the most recent fund operation.', ['operation']],
        [protocol_1.MODULES.treasury, 'Recent Signer with Operation', 1411, [protocol_1.ValueType.TYPE_U8], protocol_1.ValueType.TYPE_ADDRESS, 'Signer address of the most recent fund operation.', ['operation']],
        [protocol_1.MODULES.treasury, 'Recent Payment with Operation', 1412, [protocol_1.ValueType.TYPE_U8], protocol_1.ValueType.TYPE_ADDRESS, 'Payment address of the most recent fund operation.', ['operation']],
        [protocol_1.MODULES.treasury, 'Recent Amount with Operation', 1413, [protocol_1.ValueType.TYPE_U8], protocol_1.ValueType.TYPE_U64, 'Amount of the most recent fund operation.', ['operation']],
        [protocol_1.MODULES.treasury, 'Recent Time with Op/Pmt', 1414, [protocol_1.ValueType.TYPE_U8, protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_U64, 'Time of the most recent fund operation with payment specified.', ['operation', 'payment address']],
        [protocol_1.MODULES.treasury, 'Recent Signer with Op&Pmt', 1415, [protocol_1.ValueType.TYPE_U8, protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_ADDRESS, 'Signer of the most recent fund operationwith payment specified.', ['operation', 'payment address']],
        [protocol_1.MODULES.treasury, 'Recent Amount with Op/Pmt', 1416, [protocol_1.ValueType.TYPE_U8, protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_U64, 'Amount of the most recent fund operation with payment specified.', ['operation', 'payment address']],
        [protocol_1.MODULES.treasury, 'Recent Time with Op/Sgr', 1417, [protocol_1.ValueType.TYPE_U8, protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_U64, 'Time of the most recent fund operation with signer specified.', ['operation', 'signer address']],
        [protocol_1.MODULES.treasury, 'Recent Payment with Op/Sgr', 1418, [protocol_1.ValueType.TYPE_U8, protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_ADDRESS, 'Payment of the most recent fund operation with singner specified.', ['operation', 'signer address']],
        [protocol_1.MODULES.treasury, 'Recent Amount with Op/Sgr', 1419, [protocol_1.ValueType.TYPE_U8, protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_U64, 'Amount of the most recent fund operation with singer specified.', ['operation', 'signer address']],
        [protocol_1.MODULES.treasury, 'Recent Time with Op/Pmt/Sgr', 1420, [protocol_1.ValueType.TYPE_U8, protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_U64, 'Time of the most recent fund operation.', ['operation', 'payment address', 'singer address']],
        [protocol_1.MODULES.treasury, 'Recent Amount with Op/Pmt/Sgr', 1421, [protocol_1.ValueType.TYPE_U8, protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_U64, 'Amount of the most recent fund operation.', ['operation', 'payment address', 'singer address']],
        [protocol_1.MODULES.treasury, 'Has Operation', 1422, [protocol_1.ValueType.TYPE_U8], protocol_1.ValueType.TYPE_BOOL, 'Whether there was a fund operation?', ['operation']],
        [protocol_1.MODULES.treasury, 'Has Operation with Pmt', 1423, [protocol_1.ValueType.TYPE_U8, protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Whether there was a fund operation with payment specified?', ['operation', 'payment address']],
        [protocol_1.MODULES.treasury, 'Has Operation with Sgr', 1424, [protocol_1.ValueType.TYPE_U8, protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Whether there was a fund operation with singer specified?', ['operation', 'singer address']],
        [protocol_1.MODULES.treasury, 'Has Operation with Pmt/Sgr', 1425, [protocol_1.ValueType.TYPE_U8, protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Whether there was a fund operation?', ['operation', 'payment address', 'singer address']],
        [protocol_1.MODULES.treasury, 'Operation at Least Times', 1426, [protocol_1.ValueType.TYPE_U8, protocol_1.ValueType.TYPE_U8], protocol_1.ValueType.TYPE_BOOL, 'Does it operate at least a certain number of times?', ['operation', 'at least times']],
        [protocol_1.MODULES.treasury, 'Operation at Least Times by a Signer', 1427, [protocol_1.ValueType.TYPE_U8, protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_U8], protocol_1.ValueType.TYPE_BOOL, 'Does it operate at least a certain number of times by a signer?', ['operation', 'signer address', 'at least times']],
        [protocol_1.MODULES.arbitration, 'Permission', 1500, [], protocol_1.ValueType.TYPE_ADDRESS, 'Permission object address.', []],
        [protocol_1.MODULES.arbitration, 'Paused', 1501, [], protocol_1.ValueType.TYPE_BOOL, "Is it allowed to create Arb?", []],
        [protocol_1.MODULES.arbitration, 'Fee', 1502, [], protocol_1.ValueType.TYPE_U64, 'Cost of arbitration.', []],
        [protocol_1.MODULES.arbitration, 'Has Endpoint', 1503, [], protocol_1.ValueType.TYPE_BOOL, 'Is the endpoint set?', []],
        [protocol_1.MODULES.arbitration, 'Endpoint', 1504, [], protocol_1.ValueType.TYPE_STRING, 'Endpoint url/ipfs.', []],
        [protocol_1.MODULES.arbitration, 'Has Customer Guard', 1505, [], protocol_1.ValueType.TYPE_BOOL, 'Is there Guard set to apply for arbitration?', []],
        [protocol_1.MODULES.arbitration, 'Customer Guard', 1506, [], protocol_1.ValueType.TYPE_ADDRESS, 'Guard to apply for arbitration.', []],
        [protocol_1.MODULES.arbitration, 'Number of Voting Guard', 1507, [], protocol_1.ValueType.TYPE_U64, 'Number of voting guards.', []],
        [protocol_1.MODULES.arbitration, 'Has Voting Guard', 1508, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Has the voting Guard added?', ['guard address']],
        [protocol_1.MODULES.arbitration, 'Voting Weight', 1509, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_U64, 'Voting weight of the voting Guard.', ['guard address']],
        [protocol_1.MODULES.arbitration, 'Treasury', 1510, [], protocol_1.ValueType.TYPE_ADDRESS, 'The address of the Treasury where fees was collected at the time of withdrawal.', []],
        [protocol_1.MODULES.arb, 'Order', 1600, [], protocol_1.ValueType.TYPE_ADDRESS, 'Order under arbitration.', []],
        [protocol_1.MODULES.arb, 'Arbitration', 1601, [], protocol_1.ValueType.TYPE_ADDRESS, "Arbitration object address.", []],
        [protocol_1.MODULES.arb, 'Feedback', 1602, [], protocol_1.ValueType.TYPE_STRING, 'Arbitration feedback.', []],
        [protocol_1.MODULES.arb, 'Has Compensation', 1603, [], protocol_1.ValueType.TYPE_BOOL, 'Whether there is an arbitration result?', []],
        [protocol_1.MODULES.arb, 'Compensation', 1604, [], protocol_1.ValueType.TYPE_U64, 'Compensation should be given to the order payer.', []],
        [protocol_1.MODULES.arb, 'Unclaimed Arbitration Costs', 1605, [], protocol_1.ValueType.TYPE_U64, 'Unclaimed arbitration costs.', []],
        [protocol_1.MODULES.arb, 'Turnout', 1606, [], protocol_1.ValueType.TYPE_U64, 'The number of addresses have voted.', []],
        [protocol_1.MODULES.arb, 'Has voted', 1607, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_BOOL, 'Has someone voted?', ['voter address']],
        [protocol_1.MODULES.arb, 'Voting weight', 1608, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_U64, 'The weight of a complete vote for the address.', ['voter address']],
        [protocol_1.MODULES.arb, 'Voting Time', 1609, [protocol_1.ValueType.TYPE_ADDRESS], protocol_1.ValueType.TYPE_U64, 'The time of a complete vote for the address.', ['voter address']],
        [protocol_1.MODULES.arb, 'Voting Option', 1610, [protocol_1.ValueType.TYPE_ADDRESS, protocol_1.ValueType.TYPE_U8], protocol_1.ValueType.TYPE_BOOL, 'Does an address complete voting for the option?', ['voter address', 'option index']],
        [protocol_1.MODULES.arb, 'Number of Options', 1611, [], protocol_1.ValueType.TYPE_U64, 'Number of voting options.', []],
        [protocol_1.MODULES.arb, 'Number of Votes', 1612, [protocol_1.ValueType.TYPE_U8], protocol_1.ValueType.TYPE_U64, 'The number of votes received for an option.', ['option index']],
    ];
    Guard.BoolCmd = Guard.QUERIES.filter(function (q) { return q[4] === protocol_1.ValueType.TYPE_BOOL; });
    Guard.IsBoolCmd = function (cmd) { return Guard.BoolCmd.includes(function (q) { return q[2] == cmd; }); };
    Guard.CmdFilter = function (retType) { return Guard.QUERIES.filter(function (q) { return q[4] === retType; }); };
    Guard.GetCmd = function (cmd) {
        return Guard.QUERIES.find(function (q) { return q[2] == cmd; });
    };
    Guard.GetCmdOption = function (cmd) {
        var r = Guard.GetCmd(cmd);
        if (!r)
            return r;
        return { from: 'query', name: r[1], value: r[2], group: (0, utils_2.FirstLetterUppercase)(r[0]) };
    };
    Guard.GetInputParams = function (cmd) {
        var r = Guard.GetCmd(cmd);
        if (!r)
            return [];
        return r[3];
    };
    Guard.GetModuleName = function (cmd) {
        var r = Guard.GetCmd(cmd);
        if (!r)
            return '';
        return (0, utils_2.FirstLetterUppercase)(r[0]);
    };
    Guard.NumberOptions = function () {
        var r = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], __read(Guard.CmdFilter(protocol_1.ValueType.TYPE_U8)), false), __read(Guard.CmdFilter(protocol_1.ValueType.TYPE_U64)), false), __read(Guard.CmdFilter(protocol_1.ValueType.TYPE_U128)), false), __read(Guard.CmdFilter(protocol_1.ValueType.TYPE_U256)), false).map(function (v) {
            return { from: 'query', name: v[1], value: v[2], group: (0, utils_2.FirstLetterUppercase)(v[0]) };
        });
        return r.concat(Guard.Crunchings);
    };
    Guard.Signer = { from: 'type', name: 'Txn Signer', value: protocol_1.ContextType.TYPE_SIGNER, group: 'Txn Functions' };
    Guard.Time = { from: 'type', name: 'Txn Time', value: protocol_1.ContextType.TYPE_CLOCK, group: 'Txn Functions' };
    Guard.Guard = { from: 'type', name: 'Guard Address', value: protocol_1.ContextType.TYPE_GUARD, group: 'Txn Functions' };
    Guard.Logics = function () { return protocol_1.LogicsInfo.map(function (v) { return { from: 'type', name: v[1], value: v[0], group: 'Compare or Logic' }; }); };
    Guard.Crunchings = [
        { from: 'type', name: 'Txn Time', value: protocol_1.ContextType.TYPE_CLOCK, group: 'Txn Functions' },
        { from: 'type', name: 'PositiveNumber Add (+)', value: protocol_1.OperatorType.TYPE_NUMBER_ADD, group: 'Number Crunching' },
        { from: 'type', name: 'PositiveNumber Subtract (-)', value: protocol_1.OperatorType.TYPE_NUMBER_SUBTRACT, group: 'Number Crunching' },
        { from: 'type', name: 'PositiveNumber Multiply (*)', value: protocol_1.OperatorType.TYPE_NUMBER_MULTIPLY, group: 'Number Crunching' },
        { from: 'type', name: 'PositiveNumber Devide (/)', value: protocol_1.OperatorType.TYPE_NUMBER_DEVIDE, group: 'Number Crunching' },
        { from: 'type', name: 'PositiveNumber Mod (%)', value: protocol_1.OperatorType.TYPE_NUMBER_MOD, group: 'Number Crunching' },
    ];
    Guard.CommonOptions = function (retType) {
        return Guard.CmdFilter(retType).map(function (v) { return { from: 'query', name: v[1], value: v[2], group: (0, utils_2.FirstLetterUppercase)(v[0]) }; });
    };
    Guard.AllOptions = function () {
        var r = Guard.QUERIES.map(function (v) { return { from: 'query', name: v[1], value: v[2], group: (0, utils_2.FirstLetterUppercase)(v[0]) }; });
        return __spreadArray(__spreadArray(__spreadArray(__spreadArray([], __read(r), false), __read(Guard.Crunchings), false), __read(Guard.Logics()), false), [Guard.Signer, Guard.Time, Guard.Guard], false);
    };
    Guard.StringOptions = function () {
        return __spreadArray([], __read(Guard.CmdFilter(protocol_1.ValueType.TYPE_STRING)), false).map(function (v) {
            return { from: 'query', name: v[1], value: v[2], group: (0, utils_2.FirstLetterUppercase)(v[0]) };
        });
    };
    Guard.BoolOptions = function () {
        var n1 = Guard.BoolCmd.map(function (v) { return { from: 'query', name: v[1], value: v[2], group: (0, utils_2.FirstLetterUppercase)(v[0]) }; });
        return __spreadArray(__spreadArray([], __read(n1), false), __read(Guard.Logics()), false);
    };
    Guard.AddressOptions = function () {
        var n1 = Guard.QUERIES.filter(function (q) { return q[4] === protocol_1.ValueType.TYPE_ADDRESS; }).map(function (v) { return { from: 'query', name: v[1], value: v[2], group: (0, utils_2.FirstLetterUppercase)(v[0]) }; });
        n1.push(Guard.Signer);
        n1.push(Guard.Guard);
        return __spreadArray([], __read(n1), false);
    };
    Guard.Options = function (ret_type) {
        if (ret_type === 'number') {
            return Guard.NumberOptions();
        }
        else if (ret_type === 'any') {
            return Guard.AllOptions();
        }
        switch (ret_type) {
            case protocol_1.ValueType.TYPE_BOOL:
                return Guard.BoolOptions();
            case protocol_1.ValueType.TYPE_STRING:
                return Guard.StringOptions();
        }
        return Guard.CommonOptions(ret_type);
    };
    return Guard;
}());
exports.Guard = Guard;
var GuardMaker = /** @class */ (function () {
    function GuardMaker() {
        this.data = [];
        this.type_validator = [];
        this.constant = new Map();
    }
    GuardMaker.get_index = function () {
        if (GuardMaker.index == 256) {
            GuardMaker.index = 1;
        }
        return GuardMaker.index++;
    };
    // undefined value means witness
    GuardMaker.prototype.add_constant = function (type, value, identifier, bNeedSerialize) {
        if (bNeedSerialize === void 0) { bNeedSerialize = true; }
        if (identifier === undefined)
            identifier = GuardMaker.get_index();
        var v = this.constant.get(identifier);
        if (!v) {
            if (bNeedSerialize && value !== undefined) {
                value = utils_2.Bcs.getInstance().ser(type, value);
            }
            this.constant.set(identifier, { type: type, value: value === undefined ? undefined : value, bWitness: value === undefined ? true : false });
        }
        return identifier;
    };
    // serialize const & data, WITNESS use constants only.
    GuardMaker.prototype.add_param = function (type, param) {
        switch (type) {
            case protocol_1.ValueType.TYPE_ADDRESS:
            case protocol_1.ValueType.TYPE_BOOL:
            case protocol_1.ValueType.TYPE_U8:
            case protocol_1.ValueType.TYPE_U64:
            case protocol_1.ValueType.TYPE_U128:
            case protocol_1.ValueType.TYPE_U256:
            case protocol_1.ValueType.TYPE_VEC_ADDRESS:
            case protocol_1.ValueType.TYPE_VEC_BOOL:
            case protocol_1.ValueType.TYPE_VEC_U128:
            case protocol_1.ValueType.TYPE_VEC_U64:
            case protocol_1.ValueType.TYPE_VEC_VEC_U8:
            case protocol_1.ValueType.TYPE_OPTION_U64:
            case protocol_1.ValueType.TYPE_OPTION_ADDRESS:
            case protocol_1.ValueType.TYPE_OPTION_BOOL:
            case protocol_1.ValueType.TYPE_OPTION_U128:
            case protocol_1.ValueType.TYPE_OPTION_U256:
            case protocol_1.ValueType.TYPE_OPTION_U8:
            case protocol_1.ValueType.TYPE_VEC_U256:
                this.data.push(utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_U8, type));
                this.data.push(utils_2.Bcs.getInstance().ser(type, param));
                this.type_validator.push(type);
                break;
            case protocol_1.ValueType.TYPE_STRING:
            case protocol_1.ValueType.TYPE_VEC_U8:
                if (!param)
                    (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'param: ' + type);
                this.data.push(utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_U8, type));
                if (typeof (param) == 'string') {
                    this.data.push(utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_STRING, param));
                }
                else {
                    this.data.push(utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_VEC_U8, param));
                }
                this.type_validator.push(type);
                break;
            case protocol_1.ContextType.TYPE_SIGNER:
                this.data.push(utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_U8, type));
                this.type_validator.push(protocol_1.ValueType.TYPE_ADDRESS);
                break;
            case protocol_1.ContextType.TYPE_GUARD:
                this.data.push(utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_U8, type));
                this.type_validator.push(protocol_1.ValueType.TYPE_ADDRESS);
                break;
            case protocol_1.ContextType.TYPE_CLOCK:
                this.data.push(utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_U8, type));
                this.type_validator.push(protocol_1.ValueType.TYPE_U64);
                break;
            case protocol_1.ContextType.TYPE_CONSTANT:
                if (typeof (param) !== 'number' || !(0, utils_2.IsValidInt)(param) || param > 255) {
                    (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'add_param param:' + type);
                }
                var v = this.constant.get(param);
                if (!v)
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'identifier not in constant:' + param);
                this.type_validator.push(v.type); //@ type validator convert
                this.data.push(utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_U8, type)); // constant flag
                this.data.push(utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_U8, param)); // identifier
                break;
            default:
                (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'add_param type:' + type);
        }
        ;
        return this;
    };
    // object_address_from: string for static address; number as identifier  inconstant
    GuardMaker.prototype.add_query = function (module, query_name, object_address_from) {
        var query_index = Guard.QUERIES.findIndex(function (q) {
            return q[0] == module && q[1] == query_name;
        });
        if (query_index == -1) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'query_name:' + query_name);
        }
        if (typeof (object_address_from) == 'number') {
            if (!GuardMaker.IsValidIndentifier(object_address_from)) {
                (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'object_address_from:' + query_name);
            }
        }
        else {
            if (!(0, utils_2.IsValidAddress)(object_address_from)) {
                (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'object_address_from:' + query_name);
            }
        }
        var offset = this.type_validator.length - Guard.QUERIES[query_index][3].length;
        if (offset < 0) {
            (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'offset:' + query_name);
        }
        var types = this.type_validator.slice(offset);
        if (!(0, utils_1.array_equal)(types, Guard.QUERIES[query_index][3])) { // type validate 
            (0, exception_1.ERROR)(exception_1.Errors.Fail, 'array_equal:' + query_name);
        }
        this.data.push(utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_U8, protocol_1.OperatorType.TYPE_QUERY)); // QUERY TYPE
        if (typeof (object_address_from) == 'string') {
            this.data.push(utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_U8, protocol_1.ValueType.TYPE_ADDRESS));
            this.data.push(utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_ADDRESS, object_address_from)); // object address            
        }
        else {
            var v = this.constant.get(object_address_from);
            if (!v)
                (0, exception_1.ERROR)(exception_1.Errors.Fail, 'object_address_from not in constant:' + query_name);
            if ((v === null || v === void 0 ? void 0 : v.type) == protocol_1.ValueType.TYPE_ADDRESS) {
                this.data.push(utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_U8, protocol_1.ContextType.TYPE_CONSTANT));
                this.data.push(utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_U8, object_address_from)); // object identifer in constants
            }
            else {
                (0, exception_1.ERROR)(exception_1.Errors.Fail, 'type bWitness not match:' + query_name);
            }
        }
        this.data.push(utils_2.Bcs.getInstance().ser('u16', Guard.QUERIES[query_index][2])); // cmd(u16)
        this.type_validator.splice(offset, Guard.QUERIES[query_index][3].length); // delete type stack
        this.type_validator.push(Guard.QUERIES[query_index][4]); // add the return value type to type stack
        return this;
    };
    GuardMaker.prototype.add_logic = function (type, logic_count) {
        if (logic_count === void 0) { logic_count = 2; }
        var e = protocol_1.LogicsInfo.find(function (v) { return v[0] === type; });
        if (e) {
            e = e[1];
        }
        var splice_len = 2;
        var cur;
        var ret = protocol_1.ValueType.TYPE_BOOL;
        switch (type) {
            case protocol_1.OperatorType.TYPE_LOGIC_AS_U256_GREATER:
            case protocol_1.OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_AS_U256_LESSER:
            case protocol_1.OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_AS_U256_EQUAL:
                if (!logic_count || logic_count < 2)
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'logic param invalid:' + e);
                splice_len = logic_count;
                if (this.type_validator.length < splice_len) {
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'type_validator.length:' + e);
                }
                for (var i = 1; i <= splice_len; ++i) {
                    if (!GuardMaker.match_u256(this.type_validator[this.type_validator.length - i])) {
                        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'type_validator check:' + e);
                    }
                }
                break;
            case protocol_1.OperatorType.TYPE_LOGIC_EQUAL:
                if (!logic_count || logic_count < 2)
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'logic param invalid:' + e);
                splice_len = logic_count;
                if (this.type_validator.length < splice_len) {
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'type_validator.length:' + e);
                }
                cur = this.type_validator[this.type_validator.length - 1];
                for (var i = 2; i <= splice_len; ++i) {
                    if (this.type_validator[this.type_validator.length - i] !== cur)
                        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'type_validator check:' + e);
                }
                break;
            case protocol_1.OperatorType.TYPE_LOGIC_HAS_SUBSTRING:
                if (!logic_count || logic_count < 2)
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'logic param invalid:' + e);
                splice_len = logic_count;
                if (this.type_validator.length < splice_len) {
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'type_validator.length:' + e);
                }
                for (var i = 1; i <= splice_len; ++i) {
                    if (this.type_validator[this.type_validator.length - i] !== protocol_1.ValueType.TYPE_STRING)
                        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'type_validator check:' + e);
                }
                break;
            case protocol_1.OperatorType.TYPE_LOGIC_NOT:
                splice_len = 1;
                if (this.type_validator.length < splice_len) {
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'type_validator.length:' + e);
                }
                if (this.type_validator[this.type_validator.length - 1] != protocol_1.ValueType.TYPE_BOOL) {
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'type_validator check:' + e);
                }
                break;
            case protocol_1.OperatorType.TYPE_LOGIC_AND:
            case protocol_1.OperatorType.TYPE_LOGIC_OR: //@ logics count
                if (!logic_count || logic_count < 2)
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'logic param invalid:' + e);
                splice_len = logic_count;
                if (this.type_validator.length < splice_len) {
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'type_validator.length:' + e);
                }
                for (var i = 1; i <= splice_len; ++i) {
                    if (this.type_validator[this.type_validator.length - i] != protocol_1.ValueType.TYPE_BOOL) {
                        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'type_validator check:' + e);
                    }
                }
                break;
            case protocol_1.OperatorType.TYPE_LOGIC_ALWAYS_TRUE:
                break;
            case protocol_1.OperatorType.TYPE_NUMBER_ADD:
            case protocol_1.OperatorType.TYPE_NUMBER_DEVIDE:
            case protocol_1.OperatorType.TYPE_NUMBER_MULTIPLY:
            case protocol_1.OperatorType.TYPE_NUMBER_SUBTRACT:
            case protocol_1.OperatorType.TYPE_NUMBER_MOD:
                if (!logic_count || logic_count < 2)
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'logic param invalid:' + e);
                splice_len = logic_count;
                if (this.type_validator.length < splice_len) {
                    (0, exception_1.ERROR)(exception_1.Errors.Fail, 'type_validator.length:' + e);
                }
                for (var i = 1; i <= splice_len; ++i) {
                    if (!GuardMaker.match_u256(this.type_validator[this.type_validator.length - 1])) {
                        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'type_validator check:' + e);
                    }
                }
                ret = protocol_1.ValueType.TYPE_U256;
                break;
            default:
                (0, exception_1.ERROR)(exception_1.Errors.InvalidParam, 'add_logic type invalid:' + e);
        }
        this.data.push(utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_U8, type)); // TYPE 
        if (GuardMaker.is_multi_input_op(type)) {
            this.data.push((utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_U8, logic_count))); //@ logics
        }
        this.type_validator.splice(this.type_validator.length - splice_len); // delete type stack   
        this.type_validator.push(ret); // add bool to type stack
        return this;
    };
    GuardMaker.prototype.hasIdentifier = function (id) {
        return this.constant.has(id);
    };
    GuardMaker.prototype.build = function (bNot) {
        if (bNot === void 0) { bNot = false; }
        //console.log(this.type_validator);
        //this.data.forEach((value:Uint8Array) => console.log(value));
        if (this.type_validator.length != 1 || this.type_validator[0] != protocol_1.ValueType.TYPE_BOOL) {
            (0, exception_1.ERROR)(exception_1.Errors.Fail, 'type_validator check');
        } // ERROR
        if (bNot) {
            this.add_logic(protocol_1.OperatorType.TYPE_LOGIC_NOT);
        }
        this.data.push(utils_1.concatenate.apply(void 0, __spreadArray([Uint8Array], __read(this.data), false)));
        this.data.splice(0, this.data.length - 1);
        return this;
    };
    GuardMaker.prototype.IsReady = function () {
        return this.type_validator.length == 1 && this.type_validator[0] == protocol_1.ValueType.TYPE_BOOL && this.data.length == 1;
    };
    GuardMaker.prototype.combine = function (otherBuilt, bAnd, bCombinConstant) {
        if (bAnd === void 0) { bAnd = true; }
        if (bCombinConstant === void 0) { bCombinConstant = false; }
        if (!otherBuilt.IsReady() || !this.IsReady()) {
            (0, exception_1.ERROR)(exception_1.Errors.Fail, 'both should built yet');
        }
        ;
        var maker = new GuardMaker();
        this.constant.forEach(function (v, k) {
            maker.constant.set(k, { type: v.type, value: v.value, bWitness: v.bWitness });
        });
        otherBuilt.constant.forEach(function (v, k) {
            if (maker.constant.has(k) && !bCombinConstant) {
                (0, exception_1.ERROR)(exception_1.Errors.Fail, 'constant identifier exist');
            }
            maker.constant.set(k, { type: v.type, value: v.value, bWitness: v.bWitness });
        });
        var op = bAnd ? protocol_1.OperatorType.TYPE_LOGIC_AND : protocol_1.OperatorType.TYPE_LOGIC_OR;
        maker.data.push(utils_1.concatenate.apply(void 0, __spreadArray(__spreadArray(__spreadArray([Uint8Array], __read(this.data), false), __read(otherBuilt.data), false), [utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_U8, op), utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_U8, 2)], false)));
        this.data.splice(0, this.data.length - 1);
        maker.type_validator = this.type_validator;
        return maker;
    };
    GuardMaker.prototype.get_constant = function () { return this.constant; };
    GuardMaker.prototype.get_input = function () { return this.data; };
    // and/or + logics count
    GuardMaker.input_combine = function (input1, input2, bAnd) {
        if (bAnd === void 0) { bAnd = true; }
        var op = bAnd ? protocol_1.OperatorType.TYPE_LOGIC_AND : protocol_1.OperatorType.TYPE_LOGIC_OR;
        return (0, utils_1.concatenate)(Uint8Array, input1, input2, utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_U8, op), utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_U8, 2));
    };
    GuardMaker.input_not = function (input) {
        return (0, utils_1.concatenate)(Uint8Array, input, utils_2.Bcs.getInstance().ser(protocol_1.ValueType.TYPE_U8, protocol_1.OperatorType.TYPE_LOGIC_NOT));
    };
    GuardMaker.match_u256 = function (type) {
        return (type == protocol_1.ValueType.TYPE_U8 || type == protocol_1.ValueType.TYPE_U64 || type == protocol_1.ValueType.TYPE_U128 || type == protocol_1.ValueType.TYPE_U256);
    };
    GuardMaker.is_multi_input_op = function (type) {
        return (type === protocol_1.OperatorType.TYPE_LOGIC_AS_U256_GREATER ||
            type === protocol_1.OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL ||
            type === protocol_1.OperatorType.TYPE_LOGIC_AS_U256_LESSER ||
            type === protocol_1.OperatorType.TYPE_LOGIC_AS_U256_LESSER ||
            type === protocol_1.OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL ||
            type === protocol_1.OperatorType.TYPE_LOGIC_AS_U256_EQUAL ||
            type === protocol_1.OperatorType.TYPE_LOGIC_EQUAL ||
            type === protocol_1.OperatorType.TYPE_LOGIC_HAS_SUBSTRING ||
            type === protocol_1.OperatorType.TYPE_LOGIC_AND ||
            type === protocol_1.OperatorType.TYPE_LOGIC_OR ||
            type === protocol_1.OperatorType.TYPE_NUMBER_ADD ||
            type === protocol_1.OperatorType.TYPE_NUMBER_DEVIDE ||
            type === protocol_1.OperatorType.TYPE_NUMBER_MULTIPLY ||
            type === protocol_1.OperatorType.TYPE_NUMBER_SUBTRACT ||
            type === protocol_1.OperatorType.TYPE_NUMBER_MOD);
    };
    GuardMaker.index = 1;
    GuardMaker.IsValidIndentifier = function (identifier) {
        if (!(0, utils_2.IsValidInt)(identifier) || identifier > 255)
            return false;
        return true;
    };
    return GuardMaker;
}());
exports.GuardMaker = GuardMaker;
