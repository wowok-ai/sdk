import { SuiObjectResponse, SuiObjectDataOptions, SuiParsedData } from '@mysten/sui.js/client';
import { TransactionBlock, Inputs, type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS, getSuiMoveConfig, toHEX, fromHEX, BcsReader } from '@mysten/bcs';
import { PROTOCOL, GuardAddress, FnCallType, Data_Type, MODULES, ContextType, OBJECTS_TYPE, 
    OBJECTS_TYPE_PREFIX, Query_Param, IsValidDesription, ValueType,  OperatorType,
    IsValidInt,
    IsValidAddress} from './protocol';
import { concatenate, array_equal, ulebDecode, array_unique } from './utils';
import { stringToUint8Array, BCS_CONVERT } from './utils';


export const MAX_SENSE_COUNT = 16;

export enum Guard_Sense_Binder {
    AND = 0, // first sense of guard always AND; for combining other guards
    OR = 1,
}

export type Guard_Sense = { 
    input: Uint8Array; 
    notAfterSense: boolean; 
    binder:Guard_Sense_Binder ;
};
export type VariableType = Map<number, Guard_Vriable>;

export type Guard_Vriable = {
    type: ContextType | OperatorType,
    value?: Uint8Array,
    witness?: Uint8Array,
}
export type Guard_Creation = {
    description: string;
    variables?: VariableType;
    senses: Guard_Sense[];
}

// de sense bsc => FutureValueRequest
export type FutureValueRequest = {
    guardid: string;
    identifier: number;
    type: ContextType | OperatorType,
    witness: Uint8Array,
}

export const IsValidGuardVirableType = (type:OperatorType | ContextType) : boolean => {
    if (type == OperatorType.TYPE_FUTURE_QUERY || type == ContextType.TYPE_CONTEXT_FUTURE_ID || type == OperatorType.TYPE_QUERY_FROM_CONTEXT || 
        type == ContextType.TYPE_CONTEXT_bool || type ==ContextType.TYPE_CONTEXT_address || type == ContextType.TYPE_CONTEXT_u64 || 
        type == ContextType.TYPE_CONTEXT_u8 ||  type == ContextType.TYPE_CONTEXT_vec_u8) {
        return true;
    };
    return false;
}
export const IsValidIndentifier = (identifier:number) : boolean => {
    if (!IsValidInt(identifier) || identifier > 255) return false;
    return true
}

// called by de-guard or passport
export function set_futrue_value(variables:VariableType, identifier:number, type:OperatorType | ContextType, value?:any) : boolean {
    if (!IsValidIndentifier(identifier)) return false;
    if (!IsValidGuardVirableType(type)) return false;
    let v = variables.get(identifier);
    if (v) {
        v.value = BCS_CONVERT.ser_address(value);     
        return true;   
    }
    return false;
}
export function get_variable_value(variables:VariableType, identifier:number, type:OperatorType | ContextType) : Uint8Array | boolean {
    if (variables.has(identifier)) {
        let v = variables.get(identifier);
        if (v?.value && v.type == type) {
            return v.value;
        }
    }  return false;
}
export function get_variable_witness(variables:VariableType, identifier:number, type:OperatorType | ContextType) : Uint8Array | boolean {
    if (variables.has(identifier)) {
        let v = variables.get(identifier);
        if (v?.witness && v.type == type) {
            return v.witness;
        }
    }  return false;
}

