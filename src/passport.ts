import { SuiObjectResponse, SuiObjectDataOptions } from '@mysten/sui.js/client';
import { TransactionBlock, TransactionResult, type TransactionObjectInput, Inputs, TransactionArgument } from '@mysten/sui.js/transactions';
import { PROTOCOL, FnCallType, CLOCK_OBJECT, Query_Param, OBJECTS_TYPE, OBJECTS_TYPE_PREFIX, PassportObject, GuardObject, 
    TXB_OBJECT, ContextType, IsValidAddress, IsValidArray, IsValidObjects} from './protocol';
import { parse_object_type, array_unique, BCS_CONVERT } from './utils';
import { rpc_sense_objects_fn, parse_sense_bsc, parse_futures, FutureValueRequest, VariableType, add_variable, add_future_variable} from './guard';
import { BCS } from '@mysten/bcs';

export const MAX_GUARD_COUNT = 8;

// from guards: get future objects to fill by singer 
export const guard_futures = async (guards:string[]) : Promise<FutureValueRequest[]> => {
    let futrue_objects = guards.map((value) => {
        return {objectid:value, callback:rpc_sense_objects_fn, parser:parse_futures, data:[]} as Query_Param
    });
    await PROTOCOL.Query(futrue_objects); // future objects
    let future_objects_result:FutureValueRequest[] = [];
    futrue_objects.forEach((futrue) => { 
        futrue.data.forEach((f:FutureValueRequest) => {
            if (future_objects_result.findIndex((v)=>{ return v.guardid == f.guardid && v.identifier == f.identifier}) ==  -1) {
                future_objects_result.push(f);
            }
        }) ;
    });

    return future_objects_result
}

// from guards: get objects to 'guard_query' on chain , with future variables had filled.
// passport verify for some guards, MUST be in ONE pxb:
// 0. construct Guard_Query_Objects(passport_quries) from queries for guards of objects
// 1. create passport
// 2. add all guards / guards future variables
// 3. verify passport
// 4. ops using passport(guard set on object)
// 5. ops using passport(guard set on object)
// 6. destroy passport
export const guard_queries = async (guards:string[], futures?:FutureValueRequest[]) : Promise<Guard_Query_Object[]> => {
    let sense_objects = guards.map((value) => {
        let v:VariableType = new Map();
        futures?.forEach((f) => {
            if (f.guardid == value) {   
                add_future_variable(v, f.identifier, f.type, f.witness.slice(0), f?.value?f.value.slice(0):undefined, true);
            } 
        })
        return {objectid:value, callback:rpc_sense_objects_fn, parser:parse_sense_bsc, data:[], variables:futures?v:undefined} as Query_Param
    });

    await PROTOCOL.Query(sense_objects); // objects need quering in guards
    let sense_objects_result:string[] = [];
    sense_objects.forEach((value) => { // DONT CHANGE objects sequence 
        sense_objects_result = sense_objects_result.concat(value.data);
    });
    sense_objects_result = array_unique(sense_objects_result); // objects in guards
    
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
export function verify(txb:TransactionBlock, guards:GuardObject[], guard_queries:Guard_Query_Object[], future_values?:FutureValueRequest[]) : PassportObject | boolean {
    if (!guards || guards.length > MAX_GUARD_COUNT)   return false;
    if (!IsValidObjects(guards)) return false;

    var passport = txb.moveCall({
        target: PROTOCOL.PassportFn('new') as FnCallType,
        arguments: []
    });
   
    // add others guards, if any
    guards.forEach((guard) => {
        txb.moveCall({
            target:PROTOCOL.PassportFn('guard_add') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, guard)]
        });        
    })

    future_values?.forEach((v) => {
        txb.moveCall({
            target:PROTOCOL.PassportFn('future_set') as FnCallType,
            arguments:[passport, txb.pure(BCS_CONVERT.ser_address(v.guardid)), txb.pure(BCS_CONVERT.ser_u8(v.identifier)), 
                txb.pure(BCS_CONVERT.ser_address(v.value!))]
        })
    })

    // rules: 'verify' & 'query' in turns；'verify' at final end.
    for (let i = 0; i < guard_queries.length; i++) {
        let res = txb.moveCall({
            target: PROTOCOL.PassportFn('passport_verify') as FnCallType,
            arguments: [ passport, txb.object(CLOCK_OBJECT),  ]
        }); 
        txb.moveCall({
            target: guard_queries[i].target as FnCallType,
            arguments: [ txb.object(guard_queries[i].object), passport, res ],
            typeArguments: guard_queries[i].types,
        })
    } 
    txb.moveCall({
        target: PROTOCOL.PassportFn('passport_verify') as FnCallType,
        arguments: [ passport,  txb.object(CLOCK_OBJECT) ]
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