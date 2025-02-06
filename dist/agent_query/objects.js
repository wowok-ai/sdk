"use strict";
/**
 * Provide a query interface for AI
 *
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
exports.OBJECT_QUERY = void 0;
var protocol_1 = require("../protocol");
var machine_1 = require("../machine");
var progress_1 = require("../progress");
var exception_1 = require("../exception");
var utils_1 = require("../utils");
var OBJECT_QUERY;
(function (OBJECT_QUERY) {
    var _this = this;
    /* json: ObjectsQuery string */
    OBJECT_QUERY.objects_json = function (json) { return __awaiter(_this, void 0, void 0, function () {
        var q, _a, _b, e_1;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    q = JSON.parse(json);
                    _b = (_a = JSON).stringify;
                    _c = {};
                    return [4 /*yield*/, OBJECT_QUERY.objects(q)];
                case 1: return [2 /*return*/, _b.apply(_a, [(_c.data = _d.sent(), _c)])];
                case 2:
                    e_1 = _d.sent();
                    return [2 /*return*/, JSON.stringify({ error: e_1 === null || e_1 === void 0 ? void 0 : e_1.toString() })];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    /* json: TableQuery string */
    OBJECT_QUERY.table_json = function (json) { return __awaiter(_this, void 0, void 0, function () {
        var q, _a, _b, e_2;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    q = JSON.parse(json);
                    _b = (_a = JSON).stringify;
                    _c = {};
                    return [4 /*yield*/, OBJECT_QUERY.table(q)];
                case 1: return [2 /*return*/, _b.apply(_a, [(_c.data = _d.sent(), _c)])];
                case 2:
                    e_2 = _d.sent();
                    return [2 /*return*/, JSON.stringify({ error: e_2 === null || e_2 === void 0 ? void 0 : e_2.toString() })];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    OBJECT_QUERY.objects = function (query) { return __awaiter(_this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(query.objects.length > 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, protocol_1.Protocol.Client().multiGetObjects({ ids: query.objects,
                            options: { showContent: query.showContent, showType: query.showType, showOwner: query.showOwner } })];
                case 1:
                    res = _a.sent();
                    console.log(JSON.stringify(res));
                    return [2 /*return*/, { objects: res.map(function (v) { return data2object(v === null || v === void 0 ? void 0 : v.data); }) }];
                case 2: return [2 /*return*/, { objects: [] }];
            }
        });
    }); };
    OBJECT_QUERY.entity = function (address) { return __awaiter(_this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(0, utils_1.IsValidAddress)(address))
                        (0, exception_1.ERROR)(exception_1.Errors.IsValidAddress, 'entity.address');
                    return [4 /*yield*/, protocol_1.Protocol.Client().getDynamicFieldObject({ parentId: protocol_1.Protocol.Instance().EntityObject(), name: { type: 'address', value: address } })];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, data2object(res === null || res === void 0 ? void 0 : res.data)];
            }
        });
    }); };
    OBJECT_QUERY.table = function (query) { return __awaiter(_this, void 0, void 0, function () {
        var res;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, protocol_1.Protocol.Client().getDynamicFields({ parentId: query.parent, cursor: query.cursor, limit: query.limit })];
                case 1:
                    res = _b.sent();
                    return [2 /*return*/, { items: (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.map(function (v) {
                                return { object: v.objectId, type: v.type, version: v.version, key: {
                                        type: v.name.type, value: v.name.value
                                    } };
                            }), nextCursor: res.nextCursor, hasNextPage: res.hasNextPage }];
            }
        });
    }); };
    OBJECT_QUERY.queryTableItem_DemandPresenter = function (demand_object, address) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tableItem(tableItemQuery_byAddress(demand_object, address))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    OBJECT_QUERY.queryTableItem_PermissionEntity = function (permission_object, address) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tableItem(tableItemQuery_byAddress(permission_object, address))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    OBJECT_QUERY.queryTableItem_ArbVote = function (arb_object, address) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tableItem(tableItemQuery_byAddress(arb_object, address))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    OBJECT_QUERY.tableItemQuery_MachineNode = function (machine_object, name) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tableItem(tableItemQuery_byString(machine_object, name))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    OBJECT_QUERY.tableItemQuery_ServiceSale = function (service_object, name) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tableItem(tableItemQuery_byString(service_object, name))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    OBJECT_QUERY.tableItemQuery_ProgressHistory = function (progress_object, index) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tableItem(tableItemQuery_byU64(progress_object, index))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    OBJECT_QUERY.tableItemQuery_TreasuryHistory = function (treasury_object, index) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tableItem(tableItemQuery_byU64(treasury_object, index))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    OBJECT_QUERY.tableItemQuery_RepositoryData = function (repository_object, address, name) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (typeof (repository_object) !== 'string') {
                        repository_object = repository_object.object;
                    }
                    return [4 /*yield*/, tableItem({ parent: repository_object, key: { type: protocol_1.Protocol.Instance().Package('wowok') + '::repository::DataKey', value: { id: address, key: name } } })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    OBJECT_QUERY.tableItemQuery_ResourceMark = function (resource_object, name) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tableItem(tableItemQuery_byString(resource_object, name))];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
    function tableItemQuery_byAddress(parent, address) {
        if (typeof (parent) !== 'string') {
            parent = parent.object;
        }
        return { parent: parent, key: { type: 'address', value: address } };
    }
    function tableItemQuery_byString(parent, name) {
        if (typeof (parent) !== 'string') {
            parent = parent.object;
        }
        return { parent: parent, key: { type: '0x1::string::String', value: name } };
    }
    function tableItemQuery_byU64(parent, index) {
        if (typeof (parent) !== 'string') {
            parent = parent.object;
        }
        return { parent: parent, key: { type: 'u64', value: index } };
    }
    var tableItem = function (query) { return __awaiter(_this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, protocol_1.Protocol.Client().getDynamicFieldObject({ parentId: query.parent, name: { type: query.key.type, value: query.key.value } })];
                case 1:
                    res = _a.sent();
                    return [2 /*return*/, data2object(res === null || res === void 0 ? void 0 : res.data)];
            }
        });
    }); };
    function data2object(data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64, _65, _66, _67, _68, _69, _70, _71, _72, _73, _74, _75, _76, _77, _78, _79, _80, _81, _82, _83, _84, _85, _86, _87, _88, _89, _90, _91, _92, _93;
        var content = (_a = data === null || data === void 0 ? void 0 : data.content) === null || _a === void 0 ? void 0 : _a.fields;
        var id = (_b = data === null || data === void 0 ? void 0 : data.objectId) !== null && _b !== void 0 ? _b : ((_d = (_c = content === null || content === void 0 ? void 0 : content.id) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : undefined);
        var type_raw = (_e = data === null || data === void 0 ? void 0 : data.type) !== null && _e !== void 0 ? _e : ((_g = (_f = data === null || data === void 0 ? void 0 : data.content) === null || _f === void 0 ? void 0 : _f.type) !== null && _g !== void 0 ? _g : undefined);
        var version = (_h = data === null || data === void 0 ? void 0 : data.version) !== null && _h !== void 0 ? _h : undefined;
        var owner = (_j = data === null || data === void 0 ? void 0 : data.owner) !== null && _j !== void 0 ? _j : undefined;
        var type = type_raw ? protocol_1.Protocol.Instance().object_name_from_type_repr(type_raw) : undefined;
        if (type) {
            switch (type) {
                case 'Permission':
                    return { object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        builder: (_k = content === null || content === void 0 ? void 0 : content.builder) !== null && _k !== void 0 ? _k : '', admin: content === null || content === void 0 ? void 0 : content.admin, description: (_l = content === null || content === void 0 ? void 0 : content.description) !== null && _l !== void 0 ? _l : '',
                        entity_count: parseInt((_o = (_m = content === null || content === void 0 ? void 0 : content.table) === null || _m === void 0 ? void 0 : _m.fields) === null || _o === void 0 ? void 0 : _o.size),
                        biz_permission: (_r = (_q = (_p = content === null || content === void 0 ? void 0 : content.user_define) === null || _p === void 0 ? void 0 : _p.fields) === null || _q === void 0 ? void 0 : _q.contents) === null || _r === void 0 ? void 0 : _r.map(function (v) {
                            var _a, _b;
                            return { id: parseInt((_a = v === null || v === void 0 ? void 0 : v.fields) === null || _a === void 0 ? void 0 : _a.key), name: (_b = v === null || v === void 0 ? void 0 : v.fields) === null || _b === void 0 ? void 0 : _b.value };
                        })
                    };
                case 'Demand':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        permission: content === null || content === void 0 ? void 0 : content.permission, description: content === null || content === void 0 ? void 0 : content.description,
                        guard: (content === null || content === void 0 ? void 0 : content.guard) ? { object: content === null || content === void 0 ? void 0 : content.guard, service_id_in_guard: content === null || content === void 0 ? void 0 : content.service_identifier } : undefined,
                        time_expire: content === null || content === void 0 ? void 0 : content.time_expire, yes: content === null || content === void 0 ? void 0 : content.yes,
                        presenter_count: parseInt((_t = (_s = content === null || content === void 0 ? void 0 : content.presenters) === null || _s === void 0 ? void 0 : _s.fields) === null || _t === void 0 ? void 0 : _t.size),
                        bounty: (_u = content === null || content === void 0 ? void 0 : content.bounty) === null || _u === void 0 ? void 0 : _u.map(function (v) {
                            var _a, _b, _c, _d;
                            return { type: (_a = v === null || v === void 0 ? void 0 : v.fields) === null || _a === void 0 ? void 0 : _a.type, object: (_c = (_b = v === null || v === void 0 ? void 0 : v.fields) === null || _b === void 0 ? void 0 : _b.id) === null || _c === void 0 ? void 0 : _c.id, balance: (_d = v === null || v === void 0 ? void 0 : v.fields) === null || _d === void 0 ? void 0 : _d.balance };
                        })
                    };
                case 'Machine':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        permission: (_v = content === null || content === void 0 ? void 0 : content.permission) !== null && _v !== void 0 ? _v : '', description: (_w = content === null || content === void 0 ? void 0 : content.description) !== null && _w !== void 0 ? _w : '',
                        bPaused: content === null || content === void 0 ? void 0 : content.bPaused, bPublished: content === null || content === void 0 ? void 0 : content.bPublished, endpoint: content === null || content === void 0 ? void 0 : content.endpoint,
                        consensus_repository: content === null || content === void 0 ? void 0 : content.consensus_repositories, node_count: parseInt((_y = (_x = content === null || content === void 0 ? void 0 : content.nodes) === null || _x === void 0 ? void 0 : _x.fields) === null || _y === void 0 ? void 0 : _y.size),
                    };
                case 'Progress':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        machine: content === null || content === void 0 ? void 0 : content.machine, current: content === null || content === void 0 ? void 0 : content.current, task: content === null || content === void 0 ? void 0 : content.task,
                        parent: content === null || content === void 0 ? void 0 : content.parent, history_count: parseInt((_2 = (_1 = (_0 = (_z = content === null || content === void 0 ? void 0 : content.history) === null || _z === void 0 ? void 0 : _z.fields) === null || _0 === void 0 ? void 0 : _0.contents) === null || _1 === void 0 ? void 0 : _1.fields) === null || _2 === void 0 ? void 0 : _2.size),
                        namedOperator: (_5 = (_4 = (_3 = content === null || content === void 0 ? void 0 : content.namedOperator) === null || _3 === void 0 ? void 0 : _3.fields) === null || _4 === void 0 ? void 0 : _4.contents) === null || _5 === void 0 ? void 0 : _5.map(function (v) {
                            var _a, _b;
                            return { name: (_a = v === null || v === void 0 ? void 0 : v.fields) === null || _a === void 0 ? void 0 : _a.key, operator: (_b = v === null || v === void 0 ? void 0 : v.fields) === null || _b === void 0 ? void 0 : _b.value };
                        }),
                        session: (_8 = (_7 = (_6 = content === null || content === void 0 ? void 0 : content.session) === null || _6 === void 0 ? void 0 : _6.fields) === null || _7 === void 0 ? void 0 : _7.contents) === null || _8 === void 0 ? void 0 : _8.map(function (v) {
                            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
                            return { weights: (_c = (_b = (_a = v === null || v === void 0 ? void 0 : v.fields) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.fields) === null || _c === void 0 ? void 0 : _c.weight, threshold: (_f = (_e = (_d = v === null || v === void 0 ? void 0 : v.fields) === null || _d === void 0 ? void 0 : _d.value) === null || _e === void 0 ? void 0 : _e.fields) === null || _f === void 0 ? void 0 : _f.threshold,
                                next_node: (_g = v === null || v === void 0 ? void 0 : v.fields) === null || _g === void 0 ? void 0 : _g.key, forward: (_o = (_m = (_l = (_k = (_j = (_h = v === null || v === void 0 ? void 0 : v.fields) === null || _h === void 0 ? void 0 : _h.value) === null || _j === void 0 ? void 0 : _j.fields) === null || _k === void 0 ? void 0 : _k.forwards) === null || _l === void 0 ? void 0 : _l.fields) === null || _m === void 0 ? void 0 : _m.contents) === null || _o === void 0 ? void 0 : _o.map(function (i) {
                                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
                                    return { forward_name: (_a = i === null || i === void 0 ? void 0 : i.fields) === null || _a === void 0 ? void 0 : _a.key, accomplished: (_d = (_c = (_b = i === null || i === void 0 ? void 0 : i.fields) === null || _b === void 0 ? void 0 : _b.value) === null || _c === void 0 ? void 0 : _c.fields) === null || _d === void 0 ? void 0 : _d.accomplished,
                                        msg: (_g = (_f = (_e = i === null || i === void 0 ? void 0 : i.fields) === null || _e === void 0 ? void 0 : _e.value) === null || _f === void 0 ? void 0 : _f.fields) === null || _g === void 0 ? void 0 : _g.msg, orders: (_k = (_j = (_h = i === null || i === void 0 ? void 0 : i.fields) === null || _h === void 0 ? void 0 : _h.value) === null || _j === void 0 ? void 0 : _j.fields) === null || _k === void 0 ? void 0 : _k.orders,
                                        time: (_o = (_m = (_l = i === null || i === void 0 ? void 0 : i.fields) === null || _l === void 0 ? void 0 : _l.value) === null || _m === void 0 ? void 0 : _m.fields) === null || _o === void 0 ? void 0 : _o.time, holder: (_r = (_q = (_p = i === null || i === void 0 ? void 0 : i.fields) === null || _p === void 0 ? void 0 : _p.value) === null || _q === void 0 ? void 0 : _q.fields) === null || _r === void 0 ? void 0 : _r.who
                                    };
                                })
                            };
                        })
                    };
                case 'Order':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        service: content === null || content === void 0 ? void 0 : content.service, amount: content === null || content === void 0 ? void 0 : content.amount, agent: content === null || content === void 0 ? void 0 : content.agent, arb: content === null || content === void 0 ? void 0 : content.dispute,
                        payer: content === null || content === void 0 ? void 0 : content.payer, progress: content === null || content === void 0 ? void 0 : content.progress, discount: content === null || content === void 0 ? void 0 : content.discount, balance: content === null || content === void 0 ? void 0 : content.payed,
                        required_info: (content === null || content === void 0 ? void 0 : content.required_info) ?
                            { pubkey: (_10 = (_9 = content === null || content === void 0 ? void 0 : content.required_info) === null || _9 === void 0 ? void 0 : _9.fields) === null || _10 === void 0 ? void 0 : _10.customer_pub, msg_encrypted: (_12 = (_11 = content === null || content === void 0 ? void 0 : content.required_info) === null || _11 === void 0 ? void 0 : _11.fields) === null || _12 === void 0 ? void 0 : _12.info }
                            : undefined,
                        item: (_13 = content === null || content === void 0 ? void 0 : content.items) === null || _13 === void 0 ? void 0 : _13.map(function (v) {
                            var _a, _b, _c, _d;
                            return { name: (_a = v === null || v === void 0 ? void 0 : v.fields) === null || _a === void 0 ? void 0 : _a.name, price: (_b = v === null || v === void 0 ? void 0 : v.fields) === null || _b === void 0 ? void 0 : _b.price, stock: (_c = v === null || v === void 0 ? void 0 : v.fields) === null || _c === void 0 ? void 0 : _c.stock, endpoint: (_d = v === null || v === void 0 ? void 0 : v.fields) === null || _d === void 0 ? void 0 : _d.endpoint };
                        }),
                    };
                case 'Service':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        machine: content === null || content === void 0 ? void 0 : content.machine, permission: content === null || content === void 0 ? void 0 : content.permission, description: content === null || content === void 0 ? void 0 : content.description,
                        arbitration: content === null || content === void 0 ? void 0 : content.arbitrations, bPaused: content === null || content === void 0 ? void 0 : content.bPaused, bPublished: content === null || content === void 0 ? void 0 : content.bPublished,
                        buy_guard: content === null || content === void 0 ? void 0 : content.buy_guard, endpoint: content === null || content === void 0 ? void 0 : content.endpoint, payee: content === null || content === void 0 ? void 0 : content.payee, repository: content === null || content === void 0 ? void 0 : content.repositories,
                        withdraw_guard: (_16 = (_15 = (_14 = content === null || content === void 0 ? void 0 : content.withdraw_guard) === null || _14 === void 0 ? void 0 : _14.fields) === null || _15 === void 0 ? void 0 : _15.contents) === null || _16 === void 0 ? void 0 : _16.map(function (v) {
                            var _a, _b;
                            return { object: (_a = v === null || v === void 0 ? void 0 : v.fields) === null || _a === void 0 ? void 0 : _a.key, percent: (_b = v === null || v === void 0 ? void 0 : v.fields) === null || _b === void 0 ? void 0 : _b.value };
                        }),
                        refund_guard: (_19 = (_18 = (_17 = content === null || content === void 0 ? void 0 : content.refund_guard) === null || _17 === void 0 ? void 0 : _17.fields) === null || _18 === void 0 ? void 0 : _18.contents) === null || _19 === void 0 ? void 0 : _19.map(function (v) {
                            var _a, _b;
                            return { object: (_a = v === null || v === void 0 ? void 0 : v.fields) === null || _a === void 0 ? void 0 : _a.key, percent: (_b = v === null || v === void 0 ? void 0 : v.fields) === null || _b === void 0 ? void 0 : _b.value };
                        }),
                        sales_count: parseInt((_21 = (_20 = content === null || content === void 0 ? void 0 : content.sales) === null || _20 === void 0 ? void 0 : _20.fields) === null || _21 === void 0 ? void 0 : _21.size), extern_withdraw_treasuries: content === null || content === void 0 ? void 0 : content.extern_withdraw_treasuries,
                        customer_required_info: (content === null || content === void 0 ? void 0 : content.customer_required) ?
                            { pubkey: (_23 = (_22 = content === null || content === void 0 ? void 0 : content.customer_required) === null || _22 === void 0 ? void 0 : _22.fields) === null || _23 === void 0 ? void 0 : _23.service_pubkey, required_info: (_25 = (_24 = content === null || content === void 0 ? void 0 : content.customer_required) === null || _24 === void 0 ? void 0 : _24.fields) === null || _25 === void 0 ? void 0 : _25.customer_required_info }
                            : undefined,
                    };
                case 'Treasury':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        permission: content === null || content === void 0 ? void 0 : content.permission, description: content === null || content === void 0 ? void 0 : content.description, withdraw_mode: content === null || content === void 0 ? void 0 : content.withdraw_mode,
                        history_count: parseInt((_29 = (_28 = (_27 = (_26 = content === null || content === void 0 ? void 0 : content.history) === null || _26 === void 0 ? void 0 : _26.fields) === null || _27 === void 0 ? void 0 : _27.contents) === null || _28 === void 0 ? void 0 : _28.fields) === null || _29 === void 0 ? void 0 : _29.size), balance: content === null || content === void 0 ? void 0 : content.balance,
                        deposit_guard: content === null || content === void 0 ? void 0 : content.deposit_guard, withdraw_guard: (_32 = (_31 = (_30 = content === null || content === void 0 ? void 0 : content.withdraw_guard) === null || _30 === void 0 ? void 0 : _30.fields) === null || _31 === void 0 ? void 0 : _31.contents) === null || _32 === void 0 ? void 0 : _32.map(function (v) {
                            var _a, _b;
                            return { object: (_a = v === null || v === void 0 ? void 0 : v.fields) === null || _a === void 0 ? void 0 : _a.key, percent: (_b = v === null || v === void 0 ? void 0 : v.fields) === null || _b === void 0 ? void 0 : _b.value };
                        })
                    };
                case 'Arbitration':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        permission: content === null || content === void 0 ? void 0 : content.permission, description: content === null || content === void 0 ? void 0 : content.description, fee: content === null || content === void 0 ? void 0 : content.fee,
                        fee_treasury: content === null || content === void 0 ? void 0 : content.fee_treasury, usage_guard: content === null || content === void 0 ? void 0 : content.usage_guard,
                        endpoint: content === null || content === void 0 ? void 0 : content.endpoint, bPaused: content === null || content === void 0 ? void 0 : content.bPaused, voting_guard: (_35 = (_34 = (_33 = content === null || content === void 0 ? void 0 : content.voting_guard) === null || _33 === void 0 ? void 0 : _33.fields) === null || _34 === void 0 ? void 0 : _34.contents) === null || _35 === void 0 ? void 0 : _35.map(function (v) {
                            var _a, _b;
                            return { object: (_a = v === null || v === void 0 ? void 0 : v.fields) === null || _a === void 0 ? void 0 : _a.key, weights: (_b = v === null || v === void 0 ? void 0 : v.fields) === null || _b === void 0 ? void 0 : _b.value };
                        })
                    };
                case 'Arb':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        arbitration: content === null || content === void 0 ? void 0 : content.arbitration, description: content === null || content === void 0 ? void 0 : content.description, fee: content === null || content === void 0 ? void 0 : content.fee,
                        feedback: content === null || content === void 0 ? void 0 : content.feedback, indemnity: content === null || content === void 0 ? void 0 : content.indemnity, order: content === null || content === void 0 ? void 0 : content.order,
                        voted_count: parseInt((_37 = (_36 = content === null || content === void 0 ? void 0 : content.voted) === null || _36 === void 0 ? void 0 : _36.fields) === null || _37 === void 0 ? void 0 : _37.size),
                        proposition: (_40 = (_39 = (_38 = content === null || content === void 0 ? void 0 : content.proposition) === null || _38 === void 0 ? void 0 : _38.fields) === null || _39 === void 0 ? void 0 : _39.contents) === null || _40 === void 0 ? void 0 : _40.map(function (v) {
                            var _a, _b;
                            return { proposition: (_a = v === null || v === void 0 ? void 0 : v.fields) === null || _a === void 0 ? void 0 : _a.key, votes: (_b = v === null || v === void 0 ? void 0 : v.fields) === null || _b === void 0 ? void 0 : _b.value };
                        })
                    };
                case 'Repository':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        permission: content === null || content === void 0 ? void 0 : content.permission, description: content === null || content === void 0 ? void 0 : content.description, policy_mode: content === null || content === void 0 ? void 0 : content.policy_mode,
                        data_count: parseInt((_42 = (_41 = content === null || content === void 0 ? void 0 : content.data) === null || _41 === void 0 ? void 0 : _41.fields) === null || _42 === void 0 ? void 0 : _42.size), reference: content === null || content === void 0 ? void 0 : content.reference, rep_type: content === null || content === void 0 ? void 0 : content.type,
                        policy: (_45 = (_44 = (_43 = content === null || content === void 0 ? void 0 : content.policies) === null || _43 === void 0 ? void 0 : _43.fields) === null || _44 === void 0 ? void 0 : _44.contents) === null || _45 === void 0 ? void 0 : _45.map(function (v) {
                            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                            return { key: (_a = v === null || v === void 0 ? void 0 : v.fields) === null || _a === void 0 ? void 0 : _a.key, description: (_d = (_c = (_b = v === null || v === void 0 ? void 0 : v.fields) === null || _b === void 0 ? void 0 : _b.value) === null || _c === void 0 ? void 0 : _c.fields) === null || _d === void 0 ? void 0 : _d.description,
                                permissionIndex: (_g = (_f = (_e = v === null || v === void 0 ? void 0 : v.fields) === null || _e === void 0 ? void 0 : _e.value) === null || _f === void 0 ? void 0 : _f.fields) === null || _g === void 0 ? void 0 : _g.permission_index, dataType: (_k = (_j = (_h = v === null || v === void 0 ? void 0 : v.fields) === null || _h === void 0 ? void 0 : _h.value) === null || _j === void 0 ? void 0 : _j.fields) === null || _k === void 0 ? void 0 : _k.value_type };
                        })
                    };
                case 'Payment':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        signer: content === null || content === void 0 ? void 0 : content.signer, time: content === null || content === void 0 ? void 0 : content.time, remark: content === null || content === void 0 ? void 0 : content.remark, from: content === null || content === void 0 ? void 0 : content.from,
                        biz_id: content === null || content === void 0 ? void 0 : content.index, for_guard: content === null || content === void 0 ? void 0 : content.for_guard, for_object: content === null || content === void 0 ? void 0 : content.for_object,
                        amount: content === null || content === void 0 ? void 0 : content.amount, record: (_46 = content === null || content === void 0 ? void 0 : content.record) === null || _46 === void 0 ? void 0 : _46.map(function (v) {
                            var _a, _b;
                            return { recipient: (_a = v === null || v === void 0 ? void 0 : v.fields) === null || _a === void 0 ? void 0 : _a.recipient, amount: (_b = v === null || v === void 0 ? void 0 : v.fields) === null || _b === void 0 ? void 0 : _b.amount };
                        })
                    };
                case 'Discount':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        service: content === null || content === void 0 ? void 0 : content.service, time_start: content === null || content === void 0 ? void 0 : content.time_start, time_end: content === null || content === void 0 ? void 0 : content.time_end,
                        price_greater: content === null || content === void 0 ? void 0 : content.price_greater, off_type: content === null || content === void 0 ? void 0 : content.type, off: content === null || content === void 0 ? void 0 : content.off,
                        name: content === null || content === void 0 ? void 0 : content.name
                    };
                case 'Guard':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        description: content === null || content === void 0 ? void 0 : content.description, input: Uint8Array.from((_48 = (_47 = content === null || content === void 0 ? void 0 : content.input) === null || _47 === void 0 ? void 0 : _47.fields) === null || _48 === void 0 ? void 0 : _48.bytes),
                        identifier: (_49 = content === null || content === void 0 ? void 0 : content.constants) === null || _49 === void 0 ? void 0 : _49.map(function (v) {
                            var _a, _b, _c;
                            return { id: (_a = v === null || v === void 0 ? void 0 : v.fields) === null || _a === void 0 ? void 0 : _a.identifier, bWitness: (_b = v === null || v === void 0 ? void 0 : v.fields) === null || _b === void 0 ? void 0 : _b.bWitness, value: Uint8Array.from((_c = v === null || v === void 0 ? void 0 : v.fields) === null || _c === void 0 ? void 0 : _c.value) };
                        })
                    };
                case 'Resource':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        marks_count: parseInt((_51 = (_50 = content === null || content === void 0 ? void 0 : content.marks) === null || _50 === void 0 ? void 0 : _50.fields) === null || _51 === void 0 ? void 0 : _51.size),
                        tags: (_52 = content === null || content === void 0 ? void 0 : content.tags) === null || _52 === void 0 ? void 0 : _52.map(function (v) {
                            var _a, _b, _c;
                            return { object: (_a = v === null || v === void 0 ? void 0 : v.fields) === null || _a === void 0 ? void 0 : _a.object, nick_name: (_b = v === null || v === void 0 ? void 0 : v.fields) === null || _b === void 0 ? void 0 : _b.nick, tags: (_c = v === null || v === void 0 ? void 0 : v.fields) === null || _c === void 0 ? void 0 : _c.tags };
                        })
                    };
            }
        }
        var start = type_raw === null || type_raw === void 0 ? void 0 : type_raw.indexOf('0x2::dynamic_field::Field<');
        if (start === 0) {
            var end = type_raw === null || type_raw === void 0 ? void 0 : type_raw.substring('0x2::dynamic_field::Field<'.length);
            if (end && protocol_1.Protocol.Instance().hasPackage(end)) {
                if (end.includes('::demand::Tips>')) {
                    return {
                        object: id, type: 'DemandTable_Presenter', type_raw: type_raw, owner: owner, version: version,
                        service: content === null || content === void 0 ? void 0 : content.name, presenter: (_54 = (_53 = content === null || content === void 0 ? void 0 : content.value) === null || _53 === void 0 ? void 0 : _53.fields) === null || _54 === void 0 ? void 0 : _54.who, recommendation: (_56 = (_55 = content === null || content === void 0 ? void 0 : content.value) === null || _55 === void 0 ? void 0 : _55.fields) === null || _56 === void 0 ? void 0 : _56.tips
                    };
                }
                else if (end.includes('::machine::NodePair>>>')) {
                    return {
                        object: id, type: 'MachineTable_Node', type_raw: type_raw, owner: owner, version: version,
                        node: { name: content === null || content === void 0 ? void 0 : content.name, pairs: machine_1.Machine.rpc_de_pair(content === null || content === void 0 ? void 0 : content.value) }
                    };
                }
                else if (end.includes('::progress::History>')) {
                    return {
                        object: id, type: 'ProgressTable_History', type_raw: type_raw, owner: owner, version: version,
                        history: progress_1.Progress.rpc_de_history(content)
                    };
                }
                else if (end.includes('::service::Sale>')) {
                    return {
                        object: id, type: 'ServiceTable_Sale', type_raw: type_raw, owner: owner, version: version,
                        item: { item: content === null || content === void 0 ? void 0 : content.name, stock: (_58 = (_57 = content === null || content === void 0 ? void 0 : content.value) === null || _57 === void 0 ? void 0 : _57.fields) === null || _58 === void 0 ? void 0 : _58.stock, price: (_60 = (_59 = content === null || content === void 0 ? void 0 : content.value) === null || _59 === void 0 ? void 0 : _59.fields) === null || _60 === void 0 ? void 0 : _60.price,
                            endpoint: (_62 = (_61 = content === null || content === void 0 ? void 0 : content.value) === null || _61 === void 0 ? void 0 : _61.fields) === null || _62 === void 0 ? void 0 : _62.endpoint
                        }
                    };
                }
                else if (end.includes('::treasury::Record>')) {
                    return {
                        object: id, type: 'TreasuryTable_History', type_raw: type_raw, owner: owner, version: version,
                        id: content === null || content === void 0 ? void 0 : content.name, payment: (_64 = (_63 = content === null || content === void 0 ? void 0 : content.value) === null || _63 === void 0 ? void 0 : _63.fields) === null || _64 === void 0 ? void 0 : _64.payment, signer: (_66 = (_65 = content === null || content === void 0 ? void 0 : content.value) === null || _65 === void 0 ? void 0 : _65.fields) === null || _66 === void 0 ? void 0 : _66.signer,
                        operation: (_68 = (_67 = content === null || content === void 0 ? void 0 : content.value) === null || _67 === void 0 ? void 0 : _67.fields) === null || _68 === void 0 ? void 0 : _68.op, amount: (_70 = (_69 = content === null || content === void 0 ? void 0 : content.value) === null || _69 === void 0 ? void 0 : _69.fields) === null || _70 === void 0 ? void 0 : _70.amount, time: (_72 = (_71 = content === null || content === void 0 ? void 0 : content.value) === null || _71 === void 0 ? void 0 : _71.fields) === null || _72 === void 0 ? void 0 : _72.time
                    };
                }
                else if (end.includes('::arb::Voted>')) {
                    return {
                        object: id, type: 'ArbTable_Vote', type_raw: type_raw, owner: owner, version: version,
                        singer: content === null || content === void 0 ? void 0 : content.name, vote: (_74 = (_73 = content === null || content === void 0 ? void 0 : content.value) === null || _73 === void 0 ? void 0 : _73.fields) === null || _74 === void 0 ? void 0 : _74.agrees, time: (_76 = (_75 = content === null || content === void 0 ? void 0 : content.value) === null || _75 === void 0 ? void 0 : _75.fields) === null || _76 === void 0 ? void 0 : _76.time,
                        weight: (_78 = (_77 = content === null || content === void 0 ? void 0 : content.value) === null || _77 === void 0 ? void 0 : _77.fields) === null || _78 === void 0 ? void 0 : _78.weight
                    };
                }
                else if (end.includes('::permission::Perm>>')) {
                    return {
                        object: id, type: 'TableItem_PermissionEntity', type_raw: type_raw, owner: owner, version: version,
                        entity: content === null || content === void 0 ? void 0 : content.name, permission: (_79 = content === null || content === void 0 ? void 0 : content.value) === null || _79 === void 0 ? void 0 : _79.map(function (v) {
                            return { id: v === null || v === void 0 ? void 0 : v.fields.index, guard: v === null || v === void 0 ? void 0 : v.fields.guard };
                        })
                    };
                }
                else if (end.includes('::repository::DataKey')) {
                    return {
                        object: id, type: 'TableItem_RepositoryData', type_raw: type_raw, owner: owner, version: version,
                        address: (_81 = (_80 = content === null || content === void 0 ? void 0 : content.name) === null || _80 === void 0 ? void 0 : _80.fields) === null || _81 === void 0 ? void 0 : _81.id, key: (_83 = (_82 = content === null || content === void 0 ? void 0 : content.name) === null || _82 === void 0 ? void 0 : _82.fields) === null || _83 === void 0 ? void 0 : _83.key, data: Uint8Array.from(content === null || content === void 0 ? void 0 : content.value)
                    };
                }
                else if (end.includes('::entity::Ent>')) {
                    var info = utils_1.Bcs.getInstance().de_entInfo(Uint8Array.from((_85 = (_84 = content === null || content === void 0 ? void 0 : content.value) === null || _84 === void 0 ? void 0 : _84.fields) === null || _85 === void 0 ? void 0 : _85.avatar));
                    return {
                        object: id, type: 'Entity', type_raw: type_raw, owner: owner, version: version,
                        address: content === null || content === void 0 ? void 0 : content.name, like: (_87 = (_86 = content === null || content === void 0 ? void 0 : content.value) === null || _86 === void 0 ? void 0 : _86.fields) === null || _87 === void 0 ? void 0 : _87.like, dislike: (_89 = (_88 = content === null || content === void 0 ? void 0 : content.value) === null || _88 === void 0 ? void 0 : _88.fields) === null || _89 === void 0 ? void 0 : _89.dislike,
                        resource_object: (_91 = (_90 = content === null || content === void 0 ? void 0 : content.value) === null || _90 === void 0 ? void 0 : _90.fields) === null || _91 === void 0 ? void 0 : _91.resource, lastActive_digest: data === null || data === void 0 ? void 0 : data.previousTransaction,
                        homepage: info === null || info === void 0 ? void 0 : info.homepage, name: info === null || info === void 0 ? void 0 : info.name, avatar: info === null || info === void 0 ? void 0 : info.avatar, x: info === null || info === void 0 ? void 0 : info.twitter, discord: info === null || info === void 0 ? void 0 : info.discord,
                        description: info === null || info === void 0 ? void 0 : info.description
                    };
                }
                else if (end.includes('::resource::Addresses>')) {
                    return {
                        object: id, type: 'Entity', type_raw: type_raw, owner: owner, version: version,
                        mark_name: content === null || content === void 0 ? void 0 : content.name, objects: (_93 = (_92 = content === null || content === void 0 ? void 0 : content.value) === null || _92 === void 0 ? void 0 : _92.fields) === null || _93 === void 0 ? void 0 : _93.addresses
                    };
                }
            }
        }
        return { object: id, type: type, type_raw: type_raw, owner: owner, version: version };
    }
})(OBJECT_QUERY || (exports.OBJECT_QUERY = OBJECT_QUERY = {}));
