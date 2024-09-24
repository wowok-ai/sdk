import { type TransactionObjectInput, Inputs, Transaction as TransactionBlock} from '@mysten/sui/transactions';
import { SuiObjectResponse } from '@mysten/sui/client';
import { FnCallType, GuardObject, Protocol, ContextType, OperatorType, Data_Type,
    ValueType, SER_VALUE, IsValidOperatorType } from './protocol';
import { parse_object_type, array_unique, Bcs, ulebDecode, IsValidAddress, IsValidArray,  OPTION_NONE, readOption, readOptionString } from './utils';
import { ERROR, Errors } from './exception';
import { Guard } from './guard';

export type Guard_Query_Object = {
    target: FnCallType, // object fnCall
    object: TransactionObjectInput | string, // object 
    types: string[], // object type
    id: string, // object id
}

export interface QueryInfo {
    identifier?: number;
    index:  number;
    type: number;
    value_or_witness: string;
    future?: string;
    cmd?: number;
}
interface GuardInfo {
    id: string; // guard id
    object: TransactionObjectInput;
    query_list: (string | QueryInfo)[]; // object or witness object query
    constant: QueryInfo[]; // witness in constant & ValueType.TYPE_ADDRESS(for Query)
    input_witness: QueryInfo[]; // witness in input
}

export interface DeGuardConstant {
    type: number; // 
    value: any; //
    identifier?: number; // ID
}
export interface DeGuardData {
    type: number; // 
    value?: any; //
    identifier?: number; // ID
    cmd?: number; // 
    child: DeGuardData[];
    ret_type?: number;
}

export interface FutureFill {
    guard: string;
    index: number;
    witness: string;
    future?: string;
    cmd?: number;
    type?: string;
    identifier?: number;
}
export interface PassportQuery {
    guard: (string | TransactionObjectInput)[];
    query: Guard_Query_Object[];
    witness: Guard_Query_Object[];
}
export class GuardParser {
    protected guard_list: GuardInfo[] = [];
    protected guards: string[];
    private index:number = 0;
    private get_index() { return this.index++ }

    private constructor(guards: string[]) { 
        this.guards = guards;
    }
    guardlist = () => { return this.guard_list }