export function add_variable(variables:VariableType, identifier:number, type:OperatorType | ContextType, 
    value?:any, witness?:any, bNeedSerialize=true) : boolean {
    if (!IsValidIndentifier(identifier)) return false;
    if (!IsValidGuardVirableType(type)) return false;
    switch (type) {
        case OperatorType.TYPE_FUTURE_QUERY : 
        case ContextType.TYPE_CONTEXT_FUTURE_ID :
            if (variables.has(identifier)) {
                if (value)  {
                    bNeedSerialize? (variables.get(identifier) as Guard_Vriable).value = BCS_CONVERT.ser_address(value) :
                        (variables.get(identifier) as Guard_Vriable).value = value;
                }
                if (witness) {
                    bNeedSerialize? (variables.get(identifier) as Guard_Vriable).witness = BCS_CONVERT.ser_address(witness) :
                        (variables.get(identifier) as Guard_Vriable).witness = witness;
                }
            } else {
                bNeedSerialize ? variables.set(identifier, {type:type, witness:BCS_CONVERT.ser_address(witness)}) : 
                    variables.set(identifier, {type:type, witness:witness});                
            }
            return true;
        case ContextType.TYPE_CONTEXT_bool:
            bNeedSerialize ? variables.set(identifier, {type:type, value:BCS_CONVERT.ser_bool(value)}) :
                variables.set(identifier,  {type:type, value:value})              
            return true;   
        case ContextType.TYPE_CONTEXT_address:
        case OperatorType.TYPE_QUERY_FROM_CONTEXT:
            bNeedSerialize ? variables.set(identifier, {type:type, value:BCS_CONVERT.ser_address(value)}):
                variables.set(identifier,  {type:type, value:value});       
            return true;   
        case ContextType.TYPE_CONTEXT_u64:
            bNeedSerialize ? variables.set(identifier, {type:type, value:BCS_CONVERT.ser_u64(value)}) :
                variables.set(identifier,  {type:type, value:value})       
            return true;  
        case ContextType.TYPE_CONTEXT_u8:
            bNeedSerialize ? variables.set(identifier, {type:type, value:BCS_CONVERT.ser_u8(value)}) :
                variables.set(identifier,  {type:type, value:value})    
            return true;  
        case ContextType.TYPE_CONTEXT_vec_u8:
            bNeedSerialize ? variables.set(identifier, {type:type, value:BCS_CONVERT.ser_string(value)}) :
                variables.set(identifier,  {type:type, value:value})    
            return true;  
    }
    return false;
}

export function launch(txb:TransactionBlock, creation:Guard_Creation) : GuardAddress | boolean {
    if (!IsValidDesription(creation.description)) return false;
    if (!creation.senses) return false;

    let bValid = true;
    creation.senses.forEach((v) => {
        if (!v.input || v.input.length == 0) bValid = false;
    })
    creation?.variables?.forEach((v, k) => {
        if (!IsValidIndentifier(k)) bValid = false;
        if (!IsValidGuardVirableType(v.type)) bValid  = false;
        if (!v.value && !v.witness) bValid =  false;
    })
    if (!bValid) return false;

    let guard = txb.moveCall({
        target: PROTOCOL.GuardFn('new') as FnCallType,
        arguments: [txb.pure(creation.description , BCS.STRING)],  
    });
    creation.senses.forEach((sense: Guard_Sense) => {
        txb.moveCall({
            target: PROTOCOL.GuardFn('sense_add') as FnCallType,
            arguments:[guard, txb.pure([].slice.call(sense.input)),
                txb.pure(sense.notAfterSense, BCS.BOOL),
                txb.pure(sense.binder, BCS.U8),
            ]
        })
    });
    creation?.variables?.forEach((v, k) => {
        if (v.type == OperatorType.TYPE_FUTURE_QUERY || v.type == ContextType.TYPE_CONTEXT_FUTURE_ID) {
            if (!v.witness) return false;

            txb.moveCall({
                target:PROTOCOL.GuardFn("variable_add") as FnCallType,
                arguments:[guard, txb.pure(k, BCS.U8), txb.pure(v.type, BCS.U8), txb.pure([].slice.call(v.witness)), txb.pure(true, BCS.BOOL)]
            })            
        } else {
            if (!v.value)   return false;

            txb.moveCall({
                target:PROTOCOL.GuardFn("variable_add") as FnCallType,
                arguments:[guard, txb.pure(k, BCS.U8), txb.pure(v.type, BCS.U8), txb.pure([].slice.call(v.value)), txb.pure(true, BCS.BOOL)]
            }) 
        }
    });

    return txb.moveCall({
        target:PROTOCOL.GuardFn("create") as FnCallType,
        arguments:[guard]
    });
}

export function signer_guard(txb:TransactionBlock) : GuardAddress | boolean {
    return txb.moveCall({
        target: PROTOCOL.GuardFn('signer_guard') as FnCallType,
        arguments: []
    }); 
}

export function everyone_guard(txb:TransactionBlock) : GuardAddress | boolean {
    return txb.moveCall({
        target: PROTOCOL.GuardFn('everyone_guard') as FnCallType,
        arguments: []
    }); 
}

export type QUERIES_Type = {
    module:MODULES, 
    name:string, 
    cmd:number, 
    params:Data_Type[], 
    result:Data_Type
};

