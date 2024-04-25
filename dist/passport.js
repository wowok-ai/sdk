"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphql_query_objects = exports.rpc_query_cmd_fn = exports.destroy = exports.verify = exports.guard_queries = exports.guard_futures = exports.MAX_GUARD_COUNT = void 0;
const transactions_1 = require("@mysten/sui.js/transactions");
const protocol_1 = require("./protocol");
const utils_1 = require("./utils");
const guard_1 = require("./guard");
exports.MAX_GUARD_COUNT = 8;
// from guards: get future objects to fill by singer 
const guard_futures = async (guards) => {
    let futrue_objects = guards.map((value) => {
        return { objectid: value, callback: guard_1.rpc_sense_objects_fn, parser: guard_1.parse_futures, data: [] };
    });
    await protocol_1.PROTOCOL.Query(futrue_objects); // future objects
    let future_objects_result = [];
    futrue_objects.forEach((futrue) => {
        futrue.data.forEach((f) => {
            if (future_objects_result.findIndex((v) => { return v.guardid == f.guardid && v.identifier == f.identifier; }) == -1) {
                future_objects_result.push(f);
            }
        });
    });
    return future_objects_result;
};
exports.guard_futures = guard_futures;
// from guards: get objects to 'guard_query' on chain , with future variables had filled.
// passport verify for some guards, MUST be in ONE pxb:
// 0. construct Guard_Query_Objects(passport_quries) from queries for guards of objects
// 1. create passport
// 2. add all guards / guards future variables
// 3. verify passport
// 4. ops using passport(guard set on object)
// 5. ops using passport(guard set on object)
// 6. destroy passport
const guard_queries = async (guards, futures) => {
    let sense_objects = guards.map((value) => {
        let v = new Map();
        futures?.forEach((f) => {
            if (f.guardid == value) {
                (0, guard_1.add_future_variable)(v, f.identifier, f.type, f.witness.slice(0), f?.value ? f.value.slice(0) : undefined, true);
            }
        });
        return { objectid: value, callback: guard_1.rpc_sense_objects_fn, parser: guard_1.parse_sense_bsc, data: [], variables: futures ? v : undefined };
    });
    await protocol_1.PROTOCOL.Query(sense_objects); // objects need quering in guards
    let sense_objects_result = [];
    sense_objects.forEach((value) => {
        sense_objects_result = sense_objects_result.concat(value.data);
    });
    sense_objects_result = (0, utils_1.array_unique)(sense_objects_result); // objects in guards
    let queries = sense_objects_result.map((value) => {
        return { objectid: value, callback: exports.rpc_query_cmd_fn, data: [] };
    });
    await protocol_1.PROTOCOL.Query(queries, { 'showType': true }); // queries for passport verifing
    let res = [];
    sense_objects.forEach((guard) => {
        res = res.concat(guard.data.map((object) => {
            let data = queries.filter((v) => {
                return v.objectid == object;
            });
            if (!data) {
                console.error('error find data');
                console.log(queries);
                console.log(object);
                return;
            }
            return data[0].data;
        }));
    });
    return res;
};
exports.guard_queries = guard_queries;
// return passport object used
function verify(txb, guards, guard_queries, future_values) {
    if (!guards || guards.length > exports.MAX_GUARD_COUNT)
        return false;
    if (!(0, protocol_1.IsValidObjects)(guards))
        return false;
    var passport = txb.moveCall({
        target: protocol_1.PROTOCOL.PassportFn('new'),
        arguments: []
    });
    // add others guards, if any
    guards.forEach((guard) => {
        txb.moveCall({
            target: protocol_1.PROTOCOL.PassportFn('guard_add'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, guard)]
        });
    });
    future_values?.forEach((v) => {
        txb.moveCall({
            target: protocol_1.PROTOCOL.PassportFn('future_set'),
            arguments: [passport, txb.pure(utils_1.BCS_CONVERT.ser_address(v.guardid)), txb.pure(utils_1.BCS_CONVERT.ser_u8(v.identifier)),
                txb.pure(utils_1.BCS_CONVERT.ser_address(v.value))]
        });
    });
    // rules: 'verify' & 'query' in turns；'verify' at final end.
    for (let i = 0; i < guard_queries.length; i++) {
        let res = txb.moveCall({
            target: protocol_1.PROTOCOL.PassportFn('passport_verify'),
            arguments: [passport, txb.object(protocol_1.CLOCK_OBJECT),]
        });
        txb.moveCall({
            target: guard_queries[i].target,
            arguments: [txb.object(guard_queries[i].object), passport, res],
            typeArguments: guard_queries[i].types,
        });
    }
    txb.moveCall({
        target: protocol_1.PROTOCOL.PassportFn('passport_verify'),
        arguments: [passport, txb.object(protocol_1.CLOCK_OBJECT)]
    });
    return passport;
}
exports.verify = verify;
function destroy(txb, passport) {
    txb.moveCall({
        target: protocol_1.PROTOCOL.PassportFn('destroy'),
        arguments: [passport]
    });
    return true;
}
exports.destroy = destroy;
// construct Guard_Query_Object of wowok objects for passport verify
const rpc_query_cmd_fn = (response, param, option) => {
    if (!response.error && response.data?.objectId == param.objectid && response.data?.type) {
        for (let k = 0; k < (0, protocol_1.OBJECTS_TYPE)().length; k++) {
            if (response?.data?.type.includes((0, protocol_1.OBJECTS_TYPE)()[k])) { // type: pack::m::Object<...>
                param.data = { target: (0, protocol_1.OBJECTS_TYPE_PREFIX)()[k] + 'guard_query',
                    object: transactions_1.Inputs.SharedObjectRef({
                        objectId: response.data.objectId,
                        mutable: false,
                        initialSharedVersion: response.data.version,
                    }),
                    types: (0, utils_1.parse_object_type)(response?.data?.type),
                    id: param.objectid, };
            }
        }
    }
};
exports.rpc_query_cmd_fn = rpc_query_cmd_fn;
const graphql_query_objects = (nodes) => {
    let ret = [];
    nodes.forEach((node) => {
        for (let k = 0; k < (0, protocol_1.OBJECTS_TYPE)().length; k++) {
            if (node?.asMoveObject?.contents?.type?.repr?.includes((0, protocol_1.OBJECTS_TYPE)()[k])) { // type: pack::m::Object<...>
                ret.push({ target: (0, protocol_1.OBJECTS_TYPE_PREFIX)()[k] + 'guard_query',
                    object: transactions_1.Inputs.SharedObjectRef({
                        objectId: node.address,
                        mutable: false,
                        initialSharedVersion: node.version,
                    }),
                    types: (0, utils_1.parse_object_type)(node.asMoveObject.contents.type.repr),
                    id: node.address, });
            }
        }
    });
    return ret;
};
exports.graphql_query_objects = graphql_query_objects;