    static DeGuardObject_FromData = (guard_constants:any, guard_input_bytes:any) : {object:DeGuardData, constant:DeGuardConstant[]} => {
        let  constants : DeGuardConstant[] = [];
        guard_constants.forEach((c:any) => {
            let v = c?.fields ?? c; // graphql dosnot 'fields', but rpcall has.
            const data:Uint8Array = Uint8Array.from(v.value);
            const type = data.slice(0, 1)[0];
            var value : any = data.slice(1);
            switch (type) {
                case ContextType.TYPE_WITNESS_ID:
                case ValueType.TYPE_ADDRESS:
                    value = '0x' + Bcs.getInstance().de(ValueType.TYPE_ADDRESS, Uint8Array.from(value)).toString();
                    break;
                case ValueType.TYPE_BOOL:
                case ValueType.TYPE_U8:
                case ValueType.TYPE_U64:
                case ValueType.TYPE_U128:
                case ValueType.TYPE_U256:
                case ValueType.TYPE_VEC_U8:
                case ValueType.TYPE_VEC_U64:
                case ValueType.TYPE_VEC_U128:
                case ValueType.TYPE_VEC_ADDRESS:
                case ValueType.TYPE_VEC_BOOL:
                case ValueType.TYPE_VEC_VEC_U8:
                case ValueType.TYPE_OPTION_ADDRESS:
                case ValueType.TYPE_OPTION_BOOL: 
                case ValueType.TYPE_OPTION_U128:
                case ValueType.TYPE_OPTION_U8:
                case ValueType.TYPE_OPTION_U64:
                case ValueType.TYPE_OPTION_U256:
                case ValueType.TYPE_VEC_U256:
                case ValueType.TYPE_STRING:
                case ValueType.TYPE_OPTION_STRING:
                case ValueType.TYPE_OPTION_VEC_U8:
                case ValueType.TYPE_VEC_STRING:
                    let de  = SER_VALUE.find(s=>s.type==type);
                    if (!de) ERROR(Errors.Fail, 'GuardObject de error')
                    value = Bcs.getInstance().de(type as number, Uint8Array.from(value));
                    break;

                default:
                    ERROR(Errors.Fail, 'GuardObject constant type invalid:' +type)
            }
            constants.push({identifier:v.identifier, type:type,  value:value});
        });
        // console.log(constants)
        let bytes = Uint8Array.from(guard_input_bytes);
        let arr = [].slice.call(bytes.reverse());
        let data : DeGuardData[] = [];
        while (arr.length > 0) {
            let type : unknown = arr.shift() ;
            let value:any; let cmd:any; let identifier:any; 
            switch (type as Data_Type) { 
                case ContextType.TYPE_SIGNER:
                case ContextType.TYPE_CLOCK:
                case OperatorType.TYPE_LOGIC_AS_U256_GREATER:
                case OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL:
                case OperatorType.TYPE_LOGIC_AS_U256_LESSER:
                case OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL:
                case OperatorType.TYPE_LOGIC_AS_U256_EQUAL:
                case OperatorType.TYPE_LOGIC_EQUAL:
                case OperatorType.TYPE_LOGIC_HAS_SUBSTRING:
                case OperatorType.TYPE_LOGIC_ALWAYS_TRUE:
                case OperatorType.TYPE_LOGIC_NOT:
                case OperatorType.TYPE_NUMBER_ADD:
                case OperatorType.TYPE_NUMBER_DEVIDE:
                case OperatorType.TYPE_NUMBER_MOD:
                case OperatorType.TYPE_NUMBER_MULTIPLY:
                case OperatorType.TYPE_NUMBER_SUBTRACT:
                    break;    
                case OperatorType.TYPE_LOGIC_AND: //@ with logics count
                case OperatorType.TYPE_LOGIC_OR:
                    value = arr.shift()! as number; 
                    break;
                case ContextType.TYPE_CONSTANT:
                    identifier = arr.shift()! as number;  // identifier
                    break;
                case ContextType.TYPE_WITNESS_ID:  // add to constant 
                case ValueType.TYPE_ADDRESS: 
                    value = '0x' + Bcs.getInstance().de(ValueType.TYPE_ADDRESS, Uint8Array.from(arr)).toString();
                    arr.splice(0, 32); // address     
                    break;
                case ValueType.TYPE_BOOL:
                case ValueType.TYPE_U8:
                    value = Bcs.getInstance().de(type as ValueType, Uint8Array.from(arr)) as number;
                    arr.shift();
                    break;
                case ValueType.TYPE_U64: 
                    value = Bcs.getInstance().de(type as ValueType, Uint8Array.from(arr)) as number;
                    arr.splice(0, 8);
                    break;
                case ValueType.TYPE_U128: 
                    value = Bcs.getInstance().de(type as ValueType, Uint8Array.from(arr)) as bigint;
                    arr.splice(0, 16);
                    break;
                case ValueType.TYPE_U256:
                    value = Bcs.getInstance().de(type as ValueType, Uint8Array.from(arr)) as bigint;
                    arr.splice(0, 32);
                    break;
                case ValueType.TYPE_VEC_U8:
                case ValueType.TYPE_VEC_BOOL:
                case ValueType.TYPE_STRING:
                    let r = ulebDecode(Uint8Array.from(arr));
                    value = Bcs.getInstance().de(type as ValueType, Uint8Array.from(arr));
                    arr.splice(0, r.value+r.length);
                    break;  
                case ValueType.TYPE_VEC_ADDRESS:
                    r = ulebDecode(Uint8Array.from(arr));
                    value = Bcs.getInstance().de(type as ValueType, Uint8Array.from(arr));
                    arr.splice(0, r.value*32+r.length);
                    break;  
                case ValueType.TYPE_VEC_U128:
                    r = ulebDecode(Uint8Array.from(arr));
                    value = Bcs.getInstance().de(type as ValueType, Uint8Array.from(arr));
                    arr.splice(0, r.value*16+r.length);
                    break;  
                case ValueType.TYPE_VEC_U256:
                    r = ulebDecode(Uint8Array.from(arr));
                    value = Bcs.getInstance().de(type as ValueType, Uint8Array.from(arr));
                    arr.splice(0, r.value*32+r.length);
                    break;  
                case ValueType.TYPE_VEC_U64:
                    r = ulebDecode(Uint8Array.from(arr));
                    value = Bcs.getInstance().de(type as ValueType, Uint8Array.from(arr));
                    arr.splice(0, r.value*8+r.length);
                    break;              
                case ValueType.TYPE_VEC_VEC_U8:
                case ValueType.TYPE_VEC_STRING:
                    r = ulebDecode(Uint8Array.from(arr)); arr.splice(0, r.length);
                    let res = [];
                    for (let i = 0; i < r.value; i++) {
                        let r2 = ulebDecode(Uint8Array.from(arr)); 
                        res.push(Bcs.getInstance().de(ValueType.TYPE_VEC_U8, Uint8Array.from(arr)));
                        arr.splice(0, r2.length+r2.value);
                    }
                    value = res;
                    break;     
                case OperatorType.TYPE_QUERY:
                    let t = arr.splice(0, 1); // data-type
                    if (t[0] == ValueType.TYPE_ADDRESS || t[0] == ContextType.TYPE_WITNESS_ID) {
                        let addr = '0x' + Bcs.getInstance().de(ValueType.TYPE_ADDRESS, Uint8Array.from(arr)).toString();
                        arr.splice(0, 32); // address            
                        value = addr;
                        cmd = arr.shift()! as number; // cmd
                    } else if (t[0] == ContextType.TYPE_CONSTANT) {
                        let id = arr.splice(0, 1); // key
                        let v = constants.find((v) => 
                            (v.identifier == id[0]) && 
                            ((v.type == ValueType.TYPE_ADDRESS) || (v.type == ContextType.TYPE_WITNESS_ID)));
                        if (!v) { ERROR(Errors.Fail, 'GuardObject: indentifier not in  constant')}
                        identifier = id[0];
                        cmd = arr.shift()! as number; // cmd
                    } else {
                        ERROR(Errors.Fail, 'GuardObject: constant type invalid');
                    }
                    break;
                case ValueType.TYPE_OPTION_ADDRESS:
                    let read = readOption(arr, ValueType.TYPE_ADDRESS);
                    value = read.value;
                    if (!read.bNone) arr.splice(0, 32);
                    break;
                case ValueType.TYPE_OPTION_BOOL:
                    read = readOption(arr, ValueType.TYPE_BOOL);
                    value = read.value;
                    if (!read.bNone) arr.splice(0, 1);
                    break;
                case ValueType.TYPE_OPTION_U8:
                    read = readOption(arr, ValueType.TYPE_U8);
                    value = read.value;
                    if (!read.bNone) arr.splice(0, 1);
                    break;
                case ValueType.TYPE_OPTION_U128:
                    read = readOption(arr, ValueType.TYPE_U128);
                    value = read.value;
                    if (!read.bNone) arr.splice(0, 16);
                    break;
                case ValueType.TYPE_OPTION_U256:
                    read = readOption(arr, ValueType.TYPE_U256);
                    value = read.value;
                    if (!read.bNone) arr.splice(0, 32);
                    break;
                case ValueType.TYPE_OPTION_U64:
                    read = readOption(arr, ValueType.TYPE_U64);
                    value = read.value;
                    if (!read.bNone) arr.splice(0, 8);
                    break;
                case ValueType.TYPE_OPTION_STRING:
                    read = readOptionString(arr); // splice in it
                    value = read.value;
                    break;
                default:
                    ERROR(Errors.Fail, 'GuardObject: parse_bcs types')
            }
            data.push({type:type as number, value:value, cmd:cmd, identifier:identifier, child:[]});
        } 

        // console.log(data);
        if (!data || data.length == 0) ERROR(Errors.Fail, 'GuardObject: data parsed error');
        let stack: DeGuardData[] = [];
        data.forEach((d) => {
            this.ResolveData(constants, stack, d);
        })

        if (stack.length != 1) {
            ERROR(Errors.Fail, 'GuardObject: parse error');
        }
    
        return {object:stack.pop()!, constant:constants};
    }
    /// convert guard-on-chain to js object
    static DeGuardObject = async (protocol: Protocol, guard: string) : Promise<{object:DeGuardData, constant:DeGuardConstant[]}> => {
        if (!IsValidAddress(guard)) {
            ERROR(Errors.IsValidAddress,  'GuardObject guard')
        }

        let res = await protocol.Query_Raw([guard]);
        if (res.length == 0 || !res[0].data || res[0].data?.objectId != guard) {
            ERROR(Errors.Fail, 'GuardObject query error');
        }

        // console.log(res[0].data?.content);
        let content = res[0].data!.content as any;
        if (content?.type != protocol.Package() + '::guard::Guard') {
            ERROR(Errors.Fail, 'GuardObject object invalid')
        }

        return GuardParser.DeGuardObject_FromData(content.fields.constants, content.fields.input.fields.bytes);
    }

