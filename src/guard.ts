

import { Protocol, LogicsInfo, GuardAddress, FnCallType, Data_Type, MODULES, ContextType, ValueType,  OperatorType, ConstantType, SER_VALUE} from './protocol';
import { concatenate, array_equal } from './utils';
import { IsValidDesription, Bcs, IsValidInt, IsValidAddress, FirstLetterUppercase } from './utils';
import { ERROR, Errors } from './exception';
import { Transaction as TransactionBlock } from '@mysten/sui/transactions';

export type GuardConstant = Map<number, Guard_Vriable>;

export interface Guard_Vriable {
    type: ConstantType ,
    value?: Uint8Array,
    witness?: Uint8Array,
}

export  interface Guard_Options {
    from: 'query' | 'type';
    name: string;
    value: number;  
    group?: string;
}

export class Guard {
    static MAX_INPUT_LENGTH = 2048;
    static launch(txb:TransactionBlock, description:string, maker:GuardMaker) : GuardAddress  {
        if (!maker.IsReady()) {
            ERROR(Errors.InvalidParam, 'launch maker');
        }

        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        let bcs_input = maker.get_input()[0];
        let constants = maker.get_constant();
        if (bcs_input.length == 0 || bcs_input.length > Guard.MAX_INPUT_LENGTH) {
            ERROR(Errors.InvalidParam, 'launch input')
        }
    
        let bValid = true;
        constants?.forEach((v, k) => {
            if (!GuardConstantHelper.IsValidIndentifier(k)) bValid = false;
            if (!v.value && !v.witness) bValid =  false;
        })
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'launch constants')
        }
        
        let input = new  Uint8Array(bcs_input); // copy new uint8array to reserve!

        // reserve the  bytes for guard
        let guard = txb.moveCall({
            target: Protocol.Instance().GuardFn('new') as FnCallType,
            arguments: [txb.pure.string(description), txb.pure.vector('u8', [].slice.call(input.reverse()))],  
        });

        constants?.forEach((v, k) => {
            if (v.type == ContextType.TYPE_WITNESS_ID) {
                if (!v.witness) {
                    ERROR(Errors.InvalidParam, 'constants type')
                }

                txb.moveCall({
                    target:Protocol.Instance().GuardFn("constant_add") as FnCallType,
                    arguments:[guard, txb.pure.u8(k), txb.pure.u8(v.type), txb.pure.vector('u8', [].slice.call(v.witness)), txb.pure.bool(true)]
                })            
            } else {
                if (!v.value)   {
                    ERROR(Errors.InvalidParam, 'constants type')
                }
    
                txb.moveCall({
                    target:Protocol.Instance().GuardFn("constant_add") as FnCallType,
                    arguments:[guard, txb.pure.u8(k), txb.pure.u8(v.type), txb.pure.vector('u8', [].slice.call(v.value)), txb.pure.bool(true)]
                }) 
            }
        });
    
        return txb.moveCall({
            target:Protocol.Instance().GuardFn("create") as FnCallType,
            arguments:[guard]
        });
    }
    
    static signer_guard(txb: TransactionBlock) : GuardAddress {
        return txb.moveCall({
            target: Protocol.Instance().GuardFn('signer_guard') as FnCallType,
            arguments: []
        }); 
    }
    
    static everyone_guard(txb:TransactionBlock) : GuardAddress {
        return txb.moveCall({
            target: Protocol.Instance().GuardFn('everyone_guard') as FnCallType,
            arguments: []
        }); 
    }

    static QUERIES:any[] = [ 
        // module, 'name', 'id', [input], output
        [MODULES.permission, 'Builder', 1, [], ValueType.TYPE_ADDRESS],
        [MODULES.permission, 'Has Admin', 2, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.permission, 'Has Rights', 3, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_BOOL],
        [MODULES.permission, 'Contains Address', 4, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.permission, 'Contains Index of Address', 5, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_BOOL],
        [MODULES.permission, 'Contains Guard of Address', 6, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_BOOL],
        [MODULES.permission, 'Guard of Address', 7, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_ADDRESS],
        [MODULES.permission, 'Entity Count', 8, [], ValueType.TYPE_U64],
        [MODULES.permission, 'Admin Count', 9, [], ValueType.TYPE_U64],
    
        [MODULES.repository, 'Permission', 11, [], ValueType.TYPE_ADDRESS],
        [MODULES.repository, 'Contains Policy', 12, [ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],
        [MODULES.repository, 'Has Permission of Policy', 13, [ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],
        [MODULES.repository, 'Permission of Policy', 14, [ValueType.TYPE_VEC_U8], ValueType.TYPE_U64],
        [MODULES.repository, 'Value Type of Policy',  15, [ValueType.TYPE_VEC_U8], ValueType.TYPE_U8],
        [MODULES.repository, 'Contains Id', 16, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],   
        [MODULES.repository, 'Contains Value', 17, [ValueType.TYPE_ADDRESS, ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],
        [MODULES.repository, 'Value without Type', 18, [ValueType.TYPE_ADDRESS, ValueType.TYPE_VEC_U8], ValueType.TYPE_VEC_U8],       
        [MODULES.repository, 'Value', 19, [ValueType.TYPE_ADDRESS, ValueType.TYPE_VEC_U8], ValueType.TYPE_VEC_U8],
        [MODULES.repository, 'Type', 20, [], ValueType.TYPE_U8],   
        [MODULES.repository, 'Policy Mode', 21, [], ValueType.TYPE_U8],   
        [MODULES.repository, 'Reference Count', 22, [], ValueType.TYPE_U64],   
        [MODULES.repository, 'Has Reference', 23, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],   

        [MODULES.machine, 'Permission', 31, [], ValueType.TYPE_ADDRESS],
        [MODULES.machine, 'Paused', 32, [], ValueType.TYPE_BOOL],
        [MODULES.machine, 'Published', 33, [], ValueType.TYPE_BOOL],
        [MODULES.machine, 'Is Consensus Repository', 34, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.machine, 'Has Endpoint', 35, [], ValueType.TYPE_BOOL],   
        [MODULES.machine, 'Endpoint', 36, [], ValueType.TYPE_VEC_U8],
    
        [MODULES.progress, 'Machine', 51, [], ValueType.TYPE_ADDRESS],       
        [MODULES.progress, 'Current Node', 52, [], ValueType.TYPE_VEC_U8],
        [MODULES.progress, 'Has Parent', 53, [], ValueType.TYPE_BOOL],   
        [MODULES.progress, 'Parent', 54, [], ValueType.TYPE_ADDRESS],   
        [MODULES.progress, 'Has Task', 55, [], ValueType.TYPE_BOOL],       
        [MODULES.progress, 'Task', 56, [], ValueType.TYPE_ADDRESS],
        [MODULES.progress, 'Has Operator', 57, [ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],   
        [MODULES.progress, 'Is Operator for Address', 58, [ValueType.TYPE_VEC_U8, ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL], 
        [MODULES.progress, 'Has Context Repository', 59, [], ValueType.TYPE_BOOL],
        [MODULES.progress, 'Context Repository', 60, [], ValueType.TYPE_ADDRESS],   
    
        [MODULES.demand, 'Permission', 71, [], ValueType.TYPE_ADDRESS],       
        [MODULES.demand, 'Has Deadline', 72, [], ValueType.TYPE_BOOL],
        [MODULES.demand, 'Deadline', 73, [], ValueType.TYPE_U64],   
        [MODULES.demand, 'Bounty Count', 74, [], ValueType.TYPE_U64],   
        [MODULES.demand, 'Has Guard', 75, [], ValueType.TYPE_BOOL],       
        [MODULES.demand, 'Guard', 76, [], ValueType.TYPE_ADDRESS],
        [MODULES.demand, 'Has Service Picked', 77, [], ValueType.TYPE_BOOL],   
        [MODULES.demand, 'Service Picked', 78, [], ValueType.TYPE_ADDRESS], 
        [MODULES.demand, 'Presenter Count', 79, [], ValueType.TYPE_U64],
        [MODULES.demand, 'Is Presenter', 80, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],   
        [MODULES.demand, 'Who Got Bounty', 81, [ValueType.TYPE_ADDRESS], ValueType.TYPE_ADDRESS], 
    
        [MODULES.order, 'Amount', 91, [], ValueType.TYPE_U64],       
        [MODULES.order, 'Payer', 92, [], ValueType.TYPE_ADDRESS],
        [MODULES.order, 'Service', 93, [], ValueType.TYPE_ADDRESS],   
        [MODULES.order, 'Has Progress', 94, [], ValueType.TYPE_BOOL],   
        [MODULES.order, 'Progress', 95, [], ValueType.TYPE_ADDRESS],       
        [MODULES.order, 'Has Required Info', 96, [], ValueType.TYPE_BOOL],
        [MODULES.order, 'Required Info of Service-Pubkey', 97, [], ValueType.TYPE_VEC_U8],   
        [MODULES.order, 'Required Info of Customer-Pubkey', 98, [], ValueType.TYPE_VEC_U8], 
        [MODULES.order, 'Required Info', 99, [], ValueType.TYPE_VEC_VEC_U8],
        [MODULES.order, 'Discount Used', 100, [], ValueType.TYPE_BOOL],   
        [MODULES.order, 'Discount', 101, [], ValueType.TYPE_ADDRESS], 
        [MODULES.order, 'Balance', 102, [], ValueType.TYPE_U64], 
        [MODULES.order, 'Be Refunded', 103, [], ValueType.TYPE_BOOL],
        [MODULES.order, 'Be Withdrawed', 104, [], ValueType.TYPE_BOOL],   
    
        [MODULES.service, 'Permission', 111, [], ValueType.TYPE_ADDRESS],       
        [MODULES.service, 'Payee', 112, [], ValueType.TYPE_ADDRESS],
        [MODULES.service, 'Has Buy-Guard', 113, [], ValueType.TYPE_BOOL],   
        [MODULES.service, 'Buy-Guard', 114, [], ValueType.TYPE_ADDRESS],   
        [MODULES.service, 'Contains Repository', 115, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],       
        [MODULES.service, 'Has Withdraw-Guard', 116, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.service, 'Withdraw-Guard Percent', 117, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],   
        [MODULES.service, 'Has Refund-Guard', 118, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL], 
        [MODULES.service, 'Refund-Guard Percent', 119, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],
        [MODULES.service, 'Has Sale Item', 120, [ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],   
        [MODULES.service, 'Sale Item Price', 121, [ValueType.TYPE_VEC_U8], ValueType.TYPE_U64], 
        [MODULES.service, 'Sale Item Inventory', 122, [ValueType.TYPE_VEC_U8], ValueType.TYPE_U64], 
        [MODULES.service, 'Has Machine', 123, [], ValueType.TYPE_BOOL],
        [MODULES.service, 'Machine', 124, [], ValueType.TYPE_ADDRESS],   
        [MODULES.service, 'Paused', 125, [], ValueType.TYPE_BOOL], 
        [MODULES.service, 'Published', 126, [], ValueType.TYPE_BOOL], 
        [MODULES.service, 'Has Required Info', 127, [], ValueType.TYPE_BOOL],
        [MODULES.service, 'Required Info of Service-Pubkey', 128, [], ValueType.TYPE_VEC_U8],   
        [MODULES.service, 'Required Info', 129, [], ValueType.TYPE_VEC_VEC_U8],  
    
        [MODULES.reward, 'Permission', 151, [], ValueType.TYPE_ADDRESS],       
        [MODULES.reward, 'Reward Count Left', 152, [], ValueType.TYPE_U64],
        [MODULES.reward, 'Reward Count Supplied', 153, [], ValueType.TYPE_U64],   
        [MODULES.reward, 'Guard Count', 154, [], ValueType.TYPE_U64],   
        [MODULES.reward, 'Has Guard', 155, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],       
        [MODULES.reward, 'Guard Portion', 156, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],
        [MODULES.reward, 'Deadline', 157, [], ValueType.TYPE_U64],   
        [MODULES.reward, 'Has Claimed by Address', 158, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL], 
        [MODULES.reward, 'Claimed by Address', 159, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],
        [MODULES.reward, 'Address Count Claimed', 160, [], ValueType.TYPE_U64],   
        [MODULES.reward, 'Is Sponsor', 161, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL], 
        [MODULES.reward, 'Portion by Sponsor', 162, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64], 
        [MODULES.reward, 'Sponsor Count', 163, [], ValueType.TYPE_U64],
        [MODULES.reward, 'Allow Repeat Claim', 164, [], ValueType.TYPE_BOOL],  
        [MODULES.reward, 'Claimed Portion by Address', 165, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],  
    
        [MODULES.vote, 'Permission', 171, [], ValueType.TYPE_ADDRESS],       
        [MODULES.vote, 'Options Locked', 172, [], ValueType.TYPE_BOOL],
        [MODULES.vote, 'Deadline Locked', 173, [], ValueType.TYPE_BOOL],   
        [MODULES.vote, 'Vote-Guard Locked', 174, [], ValueType.TYPE_BOOL],   
        [MODULES.vote, 'Max Choice Count', 175, [], ValueType.TYPE_U8],       
        [MODULES.vote, 'Deadline', 176, [], ValueType.TYPE_U64],
        [MODULES.vote, 'Has Reference', 177, [], ValueType.TYPE_BOOL],   
        [MODULES.vote, 'Reference', 178, [], ValueType.TYPE_ADDRESS], 
        [MODULES.vote, 'Has Vote-Guard', 179, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.vote, 'Vote-Guard', 180, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],   
        [MODULES.vote, 'Has Voted by Address', 181, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL], 
        [MODULES.vote, 'Voted Weight by Address', 182, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64], 
        [MODULES.vote, 'Has Option', 183, [ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],
        [MODULES.vote, 'Has Object of Option', 184, [ValueType.TYPE_VEC_U8], ValueType.TYPE_BOOL],   
        [MODULES.vote, 'Option Object', 185, [ValueType.TYPE_VEC_U8], ValueType.TYPE_ADDRESS], 
        [MODULES.vote, 'Option Count', 186, [ValueType.TYPE_VEC_U8], ValueType.TYPE_U64], 
        [MODULES.vote, 'Option Votes', 187, [ValueType.TYPE_VEC_U8], ValueType.TYPE_U64],
        [MODULES.vote, 'Address Count Voted', 188, [], ValueType.TYPE_U64],   
        [MODULES.vote, 'Top1 Option by Addresses', 189, [], ValueType.TYPE_VEC_U8], 
        [MODULES.vote, 'Top1 Count by Addresses', 190, [], ValueType.TYPE_U64], 
        [MODULES.vote, 'Top1 Option by Votes', 191, [], ValueType.TYPE_VEC_U8], 
        [MODULES.vote, 'Top1 Count by Votes', 192, [], ValueType.TYPE_U64], 

        [MODULES.wowok, 'Builder', 210, [], ValueType.TYPE_ADDRESS], 
        [MODULES.wowok, 'Everyone-Guard', 211, [], ValueType.TYPE_ADDRESS], 
        [MODULES.wowok, 'Object of Entities', 212, [], ValueType.TYPE_ADDRESS],
        [MODULES.wowok, 'Grantor Count', 213, [], ValueType.TYPE_U64],   
        [MODULES.wowok, 'Has Grantor', 214, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL], 
        [MODULES.wowok, 'Grantor Name', 215, [ValueType.TYPE_ADDRESS], ValueType.TYPE_VEC_U8], 
        [MODULES.wowok, 'Grantor Registration Time', 216, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64], 
        [MODULES.wowok, 'Grantor Expired Time', 217, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64], 
        [MODULES.wowok, 'Grantee Object for Grantor', 218, [ValueType.TYPE_ADDRESS], ValueType.TYPE_ADDRESS], 

        [MODULES.entity, 'Has Entity', 230, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL], 
        [MODULES.entity, 'Likes', 231, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64], 
        [MODULES.entity, 'Dislikes', 232, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64], 
        [MODULES.entity, 'Entity Info', 233, [ValueType.TYPE_ADDRESS], ValueType.TYPE_VEC_U8], 
        [MODULES.entity, 'Has Resource by Entity', 234, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL], 
        [MODULES.entity, 'Entity Resource', 235, [ValueType.TYPE_ADDRESS], ValueType.TYPE_ADDRESS], 
    ];

    static BoolCmd = Guard.QUERIES.filter(q => q[4] === ValueType.TYPE_BOOL);
    static IsBoolCmd = (cmd:number) : boolean => { return Guard.BoolCmd.includes((q:any) => {return q[2] == cmd}) }

    static CmdFilter = (retType:ValueType) => { return Guard.QUERIES.filter((q)=> q[4] === retType)}
    static GetCmd = (cmd:number | undefined) : any => { 
        return Guard.QUERIES.find((q:any) => {return q[2] == cmd}) ;
    }
    static GetCmdOption = (cmd:number) : Guard_Options | undefined => { 
        const  r = Guard.GetCmd(cmd);
        if (!r) return r;
        return  {from:'query', name:r[1], value:r[2], group:FirstLetterUppercase(r[0])}
    }

    static GetInputParams = (cmd:number) : ValueType[] => { 
        const r = Guard.GetCmd(cmd);
        if (!r) return [];
        return (r as any[])[3];
    }
    static GetModuleName = (cmd:number) : string => {
        let r = Guard.GetCmd(cmd);
        if (!r) return '';
        return FirstLetterUppercase(r[0])
    }
    static NumberOptions = () : Guard_Options[] => {
        const r: Guard_Options[] = [...Guard.CmdFilter(ValueType.TYPE_U8), ...Guard.CmdFilter(ValueType.TYPE_U64), 
            ...Guard.CmdFilter(ValueType.TYPE_U128), ...Guard.CmdFilter(ValueType.TYPE_U256)].map((v)=> { return {from:'query', name:v[1], value:v[2], group:FirstLetterUppercase(v[0])}});
        r.push({from:'type', name:'Txn Time', value:ContextType.TYPE_CLOCK, group:'Txn Functions'});
        return r;
    }
    static CommonOptions = (retType:ValueType) : Guard_Options[] => {
        return Guard.CmdFilter(retType).map((v)=> {return {from:'query', name:v[1], value:v[2], group:FirstLetterUppercase(v[0])}});
    }
    static AllOptions = () :  Guard_Options[] => {
        return Guard.QUERIES.map((v)=>{return {from:'query', name:v[1], value:v[2], group:FirstLetterUppercase(v[0])}});
    }
    static StringOptions = () : Guard_Options[] => {
        return [...Guard.CmdFilter(ValueType.TYPE_VEC_U8), ...Guard.CmdFilter(ValueType.TYPE_STRING)].map((v) => {
            return {from:'query', name:v[1], value:v[2], group:FirstLetterUppercase(v[0])};
        });
    }
    static BoolOptions = () : Guard_Options[] => {
        const n1:Guard_Options[] = Guard.BoolCmd.map((v)=> { return {from:'query', name:v[1], value:v[2], group:FirstLetterUppercase(v[0])}});
        const n2:Guard_Options[] = LogicsInfo.map((v) => { return {from:'type', name:v[1] as string, value:v[0] as number, group:'Compare or Logic'}});
        return [...n1, ...n2]
    }
    static AddressOptions = () : Guard_Options[] => {
        const n1:Guard_Options[] = Guard.QUERIES.filter(q => q[4] === ValueType.TYPE_ADDRESS).map((v)=> { return {from:'query', name:v[1], value:v[2], group:FirstLetterUppercase(v[0])}});
        n1.push({from:'type', name:'Txn Signer', value:ContextType.TYPE_SIGNER, group:'Txn Functions'});
        return [...n1]
    }

    static Options = (ret_type: ValueType | 'number' | 'any') : Guard_Options[] => {
        if (ret_type === 'number') {
            return Guard.NumberOptions();
        } else if (ret_type === 'any') {
            return Guard.AllOptions();
        }

        switch(ret_type as number) {
            case ValueType.TYPE_BOOL:
                return Guard.BoolOptions();
            case ValueType.TYPE_STRING:
                return Guard.StringOptions();
        }
        return Guard.CommonOptions(ret_type);
    }
}

export class GuardConstantHelper {
    static IsValidIndentifier = (identifier:number) : boolean => {
        if (!IsValidInt(identifier) || identifier > 255) return false;
        return true
    }
    static get_constant_value(constants:GuardConstant, identifier:number, type:ConstantType) : Uint8Array | undefined {
        if (constants.has(identifier)) {
            let v = constants.get(identifier);
            if (v?.value && v.type == type) {
                return v.value;
            }
        } 
    }
    static get_constant_witness(constants:GuardConstant, identifier:number) : Uint8Array | undefined {
        if (constants.has(identifier)) {
            let v = constants.get(identifier);
            if (v?.witness && v.type == ContextType.TYPE_WITNESS_ID) {
                return v.witness;
            }
        } 
    }

    static add_future_constant(constants:GuardConstant, identifier:number, witness:any, value?:any, bNeedSerialize=true)  {
        if (!GuardConstantHelper.IsValidIndentifier(identifier)) ERROR(Errors.IsValidIndentifier, 'add_future_constant');
        if (!witness && !value) ERROR(Errors.InvalidParam, 'both witness and value invalid');
        let v = constants.get(identifier);
        if (!v || v.type == ContextType.TYPE_WITNESS_ID) {
            if (bNeedSerialize) {
                constants.set(identifier, {type:ContextType.TYPE_WITNESS_ID, value:value ? Bcs.getInstance().ser(ValueType.TYPE_ADDRESS, value) : undefined, 
                    witness:witness ? Bcs.getInstance().ser(ValueType.TYPE_ADDRESS, witness) : undefined})
            } else {
                constants.set(identifier, {type:ContextType.TYPE_WITNESS_ID, value:value?value:undefined, witness:witness?witness:undefined});             
            }                     
        } 
    }
    
    static add_constant(constants:GuardConstant, identifier:number, type:ValueType, value:any, bNeedSerialize=true) {
        if (!GuardConstantHelper.IsValidIndentifier(identifier)) return false;
        if (!value) return false;
    
        switch (type) {
            case ValueType.TYPE_BOOL:
            case ValueType.TYPE_ADDRESS:
            case ValueType.TYPE_U64:
            case ValueType.TYPE_U8:
            case ValueType.TYPE_U128:
            case ValueType.TYPE_U256:
            case ValueType.TYPE_VEC_U64:
            case ValueType.TYPE_VEC_VEC_U8:   
            case ValueType.TYPE_OPTION_ADDRESS:
            case ValueType.TYPE_OPTION_BOOL:
            case ValueType.TYPE_OPTION_U128:
            case ValueType.TYPE_OPTION_U256:
            case ValueType.TYPE_OPTION_U64:
            case ValueType.TYPE_OPTION_U8:
            case ValueType.TYPE_VEC_ADDRESS:
            case ValueType.TYPE_VEC_BOOL:
            case ValueType.TYPE_VEC_U128:
            case ValueType.TYPE_VEC_U256:
                let ser = SER_VALUE.find(s=>s.type==type);
                if (!ser) ERROR(Errors.Fail, 'add_constant: invalid type');
                bNeedSerialize ? constants.set(identifier, {type:type, value:Bcs.getInstance().ser(ser!.type as number, value)}) :
                constants.set(identifier,  {type:type, value:value})    
                return         
            case ValueType.TYPE_VEC_U8:
                if (typeof(value) === 'string') {
                    constants.set(identifier, {type:type, value:Bcs.getInstance().ser(ValueType.TYPE_STRING, value)})                 
                } else {
                    constants.set(identifier,  {type:type, value:value})      
                }
                return;  
            default:
                ERROR(Errors.Fail, 'add_constant  serialize not impl yet')
        }
    }
}
export class GuardMaker {
    protected data : Uint8Array[] = [];
    protected type_validator : Data_Type[] = [];
    protected constant : GuardConstant = new Map();

    private static index: number = 0;
    private static get_index() { 
        if (GuardMaker.index == 256) {
            GuardMaker.index = 0;
        }
        return GuardMaker.index++
    }

    constructor() { }

    add_constant(type:ConstantType, value:any, bNeedSerialize=true) : number {
        let identifier = GuardMaker.get_index();
        if (type == ContextType.TYPE_WITNESS_ID) {
            // add witness to constant
            GuardConstantHelper.add_future_constant(this.constant, identifier, value, undefined, bNeedSerialize);
        } else {
            GuardConstantHelper.add_constant(this.constant, identifier, type, value, bNeedSerialize);
        }
        return identifier
    }

    private  serValueParam(type:ValueType, param?:any) {
        if (!param) ERROR(Errors.InvalidParam, 'param');
        this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
        let ser = SER_VALUE.find(s=>s.type==type);
        if (!ser) ERROR(Errors.Fail, 'serValueParam: invalid type');
        this.data.push(Bcs.getInstance().ser(ser!.type as number, param));
        this.type_validator.push(type);
    }

    // serialize const & data
    add_param(type:ValueType | ContextType, param?:any) : GuardMaker {
        switch(type)  {
        case ValueType.TYPE_ADDRESS: 
        case ValueType.TYPE_BOOL:
        case ValueType.TYPE_U8:
        case ValueType.TYPE_U64: 
        case ValueType.TYPE_U128: 
        case ValueType.TYPE_U256: 
        case ValueType.TYPE_VEC_ADDRESS: 
        case ValueType.TYPE_VEC_BOOL: 
        case ValueType.TYPE_VEC_U128: 
        case ValueType.TYPE_VEC_U64: 
        case ValueType.TYPE_VEC_VEC_U8: 
        case ValueType.TYPE_OPTION_U64: 
        case ValueType.TYPE_OPTION_ADDRESS:
        case ValueType.TYPE_OPTION_BOOL:
        case ValueType.TYPE_OPTION_U128:
        case ValueType.TYPE_OPTION_U256:
        case ValueType.TYPE_OPTION_U8:
        case ValueType.TYPE_VEC_U256:
            this.serValueParam(type, param);
            break;
        case ValueType.TYPE_VEC_U8:
            if (!param) ERROR(Errors.InvalidParam, 'param');
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
            if (typeof(param) == 'string') {
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_STRING, param));
            } else {
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_VEC_U8, param));
            }
            this.type_validator.push(type);
            break;
        case ContextType.TYPE_SIGNER:
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
            this.type_validator.push(ValueType.TYPE_ADDRESS);
            break;
        case ContextType.TYPE_CLOCK:
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
            this.type_validator.push(ValueType.TYPE_U64);
            break;
        case ContextType.TYPE_WITNESS_ID:
            if (!param) ERROR(Errors.InvalidParam, 'param');
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_ADDRESS, param));
            this.type_validator.push(ValueType.TYPE_ADDRESS);
            break;   
        case ContextType.TYPE_CONSTANT:
            if (!param) {
                ERROR(Errors.InvalidParam, 'param invalid');
            }
            if (typeof(param) != 'number' || !IsValidInt(param) || param > 255) {
                ERROR(Errors.InvalidParam, 'add_param param');
            }
            
            var v = this.constant.get(param);
            if (!v) ERROR(Errors.Fail, 'identifier not in constant');
            this.type_validator.push(v!.type);
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, param));
            break;
        default:
            ERROR(Errors.InvalidParam, 'add_param type' + type);
        };
        return this;
    }

    // object_address_from: string for static address; number as identifier  inconstant
    add_query(module:MODULES, query_name:string, object_address_from:string | number, bWitness:boolean=false) : GuardMaker {
        let query_index = Guard.QUERIES.findIndex((q) => { return q[0] ==  module && q[1]  == query_name})
        if (query_index == -1)  {
            ERROR(Errors.InvalidParam, 'query_name');
        }

        if (typeof(object_address_from) == 'number' ) {
            if (!GuardConstantHelper.IsValidIndentifier(object_address_from)) {
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
        
        this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, OperatorType.TYPE_QUERY)); // QUERY TYPE
        if (typeof(object_address_from) == 'string') {
            bWitness ? this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, ContextType.TYPE_WITNESS_ID)) :
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, ValueType.TYPE_ADDRESS)); 
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_ADDRESS, object_address_from)); // object address            
        } else {
            let v =  this.constant.get(object_address_from);
            if (!v) ERROR(Errors.Fail, 'object_address_from not in constant');
            if ((bWitness && v?.type == ContextType.TYPE_WITNESS_ID) || (!bWitness && v?.type == ValueType.TYPE_ADDRESS)) {
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, ContextType.TYPE_CONSTANT));
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, object_address_from)); // object identifer in constants
            } else {
                ERROR(Errors.Fail, 'type bWitness not match')
            }
        }

        this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, Guard.QUERIES[query_index][2])); // cmd
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
                if (!GuardMaker.match_u256(this.type_validator[this.type_validator.length - 1])) { ERROR(Errors.Fail, 'type_validator check') }
                if (!GuardMaker.match_u256(this.type_validator[this.type_validator.length - 2])) { ERROR(Errors.Fail, 'type_validator check')  }
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
            case OperatorType.TYPE_LOGIC_ALWAYS_TRUE:
                break;
            default:
                ERROR(Errors.InvalidParam, 'add_logic type invalid' + type) 
        }
        this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type)); // TYPE     
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

    combine(otherBuilt:GuardMaker, bAnd:boolean = true, bCombinConstant=false) : GuardMaker {
        if (!otherBuilt.IsReady() || !this.IsReady()) { ERROR(Errors.Fail, 'both should built yet')};
        let maker = new GuardMaker();
        this.constant.forEach((v, k) => {
            maker.constant.set(k,  {type:v.type, value:v.value, witness:v.witness});
        })
        otherBuilt.constant.forEach((v, k) => {
            if (maker.constant.has(k) && !bCombinConstant) {
                ERROR(Errors.Fail, 'constant identifier exist');
            }
            maker.constant.set(k, {type:v.type, value:v.value, witness:v.witness});
        })
        let op = bAnd ? OperatorType.TYPE_LOGIC_AND :  OperatorType.TYPE_LOGIC_OR;
        maker.data.push(concatenate(Uint8Array, ...this.data, ...otherBuilt.data, Bcs.getInstance().ser(ValueType.TYPE_U8, op)));
        this.data.splice(0, this.data.length-1);
        maker.type_validator = this.type_validator;
        return maker
    }

    get_constant() { return this.constant  }
    get_input() { return this.data }

    static input_combine(input1:Uint8Array, input2:Uint8Array, bAnd:boolean = true) : Uint8Array {
        let op = bAnd ? OperatorType.TYPE_LOGIC_AND :  OperatorType.TYPE_LOGIC_OR;
        return concatenate(Uint8Array, input1, input2, Bcs.getInstance().ser(ValueType.TYPE_U8, op)) as  Uint8Array;
    }
    static input_not(input:Uint8Array) : Uint8Array {
        return concatenate(Uint8Array, input, Bcs.getInstance().ser(ValueType.TYPE_U8, OperatorType.TYPE_LOGIC_NOT)) as Uint8Array;
    }

    static match_u256(type:number) : boolean {
        if (type == ValueType.TYPE_U8 || 
            type == ValueType.TYPE_U64 || 
            type == ValueType.TYPE_U128 ||
            type == ValueType.TYPE_U256) {
                return true;
        }
        return false;
    }
}




