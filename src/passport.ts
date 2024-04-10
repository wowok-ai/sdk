import { SuiObjectResponse, SuiObjectDataOptions } from '@mysten/sui.js/client';
import { TransactionBlock, TransactionResult, type TransactionObjectInput, Inputs } from '@mysten/sui.js/transactions';
import { PROTOCOL, FnCallType, CLOCK_OBJECT, Query_Param, OBJECTS_TYPE, OBJECTS_TYPE_PREFIX, PassportObject, GuardObject, TXB_OBJECT} from './protocol';
import { parse_object_type, array_unique } from './util';
import { rpc_sense_objects_fn } from './guard';

export const MAX_GUARD_COUNT = 8;

// passport verify for some guards, MUST be in ONE pxb:
// 0. construct Guard_Query_Objects(passport_quries) from queries for guards of objects
// 1. create passport
// 2. add all guards
// 3. verify passport
// 4. ops using passport(guard set on object)
// 5. ops using passport(guard set on object)
// 6. destroy passport


export const passport_queries = async (guards:string[]) : Promise<Guard_Query_Object[]> => {
    let sense_objects = guards.map((value) => {
        return {objectid:value, callback:rpc_sense_objects_fn, data:[]} as Query_Param
    });
    await PROTOCOL.Query(sense_objects); // objects need quering in guards
    let sense_objects_result:string[] = [];
    sense_objects.forEach((value) => { // DONT CHANGE objects sequence 
        sense_objects_result = sense_objects_result.concat(value.data);
    });
    sense_objects_result = array_unique(sense_objects_result); // objects in guards
    // console.log(sense_objects_result);

    let queries = sense_objects_result.map((value) => { 
        return {objectid:value, callback:rpc_query_cmd_fn, data:[]} as Query_Param;
    })
    await PROTOCOL.Query(queries, {'showType':true}); // queries for passport verifing
    let res : Guard_Query_Object[] = [];
    sense_objects.forEach((guard) => { // DONT CHANGE objects sequence  for passport verifying
        res = res.concat(guard.data.map((object:string) => {
            let data = queries.filter((v) => {
                return v.objectid == object
            });
            if (!data) {
                console.error('error find data')
                console.log(queries)
                console.log(object)
                return 
            }
            return data[0].data          
        }))
    })
    return res;
}

// return passport object used
export function verify(txb:TransactionBlock, guards:string[], passport_queries:Guard_Query_Object[]) : PassportObject | boolean {
    if (!guards || passport_queries.length == 0 || passport_queries.length > MAX_GUARD_COUNT) {
        return false;
    }
    console.log(guards)
    console.log(passport_queries)
    
    var passport = txb.moveCall({
        target: PROTOCOL.PassportFn('new') as FnCallType,
        arguments: [ TXB_OBJECT(txb, guards[0]), txb.object(CLOCK_OBJECT)]
    });

    // add others guards, if any
    for (let i = 1; i < guards.length; i++) {
        console.log('dfdfdf')
        txb.moveCall({
            target:PROTOCOL.PassportFn('guard_add') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, guards[i])]
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

export function destroy(txb:TransactionBlock, passport:PassportObject) : boolean {
    txb.moveCall({
        target: PROTOCOL.PassportFn('destroy') as FnCallType,
        arguments: [ passport ]
    });  
    return true
}

export type Guard_Query_Object = {
    target: FnCallType, // object fnCall
    object: TransactionObjectInput, // object 
    types: string[], // object type
    id: string, // object id
}

// construct Guard_Query_Object of wowok objects for passport verify
export const rpc_query_cmd_fn = (response:SuiObjectResponse, param:Query_Param, option:SuiObjectDataOptions) => {
    if (!response.error && response.data?.objectId == param.objectid && response.data?.type) {
        for (let k = 0; k < OBJECTS_TYPE().length; k++) {
            if (response?.data?.type.includes(OBJECTS_TYPE()[k]) ) { // type: pack::m::Object<...>
                param.data = { target:OBJECTS_TYPE_PREFIX()[k] + 'guard_query' as FnCallType,
                    object:Inputs.SharedObjectRef({
                        objectId: response.data.objectId,
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

export const graphql_query_objects = (nodes:any) : Guard_Query_Object[] => {
    let ret:Guard_Query_Object[] = [];
    nodes.forEach((node:any) => {
        for (let k = 0; k < OBJECTS_TYPE().length; k++) {
            if (node?.asMoveObject?.contents?.type?.repr?.includes(OBJECTS_TYPE()[k]) ) { // type: pack::m::Object<...>
                ret.push({ target:OBJECTS_TYPE_PREFIX()[k] + 'guard_query' as FnCallType,
                    object:Inputs.SharedObjectRef({
                        objectId: node.address,
                        mutable: false,
                        initialSharedVersion: node.version,
                    }) as TransactionObjectInput,
                    types:parse_object_type(node.asMoveObject.contents.type.repr as string),
                    id: node.address,
                } as Guard_Query_Object);
            }
        }        
    })
    return ret
}