    static ResolveData = (constants:  DeGuardConstant[], stack:DeGuardData[], current: DeGuardData) => {
        switch (current.type) {
            case OperatorType.TYPE_LOGIC_ALWAYS_TRUE:
                current.ret_type = ValueType.TYPE_BOOL;
                stack.push(current);
                return;
            case OperatorType.TYPE_LOGIC_NOT:
                current.ret_type = ValueType.TYPE_BOOL;
                if (stack.length < 1) ERROR(Errors.Fail, 'ResolveData: TYPE_LOGIC_NOT');

                let param = stack.pop() as DeGuardData;
                if (!param.ret_type || param.ret_type !=  ValueType.TYPE_BOOL) {
                    ERROR(Errors.Fail, 'ResolveData: TYPE_LOGIC_NOT type invalid');
                }

                current.child.push(param);
                stack.push(current);
                return;
            case OperatorType.TYPE_LOGIC_AS_U256_GREATER:
            case OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL:
            case OperatorType.TYPE_LOGIC_AS_U256_LESSER:
            case OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL:
            case OperatorType.TYPE_LOGIC_AS_U256_EQUAL:
            case OperatorType.TYPE_NUMBER_ADD:
            case OperatorType.TYPE_NUMBER_DEVIDE:
            case OperatorType.TYPE_NUMBER_MOD:
            case OperatorType.TYPE_NUMBER_MULTIPLY:
            case OperatorType.TYPE_NUMBER_SUBTRACT:
                if (current.type === OperatorType.TYPE_LOGIC_AS_U256_GREATER || current.type === OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL ||
                    current.type === OperatorType.TYPE_LOGIC_AS_U256_LESSER || current.type === OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL ||
                    current.type === OperatorType.TYPE_LOGIC_AS_U256_EQUAL) {
                        current.ret_type = ValueType.TYPE_BOOL;
                } else {
                    current.ret_type = ValueType.TYPE_U256;
                }
                
                if (stack.length < 2) ERROR(Errors.Fail, 'ResolveData: ' + current.type);
                for (let i = 0; i < 2; ++i) {
                    let p = stack.pop() as DeGuardData;
                    if (!p.ret_type) ERROR(Errors.Fail, 'ResolveData: ' + current.type + ' INVALID param type');
                    if (p.ret_type != ValueType.TYPE_U8  && p.ret_type != ValueType.TYPE_U64 &&
                        p.ret_type != ValueType.TYPE_U128 && p.ret_type != ValueType.TYPE_U256) {
                            ERROR(Errors.Fail, 'ResolveData: ' + current.type + ' INVALID param type');
                    };
                    current.child.push(p);
                }
                stack.push(current);
                return;
            case OperatorType.TYPE_LOGIC_EQUAL:
                current.ret_type = ValueType.TYPE_BOOL;
                if (stack.length < 2) ERROR(Errors.Fail, 'ResolveData: ' + current.type);
                var p1 = stack.pop() as DeGuardData; var p2 = stack.pop() as DeGuardData;
                //console.log(p1); console.log(p2)
                if (!p1.ret_type || !p2.ret_type) ERROR(Errors.Fail, 'ResolveData: ' + current.type + ' INVALID param type');
                if (p1.ret_type != p2.ret_type) ERROR(Errors.Fail, 'ResolveData: ' + current.type + ' param type not match');

                current.child.push(p1);
                current.child.push(p2);
                stack.push(current);
                return;
            case OperatorType.TYPE_LOGIC_HAS_SUBSTRING:
                current.ret_type = ValueType.TYPE_BOOL;
                if (stack.length < 2) ERROR(Errors.Fail, 'ResolveData: ' + current.type);
                var p1 = stack.pop() as DeGuardData; var p2 = stack.pop() as DeGuardData;
                if (!p1.ret_type || !p2.ret_type) ERROR(Errors.Fail, 'ResolveData: ' + current.type + ' INVALID param type');
                if (p1.ret_type != ValueType.TYPE_STRING || p2.ret_type != ValueType.TYPE_STRING) {
                    ERROR(Errors.Fail, 'ResolveData: ' + current.type + ' param type not match');
                }

                current.child.push(p1);
                current.child.push(p2);
                stack.push(current);
                return
            case OperatorType.TYPE_LOGIC_AND:
            case OperatorType.TYPE_LOGIC_OR:
                current.ret_type = ValueType.TYPE_BOOL;
                if (stack.length < current.value || current.value < 2) ERROR(Errors.Fail, 'ResolveData: ' + current.type);
                for (let i = 0; i < current.value; ++i) {
                    var p = stack.pop() as DeGuardData;
                    if (!p.ret_type || (p.ret_type != ValueType.TYPE_BOOL))  ERROR(Errors.Fail, 'ResolveData: ' + current.type + ' INVALID param type');
                    current.child.push(p);
                }
                stack.push(current);
                return
            case OperatorType.TYPE_QUERY:
                if (!current?.cmd)  ERROR(Errors.Fail, 'OperateParamCount: cmd invalid ' + current.type);
                let r = Guard.GetCmd(current.cmd!);
                if (!r) ERROR(Errors.Fail, 'OperateParamCount: cmd not supported ' + current.type);
                current.ret_type = r[4];

                if (stack.length < r[3].length) ERROR(Errors.Fail, 'OperateParamCount: cmd param lost ' + current.type);
                r[3].forEach((e:number) => {
                    let d = stack.pop() as DeGuardData;
                    if (!d?.ret_type || d.ret_type != e) {
                        ERROR(Errors.Fail, 'OperateParamCount: cmd param not match ' + current.type);
                    }
                    current.child.push(d)
                });
               
                stack.push(current);
                return
            case ValueType.TYPE_ADDRESS:
            case ValueType.TYPE_BOOL:
            case ValueType.TYPE_U128:
            case ValueType.TYPE_U256:
            case ValueType.TYPE_U64:
            case ValueType.TYPE_U8:
            case ValueType.TYPE_VEC_ADDRESS:
            case ValueType.TYPE_VEC_BOOL:
            case ValueType.TYPE_VEC_U128:
            case ValueType.TYPE_VEC_U256:
            case ValueType.TYPE_VEC_U64:
            case ValueType.TYPE_VEC_U8:
            case ValueType.TYPE_VEC_VEC_U8:
            case ValueType.TYPE_OPTION_ADDRESS:
            case ValueType.TYPE_OPTION_BOOL:
            case ValueType.TYPE_OPTION_U128:
            case ValueType.TYPE_OPTION_U256:
            case ValueType.TYPE_OPTION_U64:
            case ValueType.TYPE_OPTION_U8:
            case ValueType.TYPE_STRING:
                current.ret_type = current.type;
                stack.push(current);
                return;
            case ContextType.TYPE_CLOCK:
                current.ret_type = ValueType.TYPE_U64;
                stack.push(current);
                return;
            case ContextType.TYPE_SIGNER:
            case ContextType.TYPE_WITNESS_ID: /// notice!! convert witness type to address type
                current.ret_type = ValueType.TYPE_ADDRESS;
                stack.push(current);
                return;
            case ContextType.TYPE_CONSTANT:
                let  v = constants.find((e) => e.identifier ==  current?.identifier);
                if (!v) ERROR(Errors.Fail, 'OperateParamCount: identifier  invalid ' + current.type);
                
                current.ret_type = v?.type;
                if (v?.type == ContextType.TYPE_WITNESS_ID) {
                    current.ret_type = ValueType.TYPE_ADDRESS;
                }
                
                stack.push(current);
                return;
                
        }   
        ERROR(Errors.Fail, 'OperateParamCount: type  invalid ' + current.type);
    }

