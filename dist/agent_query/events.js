"use strict";
/**
 * Provide AI with Basic WoWok event queries:
 * for real-time detail tracking.
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
exports.EVENT_QUERY = void 0;
var protocol_1 = require("../protocol");
var EVENT_QUERY;
(function (EVENT_QUERY) {
    var _this = this;
    EVENT_QUERY.newArbEvents = function (option) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, queryEvents(protocol_1.Protocol.Instance().Package('wowok') + '::arb::NewArbEvent', option)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    EVENT_QUERY.presentServiceEvents = function (option) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, queryEvents(protocol_1.Protocol.Instance().Package('wowok') + '::demand::PresentEvent', option)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    EVENT_QUERY.newProgressEvents = function (option) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, queryEvents(protocol_1.Protocol.Instance().Package('wowok') + '::progress::NewProgressEvent', option)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    EVENT_QUERY.newOrderEvents = function (option) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, queryEvents(protocol_1.Protocol.Instance().Package('wowok') + '::order::NewOrderEvent', option)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    var queryEvents = function (type, option) { return __awaiter(_this, void 0, void 0, function () {
        var res, data;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, protocol_1.Protocol.Client().queryEvents({ query: { MoveEventType: type }, cursor: option === null || option === void 0 ? void 0 : option.cursor, limit: option === null || option === void 0 ? void 0 : option.limit, order: option === null || option === void 0 ? void 0 : option.order })];
                case 1:
                    res = _b.sent();
                    data = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.map(function (v) {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
                        if ((v === null || v === void 0 ? void 0 : v.packageId) === protocol_1.Protocol.Instance().Package('wowok')) {
                            if ((_a = v === null || v === void 0 ? void 0 : v.type) === null || _a === void 0 ? void 0 : _a.includes('::order::NewOrderEvent')) {
                                return {
                                    id: v === null || v === void 0 ? void 0 : v.id, time: v === null || v === void 0 ? void 0 : v.timestampMs, type_raw: v === null || v === void 0 ? void 0 : v.type, sender: v === null || v === void 0 ? void 0 : v.sender, type: 'NewOrderEvent',
                                    order: (_b = v === null || v === void 0 ? void 0 : v.parsedJson) === null || _b === void 0 ? void 0 : _b.object, service: (_c = v === null || v === void 0 ? void 0 : v.parsedJson) === null || _c === void 0 ? void 0 : _c.service, progress: (_d = v === null || v === void 0 ? void 0 : v.parsedJson) === null || _d === void 0 ? void 0 : _d.progress, amount: (_e = v === null || v === void 0 ? void 0 : v.parsedJson) === null || _e === void 0 ? void 0 : _e.amount
                                };
                            }
                            else if ((_f = v === null || v === void 0 ? void 0 : v.type) === null || _f === void 0 ? void 0 : _f.includes('::demand::PresentEvent')) {
                                return {
                                    id: v === null || v === void 0 ? void 0 : v.id, time: v === null || v === void 0 ? void 0 : v.timestampMs, type_raw: v === null || v === void 0 ? void 0 : v.type, sender: v === null || v === void 0 ? void 0 : v.sender, type: 'NewOrderEvent',
                                    demand: (_g = v === null || v === void 0 ? void 0 : v.parsedJson) === null || _g === void 0 ? void 0 : _g.object, service: (_h = v === null || v === void 0 ? void 0 : v.parsedJson) === null || _h === void 0 ? void 0 : _h.service, recommendation: (_j = v === null || v === void 0 ? void 0 : v.parsedJson) === null || _j === void 0 ? void 0 : _j.tips
                                };
                            }
                            else if ((_k = v === null || v === void 0 ? void 0 : v.type) === null || _k === void 0 ? void 0 : _k.includes('::progress::NewProgressEvent')) {
                                return {
                                    id: v === null || v === void 0 ? void 0 : v.id, time: v === null || v === void 0 ? void 0 : v.timestampMs, type_raw: v === null || v === void 0 ? void 0 : v.type, sender: v === null || v === void 0 ? void 0 : v.sender, type: 'NewOrderEvent',
                                    progress: (_l = v === null || v === void 0 ? void 0 : v.parsedJson) === null || _l === void 0 ? void 0 : _l.object, machine: (_m = v === null || v === void 0 ? void 0 : v.parsedJson) === null || _m === void 0 ? void 0 : _m.machine, task: (_o = v === null || v === void 0 ? void 0 : v.parsedJson) === null || _o === void 0 ? void 0 : _o.task
                                };
                            }
                            else if ((_p = v === null || v === void 0 ? void 0 : v.type) === null || _p === void 0 ? void 0 : _p.includes('::arb::NewArbEvent')) {
                                return {
                                    id: v === null || v === void 0 ? void 0 : v.id, time: v === null || v === void 0 ? void 0 : v.timestampMs, type_raw: v === null || v === void 0 ? void 0 : v.type, sender: v === null || v === void 0 ? void 0 : v.sender, type: 'NewOrderEvent',
                                    arb: (_q = v === null || v === void 0 ? void 0 : v.parsedJson) === null || _q === void 0 ? void 0 : _q.object, arbitration: (_r = v === null || v === void 0 ? void 0 : v.parsedJson) === null || _r === void 0 ? void 0 : _r.arbitration, order: (_s = v === null || v === void 0 ? void 0 : v.parsedJson) === null || _s === void 0 ? void 0 : _s.order
                                };
                            }
                        }
                        return { id: v === null || v === void 0 ? void 0 : v.id, time: v === null || v === void 0 ? void 0 : v.timestampMs, type_raw: v === null || v === void 0 ? void 0 : v.type, sender: v === null || v === void 0 ? void 0 : v.sender, type: '', };
                    });
                    return [2 /*return*/, { data: data, hasNextPage: res === null || res === void 0 ? void 0 : res.hasNextPage, nextCursor: res === null || res === void 0 ? void 0 : res.nextCursor }];
            }
        });
    }); };
})(EVENT_QUERY || (exports.EVENT_QUERY = EVENT_QUERY = {}));
