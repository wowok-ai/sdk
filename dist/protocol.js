"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBJECTS_TYPE = exports.OBJECTS_TYPE_PREFIX = exports.PROTOCOL = exports.Protocol = exports.ENTRYPOINT = exports.ContextType = exports.OperatorType = exports.ValueType = exports.CLOCK_OBJECT = exports.TXB_OBJECT = exports.MODULES = exports.IsValidObjects = exports.IsValidArray = exports.IsValidPercent = exports.IsValidInt = exports.IsValidUint = exports.IsValidArgType = exports.IsValidAddress = exports.IsValidEndpoint = exports.IsValidName_AllowEmpty = exports.IsValidName = exports.IsValidDesription = exports.OptionNone = exports.MAX_ENDPOINT_LENGTH = exports.MAX_NAME_LENGTH = exports.MAX_DESCRIPTION_LENGTH = void 0;
const client_1 = require("@mysten/sui.js/client");
const ed25519_1 = require("@mysten/sui.js/keypairs/ed25519");
const bcs_1 = require("@mysten/bcs");
const transactions_1 = require("@mysten/sui.js/transactions");
const util_1 = require("./util");
exports.MAX_DESCRIPTION_LENGTH = 1024;
exports.MAX_NAME_LENGTH = 64;
exports.MAX_ENDPOINT_LENGTH = 1024;
const OptionNone = (txb) => { return txb.pure([], bcs_1.BCS.U8); };
exports.OptionNone = OptionNone;
const IsValidDesription = (description) => { return description.length <= exports.MAX_DESCRIPTION_LENGTH; };
exports.IsValidDesription = IsValidDesription;
const IsValidName = (name) => { return name.length <= exports.MAX_NAME_LENGTH && name.length != 0; };
exports.IsValidName = IsValidName;
const IsValidName_AllowEmpty = (name) => { return name.length <= exports.MAX_NAME_LENGTH; };
exports.IsValidName_AllowEmpty = IsValidName_AllowEmpty;
const IsValidEndpoint = (endpoint) => { return endpoint.length <= exports.MAX_ENDPOINT_LENGTH; };
exports.IsValidEndpoint = IsValidEndpoint;
const IsValidAddress = (address) => { return address.length != 0; };
exports.IsValidAddress = IsValidAddress;
const IsValidArgType = (argType) => { return argType.length != 0; };
exports.IsValidArgType = IsValidArgType;
const IsValidUint = (value) => { return Number.isSafeInteger(value) && value != 0; };
exports.IsValidUint = IsValidUint;
const IsValidInt = (value) => { return Number.isSafeInteger(value); };
exports.IsValidInt = IsValidInt;
const IsValidPercent = (value) => { return Number.isSafeInteger(value) && value > 0 && value <= 100; };
exports.IsValidPercent = IsValidPercent;
const IsValidArray = (arr, validFunc) => {
    let bValid = true;
    arr.forEach((v) => {
        if (!validFunc(v)) {
            bValid = false;
        }
    });
    return bValid;
};
exports.IsValidArray = IsValidArray;
const IsValidObjects = (arr) => {
    return (0, exports.IsValidArray)(arr, (v) => {
        if (!v)
            return false;
        return true;
    });
};
exports.IsValidObjects = IsValidObjects;
var MODULES;
(function (MODULES) {
    MODULES["machine"] = "machine";
    MODULES["node"] = "node";
    MODULES["progress"] = "progress";
    MODULES["community"] = "community";
    MODULES["repository"] = "repository";
    MODULES["permission"] = "permission";
    MODULES["passport"] = "passport";
    MODULES["guard"] = "guard";
    MODULES["vote"] = "vote";
    MODULES["demand"] = "demand";
    MODULES["order"] = "order";
    MODULES["reward"] = "reward";
    MODULES["service"] = "service";
    MODULES["wowok"] = "wowok";
})(MODULES || (exports.MODULES = MODULES = {}));
function TXB_OBJECT(txb, arg) {
    if (typeof arg == 'string')
        return txb.object(arg);
    return arg;
}
exports.TXB_OBJECT = TXB_OBJECT;
exports.CLOCK_OBJECT = transactions_1.Inputs.SharedObjectRef({
    objectId: "0x6",
    mutable: false,
    initialSharedVersion: 1,
});
var ValueType;
(function (ValueType) {
    ValueType[ValueType["TYPE_STATIC_bool"] = 100] = "TYPE_STATIC_bool";
    ValueType[ValueType["TYPE_STATIC_address"] = 101] = "TYPE_STATIC_address";
    ValueType[ValueType["TYPE_STATIC_u64"] = 102] = "TYPE_STATIC_u64";
    ValueType[ValueType["TYPE_STATIC_u8"] = 103] = "TYPE_STATIC_u8";
    ValueType[ValueType["TYPE_STATIC_u128"] = 104] = "TYPE_STATIC_u128";
    ValueType[ValueType["TYPE_STATIC_vec_u8"] = 105] = "TYPE_STATIC_vec_u8";
    ValueType[ValueType["TYPE_STATIC_vec_address"] = 106] = "TYPE_STATIC_vec_address";
    ValueType[ValueType["TYPE_STATIC_vec_bool"] = 107] = "TYPE_STATIC_vec_bool";
    ValueType[ValueType["TYPE_STATIC_vec_vec_u8"] = 108] = "TYPE_STATIC_vec_vec_u8";
    ValueType[ValueType["TYPE_STATIC_vec_u64"] = 109] = "TYPE_STATIC_vec_u64";
    ValueType[ValueType["TYPE_STATIC_vec_u128"] = 110] = "TYPE_STATIC_vec_u128";
    ValueType[ValueType["TYPE_STATIC_option_address"] = 111] = "TYPE_STATIC_option_address";
    ValueType[ValueType["TYPE_STATIC_option_bool"] = 112] = "TYPE_STATIC_option_bool";
    ValueType[ValueType["TYPE_STATIC_option_u8"] = 113] = "TYPE_STATIC_option_u8";
    ValueType[ValueType["TYPE_STATIC_option_u64"] = 114] = "TYPE_STATIC_option_u64";
    ValueType[ValueType["TYPE_STATIC_option_u128"] = 115] = "TYPE_STATIC_option_u128";
})(ValueType || (exports.ValueType = ValueType = {}));
var OperatorType;
(function (OperatorType) {
    OperatorType[OperatorType["TYPE_DYNAMIC_QUERY"] = 1] = "TYPE_DYNAMIC_QUERY";
    OperatorType[OperatorType["TYPE_LOGIC_OPERATOR_U128_GREATER"] = 11] = "TYPE_LOGIC_OPERATOR_U128_GREATER";
    OperatorType[OperatorType["TYPE_LOGIC_OPERATOR_U128_GREATER_EQUAL"] = 12] = "TYPE_LOGIC_OPERATOR_U128_GREATER_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_OPERATOR_U128_LESSER"] = 13] = "TYPE_LOGIC_OPERATOR_U128_LESSER";
    OperatorType[OperatorType["TYPE_LOGIC_OPERATOR_U128_LESSER_EQUAL"] = 14] = "TYPE_LOGIC_OPERATOR_U128_LESSER_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_OPERATOR_U128_EQUAL"] = 15] = "TYPE_LOGIC_OPERATOR_U128_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_OPERATOR_EQUAL"] = 16] = "TYPE_LOGIC_OPERATOR_EQUAL";
    OperatorType[OperatorType["TYPE_LOGIC_OPERATOR_HAS_SUBSTRING"] = 17] = "TYPE_LOGIC_OPERATOR_HAS_SUBSTRING";
    OperatorType[OperatorType["TYPE_LOGIC_ALWAYS_TRUE"] = 18] = "TYPE_LOGIC_ALWAYS_TRUE";
})(OperatorType || (exports.OperatorType = OperatorType = {}));
var ContextType;
(function (ContextType) {
    ContextType[ContextType["TYPE_CONTEXT_SIGNER"] = 60] = "TYPE_CONTEXT_SIGNER";
    ContextType[ContextType["TYPE_CONTEXT_CURRENT_PROGRESS"] = 61] = "TYPE_CONTEXT_CURRENT_PROGRESS";
    ContextType[ContextType["TYPE_CONTEXT_CURRENT_CLOCK"] = 62] = "TYPE_CONTEXT_CURRENT_CLOCK";
})(ContextType || (exports.ContextType = ContextType = {}));
var ENTRYPOINT;
(function (ENTRYPOINT) {
    ENTRYPOINT["mainnet"] = "mainnet";
    ENTRYPOINT["testnet"] = "testnet";
    ENTRYPOINT["devnet"] = "devnet";
    ENTRYPOINT["localnet"] = "localnet";
})(ENTRYPOINT || (exports.ENTRYPOINT = ENTRYPOINT = {}));
class Protocol {
    network = '';
    package = '';
    signer = '';
    everyone_guard = '';
    constructor(network = ENTRYPOINT.localnet, signer = "0xe386bb9e01b3528b75f3751ad8a1e418b207ad979fea364087deef5250a73d3f") {
        this.signer = signer;
        this.UseNetwork(network);
    }
    UseNetwork(network = ENTRYPOINT.localnet) {
        this.network = network;
        switch (network) {
            case ENTRYPOINT.localnet:
                this.package = "0xe9721254e97dd074e06c5efe5c57be169b64b39ae48939d89c00bf2f62b19e10";
                this.everyone_guard = "0xb2a3fe7881cb883743c4e962b7e3c7716a1cd47a67adad01dc79795def4f769d";
                break;
            case ENTRYPOINT.devnet:
                break;
            case ENTRYPOINT.testnet:
                this.package = "0x717b14e0fb287594ce9aed4ee5fb87323469c79d15c1f82c676cf55c338bfb76";
                this.everyone_guard = "0x78a41fcc4f566360839613f6b917fb101ae015e56b43143f496f265b6422fddc";
                break;
            case ENTRYPOINT.mainnet:
                break;
        }
        ;
    }
    Package() { return this.package; }
    EveryoneGuard() { return this.everyone_guard; }
    NetworkUrl() {
        switch (this.network) {
            case ENTRYPOINT.localnet:
                return "http://127.0.0.1:9000";
            case ENTRYPOINT.devnet:
                return "https://fullnode.devnet.sui.io:443";
            case ENTRYPOINT.testnet:
                return "https://fullnode.testnet.sui.io:443";
            case ENTRYPOINT.mainnet:
                return "https://fullnode.mainnet.sui.io:443";
        }
        ;
        return "";
    }
    ;
    MachineFn = (fn) => { return `${this.package}::${MODULES.machine}::${fn}`; };
    NodeFn = (fn) => { return `${this.package}::${MODULES.node}::${fn}`; };
    ProgressFn = (fn) => { return `${this.package}::${MODULES.progress}::${fn}`; };
    CommunityFn = (fn) => { return `${this.package}::${MODULES.community}::${fn}`; };
    RepositoryFn = (fn) => { return `${this.package}::${MODULES.repository}::${fn}`; };
    PermissionFn = (fn) => { return `${this.package}::${MODULES.permission}::${fn}`; };
    PassportFn = (fn) => { return `${this.package}::${MODULES.passport}::${fn}`; };
    GuardFn = (fn) => { return `${this.package}::${MODULES.guard}::${fn}`; };
    VoteFn = (fn) => { return `${this.package}::${MODULES.vote}::${fn}`; };
    DemandFn = (fn) => { return `${this.package}::${MODULES.demand}::${fn}`; };
    OrderFn = (fn) => { return `${this.package}::${MODULES.order}::${fn}`; };
    RewardFn = (fn) => { return `${this.package}::${MODULES.reward}::${fn}`; };
    ServiceFn = (fn) => { return `${this.package}::${MODULES.service}::${fn}`; };
    WowokFn = (fn) => { return `${this.package}::${MODULES.wowok}::${fn}`; };
    Query = async (objects, options = { showContent: true }) => {
        const client = new client_1.SuiClient({ url: exports.PROTOCOL.NetworkUrl() });
        const ids = objects.map((value) => value.objectid);
        const res = await client.call('sui_multiGetObjects', [ids, options]);
        let ret = [];
        for (let i = 0; i < res.length; i++) {
            objects.forEach((object) => {
                object.callback(res[i], object, options);
            });
        }
        return res;
    };
    Sign_Excute = async (exes, priv_key, param, options = { showObjectChanges: true }) => {
        const client = new client_1.SuiClient({ url: exports.PROTOCOL.NetworkUrl() });
        const txb = new transactions_1.TransactionBlock();
        exes.forEach((e) => { e(txb, param); });
        const privkey = (0, bcs_1.fromHEX)(priv_key);
        const keypair = ed25519_1.Ed25519Keypair.fromSecretKey(privkey);
        const response = await client.signAndExecuteTransactionBlock({
            transactionBlock: txb,
            signer: keypair,
            options
        });
        return response;
    };
}
exports.Protocol = Protocol;
exports.PROTOCOL = new Protocol();
exports.OBJECTS_TYPE_PREFIX = Object.keys(MODULES).map((key) => { return exports.PROTOCOL.Package() + '::' + key + '::'; });
exports.OBJECTS_TYPE = Object.keys(MODULES).map((key) => { let i = exports.PROTOCOL.Package() + '::' + key + '::'; return i + (0, util_1.capitalize)(key); });