 /*   
    static CreateAsync = async (protocol: Protocol, guards: string[]) => {
        if (!IsValidArray(guards, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'guards');
        }

        let guard_list = array_unique(guards);
        const me = new GuardParser(protocol, guards);
        
        let res =  await protocol.Query_Raw(guard_list);
        console.log(res)
        res.forEach((r) => {
            let c = r.data?.content as any;
            if (!c) return;

            let index = protocol.WOWOK_OBJECTS_TYPE().findIndex(v => {return v.includes('guard::Guard') && v == c.type});
            if (index == -1) return;

            let info:GuardInfo = {id: c.fields.id.id, query_list:[],  constant:[], input_witness:[]};
            me.parse_constant(info,  c.fields.constants);
            if (c.fields.input.type == (protocol.Package() + '::bcs::BCS')) {
                me.parse_bcs(info,  Uint8Array.from(c.fields.input.fields.bytes));
            }
            me.guard_list.push(info);
        })
        return me
    }
*/
    private static  Parse_Guard_Helper(guards: string[], res:SuiObjectResponse[]) {
        const protocol = Protocol.Instance();
        const me = new GuardParser(guards);
        res.forEach((r) => {
            let c = r.data?.content as any;
            if (!c) return;

            let index = protocol.WOWOK_OBJECTS_TYPE().findIndex(v => {return v.includes('guard::Guard') && v == c.type});
            if (index == -1) return;

            let info:GuardInfo = {id: c.fields.id.id, query_list:[],  constant:[], input_witness:[], object:Inputs.ObjectRef(
                {objectId:c.fields.id.id, digest:r.data?.digest??'', version:r.data?.version ?? ''}
            )};
            me.parse_constant(info,  c.fields.constants); // MUST first
            if (c.fields.input.type === (protocol.Package() + '::bcs::BCS')) {
                me.parse_bcs(info,  Uint8Array.from(c.fields.input.fields.bytes)); // second
            }
            me.guard_list.push(info);
        })
        return me
    }