export const QUERIES:any = [ 
    // module, 'name', 'id', [input], output
    [MODULES.permission, 'builder', 1, [], ValueType.TYPE_STATIC_address],
    [MODULES.permission, 'is_admin', 2, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
    [MODULES.permission, 'has_rights', 3, [ValueType.TYPE_STATIC_address, ValueType.TYPE_STATIC_u64], ValueType.TYPE_STATIC_bool],
    [MODULES.permission, 'contains_address', 4, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
    [MODULES.permission, 'contains_index', 5, [ValueType.TYPE_STATIC_address, ValueType.TYPE_STATIC_u64], ValueType.TYPE_STATIC_bool],
    [MODULES.permission, 'contains_guard', 6, [ValueType.TYPE_STATIC_address, ValueType.TYPE_STATIC_u64], ValueType.TYPE_STATIC_bool],
    [MODULES.permission, 'contains_guard', 7, [ValueType.TYPE_STATIC_address, ValueType.TYPE_STATIC_u64], ValueType.TYPE_STATIC_address],
    [MODULES.permission, 'entity_count', 8, [], ValueType.TYPE_STATIC_u64],
    [MODULES.permission, 'admin_count', 9, [], ValueType.TYPE_STATIC_u64],

    [MODULES.repository, 'permission', 1, [], ValueType.TYPE_STATIC_address],
    [MODULES.repository, 'policy_contains', 2, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_bool],
    [MODULES.repository, 'policy_has_permission_index', 3, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_bool],
    [MODULES.repository, 'policy_permission_index', 4, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_u64],
    [MODULES.repository, 'policy_value_type', 5, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_u8],
    [MODULES.repository, 'contains_id', 6, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],   
    [MODULES.repository, 'contains_value', 7, [ValueType.TYPE_STATIC_address, ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_bool],
    [MODULES.repository, 'value_without_type', 8, [ValueType.TYPE_STATIC_address, ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_vec_u8],       
    [MODULES.repository, 'value', 9, [ValueType.TYPE_STATIC_address, ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_vec_u8],
    [MODULES.repository, 'type', 10, [], ValueType.TYPE_STATIC_u8],   
    [MODULES.repository, 'policy_mode', 11, [], ValueType.TYPE_STATIC_u8],   

    [MODULES.machine, 'permission', 1, [], ValueType.TYPE_STATIC_address],
    [MODULES.machine, 'has_paused', 2, [], ValueType.TYPE_STATIC_bool],
    [MODULES.machine, 'has_published', 3, [], ValueType.TYPE_STATIC_bool],
    [MODULES.machine, 'consensus_repositories_contains', 5, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
    [MODULES.machine, 'has_endpoint', 6, [], ValueType.TYPE_STATIC_bool],   
    [MODULES.machine, 'endpoint', 7, [], ValueType.TYPE_STATIC_vec_u8],

    [MODULES.progress, 'machine', 1, [], ValueType.TYPE_STATIC_address],       
    [MODULES.progress, 'current', 2, [], ValueType.TYPE_STATIC_vec_u8],
    [MODULES.progress, 'has_parent', 3, [], ValueType.TYPE_STATIC_bool],   
    [MODULES.progress, 'parent', 4, [], ValueType.TYPE_STATIC_address],   
    [MODULES.progress, 'has_task', 5, [], ValueType.TYPE_STATIC_bool],       
    [MODULES.progress, 'task', 6, [], ValueType.TYPE_STATIC_address],
    [MODULES.progress, 'has_namedOperator', 7, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_bool],   
    [MODULES.progress, 'namedOperator_contains', 8, [ValueType.TYPE_STATIC_vec_u8, ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool], 
    [MODULES.progress, 'has_context_repository', 9, [], ValueType.TYPE_STATIC_bool],
    [MODULES.progress, 'context_repository', 10, [], ValueType.TYPE_STATIC_address],   

    [MODULES.demand, 'permission', 1, [], ValueType.TYPE_STATIC_address],       
    [MODULES.demand, 'has_time_expire', 2, [], ValueType.TYPE_STATIC_bool],
    [MODULES.demand, 'time_expire', 3, [], ValueType.TYPE_STATIC_u64],   
    [MODULES.demand, 'earnest_count', 4, [], ValueType.TYPE_STATIC_u64],   
    [MODULES.demand, 'has_guard', 5, [], ValueType.TYPE_STATIC_bool],       
    [MODULES.demand, 'guard', 6, [], ValueType.TYPE_STATIC_address],
    [MODULES.demand, 'has_yes', 7, [], ValueType.TYPE_STATIC_bool],   
    [MODULES.demand, 'yes', 8, [], ValueType.TYPE_STATIC_address], 
    [MODULES.demand, 'presenters_count', 9, [], ValueType.TYPE_STATIC_u64],
    [MODULES.demand, 'has_presenter', 10, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],   
    [MODULES.demand, 'persenter', 11, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_address], 

    [MODULES.order, 'amount', 1, [], ValueType.TYPE_STATIC_u64],       
    [MODULES.order, 'payer', 2, [], ValueType.TYPE_STATIC_address],
    [MODULES.order, 'service', 3, [], ValueType.TYPE_STATIC_address],   
    [MODULES.order, 'has_progress', 4, [], ValueType.TYPE_STATIC_bool],   
    [MODULES.order, 'progress', 5, [], ValueType.TYPE_STATIC_address],       
    [MODULES.order, 'has_requred_info', 6, [], ValueType.TYPE_STATIC_bool],
    [MODULES.order, 'requred_info_service_pubkey', 7, [], ValueType.TYPE_STATIC_vec_u8],   
    [MODULES.order, 'requred_info_customer_pubkey', 8, [], ValueType.TYPE_STATIC_vec_u8], 
    [MODULES.order, 'requred_info_info', 9, [], ValueType.TYPE_STATIC_vec_vec_u8],
    [MODULES.order, 'has_discount', 10, [], ValueType.TYPE_STATIC_bool],   
    [MODULES.order, 'discount', 11, [], ValueType.TYPE_STATIC_address], 
    [MODULES.order, 'balance', 12, [], ValueType.TYPE_STATIC_u64], 
    [MODULES.order, 'bRefunded', 13, [], ValueType.TYPE_STATIC_u8],
    [MODULES.order, 'bWithdrawed', 14, [], ValueType.TYPE_STATIC_u8],   

    [MODULES.service, 'permission', 1, [], ValueType.TYPE_STATIC_address],       
    [MODULES.service, 'payee', 2, [], ValueType.TYPE_STATIC_address],
    [MODULES.service, 'has_buy_guard', 3, [], ValueType.TYPE_STATIC_bool],   
    [MODULES.service, 'buy_guard', 4, [], ValueType.TYPE_STATIC_address],   
    [MODULES.service, 'repository_contains', 5, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],       
    [MODULES.service, 'has_withdraw_guard', 6, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
    [MODULES.service, 'withdraw_guard_percent', 7, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_u64],   
    [MODULES.service, 'has_refund_guard', 8, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool], 
    [MODULES.service, 'refund_guard_percent', 9, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_u64],
    [MODULES.service, 'has_sale', 10, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_bool],   
    [MODULES.service, 'sale_price', 11, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_u64], 
    [MODULES.service, 'sale_stock', 12, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_u64], 
    [MODULES.service, 'has_machine', 13, [], ValueType.TYPE_STATIC_bool],
    [MODULES.service, 'machine', 14, [], ValueType.TYPE_STATIC_address],   
    [MODULES.service, 'bPaused', 15, [], ValueType.TYPE_STATIC_bool], 
    [MODULES.service, 'bPublished', 16, [], ValueType.TYPE_STATIC_bool], 
    [MODULES.service, 'has_required', 17, [], ValueType.TYPE_STATIC_bool],
    [MODULES.service, 'requrired_pubkey', 18, [], ValueType.TYPE_STATIC_vec_u8],   
    [MODULES.service, 'requrired_info', 19, [], ValueType.TYPE_STATIC_vec_vec_u8],  

    [MODULES.reward, 'permission', 1, [], ValueType.TYPE_STATIC_address],       
    [MODULES.reward, 'rewards_count_remain', 2, [], ValueType.TYPE_STATIC_u64],
    [MODULES.reward, 'rewards_count_supplied', 3, [], ValueType.TYPE_STATIC_u64],   
    [MODULES.reward, 'guard_count', 4, [], ValueType.TYPE_STATIC_u64],   
    [MODULES.reward, 'has_guard', 5, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],       
    [MODULES.reward, 'guard_portions', 6, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_u64],
    [MODULES.reward, 'time_expire', 7, [], ValueType.TYPE_STATIC_u64],   
    [MODULES.reward, 'has_claimed', 8, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool], 
    [MODULES.reward, 'claimed', 9, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_u64],
    [MODULES.reward, 'has_claimed_count', 10, [], ValueType.TYPE_STATIC_u64],   
    [MODULES.reward, 'is_sponsor', 11, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool], 
    [MODULES.reward, 'sponsor', 12, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_u64], 
    [MODULES.reward, 'sponsor_count', 13, [], ValueType.TYPE_STATIC_u64],
    [MODULES.reward, 'bAllowRepeatClaim', 14, [], ValueType.TYPE_STATIC_bool],  

    [MODULES.vote, 'permission', 1, [], ValueType.TYPE_STATIC_address],       
    [MODULES.vote, 'bOptions_locked_for_voting', 2, [], ValueType.TYPE_STATIC_bool],
    [MODULES.vote, 'bdeadline_locked', 3, [], ValueType.TYPE_STATIC_bool],   
    [MODULES.vote, 'bLockedGuard', 4, [], ValueType.TYPE_STATIC_bool],   
    [MODULES.vote, 'max_choice_count', 5, [], ValueType.TYPE_STATIC_u8],       
    [MODULES.vote, 'deadline', 6, [], ValueType.TYPE_STATIC_u64],
    [MODULES.vote, 'has_reference', 7, [], ValueType.TYPE_STATIC_bool],   
    [MODULES.vote, 'reference', 8, [], ValueType.TYPE_STATIC_address], 
    [MODULES.vote, 'has_guard', 9, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
    [MODULES.vote, 'guard', 10, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_u64],   
    [MODULES.vote, 'voted', 11, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool], 
    [MODULES.vote, 'voted_weight', 12, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_u64], 
    [MODULES.vote, 'has_agree', 13, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_bool],
    [MODULES.vote, 'agree_has_object', 14, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_bool],   
    [MODULES.vote, 'agree_object', 15, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_address], 
    [MODULES.vote, 'agree_count', 16, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_u64], 
    [MODULES.vote, 'agree_votes', 17, [ValueType.TYPE_STATIC_vec_u8], ValueType.TYPE_STATIC_u64],
    [MODULES.vote, 'voted_count', 18, [], ValueType.TYPE_STATIC_u64],   
    [MODULES.vote, 'top1_name_by_count', 19, [], ValueType.TYPE_STATIC_vec_u8], 
    [MODULES.vote, 'top1_count', 20, [], ValueType.TYPE_STATIC_u64], 
    [MODULES.vote, 'top1_name_by_votes', 21, [], ValueType.TYPE_STATIC_vec_u8], 
    [MODULES.vote, 'top1_votes', 22, [], ValueType.TYPE_STATIC_u64], 
]

export class SenseMaker {
    protected data : Uint8Array[] = [];
    protected type_validator : Data_Type[] = [];
    constructor() { }

    // serialize const & data
    add_param(type:ValueType | ContextType, param?:any, variable?:VariableType) : boolean {
        switch(type)  {
        case ValueType.TYPE_STATIC_address: 
            if (!param) return false
            this.data.push(BCS_CONVERT.ser_u8(type));
            this.data.push(BCS_CONVERT.ser_address(param));
            this.type_validator.push(type);
            break;
        case ValueType.TYPE_STATIC_bool:
            if (!param) return false
            this.data.push(BCS_CONVERT.ser_u8(type));
            this.data.push(BCS_CONVERT.ser_bool(param));
            this.type_validator.push(type);
            break;
        case ValueType.TYPE_STATIC_u8:
            if (!param) return false
            this.data.push(BCS_CONVERT.ser_u8(type));
            this.data.push(BCS_CONVERT.ser_u8(param));
            this.type_validator.push(type);
            break;
        case ValueType.TYPE_STATIC_u64: 
            if (!param) return false
            this.data.push(BCS_CONVERT.ser_u8(type));
            this.data.push(BCS_CONVERT.ser_u64(param));
            this.type_validator.push(type);
            break;
        case ValueType.TYPE_STATIC_vec_u8:
            if (!param) return false
            this.data.push(BCS_CONVERT.ser_u8(type));
            this.data.push(BCS_CONVERT.ser_string(param));
            this.type_validator.push(type);
            // this.data[this.data.length-1].forEach((item : number) => console.log(item))
            break;
        case ContextType.TYPE_CONTEXT_SIGNER:
            this.data.push(BCS_CONVERT.ser_u8(type));
            this.type_validator.push(ValueType.TYPE_STATIC_address);
            break;
        case ContextType.TYPE_CONTEXT_CLOCK:
            this.data.push(BCS_CONVERT.ser_u8(type));
            this.type_validator.push(ValueType.TYPE_STATIC_u64);
            break;
        case ContextType.TYPE_CONTEXT_bool:
        case ContextType.TYPE_CONTEXT_u8:
        case ContextType.TYPE_CONTEXT_u64:
        case ContextType.TYPE_CONTEXT_vec_u8:
        case ContextType.TYPE_CONTEXT_address:
        case ContextType.TYPE_CONTEXT_FUTURE_ID:
            if (!variable || !param) return false;
            if (typeof(param) != 'number') return false;
            if (!IsValidInt(param) || param > 255) return false;
            
            var v = variable.get(param);
            if (v?.type == type) {
                this.data.push(BCS_CONVERT.ser_u8(type));
                this.data.push(BCS_CONVERT.ser_u8(param));
                if (type == ContextType.TYPE_CONTEXT_bool) {
                    this.type_validator.push(ValueType.TYPE_STATIC_bool);                    
                } else if (type == ContextType.TYPE_CONTEXT_u8) {
                    this.type_validator.push(ValueType.TYPE_STATIC_u8);
                } else if (type == ContextType.TYPE_CONTEXT_u64) {
                    this.type_validator.push(ValueType.TYPE_STATIC_u64);
                } else if (type == ContextType.TYPE_CONTEXT_vec_u8) {
                    this.type_validator.push(ValueType.TYPE_STATIC_vec_u8);
                } else if (type == ContextType.TYPE_CONTEXT_address) {
                    this.type_validator.push(ValueType.TYPE_STATIC_address);
                } else if (type == ContextType.TYPE_CONTEXT_FUTURE_ID) {
                    this.type_validator.push(ValueType.TYPE_STATIC_address);
                }
                break;
            }; 
            return false;
        default:
            return false;
        };
        
        return true;
    }
    query_index(module:MODULES, query_name:string) : number {
        for (let i = 0; i < QUERIES.length; i++) {
            if (QUERIES[i][0] == module && QUERIES[i][1] == query_name) {
                return i;
            }
        }
        return -1;
    }
    add_future_query(identifier:number, module:MODULES, query_name:string, variable?:VariableType) : boolean {
        let query_index = this.query_index(module, query_name);
        if (!IsValidIndentifier(identifier) || query_index == -1)  return false;  
        if (module != MODULES.order && module != MODULES.progress)    return false;
        if (!variable  || variable.get(identifier)?.type != OperatorType.TYPE_FUTURE_QUERY) return false;

        let offset = this.type_validator.length - QUERIES[query_index][3].length;
        if (offset < 0) { 
            return false; 
        }

        let types = this.type_validator.slice(offset);
        if (!array_equal(types, QUERIES[query_index][3])) { // type validate 
            return false; 
        }

        this.data.push(BCS_CONVERT.ser_u8(OperatorType.TYPE_FUTURE_QUERY)); // TYPE
        this.data.push(BCS_CONVERT.ser_u8(identifier)); // variable identifier
        this.data.push(BCS_CONVERT.ser_u8(QUERIES[query_index][2])); // cmd

        this.type_validator.splice(offset, QUERIES[query_index][3].length); // delete type stack
        this.type_validator.push(QUERIES[query_index][4]); // add the return value type to type stack
        // console.log(this.type_validator)
        return true;
    }

    // object_address_from: string for static address; number as identifier  for variable
    add_query(module:MODULES, query_name:string, object_address_from:string | number) : boolean {
        let query_index = this.query_index(module, query_name); // query_index: index(from 0) of array QUERIES 
        if (query_index == -1)  return false; 
        if (typeof(object_address_from) == 'number') {
            if (!IsValidIndentifier(object_address_from)) return false;
        } else {
            if (!IsValidAddress(object_address_from)) return false;
        }

        let offset = this.type_validator.length - QUERIES[query_index][3].length;
        if (offset < 0) { 
            return false; 
        }

        let types = this.type_validator.slice(offset);
        if (!array_equal(types, QUERIES[query_index][3])) { // type validate 
            return false; 
        }
        
        if (typeof(object_address_from) == 'string') {
            this.data.push(BCS_CONVERT.ser_u8(OperatorType.TYPE_QUERY));// TYPE
            this.data.push(BCS_CONVERT.ser_address(object_address_from)); // object address            
        } else {
            this.data.push(BCS_CONVERT.ser_u8(OperatorType.TYPE_QUERY_FROM_CONTEXT));// TYPE
            this.data.push(BCS_CONVERT.ser_u8(object_address_from)); // object identifer in variables
        }

        this.data.push(BCS_CONVERT.ser_u8(QUERIES[query_index][2])); // cmd

        this.type_validator.splice(offset, QUERIES[query_index][3].length); // delete type stack
        this.type_validator.push(QUERIES[query_index][4]); // add the return value type to type stack
        // console.log(this.type_validator)
        return true;
    }

    add_logic(type:OperatorType) : boolean {
        switch (type) {
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER_EQUAL:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER_EQUAL:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_EQUAL:
                if (this.type_validator.length < 2)  { return false; }
                if (!match_u128(this.type_validator[this.type_validator.length - 1])) { return false; }
                if (!match_u128(this.type_validator[this.type_validator.length - 2])) { return false; }
                break;
            case OperatorType.TYPE_LOGIC_OPERATOR_EQUAL:
            case OperatorType.TYPE_LOGIC_OPERATOR_HAS_SUBSTRING:
                if (this.type_validator.length < 2)  { return false; }
                break;
            default:
                return false;
        }
        this.data.push(BCS_CONVERT.ser_u8(type)); // TYPE     
        this.type_validator.splice(this.type_validator.length - 2); // delete type stack   
        this.type_validator.push(ValueType.TYPE_STATIC_bool); // add bool to type stack
        return true;
    }

    make(bNotAfterSense:boolean = false, binder:Guard_Sense_Binder = Guard_Sense_Binder.AND) : boolean | Guard_Sense {
        //console.log(this.type_validator);
        //this.data.forEach((value:Uint8Array) => console.log(value));
        if (this.type_validator.length != 1 || this.type_validator[0] != ValueType.TYPE_STATIC_bool) { 
            // console.log(this.type_validator)
            return false;
        } // ERROR

        let input = concatenate(Uint8Array, ...this.data) as Uint8Array;
        const sense:Guard_Sense = {input:input, notAfterSense:bNotAfterSense, binder:binder};
        return sense;
    }
}

function match_u128(type:number) : boolean {
    if (type == ValueType.TYPE_STATIC_u8 || 
        type == ValueType.TYPE_STATIC_u64 || 
        type == ValueType.TYPE_STATIC_u128 ) {
            return true;
    }
    return false;
}

export function parse_graphql_senses(guardid:string, senses:any) : string[] {
    let objects:string[] = [];
    senses.forEach((s:any) => {
        let res = parse_sense_bsc(objects,  guardid, Uint8Array.from(s.input.bytes));
    });
    return objects;
}

export function parse_futures(result:any[], guardid: string, chain_sense_bsc:Uint8Array, variable?:VariableType) : boolean {
    var arr = [].slice.call(chain_sense_bsc.reverse());

    while (arr.length > 0) {
        var type : unknown = arr.shift() ;
        // console.log(type);
        switch (type as Data_Type) { 
            case ContextType.TYPE_CONTEXT_SIGNER:
            case ContextType.TYPE_CONTEXT_CLOCK:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER_EQUAL:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER_EQUAL:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_EQUAL:
            case OperatorType.TYPE_LOGIC_OPERATOR_EQUAL:
            case OperatorType.TYPE_LOGIC_OPERATOR_HAS_SUBSTRING:
            case OperatorType.TYPE_LOGIC_ALWAYS_TRUE:
            break;    
        case ContextType.TYPE_CONTEXT_FUTURE_ID: // MACHINE-ID
        case OperatorType.TYPE_FUTURE_QUERY:
            var identifer = arr.splice(0, 1);  
            if (type == OperatorType.TYPE_FUTURE_QUERY) {
                arr.splice(0, 1); // cmd
            }

            if (!variable || variable?.get(identifer[0])?.type != type) return false;
            let witness = get_variable_witness(variable, identifer[0], type as OperatorType) ;
            if (!witness)  return false;

            result.push({guardid:guardid, identifier:identifer[0], type:type, witness:Uint8Array.from(witness as Uint8Array)} as FutureValueRequest);
            break;
        case ContextType.TYPE_CONTEXT_address:
        case ContextType.TYPE_CONTEXT_bool:
        case ContextType.TYPE_CONTEXT_u8:
        case ContextType.TYPE_CONTEXT_u64:
        case ContextType.TYPE_CONTEXT_vec_u8:
        case ValueType.TYPE_STATIC_bool:
        case ValueType.TYPE_STATIC_u8:
            arr.splice(0, 1); // identifier
            break;
        case OperatorType.TYPE_QUERY_FROM_CONTEXT: 
            arr.splice(0, 2); // identifer + cmd
        case ValueType.TYPE_STATIC_address: 
            arr.splice(0, 32);
            break;
        case ValueType.TYPE_STATIC_u64: 
            arr.splice(0, 8);
            break;
        case ValueType.TYPE_STATIC_u128: 
            arr.splice(0, 16);
            break;
        case ValueType.TYPE_STATIC_vec_u8:
            let {value, length} = ulebDecode(Uint8Array.from(arr));
            arr.splice(0, value+length);
            break;     
        case OperatorType.TYPE_QUERY:
            arr.splice(0, 33); // address + cmd
            break;
        default:
            console.error('parse_sense_bsc:undefined');
            console.log(type as number)
            console.log(arr)
            return false; // error
        }
    } 
    return true;
}

// parse guard senses input bytes of a guard, return [objectids] for 'query_cmd' 
export function parse_sense_bsc(result:any[], guardid: string, chain_sense_bsc:Uint8Array, variable?:VariableType)  : boolean {
    var arr = [].slice.call(chain_sense_bsc.reverse());

    while (arr.length > 0) {
        var type : unknown = arr.shift() ;
        // console.log(type);
        switch (type as Data_Type) { 
            case ContextType.TYPE_CONTEXT_SIGNER:
            case ContextType.TYPE_CONTEXT_CLOCK:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER_EQUAL:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER_EQUAL:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_EQUAL:
            case OperatorType.TYPE_LOGIC_OPERATOR_EQUAL:
            case OperatorType.TYPE_LOGIC_OPERATOR_HAS_SUBSTRING:
            case OperatorType.TYPE_LOGIC_ALWAYS_TRUE:
            break;    
        case ContextType.TYPE_CONTEXT_FUTURE_ID: // MACHINE-ID
            var v = arr.splice(0, 1);
            if (!variable || variable?.get(v[0])?.type != type) return false;
            break;
        case ContextType.TYPE_CONTEXT_address:
        case ContextType.TYPE_CONTEXT_bool:
        case ContextType.TYPE_CONTEXT_u8:
        case ContextType.TYPE_CONTEXT_u64:
        case ContextType.TYPE_CONTEXT_vec_u8:
            arr.splice(0, 1); // identifier
            break;
        case ValueType.TYPE_STATIC_address: 
            //console.log('0x' + bcs.de(BCS.ADDRESS,  Uint8Array.from(array)).toString());
            arr.splice(0, 32);
            break;
        case ValueType.TYPE_STATIC_bool:
        case ValueType.TYPE_STATIC_u8:
            arr.splice(0, 1);
            break;
        case ValueType.TYPE_STATIC_u64: 
            arr.splice(0, 8);
            break;
        case ValueType.TYPE_STATIC_u128: 
            arr.splice(0, 16);
            break;
        case ValueType.TYPE_STATIC_vec_u8:
            let {value, length} = ulebDecode(Uint8Array.from(arr));
            arr.splice(0, value+length);
            break;     
        case OperatorType.TYPE_QUERY:
            result.push('0x' + BCS_CONVERT.de(BCS.ADDRESS, Uint8Array.from(arr)).toString());
            arr.splice(0, 33); // address + cmd
            break;
        case OperatorType.TYPE_QUERY_FROM_CONTEXT: 
        case OperatorType.TYPE_FUTURE_QUERY: 
            var identifer = arr.splice(0, 1);
            if (variable) {
                let v = get_variable_value(variable, identifer[0], type as OperatorType) ;
                if (v)  {
                    result.push('0x' + BCS_CONVERT.de(BCS.ADDRESS, Uint8Array.from(v as Uint8Array)).toString());
                    arr.splice(0, 1); // splice cmd  
                    break;
                }
            }; return false  
        default:
            console.error('parse_sense_bsc:undefined');
            console.log(type as number)
            console.log(arr)
            return false; // error
        }
    } 
    return true;
}

export const rpc_description_fn = (response:SuiObjectResponse, param:Query_Param, option:SuiObjectDataOptions) => {
    if (!response.error) {
        let c = response?.data?.content as any;

        if (OBJECTS_TYPE().find((v) => (v == c.type)) && c.fields.id.id == param.objectid) { // GUARD OBJECT
            let description = c.fields.description;
            if (!param.data.includes(description)) {
                param.data.push(description);
            }
        }        
    }
}


export const rpc_sense_objects_fn = (response:SuiObjectResponse, param:Query_Param, option:SuiObjectDataOptions) => {
    if (!response.error) {
        let c = response?.data?.content as any;
        let index = OBJECTS_TYPE().findIndex(v => v.includes('guard::Guard') && v == c.type);
        if (index >= 0 && c.fields.id.id == param.objectid) { // GUARD OBJECT
            let v = param?.variables  ? param.variables : new Map<number, Guard_Vriable>();
            
            for (let i = 0; i < c.fields.variables.length; i ++) {
                let variable = c.fields.variables[i];
                if (variable.type == (OBJECTS_TYPE_PREFIX()[index] + 'Variable')) { // ...::guard::Variable
                    if (!add_variable(v, variable.fields.identifier, variable.fields.type, variable.fields?.value, variable.fields?.witness, false)) {
                        console.log('rpc_sense_objects_fn add_variable error');
                        console.log(variable);
                        return ;
                    }
                }                         
            }
            param.variables = v;

            for (let i = 0; i < c.fields.senses.length; i ++) {
                let sense = c.fields.senses[i];
                if (sense.type == (OBJECTS_TYPE_PREFIX()[index] + 'Sense')) { // ...::guard::Sense    
                    let result : any[] = [];
                    if (param?.parser && param.parser(result, param.objectid, Uint8Array.from(sense.fields.input.fields.bytes), param.variables)) {
                        param.data = param.data.concat(result);      // DONT array_unique senses                  
                    }       
                }                         
            }
        } 
    }
}


