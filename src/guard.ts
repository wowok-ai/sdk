
import { BCS } from '@mysten/bcs';
import { Protocol, GuardAddress, FnCallType, Data_Type, MODULES, ContextType, ValueType,  OperatorType, VariableType} from './protocol';
import { concatenate, array_equal } from './utils';
import { IsValidDesription, Bcs, IsValidInt, IsValidAddress } from './utils';
import { ERROR, Errors } from './exception';

export type GuardVariable = Map<number, Guard_Vriable>;

export interface Guard_Vriable {
    type: VariableType ,
    value?: Uint8Array,
    witness?: Uint8Array,
}

export class Guard {
    static MAX_INPUT_LENGTH = 2048;
    static launch(protocol:Protocol, description:string, maker:GuardMaker) : GuardAddress  {
        if (!maker.IsReady()) {
            ERROR(Errors.InvalidParam, 'launch maker');
        }

        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        let bcs_input = maker.get_input()[0];
        let variables = maker.get_variable();
        if (bcs_input.length == 0 || bcs_input.length > Guard.MAX_INPUT_LENGTH) {
            ERROR(Errors.InvalidParam, 'launch input')
        }
    
        let bValid = true;
        variables?.forEach((v, k) => {
            if (!GuardVariableHelper.IsValidIndentifier(k)) bValid = false;
            if (!v.value && !v.witness) bValid =  false;
        })
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'launch variables')
        }
        
        let txb = protocol.CurrentSession();
        let input = new  Uint8Array(bcs_input); // copy new uint8array to reserve!

        // reserve the  bytes for guard
        let guard = txb.moveCall({
            target: protocol.GuardFn('new') as FnCallType,
            arguments: [txb.pure(description , BCS.STRING), txb.pure([].slice.call(input.reverse()))],  
        });

        variables?.forEach((v, k) => {
            if (v.type == ContextType.TYPE_WITNESS_ID) {
                if (!v.witness) {
                    ERROR(Errors.InvalidParam, 'variables type')
                }

                txb.moveCall({
                    target:protocol.GuardFn("variable_add") as FnCallType,
                    arguments:[guard, txb.pure(k, BCS.U8), txb.pure(v.type, BCS.U8), txb.pure([].slice.call(v.witness)), txb.pure(true, BCS.BOOL)]
                })            
            } else {
                if (!v.value)   {
                    ERROR(Errors.InvalidParam, 'variables type')
                }
    
                txb.moveCall({
                    target:protocol.GuardFn("variable_add") as FnCallType,
                    arguments:[guard, txb.pure(k, BCS.U8), txb.pure(v.type, BCS.U8), txb.pure([].slice.call(v.value)), txb.pure(true, BCS.BOOL)]
                }) 
            }
        });
    
        return txb.moveCall({
            target:protocol.GuardFn("create") as FnCallType,
            arguments:[guard]
        });
    }
    
    static signer_guard(protocol: Protocol) : GuardAddress {
        return protocol.CurrentSession().moveCall({
            target: protocol.GuardFn('signer_guard') as FnCallType,
            arguments: []
        }); 
    }
    
    static everyone_guard(protocol:Protocol) : GuardAddress {
        return protocol.CurrentSession().moveCall({
            target: protocol.GuardFn('everyone_guard') as FnCallType,
            arguments: []
        }); 
    }
    static QUERIES:any[] = [ 
        // module, 'name', 'id', [input], output
        [MODULES.permission, 'builder', 1, [], ValueType.TYPE_ADDRESS],
        [MODULES.permission, 'is_admin', 2, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.permission, 'has_rights', 3, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_BOOL],
        [MODULES.permission, 'contains_address', 4, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.permission, 'contains_index', 5, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_BOOL],
        [MODULES.permission, 'contains_guard', 6, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_BOOL],
        [MODULES.permission, 'contains_guard', 7, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_ADDRESS],
        [MODULES.permission, 'entity_count', 8, [], ValueType.TYPE_U64],
        [MODULES.permission, 'admin_count', 9, [], ValueType.TYPE_U64],
    
        [MODULES.repository, 'permission', 1, [], ValueType.TYPE_ADDRESS],
        [MODULES.repository, 'policy_contains', 2, [ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],
        [MODULES.repository, 'policy_has_permission_index', 3, [ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],
        [MODULES.repository, 'policy_permission_index', 4, [ValueType.TYPE_VEC_U8], ValueType.TYPE_U64],
        [MODULES.repository, 'policy_value_type', 5, [ValueType.TYPE_VEC_U8], ValueType.TYPE_U8],
        [MODULES.repository, 'contains_id', 6, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],   
        [MODULES.repository, 'contains_value', 7, [ValueType.TYPE_ADDRESS, ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],
        [MODULES.repository, 'value_without_type', 8, [ValueType.TYPE_ADDRESS, ValueType.TYPE_VEC_U8], ValueType.TYPE_VEC_U8],       
        [MODULES.repository, 'value', 9, [ValueType.TYPE_ADDRESS, ValueType.TYPE_VEC_U8], ValueType.TYPE_VEC_U8],
        [MODULES.repository, 'type', 10, [], ValueType.TYPE_U8],   
        [MODULES.repository, 'policy_mode', 11, [], ValueType.TYPE_U8],   
        [MODULES.repository, 'reference_count', 12, [], ValueType.TYPE_U64],   
        [MODULES.repository, 'has_reference', 13, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],   

        [MODULES.machine, 'permission', 1, [], ValueType.TYPE_ADDRESS],
        [MODULES.machine, 'has_paused', 2, [], ValueType.TYPE_BOOL],
        [MODULES.machine, 'has_published', 3, [], ValueType.TYPE_BOOL],
        [MODULES.machine, 'consensus_repositories_contains', 5, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.machine, 'has_endpoint', 6, [], ValueType.TYPE_BOOL],   
        [MODULES.machine, 'endpoint', 7, [], ValueType.TYPE_VEC_U8],
    
        [MODULES.progress, 'machine', 1, [], ValueType.TYPE_ADDRESS],       
        [MODULES.progress, 'current', 2, [], ValueType.TYPE_VEC_U8],
        [MODULES.progress, 'has_parent', 3, [], ValueType.TYPE_BOOL],   
        [MODULES.progress, 'parent', 4, [], ValueType.TYPE_ADDRESS],   
        [MODULES.progress, 'has_task', 5, [], ValueType.TYPE_BOOL],       
        [MODULES.progress, 'task', 6, [], ValueType.TYPE_ADDRESS],
        [MODULES.progress, 'has_namedOperator', 7, [ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],   
        [MODULES.progress, 'namedOperator_contains', 8, [ValueType.TYPE_VEC_U8, ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL], 
        [MODULES.progress, 'has_context_repository', 9, [], ValueType.TYPE_BOOL],
        [MODULES.progress, 'context_repository', 10, [], ValueType.TYPE_ADDRESS],   
    
        [MODULES.demand, 'permission', 1, [], ValueType.TYPE_ADDRESS],       
        [MODULES.demand, 'has_time_expire', 2, [], ValueType.TYPE_BOOL],
        [MODULES.demand, 'time_expire', 3, [], ValueType.TYPE_U64],   
        [MODULES.demand, 'earnest_count', 4, [], ValueType.TYPE_U64],   
        [MODULES.demand, 'has_guard', 5, [], ValueType.TYPE_BOOL],       
        [MODULES.demand, 'guard', 6, [], ValueType.TYPE_ADDRESS],
        [MODULES.demand, 'has_yes', 7, [], ValueType.TYPE_BOOL],   
        [MODULES.demand, 'yes', 8, [], ValueType.TYPE_ADDRESS], 
        [MODULES.demand, 'presenters_count', 9, [], ValueType.TYPE_U64],
        [MODULES.demand, 'has_presenter', 10, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],   
        [MODULES.demand, 'persenter', 11, [ValueType.TYPE_ADDRESS], ValueType.TYPE_ADDRESS], 
    
        [MODULES.order, 'amount', 1, [], ValueType.TYPE_U64],       
        [MODULES.order, 'payer', 2, [], ValueType.TYPE_ADDRESS],
        [MODULES.order, 'service', 3, [], ValueType.TYPE_ADDRESS],   
        [MODULES.order, 'has_progress', 4, [], ValueType.TYPE_BOOL],   
        [MODULES.order, 'progress', 5, [], ValueType.TYPE_ADDRESS],       
        [MODULES.order, 'has_requred_info', 6, [], ValueType.TYPE_BOOL],
        [MODULES.order, 'requred_info_service_pubkey', 7, [], ValueType.TYPE_VEC_U8],   
        [MODULES.order, 'requred_info_customer_pubkey', 8, [], ValueType.TYPE_VEC_U8], 
        [MODULES.order, 'requred_info_info', 9, [], ValueType.TYPE_VEC_VEC_U8],
        [MODULES.order, 'has_discount', 10, [], ValueType.TYPE_BOOL],   
        [MODULES.order, 'discount', 11, [], ValueType.TYPE_ADDRESS], 
        [MODULES.order, 'balance', 12, [], ValueType.TYPE_U64], 
        [MODULES.order, 'bRefunded', 13, [], ValueType.TYPE_U8],
        [MODULES.order, 'bWithdrawed', 14, [], ValueType.TYPE_U8],   
    
        [MODULES.service, 'permission', 1, [], ValueType.TYPE_ADDRESS],       
        [MODULES.service, 'payee', 2, [], ValueType.TYPE_ADDRESS],
        [MODULES.service, 'has_buy_guard', 3, [], ValueType.TYPE_BOOL],   
        [MODULES.service, 'buy_guard', 4, [], ValueType.TYPE_ADDRESS],   
        [MODULES.service, 'repository_contains', 5, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],       
        [MODULES.service, 'has_withdraw_guard', 6, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.service, 'withdraw_guard_percent', 7, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],   
        [MODULES.service, 'has_refund_guard', 8, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL], 
        [MODULES.service, 'refund_guard_percent', 9, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],
        [MODULES.service, 'has_sale', 10, [ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],   
        [MODULES.service, 'sale_price', 11, [ValueType.TYPE_VEC_U8], ValueType.TYPE_U64], 
        [MODULES.service, 'sale_stock', 12, [ValueType.TYPE_VEC_U8], ValueType.TYPE_U64], 
        [MODULES.service, 'has_machine', 13, [], ValueType.TYPE_BOOL],
        [MODULES.service, 'machine', 14, [], ValueType.TYPE_ADDRESS],   
        [MODULES.service, 'bPaused', 15, [], ValueType.TYPE_BOOL], 
        [MODULES.service, 'bPublished', 16, [], ValueType.TYPE_BOOL], 
        [MODULES.service, 'has_required', 17, [], ValueType.TYPE_BOOL],
        [MODULES.service, 'requrired_pubkey', 18, [], ValueType.TYPE_VEC_U8],   
        [MODULES.service, 'requrired_info', 19, [], ValueType.TYPE_VEC_VEC_U8],  
    
        [MODULES.reward, 'permission', 1, [], ValueType.TYPE_ADDRESS],       
        [MODULES.reward, 'rewards_count_remain', 2, [], ValueType.TYPE_U64],
        [MODULES.reward, 'rewards_count_supplied', 3, [], ValueType.TYPE_U64],   
        [MODULES.reward, 'guard_count', 4, [], ValueType.TYPE_U64],   
        [MODULES.reward, 'has_guard', 5, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],       
        [MODULES.reward, 'guard_portions', 6, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],
        [MODULES.reward, 'time_expire', 7, [], ValueType.TYPE_U64],   
        [MODULES.reward, 'has_claimed', 8, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL], 
        [MODULES.reward, 'claimed', 9, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],
        [MODULES.reward, 'has_claimed_count', 10, [], ValueType.TYPE_U64],   
        [MODULES.reward, 'is_sponsor', 11, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL], 
        [MODULES.reward, 'sponsor', 12, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64], 
        [MODULES.reward, 'sponsor_count', 13, [], ValueType.TYPE_U64],
        [MODULES.reward, 'bAllowRepeatClaim', 14, [], ValueType.TYPE_BOOL],  
    
        [MODULES.vote, 'permission', 1, [], ValueType.TYPE_ADDRESS],       
        [MODULES.vote, 'bOptions_locked_for_voting', 2, [], ValueType.TYPE_BOOL],
        [MODULES.vote, 'bdeadline_locked', 3, [], ValueType.TYPE_BOOL],   
        [MODULES.vote, 'bLockedGuard', 4, [], ValueType.TYPE_BOOL],   
        [MODULES.vote, 'max_choice_count', 5, [], ValueType.TYPE_U8],       
        [MODULES.vote, 'deadline', 6, [], ValueType.TYPE_U64],
        [MODULES.vote, 'has_reference', 7, [], ValueType.TYPE_BOOL],   
        [MODULES.vote, 'reference', 8, [], ValueType.TYPE_ADDRESS], 
        [MODULES.vote, 'has_guard', 9, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.vote, 'guard', 10, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],   
        [MODULES.vote, 'voted', 11, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL], 
        [MODULES.vote, 'voted_weight', 12, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64], 
        [MODULES.vote, 'has_agree', 13, [ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],
        [MODULES.vote, 'agree_has_object', 14, [ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],   
        [MODULES.vote, 'agree_object', 15, [ValueType.TYPE_VEC_U8], ValueType.TYPE_ADDRESS], 
        [MODULES.vote, 'agree_count', 16, [ValueType.TYPE_VEC_U8], ValueType.TYPE_U64], 
        [MODULES.vote, 'agree_votes', 17, [ValueType.TYPE_VEC_U8], ValueType.TYPE_U64],
        [MODULES.vote, 'voted_count', 18, [], ValueType.TYPE_U64],   
        [MODULES.vote, 'top1_name_by_count', 19, [], ValueType.TYPE_VEC_U8], 
        [MODULES.vote, 'top1_count', 20, [], ValueType.TYPE_U64], 
        [MODULES.vote, 'top1_name_by_votes', 21, [], ValueType.TYPE_VEC_U8], 
        [MODULES.vote, 'top1_votes', 22, [], ValueType.TYPE_U64], 
    ]
}

export class GuardVariableHelper {
    static IsValidIndentifier = (identifier:number) : boolean => {
        if (!IsValidInt(identifier) || identifier > 255) return false;
        return true
    }
    static get_variable_value(variables:GuardVariable, identifier:number, type:VariableType) : Uint8Array | undefined {
        if (variables.has(identifier)) {
            let v = variables.get(identifier);
            if (v?.value && v.type == type) {
                return v.value;
            }
        } 
    }
    static get_variable_witness(variables:GuardVariable, identifier:number) : Uint8Array | undefined {
        if (variables.has(identifier)) {
            let v = variables.get(identifier);
            if (v?.witness && v.type == ContextType.TYPE_WITNESS_ID) {
                return v.witness;
            }
        } 
    }

    static add_future_variable(variables:GuardVariable, identifier:number, witness:any, value?:any, bNeedSerialize=true)  {
        if (!GuardVariableHelper.IsValidIndentifier(identifier)) ERROR(Errors.IsValidIndentifier, 'add_future_variable');
        if (!witness && !value) ERROR(Errors.InvalidParam, 'both witness and value invalid');
        let v = variables.get(identifier);
        if (!v || v.type == ContextType.TYPE_WITNESS_ID) {
            if (bNeedSerialize) {
                variables.set(identifier, {type:ContextType.TYPE_WITNESS_ID, value:value ? Bcs.getInstance().ser_address(value) : undefined, witness:witness ? Bcs.getInstance().ser_address(witness) : undefined})
            } else {
                variables.set(identifier, {type:ContextType.TYPE_WITNESS_ID, value:value?value:undefined, witness:witness?witness:undefined});             
            }                     
        } 
    }
    
    static add_variable(variables:GuardVariable, identifier:number, type:ValueType, value:any, bNeedSerialize=true) {
        if (!GuardVariableHelper.IsValidIndentifier(identifier)) return false;
        if (!value) return false;
    
        switch (type) {
            case ValueType.TYPE_BOOL:
                bNeedSerialize ? variables.set(identifier, {type:type, value:Bcs.getInstance().ser_bool(value)}) :
                    variables.set(identifier,  {type:type, value:value})    
                return         
            case ValueType.TYPE_ADDRESS:
                bNeedSerialize ? variables.set(identifier, {type:type, value:Bcs.getInstance().ser_address(value)}):
                    variables.set(identifier,  {type:type, value:value});       
                return;   
            case ValueType.TYPE_U64:
                bNeedSerialize ? variables.set(identifier, {type:type, value:Bcs.getInstance().ser_u64(value)}) :
                    variables.set(identifier,  {type:type, value:value})       
                return;  
            case ValueType.TYPE_U8:
                bNeedSerialize ? variables.set(identifier, {type:type, value:Bcs.getInstance().ser_u8(value)}) :
                    variables.set(identifier,  {type:type, value:value})    
                return;  
            case ValueType.TYPE_VEC_U8:
                if (typeof(value) === 'string') {
                    variables.set(identifier, {type:type, value:Bcs.getInstance().ser_string(value)})                 
                } else {
                    variables.set(identifier,  {type:type, value:value})      
                }
                return;  
            case ValueType.TYPE_U128:
                bNeedSerialize ? variables.set(identifier, {type:type, value:Bcs.getInstance().ser_u128(value)}) :
                    variables.set(identifier,  {type:type, value:value})    
                return;  
            case ValueType.TYPE_U256:
                bNeedSerialize ? variables.set(identifier, {type:type, value:Bcs.getInstance().ser_u256(value)}) :
                    variables.set(identifier,  {type:type, value:value})    
                return;  
            case ValueType.TYPE_VEC_U64:
                bNeedSerialize ? variables.set(identifier, {type:type, value:Bcs.getInstance().ser_vector_u64(value)}) :
                    variables.set(identifier,  {type:type, value:value})    
                return;  
            case ValueType.TYPE_VEC_VEC_U8:
                bNeedSerialize ? variables.set(identifier, {type:type, value:Bcs.getInstance().ser_vector_vector_u8(value)}) :
                    variables.set(identifier,  {type:type, value:value})    
                return;        
            default:
                if (bNeedSerialize) {
                    ERROR(Errors.Fail, 'ValueType  serialize not impl yet')
                }
                variables.set(identifier,  {type:type, value:value}) 
        }
    }
}
export class GuardMaker {
    protected data : Uint8Array[] = [];
    protected type_validator : Data_Type[] = [];
    protected variable : GuardVariable = new Map();

    private static index: number = 0;
    private static get_index() { 
        if (GuardMaker.index == 256) {
            GuardMaker.index = 0;
        }
        return GuardMaker.index++
    }

    constructor() { }

    add_variable(type:VariableType, value:any, bNeedSerialize=true) : number {
        let identifier = GuardMaker.get_index();
        if (type == ContextType.TYPE_WITNESS_ID) {
            // add witness to variable
            GuardVariableHelper.add_future_variable(this.variable, identifier, value, undefined, bNeedSerialize);
        } else {
            GuardVariableHelper.add_variable(this.variable, identifier, type, value, bNeedSerialize);
        }
        return identifier
    }

    // serialize const & data
    add_param(type:ValueType | ContextType, param?:any) : GuardMaker {
        switch(type)  {
        case ValueType.TYPE_ADDRESS: 
            if (!param) ERROR(Errors.InvalidParam, 'param');
            this.data.push(Bcs.getInstance().ser_u8(type));
            this.data.push(Bcs.getInstance().ser_address(param));
            this.type_validator.push(type);
            break;
        case ValueType.TYPE_BOOL:
            if (!param) ERROR(Errors.InvalidParam, 'param');
            this.data.push(Bcs.getInstance().ser_u8(type));
            this.data.push(Bcs.getInstance().ser_bool(param));
            this.type_validator.push(type);
            break;
        case ValueType.TYPE_U8:
            if (!param) ERROR(Errors.InvalidParam, 'param');
            this.data.push(Bcs.getInstance().ser_u8(type));
            this.data.push(Bcs.getInstance().ser_u8(param));
            this.type_validator.push(type);
            break;
        case ValueType.TYPE_U64: 
            if (!param) ERROR(Errors.InvalidParam, 'param');
            this.data.push(Bcs.getInstance().ser_u8(type));
            this.data.push(Bcs.getInstance().ser_u64(param));
            this.type_validator.push(type);
            break;
        case ValueType.TYPE_VEC_U8:
            if (!param) ERROR(Errors.InvalidParam, 'param');
            this.data.push(Bcs.getInstance().ser_u8(type));
            this.data.push(Bcs.getInstance().ser_string(param));
            this.type_validator.push(type);
            // this.data[this.data.length-1].forEach((item : number) => console.log(item))
            break;
        case ContextType.TYPE_SIGNER:
            this.data.push(Bcs.getInstance().ser_u8(type));
            this.type_validator.push(ValueType.TYPE_ADDRESS);
            break;
        case ContextType.TYPE_CLOCK:
            this.data.push(Bcs.getInstance().ser_u8(type));
            this.type_validator.push(ValueType.TYPE_U64);
            break;
        case ContextType.TYPE_WITNESS_ID:
            if (!param) ERROR(Errors.InvalidParam, 'param');
            this.data.push(Bcs.getInstance().ser_u8(type));
            this.data.push(Bcs.getInstance().ser_address(param));
            this.type_validator.push(ValueType.TYPE_ADDRESS);
            break;   
        case ContextType.TYPE_VARIABLE:
            if (!param) {
                ERROR(Errors.InvalidParam, 'param invalid');
            }
            if (typeof(param) != 'number' || !IsValidInt(param) || param > 255) {
                ERROR(Errors.InvalidParam, 'add_param param');
            }
            
            var v = this.variable.get(param);
            if (!v) ERROR(Errors.Fail, 'identifier not in variable');
            this.type_validator.push(v!.type);
            this.data.push(Bcs.getInstance().ser_u8(type));
            this.data.push(Bcs.getInstance().ser_u8(param));
            break;
        default:
            ERROR(Errors.InvalidParam, 'add_param type');
        };
        return this;
    }

    // object_address_from: string for static address; number as identifier  invariable
    add_query(module:MODULES, query_name:string, object_address_from:string | number, bWitness:boolean=false) : GuardMaker {
        let query_index = Guard.QUERIES.findIndex((q) => { return q[0] ==  module && q[1]  == query_name})
        if (query_index == -1)  {
            ERROR(Errors.InvalidParam, 'query_name');
        }

        if (typeof(object_address_from) == 'number' ) {
            if (!GuardVariableHelper.IsValidIndentifier(object_address_from)) {
                ERROR(Errors.InvalidParam, 'object_address_from');
            }
        } else {
            if (!IsValidAddress(object_address_from)) {
                ERROR(Errors.InvalidParam, 'object_address_from');
            }
        }

        let offset = this.type_validator.length - Guard.QUERIES[query_index][3].length;
        if (offset < 0) { 
            ERROR(Errors.InvalidParam, 'query_name');
        }

        let types = this.type_validator.slice(offset);
        if (!array_equal(types, Guard.QUERIES[query_index][3])) { // type validate 
            ERROR(Errors.Fail, 'array_equal');
        }
        
        this.data.push(Bcs.getInstance().ser_u8(OperatorType.TYPE_QUERY)); // QUERY TYPE
        if (typeof(object_address_from) == 'string') {
            bWitness ? this.data.push(Bcs.getInstance().ser_u8(ContextType.TYPE_WITNESS_ID)) :
                this.data.push(Bcs.getInstance().ser_u8(ValueType.TYPE_ADDRESS)); 
            this.data.push(Bcs.getInstance().ser_address(object_address_from)); // object address            
        } else {
            let v =  this.variable.get(object_address_from);
            if (!v) ERROR(Errors.Fail, 'object_address_from not in variable');
            if ((bWitness && v?.type == ContextType.TYPE_WITNESS_ID) || (!bWitness && v?.type == ValueType.TYPE_ADDRESS)) {
                this.data.push(Bcs.getInstance().ser_u8(ContextType.TYPE_VARIABLE));
                this.data.push(Bcs.getInstance().ser_u8(object_address_from)); // object identifer in variables
            } else {
                ERROR(Errors.Fail, 'type bWitness not match')
            }
        }

        this.data.push(Bcs.getInstance().ser_u8(Guard.QUERIES[query_index][2])); // cmd
        this.type_validator.splice(offset, Guard.QUERIES[query_index][3].length); // delete type stack
        this.type_validator.push(Guard.QUERIES[query_index][4]); // add the return value type to type stack
        return this;
    }

    add_logic(type:OperatorType) : GuardMaker {
        let splice_len = 2;
        switch (type) {
            case OperatorType.TYPE_LOGIC_AS_U256_GREATER:
            case OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL:
            case OperatorType.TYPE_LOGIC_AS_U256_LESSER:
            case OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL:
            case OperatorType.TYPE_LOGIC_AS_U256_EQUAL:
                if (this.type_validator.length < splice_len)  { ERROR(Errors.Fail, 'type_validator.length') }
                if (!GuardMaker.match_u128(this.type_validator[this.type_validator.length - 1])) { ERROR(Errors.Fail, 'type_validator check') }
                if (!GuardMaker.match_u128(this.type_validator[this.type_validator.length - 2])) { ERROR(Errors.Fail, 'type_validator check')  }
                break;
            case OperatorType.TYPE_LOGIC_EQUAL:
                if (this.type_validator.length < splice_len)  { ERROR(Errors.Fail, 'type_validator.length') }
                break;
            case OperatorType.TYPE_LOGIC_HAS_SUBSTRING:
                if (this.type_validator.length < splice_len)  { ERROR(Errors.Fail, 'type_validator.length') }
                break;
            case OperatorType.TYPE_LOGIC_NOT:
                splice_len =  1;
                if (this.type_validator.length < splice_len) { ERROR(Errors.Fail, 'type_validator.length') }
                if (this.type_validator[this.type_validator.length -1] != ValueType.TYPE_BOOL) { ERROR(Errors.Fail, 'type_validator check')  }
                break;
            case OperatorType.TYPE_LOGIC_AND:
            case OperatorType.TYPE_LOGIC_OR:
                if (this.type_validator.length < splice_len)  { ERROR(Errors.Fail, 'type_validator.length') }
                if (this.type_validator[this.type_validator.length -1] != ValueType.TYPE_BOOL) { ERROR(Errors.Fail, 'type_validator check')  }
                if (this.type_validator[this.type_validator.length -2] != ValueType.TYPE_BOOL) { ERROR(Errors.Fail, 'type_validator check')  }
                break;
            default:
                ERROR(Errors.InvalidParam, 'type') 
        }
        this.data.push(Bcs.getInstance().ser_u8(type)); // TYPE     
        this.type_validator.splice(this.type_validator.length - splice_len); // delete type stack   
        this.type_validator.push(ValueType.TYPE_BOOL); // add bool to type stack
        return this;
    }

    build(bNot = false) : GuardMaker {
        //console.log(this.type_validator);
        //this.data.forEach((value:Uint8Array) => console.log(value));
        if (this.type_validator.length != 1 || this.type_validator[0] != ValueType.TYPE_BOOL) { 
            ERROR(Errors.Fail, 'type_validator check') 
        } // ERROR
        if (bNot) {
            this.add_logic(OperatorType.TYPE_LOGIC_NOT);
        }
        this.data.push(concatenate(Uint8Array, ...this.data) as Uint8Array);
        this.data.splice(0, this.data.length-1);
        return this;
    }

    IsReady() : boolean {
        return this.type_validator.length == 1 && this.type_validator[0] == ValueType.TYPE_BOOL && this.data.length == 1;
    }

    combine(otherBuilt:GuardMaker, bAnd:boolean = true, bCombinVariable=false) : GuardMaker {
        if (!otherBuilt.IsReady() || !this.IsReady()) { ERROR(Errors.Fail, 'both should built yet')};
        let maker = new GuardMaker();
        this.variable.forEach((v, k) => {
            maker.variable.set(k,  {type:v.type, value:v.value, witness:v.witness});
        })
        otherBuilt.variable.forEach((v, k) => {
            if (maker.variable.has(k) && !bCombinVariable) {
                ERROR(Errors.Fail, 'variable identifier exist');
            }
            maker.variable.set(k, {type:v.type, value:v.value, witness:v.witness});
        })
        let op = bAnd ? OperatorType.TYPE_LOGIC_AND :  OperatorType.TYPE_LOGIC_OR;
        maker.data.push(concatenate(Uint8Array, ...this.data, ...otherBuilt.data, Bcs.getInstance().ser_u8(op)));
        this.data.splice(0, this.data.length-1);
        maker.type_validator = this.type_validator;
        return maker
    }

    get_variable() { return this.variable  }
    get_input() { return this.data }

    static input_combine(input1:Uint8Array, input2:Uint8Array, bAnd:boolean = true) : Uint8Array {
        let op = bAnd ? OperatorType.TYPE_LOGIC_AND :  OperatorType.TYPE_LOGIC_OR;
        return concatenate(Uint8Array, input1, input2, Bcs.getInstance().ser_u8(op)) as  Uint8Array;
    }
    static input_not(input:Uint8Array) : Uint8Array {
        return concatenate(Uint8Array, input, Bcs.getInstance().ser_u8(OperatorType.TYPE_LOGIC_NOT)) as Uint8Array;
    }

    static match_u128(type:number) : boolean {
        if (type == ValueType.TYPE_U8 || 
            type == ValueType.TYPE_U64 || 
            type == ValueType.TYPE_U128 ||
            type == ValueType.TYPE_U256) {
                return true;
        }
        return false;
    }
}