    static Create = async (guards: string[], onGuardInfo?:(parser:GuardParser|undefined)=>void) => {
        if (!IsValidArray(guards, IsValidAddress)) {
            if (onGuardInfo) onGuardInfo(undefined);
            return undefined;
        }

        let guard_list = array_unique(guards);
        const protocol = Protocol.Instance();

        if (onGuardInfo) {
            protocol.Query_Raw(guard_list)
                .then((res) => { 
                    onGuardInfo(GuardParser.Parse_Guard_Helper(guards, res)); 
                }).catch((e) => { 
                    console.log(e);
                    onGuardInfo(undefined); 
                })            
        } else {
            const res = await protocol.Query_Raw(guard_list);
            return GuardParser.Parse_Guard_Helper(guards, res);
        }
    }

    future_fills = () : FutureFill[] => {
        const ret : FutureFill[] = [];
        this.guard_list.forEach((g) => {
            g.query_list.forEach((v) => {
                if (typeof(v) !== 'string') {
                    ret.push({guard:g.id, index:v.index, witness:v.value_or_witness, cmd:v.cmd, identifier:v?.identifier});
                }
            })
            // cmd already in query_list, so filter it out.
            g.constant.filter((v)=>v.type === ContextType.TYPE_WITNESS_ID && v.cmd === undefined).forEach((v) => {
                ret.push({guard:g.id, index:v.index, witness:v.value_or_witness, identifier:v?.identifier});
            })
            g.input_witness.forEach((v) => {
                ret.push({guard:g.id, index:v.index, witness:v.value_or_witness, identifier:v?.identifier});
            })
        }); return ret;
    }

