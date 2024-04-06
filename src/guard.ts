import { SuiObjectResponse, SuiObjectDataOptions, SuiParsedData } from '@mysten/sui.js/client';
import { TransactionBlock, Inputs, type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS, getSuiMoveConfig, toHEX, fromHEX, BcsReader } from '@mysten/bcs';
import { PROTOCOL, GuardAddress, FnCallType, Data_Type, MODULES, ContextType, OBJECTS_TYPE, 
    OBJECTS_TYPE_PREFIX, Query_Param, IsValidDesription, ValueType,  OperatorType} from './protocol';
import { concatenate, array_equal, ulebDecode, array_unique } from './util';
import { TransactionBlockDataBuilder } from '@mysten/sui.js/dist/cjs/builder/TransactionBlockData';

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

export type Guard_Creation = {
    description: string;
    senses: Guard_Sense[];
}

export function launch(txb:TransactionBlock, creation:Guard_Creation) : GuardAddress | boolean {
    if (!IsValidDesription(creation.description)) return false;
    if (!creation.senses) return false;
    let bValid = true;
    creation.senses.forEach((v) => {
        if (v.input.length == 0) bValid = false;
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
    return txb.moveCall({
        target:PROTOCOL.GuardFn("create") as FnCallType,
        arguments:[guard]
    });
}

export function signer_guard(txb:TransactionBlock) : boolean {
    txb.moveCall({
        target: PROTOCOL.GuardFn('signer_guard') as FnCallType,
        arguments: []
    }); // { kind: 'Result', index: 0 }, ref to address could used by PTB
    return true
}

export type Sense_Cmd_Type = {
    module:MODULES, 
    name:string, 
    cmd:number, 
    params:Data_Type[], 
    result:Data_Type
};

export const Sense_Cmd:any = [ 
    // module, 'name', 'id', [input], output
    [MODULES.permission, 'builder', 1, [], ValueType.TYPE_STATIC_address],
    [MODULES.permission, 'is_admin', 2, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
    [MODULES.permission, 'has_rights', 3, [ValueType.TYPE_STATIC_address, ValueType.TYPE_STATIC_u64], ValueType.TYPE_STATIC_bool],
    [MODULES.permission, 'contains_address', 4, [ValueType.TYPE_STATIC_address], ValueType.TYPE_STATIC_bool],
    [MODULES.permission, 'contains_index', 5, [ValueType.TYPE_STATIC_address, ValueType.TYPE_STATIC_u64], ValueType.TYPE_STATIC_bool],
    [MODULES.permission, 'contains_guard', 6, [ValueType.TYPE_STATIC_address, ValueType.TYPE_STATIC_u64], ValueType.TYPE_STATIC_bool],
    [MODULES.permission, 'contains_guard', 7, [ValueType.TYPE_STATIC_address, ValueType.TYPE_STATIC_u64], ValueType.TYPE_STATIC_address],

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
    add_param(type:ValueType | ContextType, param?:any) : boolean {
        const bcs = new BCS(getSuiMoveConfig());
        switch(type)  {
        case ValueType.TYPE_STATIC_address: 
            this.data.push(bcs.ser(BCS.U8, type).toBytes());
            this.data.push(bcs.ser(BCS.ADDRESS, param).toBytes());
            this.type_validator.push(type);
            break;
        case ValueType.TYPE_STATIC_bool:
            this.data.push(bcs.ser(BCS.U8, type).toBytes());
            this.data.push(bcs.ser(BCS.BOOL, param).toBytes());
            this.type_validator.push(type);
            break;
        case ValueType.TYPE_STATIC_u8:
            this.data.push(bcs.ser(BCS.U8, type).toBytes());
            this.data.push(bcs.ser(BCS.U8, param).toBytes());
            this.type_validator.push(type);
            break;
        case ValueType.TYPE_STATIC_u64: 
            this.data.push(bcs.ser(BCS.U8, type).toBytes());
            this.data.push(bcs.ser(BCS.U64, param).toBytes());
            this.type_validator.push(type);
            break;
        case ValueType.TYPE_STATIC_vec_u8:
            this.data.push(bcs.ser(BCS.U8, type).toBytes());
            this.data.push(bcs.ser("vector<u8>", param).toBytes());
            this.type_validator.push(type);
            // this.data[this.data.length-1].forEach((item : number) => console.log(item))
            break;
        case ContextType.TYPE_CONTEXT_SIGNER:
            this.data.push(bcs.ser(BCS.U8, type).toBytes());
            this.type_validator.push(ValueType.TYPE_STATIC_address);
            break;
        case ContextType.TYPE_CONTEXT_CURRENT_CLOCK:
            this.data.push(bcs.ser(BCS.U8, type).toBytes());
            this.type_validator.push(ValueType.TYPE_STATIC_u64);
            break;
        case ContextType.TYPE_CONTEXT_CURRENT_PROGRESS:
            this.data.push(bcs.ser(BCS.U8, type).toBytes());
            this.type_validator.push(ValueType.TYPE_STATIC_address);
            break;
        default:
            return false;
        };
        
        return true;
    }
    add_cmd(object_address:string, sense_index:number) : boolean {
        if (!object_address || sense_index >= Sense_Cmd.length) { return false; }
        let offset = this.type_validator.length - Sense_Cmd[sense_index][3].length;
        if (offset < 0) { 
            return false; 
        }

        let types = this.type_validator.slice(offset);
        if (!array_equal(types, Sense_Cmd[sense_index][3])) { // type validate 
            return false; 
        }
        
        const bcs = new BCS(getSuiMoveConfig());
        this.data.push(bcs.ser(BCS.U8, OperatorType.TYPE_DYNAMIC_QUERY).toBytes()); // TYPE
        this.data.push(bcs.ser(BCS.ADDRESS, object_address).toBytes()); // object address
        this.data.push(bcs.ser(BCS.U8, Sense_Cmd[sense_index][2]).toBytes()); // cmd

        this.type_validator.splice(offset, Sense_Cmd[sense_index][3].length); // delete type stack
        this.type_validator.push(Sense_Cmd[sense_index][4]); // add the return value type to type stack
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
        const bcs = new BCS(getSuiMoveConfig());
        this.data.push(bcs.ser(BCS.U8, type).toBytes()); // TYPE     
        this.type_validator.splice(this.type_validator.length - 2); // delete type stack   
        this.type_validator.push(ValueType.TYPE_STATIC_bool); // add bool to type stack
        return true;
    }

    make(bNotAfterSense:boolean, binder:Guard_Sense_Binder) : boolean | Guard_Sense {
        //console.log(this.type_validator);
        //this.data.forEach((value:Uint8Array) => console.log(value));
        if (this.type_validator.length != 1 || this.type_validator[0] != ValueType.TYPE_STATIC_bool) { 
            return false;
        } // ERROR

        let input = concatenate(Uint8Array, ...this.data) as Uint8Array;
        const sense:Guard_Sense = {input:input, notAfterSense:bNotAfterSense, binder:binder};
        return sense;
    }
}

function match_u128(type:number) : boolean {
    if (type == ValueType.TYPE_STATIC_option_u8 || 
        type == ValueType.TYPE_STATIC_option_u64 || 
        type == ValueType.TYPE_STATIC_option_u128 ) {
            return true;
    }
    return false;
}

// parse guard senses input bytes of a guard, return [objectids] for 'query_cmd' 
export function parse_sense_bsc(chain_sense_bsc:Uint8Array)  : boolean | string[] {
    // console.log(data);
    var array = [].slice.call(chain_sense_bsc.reverse());
    const bcs = new BCS(getSuiMoveConfig());
    var result = [];

    while (array.length > 0) {
        var type : unknown = array.shift() ;
        // console.log(type);
        switch (type as Data_Type) { 
            case ContextType.TYPE_CONTEXT_SIGNER:
            case ContextType.TYPE_CONTEXT_CURRENT_CLOCK:
            case ContextType.TYPE_CONTEXT_CURRENT_PROGRESS:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER_EQUAL:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER_EQUAL:
            case OperatorType.TYPE_LOGIC_OPERATOR_U128_EQUAL:
            case OperatorType.TYPE_LOGIC_OPERATOR_EQUAL:
            case OperatorType.TYPE_LOGIC_OPERATOR_HAS_SUBSTRING:
            break;    
        case ValueType.TYPE_STATIC_address: 
            //console.log('0x' + bcs.de(BCS.ADDRESS,  Uint8Array.from(array)).toString());
            array.splice(0, 32);
            break;
        case ValueType.TYPE_STATIC_bool:
        case ValueType.TYPE_STATIC_u8:
            array.splice(0, 1);
            break;
        case ValueType.TYPE_STATIC_u64: 
            array.splice(0, 8);
            break;
        case ValueType.TYPE_STATIC_u128: 
            array.splice(0, 16);
            break;
        case ValueType.TYPE_STATIC_vec_u8:
            let {value, length} = ulebDecode(Uint8Array.from(array));
            array.splice(0, value+length);
            break;     
        case OperatorType.TYPE_DYNAMIC_QUERY:
            result.push('0x' + bcs.de(BCS.ADDRESS,  Uint8Array.from(array)).toString());
            array.splice(0, 33); // address + cmd
            break;
        default:
            // console.log('parse_sense_bsc:undefined');
            return false; // error
        }
    } 
    return result;
}

const MODULE_GUARD_INDEX = 7;
export const description_fn = (response:SuiObjectResponse, param:Query_Param, option:SuiObjectDataOptions) => {
    if (!response.error) {
        let c = response?.data?.content as any;
        if (c.type == OBJECTS_TYPE[MODULE_GUARD_INDEX] && c.fields.id.id == param.objectid) { // GUARD OBJECT
            let description = c.fields.description;
            if (!param.data.includes(description)) {
                param.data.push(description);
            }
        }        
    }
}
export const sense_objects_fn = (response:SuiObjectResponse, param:Query_Param, option:SuiObjectDataOptions) => {
    if (!response.error) {
        let c = response?.data?.content as any;
        if (c.type == OBJECTS_TYPE[MODULE_GUARD_INDEX] && c.fields.id.id == param.objectid) { // GUARD OBJECT
            for (let i = 0; i < c.fields.senses.length; i ++) {
                let sense = c.fields.senses[i];
                if (sense.type == (OBJECTS_TYPE_PREFIX[MODULE_GUARD_INDEX] + 'Sense')) { // ...::guard::Sense                    
                    let ids = parse_sense_bsc(Uint8Array.from(sense.fields.input.fields.bytes)) as string[];
                    param.data = array_unique(param.data.concat(ids));
                }                         
            }
        } 
    }
}