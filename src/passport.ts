import { SuiObjectResponse, SuiObjectDataOptions } from '@mysten/sui.js/client';
import { TransactionBlock, TransactionResult, type TransactionObjectInput, Inputs } from '@mysten/sui.js/transactions';
import { PROTOCOL, FnCallType, CLOCK_OBJECT, Query_Param, OBJECTS_TYPE, OBJECTS_TYPE_PREFIX} from './protocol';
import { parse_object_type, array_unique } from './util';
import { sense_objects_fn } from './guard';

export const MAX_GUARD_COUNT = 8;

// passport verify for some guards, MUST be in ONE pxb:
// 0. construct Guard_Query_Objects(passport_quries) from queries for guards of objects
// 1. create passport
// 2. add all guards
// 3. verify passport
// 4. ops using passport(guard set on object)
// 5. ops using passport(guard set on object)
// 6. destroy passport

export type PassportObject = TransactionResult;

export const passport_queries = async (guards:string[]) : Promise<Guard_Query_Object[]> => {
    let sense_objects = guards.map((value) => {
        return {objectid:value, callback:sense_objects_fn, data:[]} as Query_Param
    });
    await PROTOCOL.Query(sense_objects); // objects need quering in guards
    let sense_objects_result:string[] = [];
    sense_objects.forEach((value) => {
        sense_objects_result = sense_objects_result.concat(value.data);
    });
    sense_objects_result = array_unique(sense_objects_result);
    console.log(sense_objects_result);

    let queries = sense_objects_result.map((value) => { 
        return {objectid:value, callback:query_cmd_fn} as Query_Param;
    })
    await PROTOCOL.Query(queries, {'showType':true}); // queries for passport verifing
    return queries.map((value) => {
        return value.data as Guard_Query_Object;
    })
}
// return passport object for using
export function verify(txb:TransactionBlock, passport_queries:Guard_Query_Object[]) : PassportObject | undefined {
    if (passport_queries.length == 0 || passport_queries.length > MAX_GUARD_COUNT) {
        return undefined;
    }
    let guard_ids = passport_queries.map((value)=>value.id);
    var passport = txb.moveCall({
        target: PROTOCOL.PassportFn('new') as FnCallType,
        arguments: [ txb.object(guard_ids[0]), txb.object(CLOCK_OBJECT)]
    });

    // add others guards, if any
    for (let i = 1; i < guard_ids.length; i++) {
        txb.moveCall({
            target:PROTOCOL.PassportFn('guard_add') as FnCallType,
            arguments:[passport, txb.object(guard_ids[i])]
        });
    }

    // rules: 'verify' & 'query' in turns；'verify' at final end.
    for (let i = 0; i < passport_queries.length; i++) {
        txb.moveCall({
            target: PROTOCOL.PassportFn('passport_verify') as FnCallType,
            arguments: [ passport ]
        }); 
        txb.moveCall({
            target: passport_queries[i].target as FnCallType,
            arguments: [ txb.object(passport_queries[i].object), passport ],
            typeArguments: passport_queries[i].types,
        })
    }
    txb.moveCall({
        target: PROTOCOL.PassportFn('passport_verify') as FnCallType,
        arguments: [ passport ]
    });     

    return passport;
}

export function destroy(txb:TransactionBlock, passport:PassportObject) {
    txb.moveCall({
        target: PROTOCOL.PassportFn('destroy') as FnCallType,
        arguments: [ passport ]
    });  
}

export type Guard_Query_Object = {
    target: FnCallType,
    object: TransactionObjectInput,
    types: string[],
    id: string,
}

// construct Guard_Query_Object of wowok objects for passport verify
export const query_cmd_fn = (response:SuiObjectResponse, param:Query_Param, option:SuiObjectDataOptions) => {
    if (!response.error && response.data?.objectId == param.objectid && response.data?.type) {
        for (let k = 0; k < OBJECTS_TYPE.length; k++) {
            if (response?.data?.type.includes(OBJECTS_TYPE[k]) ) { // type: pack::m::Object<...>
                param.data = { target:OBJECTS_TYPE_PREFIX[k] + 'guard_query' as FnCallType,
                    object:Inputs.SharedObjectRef({
                        objectId: param.objectid,
                        mutable: false,
                        initialSharedVersion: response.data!.version,
                    }) as TransactionObjectInput,
                    types:parse_object_type(response?.data?.type as string),
                    id: param.objectid,
                } as Guard_Query_Object;
            }
        }
    }
}