    parse_constant = (info:GuardInfo, constants:any)  => {
        constants.forEach((v:any) => {
            if (v.type == (Protocol.Instance().Package() + '::guard::Constant')) {
                // ValueType.TYPE_ADDRESS: Query_Cmd maybe used the address, so save it for querying
                const data = Uint8Array.from(v.fields.value);
                const type = data.slice(0, 1)[0];
                const value = data.slice(1);
                if (type == ContextType.TYPE_WITNESS_ID || type == ValueType.TYPE_ADDRESS) {
                    info.constant.push({identifier:v.fields.identifier,  index:this.get_index(), type:type,
                        value_or_witness:'0x' + Bcs.getInstance().de(ValueType.TYPE_ADDRESS, Uint8Array.from(value))});
                }
            }
        });
        //console.log(info.constant)
    }

    parse_bcs = (info:GuardInfo, chain_bytes: Uint8Array) => {
        var arr = [].slice.call(chain_bytes.reverse());
        while (arr.length > 0) {
            var type : unknown = arr.shift() ;
            // console.log(type);
            switch (type as Data_Type) { 
                case ContextType.TYPE_SIGNER:
                case ContextType.TYPE_CLOCK:
                case OperatorType.TYPE_LOGIC_AS_U256_GREATER:
                case OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL:
                case OperatorType.TYPE_LOGIC_AS_U256_LESSER:
                case OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL:
                case OperatorType.TYPE_LOGIC_AS_U256_EQUAL:
                case OperatorType.TYPE_LOGIC_EQUAL:
                case OperatorType.TYPE_LOGIC_HAS_SUBSTRING:
                case OperatorType.TYPE_LOGIC_ALWAYS_TRUE:
                case OperatorType.TYPE_LOGIC_NOT:
                case OperatorType.TYPE_NUMBER_ADD:
                case OperatorType.TYPE_NUMBER_DEVIDE:
                case OperatorType.TYPE_NUMBER_MOD:
                case OperatorType.TYPE_NUMBER_MULTIPLY:
                case OperatorType.TYPE_NUMBER_SUBTRACT:
                break;    
            case OperatorType.TYPE_LOGIC_AND: //@ logics count
            case OperatorType.TYPE_LOGIC_OR:
                arr.splice(0, 1); // identifier of constant
                break;      
            case ContextType.TYPE_CONSTANT:
                arr.splice(0, 1); // identifier of constant
                break;
            case ContextType.TYPE_WITNESS_ID:  // add to constant 
                let addr = '0x' + Bcs.getInstance().de(ValueType.TYPE_ADDRESS, Uint8Array.from(arr)).toString();
                arr.splice(0, 32); // address     
                info.input_witness.push({index:this.get_index(), type:ContextType.TYPE_WITNESS_ID, value_or_witness:addr})
                break;
            case ValueType.TYPE_BOOL:
            case ValueType.TYPE_U8:
                arr.splice(0, 1); // identifier
                break;
            case ValueType.TYPE_ADDRESS: 
                arr.splice(0, 32);
                break;
            case ValueType.TYPE_U64: 
                arr.splice(0, 8);
                break;
            case ValueType.TYPE_U128: 
                arr.splice(0, 16);
                break;
            case ValueType.TYPE_U256:
                arr.splice(0, 32);
                break;
            case ValueType.TYPE_VEC_U8:
                let {value, length} = ulebDecode(Uint8Array.from(arr));
                arr.splice(0, value+length);
                break;     
            case OperatorType.TYPE_QUERY:
                let type = arr.splice(0, 1);
                if (type[0] == ValueType.TYPE_ADDRESS || type[0] == ContextType.TYPE_WITNESS_ID) {
                    let addr = '0x' + Bcs.getInstance().de(ValueType.TYPE_ADDRESS, Uint8Array.from(arr)).toString();
                    const offset = arr.splice(0, 33); // address + cmd              
                    if (type[0] == ValueType.TYPE_ADDRESS) {
                        info.query_list.push(addr);
                    } else if (type[0] == ContextType.TYPE_WITNESS_ID){
                        info.query_list.push({index:this.get_index(), type:type[0], value_or_witness:addr, cmd:offset[offset.length-1]});
                    }
                } else if (type[0] == ContextType.TYPE_CONSTANT) {
                    const identifer = arr.splice(0, 2); // key + cmd
                    let constant = info.constant.find((v) => 
                        (v.identifier == identifer[0]) && 
                        ((v.type == ValueType.TYPE_ADDRESS) || (v.type == ContextType.TYPE_WITNESS_ID)));
                    if (!constant) { ERROR(Errors.Fail, 'indentifier not in  constant')}
                    if (constant?.type == ValueType.TYPE_ADDRESS) {
                        info.query_list.push(constant.value_or_witness);
                    } else if (constant?.type == ContextType.TYPE_WITNESS_ID) {
                        const index = this.get_index();
                        info.query_list.push({identifier:identifer[0], type:constant.type, value_or_witness:constant.value_or_witness, 
                            index:index, cmd:identifer[identifer.length-1]}); // query witness in constant
                        constant.cmd = identifer[identifer.length-1]; // mark this is a cmd in querylist(avoid multi input future by singer)
                        constant.index = index;
                    } 
                } else {
                    ERROR(Errors.Fail, 'constant type invalid');
                }

                break;
            default:
                ERROR(Errors.Fail, 'parse_bcs types')
            }
        } 
    }

