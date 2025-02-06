"use strict";
/**
 * Provides permission lookup for an address:
 * not only the permission table, but also the administrator or Builder identity.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSION_QUERY = void 0;
var transactions_1 = require("@mysten/sui/transactions");
var protocol_1 = require("../protocol");
var utils_1 = require("../utils");
var exception_1 = require("../exception");
var permission_1 = require("../permission");
var bcs_1 = require("@mysten/bcs");
var PERMISSION_QUERY;
(function (PERMISSION_QUERY) {
    var _this = this;
    /*json: PermissionQuery; return PermissionAnswer */
    PERMISSION_QUERY.permission_json = function (json) { return __awaiter(_this, void 0, void 0, function () {
        var q, _a, _b, e_1;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    q = JSON.parse(json);
                    _b = (_a = JSON).stringify;
                    _c = {};
                    return [4 /*yield*/, PERMISSION_QUERY.permission(q)];
                case 1: return [2 /*return*/, _b.apply(_a, [(_c.data = _d.sent(), _c)])];
                case 2:
                    e_1 = _d.sent();
                    return [2 /*return*/, JSON.stringify({ error: e_1 })];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    PERMISSION_QUERY.permission = function (query) { return __awaiter(_this, void 0, void 0, function () {
        var txb, object, res, perm, perms, guards, items, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(0, utils_1.IsValidAddress)(query.permission_object)) {
                        (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'permission.permission_object');
                    }
                    if (!(0, utils_1.IsValidAddress)(query.address)) {
                        (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'permission.address');
                    }
                    txb = new transactions_1.Transaction();
                    object = permission_1.Permission.From(txb, query.permission_object);
                    object.query_permissions_all(query.address);
                    return [4 /*yield*/, protocol_1.Protocol.Client().devInspectTransactionBlock({ sender: query.address, transactionBlock: txb })];
                case 1:
                    res = _a.sent();
                    if (res.results && res.results[0].returnValues && res.results[0].returnValues.length !== 3) {
                        (0, exception_1.ERROR)(exception_1.Errors.Fail, 'permission.retValues');
                    }
                    perm = utils_1.Bcs.getInstance().de(bcs_1.BCS.U8, Uint8Array.from(res.results[0].returnValues[0][0]));
                    if (perm === permission_1.Permission.PERMISSION_ADMIN || perm === permission_1.Permission.PERMISSION_OWNER_AND_ADMIN) {
                        return [2 /*return*/, { who: query.address, admin: true, owner: perm % 2 === 1, items: [], object: query.permission_object }];
                    }
                    else {
                        perms = utils_1.Bcs.getInstance().de('vector<u64>', Uint8Array.from(res.results[0].returnValues[1][0]));
                        guards = utils_1.Bcs.getInstance().de_guards(Uint8Array.from(res.results[0].returnValues[2][0]));
                        items = [];
                        for (i = 0; i < perms.length; ++i) {
                            items.push({ query: perms[i], permission: true, guard: guards[i] ? ('0x' + guards[i]) : undefined });
                        }
                        return [2 /*return*/, { who: query.address, admin: false, owner: perm % 2 === 1, items: items, object: query.permission_object }];
                    }
                    return [2 /*return*/];
            }
        });
    }); };
})(PERMISSION_QUERY || (exports.PERMISSION_QUERY = PERMISSION_QUERY = {}));
