"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query_cmd_fn = exports.destroy = exports.verify = exports.passport_queries = exports.MAX_GUARD_COUNT = void 0;
const transactions_1 = require("@mysten/sui.js/transactions");
const protocol_1 = require("./protocol");
const util_1 = require("./util");
const guard_1 = require("./guard");
exports.MAX_GUARD_COUNT = 8;
// passport verify for some guards, MUST be in ONE pxb:
// 0. construct Guard_Query_Objects(passport_quries) from queries for guards of objects
// 1. create passport
// 2. add all guards
// 3. verify passport
// 4. ops using passport(guard set on object)
// 5. ops using passport(guard set on object)
// 6. destroy passport
const passport_queries = async (guards) => {
    let sense_objects = guards.map((value) => {
        return { objectid: value, callback: guard_1.sense_objects_fn, data: [] };
    });
    await protocol_1.PROTOCOL.Query(sense_objects); // objects need quering in guards
    let sense_objects_result = [];
    sense_objects.forEach((value) => {
        sense_objects_result = sense_objects_result.concat(value.data);
    });
    sense_objects_result = (0, util_1.array_unique)(sense_objects_result);
    console.log(sense_objects_result);
    let queries = sense_objects_result.map((value) => {
        return { objectid: value, callback: exports.query_cmd_fn };
    });
    await protocol_1.PROTOCOL.Query(queries, { 'showType': true }); // queries for passport verifing
    return queries.map((value) => {
        return value.data;
    });
};
exports.passport_queries = passport_queries;
// return passport object for using
function verify(txb, passport_queries) {
    if (passport_queries.length == 0 || passport_queries.length > exports.MAX_GUARD_COUNT) {
        return false;
    }
    let guard_ids = passport_queries.map((value) => value.id);
    var passport = txb.moveCall({
        target: protocol_1.PROTOCOL.PassportFn('new'),
        arguments: [txb.object(guard_ids[0]), txb.object(protocol_1.CLOCK_OBJECT)]
    });
    // add others guards, if any
    for (let i = 1; i < guard_ids.length; i++) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.PassportFn('guard_add'),
            arguments: [passport, txb.object(guard_ids[i])]
        });
    }
    // rules: 'verify' & 'query' in turns；'verify' at final end.
    for (let i = 0; i < passport_queries.length; i++) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.PassportFn('passport_verify'),
            arguments: [passport]
        });
        txb.moveCall({
            target: passport_queries[i].target,
            arguments: [txb.object(passport_queries[i].object), passport],
            typeArguments: passport_queries[i].types,
        });
    }
    txb.moveCall({
        target: protocol_1.PROTOCOL.PassportFn('passport_verify'),
        arguments: [passport]
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
const query_cmd_fn = (response, param, option) => {
    if (!response.error && response.data?.objectId == param.objectid && response.data?.type) {
        for (let k = 0; k < protocol_1.OBJECTS_TYPE.length; k++) {
            if (response?.data?.type.includes(protocol_1.OBJECTS_TYPE[k])) { // type: pack::m::Object<...>
                param.data = { target: protocol_1.OBJECTS_TYPE_PREFIX[k] + 'guard_query',
                    object: transactions_1.Inputs.SharedObjectRef({
                        objectId: param.objectid,
                        mutable: false,
                        initialSharedVersion: response.data.version,
                    }),
                    types: (0, util_1.parse_object_type)(response?.data?.type),
                    id: param.objectid, };
            }
        }
    }
};
exports.query_cmd_fn = query_cmd_fn;