    private get_object(guardid:string, info:QueryInfo, fill?:FutureFill[]) :  string  {
        let r = fill?.find(i => guardid == i.guard && i.index == info.index);
        if (!r || !r.future) {
            if (!info.future) {
                ERROR(Errors.InvalidParam, 'index invalid for fill') 
            }
        } else {
            info.future = r!.future;
        }
        return info.future!
    }

    done = async (fill?:FutureFill[], onPassportQueryReady?:(passport:PassportQuery | undefined)=>void) : Promise<PassportQuery | undefined>=> {
        let objects: string[] = [];
        this.guard_list.forEach((g) => {
            // futures in constant table (all witness)
            g.constant.filter(v => v.type == ContextType.TYPE_WITNESS_ID /*&& v.cmd === undefined*/).forEach((q) => {
                objects.push(this.get_object(g.id, q, fill));
            })
            // objects to query
            let list = g.query_list.map((q) => {
                if (typeof(q) === "string") {
                    objects.push(q)
                    return q
                } else {
                    let r = this.get_object(g.id, q, fill);
                    objects.push(r);
                    return r
                }
            })
            g.query_list =  list; // all to string to query
            g.input_witness.forEach((q) => {
                objects.push(this.get_object(g.id, q, fill));
            })
        })
        if (onPassportQueryReady) {
            Protocol.Instance().Query_Raw(array_unique(objects), {showType:true}).then((res) => {
                onPassportQueryReady(this.done_helper(res));
            }).catch(e => {
                console.log(e);
                onPassportQueryReady(undefined);
            })
            return undefined;
        } else {
            const res = await Protocol.Instance().Query_Raw(array_unique(objects), {showType:true});
            return this.done_helper(res);
        }
    }

    private done_helper(res:SuiObjectResponse[]) {
        let query: Guard_Query_Object[] = [];
        let witness: Guard_Query_Object[] = [];
        let guards: TransactionObjectInput[] = [];
        this.guard_list.forEach(g => {
            g.query_list.forEach(q => { // query list
                let r = res.find(r => r.data?.objectId == q as string);  
                if (!r)   { ERROR(Errors.Fail, 'query object not match')} 
                let object = this.object_query(r!.data); // build passport query objects
                if (!object) { ERROR(Errors.Fail, 'query object fail')} 
                query.push(object!);
            })
            res.forEach(q => { // witness(address & query) list
                let r1 = g.constant.find(v  => v.future === q.data?.objectId);
                let r2 = g.input_witness.find(v  => v.future === q.data?.objectId)
                // not match r1 || r2 means query-cmd, not witness-cmd
                if (r1 || r2) {
                    let object = this.object_query(q.data, 'witness'); // witness address onchain check
                    if (!object)  { ERROR(Errors.Fail, 'witness object fail') }
                    witness.push(object!);
                }
            })
            guards.push(g.object);
        })

        return {guard:guards, query:query,  witness:witness} as PassportQuery;
    }

