"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityFn = exports.MachineFn = exports.ContractFn = exports.MODULES = exports.ENTRYPOINT = exports.Config = exports.SENDER_PRIV = exports.PACKAGE = void 0;
exports.PACKAGE = "0x6b9dec1b3ca2e92f366eeeff47d119712f44d3a6cef8959f95b3a09bac2c9840"; // address, NOT id
exports.SENDER_PRIV = "0xc9bbc30f72ef7d9aa674a3be1448b9267141a676b59f3f4315231617a5bbc0e8";
class Config {
    constructor() {
    }
}
exports.Config = Config;
var ENTRYPOINT;
(function (ENTRYPOINT) {
    ENTRYPOINT["mainnet"] = "mainnet";
    ENTRYPOINT["testnet"] = "testnet";
    ENTRYPOINT["devnet"] = "devnet";
    ENTRYPOINT["localnet"] = "localnet";
})(ENTRYPOINT || (exports.ENTRYPOINT = ENTRYPOINT = {}));
var MODULES;
(function (MODULES) {
    MODULES["machine"] = "machine";
    MODULES["community"] = "community";
})(MODULES || (exports.MODULES = MODULES = {}));
exports.ContractFn = ((mod, fn) => { return `${exports.PACKAGE}::${mod}::${fn}`; });
const MachineFn = (fn) => { return `${exports.PACKAGE}::${MODULES.machine}::${fn}`; };
exports.MachineFn = MachineFn;
const CommunityFn = (fn) => { return `${exports.PACKAGE}::${MODULES.community}::${fn}`; };
exports.CommunityFn = CommunityFn;
