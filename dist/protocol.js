"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OBJECTS_TYPE = exports.OBJECTS_TYPE_PREFIX = exports.PROTOCOL = exports.Protocol = exports.ENTRYPOINT = exports.Data_Type = exports.CLOCK_OBJECT = exports.TXB_OBJECT = exports.MODULES = exports.name_data = exports.endpoint_data = exports.description_data = exports.MAX_ENDPOINT_LENGTH = exports.MAX_NAME_LENGTH = exports.MAX_DESCRIPTION_LENGTH = void 0;
const client_1 = require("@mysten/sui.js/client");
const ed25519_1 = require("@mysten/sui.js/keypairs/ed25519");
const bcs_1 = require("@mysten/bcs");
const transactions_1 = require("@mysten/sui.js/transactions");
const util_1 = require("./util");
exports.MAX_DESCRIPTION_LENGTH = 1024;
exports.MAX_NAME_LENGTH = 64;
exports.MAX_ENDPOINT_LENGTH = 1024;
function description_data(description) {
    return description.substring(0, exports.MAX_DESCRIPTION_LENGTH);
}
exports.description_data = description_data;
function endpoint_data(endpoint) {
    return endpoint.substring(0, exports.MAX_ENDPOINT_LENGTH);
}
exports.endpoint_data = endpoint_data;
function name_data(name) {
    return name.substring(0, exports.MAX_NAME_LENGTH);
}
exports.name_data = name_data;
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
var Data_Type;
(function (Data_Type) {
    Data_Type[Data_Type["TYPE_DYNAMIC_QUERY"] = 1] = "TYPE_DYNAMIC_QUERY";
    Data_Type[Data_Type["TYPE_LOGIC_OPERATOR_U128_GREATER"] = 11] = "TYPE_LOGIC_OPERATOR_U128_GREATER";
    Data_Type[Data_Type["TYPE_LOGIC_OPERATOR_U128_GREATER_EQUAL"] = 12] = "TYPE_LOGIC_OPERATOR_U128_GREATER_EQUAL";
    Data_Type[Data_Type["TYPE_LOGIC_OPERATOR_U128_LESSER"] = 13] = "TYPE_LOGIC_OPERATOR_U128_LESSER";
    Data_Type[Data_Type["TYPE_LOGIC_OPERATOR_U128_LESSER_EQUAL"] = 14] = "TYPE_LOGIC_OPERATOR_U128_LESSER_EQUAL";
    Data_Type[Data_Type["TYPE_LOGIC_OPERATOR_U128_EQUAL"] = 15] = "TYPE_LOGIC_OPERATOR_U128_EQUAL";
    Data_Type[Data_Type["TYPE_LOGIC_OPERATOR_EQUAL"] = 16] = "TYPE_LOGIC_OPERATOR_EQUAL";
    Data_Type[Data_Type["TYPE_LOGIC_OPERATOR_HAS_SUBSTRING"] = 17] = "TYPE_LOGIC_OPERATOR_HAS_SUBSTRING";
    Data_Type[Data_Type["TYPE_LOGIC_ALWAYS_TRUE"] = 18] = "TYPE_LOGIC_ALWAYS_TRUE";
    // TYPE_LOGIC_OPERATOR_VECU8_CONTAINS = 18, // SUB VEC<U8>
    Data_Type[Data_Type["TYPE_CONTEXT_SIGNER"] = 60] = "TYPE_CONTEXT_SIGNER";
    Data_Type[Data_Type["TYPE_CONTEXT_CURRENT_PROGRESS"] = 61] = "TYPE_CONTEXT_CURRENT_PROGRESS";
    Data_Type[Data_Type["TYPE_CONTEXT_CURRENT_CLOCK"] = 62] = "TYPE_CONTEXT_CURRENT_CLOCK";
    Data_Type[Data_Type["TYPE_STATIC_bool"] = 100] = "TYPE_STATIC_bool";
    Data_Type[Data_Type["TYPE_STATIC_address"] = 101] = "TYPE_STATIC_address";
    Data_Type[Data_Type["TYPE_STATIC_u64"] = 102] = "TYPE_STATIC_u64";
    Data_Type[Data_Type["TYPE_STATIC_u8"] = 103] = "TYPE_STATIC_u8";
    Data_Type[Data_Type["TYPE_STATIC_u128"] = 104] = "TYPE_STATIC_u128";
    Data_Type[Data_Type["TYPE_STATIC_vec_u8"] = 105] = "TYPE_STATIC_vec_u8";
    Data_Type[Data_Type["TYPE_STATIC_vec_address"] = 106] = "TYPE_STATIC_vec_address";
    Data_Type[Data_Type["TYPE_STATIC_vec_bool"] = 107] = "TYPE_STATIC_vec_bool";
    Data_Type[Data_Type["TYPE_STATIC_vec_vec_u8"] = 108] = "TYPE_STATIC_vec_vec_u8";
    Data_Type[Data_Type["TYPE_STATIC_vec_u64"] = 109] = "TYPE_STATIC_vec_u64";
    Data_Type[Data_Type["TYPE_STATIC_vec_u128"] = 110] = "TYPE_STATIC_vec_u128";
    Data_Type[Data_Type["TYPE_STATIC_option_address"] = 111] = "TYPE_STATIC_option_address";
    Data_Type[Data_Type["TYPE_STATIC_option_bool"] = 112] = "TYPE_STATIC_option_bool";
    Data_Type[Data_Type["TYPE_STATIC_option_u8"] = 113] = "TYPE_STATIC_option_u8";
    Data_Type[Data_Type["TYPE_STATIC_option_u64"] = 114] = "TYPE_STATIC_option_u64";
    Data_Type[Data_Type["TYPE_STATIC_option_u128"] = 115] = "TYPE_STATIC_option_u128";
    Data_Type[Data_Type["TYPE_STATIC_by_value_specified"] = 126] = "TYPE_STATIC_by_value_specified";
    Data_Type[Data_Type["TYPE_STATIC_error"] = 127] = "TYPE_STATIC_error";
})(Data_Type || (exports.Data_Type = Data_Type = {}));
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
        this.network = network;
        this.signer = signer;
        switch (network) {
            case ENTRYPOINT.localnet:
                this.package = "0x74bc92ffc14f5a443e27dfd0016cdb37ac5a45a0ebd54ce0875b40d213600f3d";
                this.everyone_guard = "0x5db7fa50a92c45c3ac7b0110b1c68e2113ac4a82f1bb780c398eaac940b651c4";
                break;
            case ENTRYPOINT.devnet:
                break;
            case ENTRYPOINT.testnet:
                this.package = "0x038b0be329e4fd227d846b850aeb1822f9629c62c14d85ffcd22d856c843923f";
                this.everyone_guard = "0xdfe42468bfc7d7988fa1707978ef9376178dcefbe938d140a1bfd97abe755998";
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
        exes(txb, param);
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