    // create onchain query for objects : object, movecall-types, id
    private object_query = (data: any, method:'guard_query'|'witness'='guard_query') : Guard_Query_Object | undefined=> {
        for (let k = 0; k < Protocol.Instance().WOWOK_OBJECTS_TYPE().length; k++) {
            if (data.type.includes(Protocol.Instance().WOWOK_OBJECTS_TYPE()[k]) ) { // type: pack::m::Object<...>
                return  { target:Protocol.Instance().WOWOK_OBJECTS_PREFIX_TYPE()[k] + method as FnCallType,
                    object:Inputs.SharedObjectRef({
                        objectId: data.objectId,
                        mutable: false,
                        initialSharedVersion: data.version,
                    }) as TransactionObjectInput,
                    types:parse_object_type(data.type as string),
                    id: data.objectId,
                } as Guard_Query_Object;
            }
        }
    }
}

export class Passport {
    static MAX_GUARD_COUNT = 8;
    protected passport;
    protected txb;

    get_object () { return this.passport }
    // return passport object used
    // bObject(true) in cmd env; (false) in service env
    constructor (txb:TransactionBlock, query:PassportQuery, bObject:boolean=false)  {
        if (!query.guard || query.guard.length > Passport.MAX_GUARD_COUNT)   {
            ERROR(Errors.InvalidParam, 'guards' )
        }

        this.txb = txb;
        this.passport = this.txb.moveCall({
            target:Protocol.Instance().PassportFn('new') as FnCallType,
            arguments: []
        });

        // add others guards, if any
        query.guard.forEach((g) => {
            this.txb.moveCall({
                target:Protocol.Instance().PassportFn('guard_add') as FnCallType,
                arguments:[this.passport, this.txb.object(g)]
            });        
        })

        // witness
        query?.witness.forEach((w) => {
            this.txb.moveCall({
                target: w.target as FnCallType,
                arguments: [this.passport, this.txb.object(w.object)],
                typeArguments: w.types,
            })
        })

        const clock = this.txb.sharedObjectRef(Protocol.CLOCK_OBJECT);
        // rules: 'verify' & 'query' in turns; 'verify' at final end.
        query?.query.forEach((q) => {
            this.txb.moveCall({
                target: Protocol.Instance().PassportFn('passport_verify') as FnCallType,
                arguments: [ this.passport, this.txb.object(clock)]
            }); 
            this.txb.moveCall({
                target: q.target as FnCallType,
                arguments: [ bObject ? this.txb.object(q.object) : this.txb.object(q.id), this.passport],
                typeArguments: q.types,
            })
        })
        this.txb.moveCall({
            target: Protocol.Instance().PassportFn('passport_verify') as FnCallType,
            arguments: [ this.passport,  this.txb.object(clock) ]
        });  
    }
    
    destroy() {
        this.txb.moveCall({
            target: Protocol.Instance().PassportFn('destroy') as FnCallType,
            arguments: [ this.passport ]
        });  
    }

    freeze() {
        this.txb.moveCall({
            target: Protocol.Instance().PassportFn('freezen') as FnCallType,
            arguments: [ this.passport ]
        });  
    }

    query_result(sender:string, handleResult:OnQueryPassportResult) {
        this.txb.moveCall({
            target: Protocol.Instance().PassportFn('query_result') as FnCallType,
            arguments: [ this.passport ]
        });  

        Protocol.Client().devInspectTransactionBlock({sender:sender, transactionBlock:this.txb}).then((res) => {
            const r = Passport.ResolveQueryRes(this.txb, res);
            if (r) handleResult(r);
        }).catch(e=>{
            console.log(e);
        })
    }

    query_result_async = async (sender:string) : Promise<QueryPassportResult | undefined> => {
        this.txb.moveCall({
            target: Protocol.Instance().PassportFn('query_result') as FnCallType,
            arguments: [ this.passport ]
        });  

        const res = await Protocol.Client().devInspectTransactionBlock({sender:sender, transactionBlock:this.txb});
        return Passport.ResolveQueryRes(this.txb, res);
    }

    private static  ResolveQueryRes(txb:TransactionBlock, res:any) : QueryPassportResult | undefined {
        for (let i = 0; i < res.results?.length; ++ i) {
            const v = res.results[i];
            if (v?.returnValues && v.returnValues.length === 2 && 
                v.returnValues[0][1] === 'bool' && v.returnValues[1][1] === 'vector<address>') { // (bool, vector<address>)
                const result = Bcs.getInstance().de('bool', Uint8Array.from(v.returnValues[0][0]));
                const guards = Bcs.getInstance().de('vector<address>', Uint8Array.from(v.returnValues[1][0])).map((v:string)=>'0x'+v);
                return {txb:txb, result:result, guards:guards}
            }
        }
        return undefined
    }
}

export interface QueryPassportResult {
    txb: TransactionBlock;
    result: boolean;
    guards: string[];
}

export type OnQueryPassportResult = (result:QueryPassportResult) => void;


