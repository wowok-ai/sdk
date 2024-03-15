"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Community = void 0;
const client_1 = require("../node_modules/@mysten/sui.js/client");
const transactions_1 = require("../node_modules/@mysten/sui.js/transactions");
const ed25519_1 = require("../node_modules/@mysten/sui.js/keypairs/ed25519");
const bcs_1 = require("../node_modules/@mysten/bcs");
const config_js_1 = require("./config.js");
__exportStar(require("./config.js"), exports);
class Community {
    constructor(entry) {
        this.client = new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)(entry) });
    }
    create(data) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const txb = new transactions_1.TransactionBlock();
            /// resolve nd
            var community = txb.moveCall({
                target: (0, config_js_1.CommunityFn)('new'),
                arguments: [
                    txb.pure((_a = data.name) !== null && _a !== void 0 ? _a : '', bcs_1.BCS.STRING),
                    txb.pure((_b = data.discription) !== null && _b !== void 0 ? _b : '', bcs_1.BCS.STRING)
                ],
            });
            /// resolve admins  
            data.admins.forEach((admin) => {
                console.log(admin.address);
                txb.moveCall({
                    target: (0, config_js_1.CommunityFn)('admin_add'),
                    arguments: [
                        community,
                        txb.pure(admin.address, bcs_1.BCS.ADDRESS)
                    ]
                });
            });
            /// resolve members
            data.members.forEach((member) => {
                var _a;
                txb.moveCall({
                    target: (0, config_js_1.CommunityFn)('member_addforce'),
                    arguments: [
                        community,
                        txb.pure(member.address, bcs_1.BCS.ADDRESS),
                        txb.pure((_a = member.name) !== null && _a !== void 0 ? _a : '', bcs_1.BCS.STRING)
                    ]
                });
            });
            /// create
            txb.moveCall({
                target: (0, config_js_1.CommunityFn)('create'),
                arguments: [
                    community
                ]
            });
            const privkey = (0, bcs_1.fromHEX)(config_js_1.SENDER_PRIV);
            const keypair = ed25519_1.Ed25519Keypair.fromSecretKey(privkey);
            const options = { showInput: true,
                showEffects: true,
                showEvents: true,
                showBalanceChanges: true,
                showObjectChanges: true };
            const response = yield this.client.signAndExecuteTransactionBlock({
                transactionBlock: txb,
                signer: keypair,
                options
            });
            console.log(response);
            return response;
        });
    }
}
exports.Community = Community;
