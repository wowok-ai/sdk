import { BCS } from '@mysten/bcs';
import { Protocol, FnCallType, ValueType, RepositoryValueType, RepositoryAddress, PermissionObject, PassportObject, TxbObject} from './protocol';
import { PermissionIndexType, Permission } from './permission'
import { Bcs, array_unique, IsValidDesription, IsValidAddress, IsValidArray, OptionNone, IsValidName,  ValueTypeConvert} from './utils';
import { ERROR, Errors } from './exception';
import { Resource } from './resource';

export enum Repository_Policy_Mode {
    POLICY_MODE_FREE = 0,
    POLICY_MODE_STRICT = 1,
}

export interface RepData {
    id: string;
    name: string;
    dataType?: RepositoryValueType;
    data?: Uint8Array;
    object: string;
}

export type Repository_Policy = {
    key:string;
    description: string;
    data_type: RepositoryValueType;
    permission?: PermissionIndexType; // PermissionIndex like, must be geater than 10000
}
export type Repository_Policy_Data = {
    key: string;
    data: Repository_Value[];
    value_type?: ValueType;
}
export type Repository_Value = {
    address: string; // UID: address or objectid
    bcsBytes: Uint8Array;
}

export class Repository {
    protected permission ;
    protected object:TxbObject;
    protected protocol;

    get_object() { return this.object }
    private constructor(protocol:Protocol, permission:PermissionObject) {
        this.protocol = protocol;
        this.permission = permission;
        this.object = '';
    }
    static From(protocol:Protocol, permission:PermissionObject, object:TxbObject) : Repository {
        let r = new Repository(protocol, permission);
        r.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), object);
        return r
    }
    static New(protocol:Protocol, permission:PermissionObject, description:string, 
        policy_mode: Repository_Policy_Mode, passport?:PassportObject) : Repository {
        if (!Protocol.IsValidObjects([permission])) {
            ERROR(Errors.IsValidObjects, 'permission')
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }

        let r = new Repository(protocol, permission);
        let txb = protocol.CurrentSession();

        if (passport) {
            r.object = txb.moveCall({
                target:protocol.RepositoryFn('new_with_passport') as FnCallType,
                arguments:[passport, txb.pure(description), txb.pure(policy_mode, BCS.U8), Protocol.TXB_OBJECT(txb, permission)],
            })
        } else {
            r.object = txb.moveCall({
                target:protocol.RepositoryFn('new') as FnCallType,
                arguments:[txb.pure(description), txb.pure(policy_mode, BCS.U8), Protocol.TXB_OBJECT(txb, permission)],
            })
        }
        return r
    }

    launch() : RepositoryAddress {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target:this.protocol.RepositoryFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object)],
        })    
    }
    destroy()  {
        if (!Protocol.IsValidObjects([this.object])) return false;
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.RepositoryFn('destroy') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
        })   
    }

    add_data(data:Repository_Policy_Data)  {
        if (!Repository.IsValidName(data.key)) {
            ERROR(Errors.IsValidName)
        }

        let bValid = true;
        data.data.forEach((value) => {
            if (!IsValidAddress(value.address)) bValid = false;
            if (!Repository.IsValidValue(value.bcsBytes)) bValid = false; 
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam)
        }

        let txb = this.protocol.CurrentSession();
        if (data?.value_type) {
            data.data.forEach((d) => txb.moveCall({
                target:this.protocol.RepositoryFn('add') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), 
                    txb.pure(d.address, BCS.ADDRESS),
                    txb.pure(data.key), 
                    txb.pure(data.value_type, BCS.U8),
                    txb.pure([...d.bcsBytes], 'vector<u8>'),
                    Protocol.TXB_OBJECT(txb, this.permission),
                ],
            }))       
        } else {
            data.data.forEach((d) => txb.moveCall({
                target:this.protocol.RepositoryFn('add_typed_data') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), 
                    txb.pure(d.address, BCS.ADDRESS),
                    txb.pure(data.key), 
                    txb.pure([...d.bcsBytes], 'vector<u8>'),
                    Protocol.TXB_OBJECT(txb, this.permission),
                ],
            }))   
        }
    }

    remove(address:string, key:string)  {
        if (!Repository.IsValidName(key)) {
            ERROR(Errors.IsValidName)
        } 
        if (!IsValidAddress(address)) {
            ERROR(Errors.IsValidAddress)
        }

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.RepositoryFn('remove') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), 
                txb.pure(address, BCS.ADDRESS),
                txb.pure(key), 
                Protocol.TXB_OBJECT(txb, this.permission),
            ],
        })  
    }
    add_reference(references:string[], passport?:PassportObject) {
        if (references.length === 0)  return;
        if (!IsValidArray(references, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'add_reference')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.RepositoryFn('reference_add_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), 
                    txb.pure(array_unique(references), 'vector<address>'),
                    Protocol.TXB_OBJECT(txb, this.permission)]
            })      
        } else {
            txb.moveCall({
                target:this.protocol.RepositoryFn('reference_add') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), 
                    txb.pure(array_unique(references), 'vector<address>'),
                    Protocol.TXB_OBJECT(txb, this.permission)]
            })  
        }
    }
    remove_reference(references:string[], removeall?:boolean, passport?:PassportObject) {
        if (references.length === 0 && !removeall)  return

        if (!IsValidArray(references, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'remove_reference')
        }

        let txb = this.protocol.CurrentSession();
        if (removeall) {
            if (passport) {
                txb.moveCall({
                    target:this.protocol.RepositoryFn('reference_removeall_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), 
                        Protocol.TXB_OBJECT(txb, this.permission)]
                })      
            } else {
                txb.moveCall({
                    target:this.protocol.RepositoryFn('reference_removeall') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), 
                        Protocol.TXB_OBJECT(txb, this.permission)]
                })  
            }            
        } else {
            if (passport) {
                txb.moveCall({
                    target:this.protocol.RepositoryFn('reference_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), 
                        txb.pure(array_unique(references), 'vector<address>'),
                        Protocol.TXB_OBJECT(txb, this.permission)]
                })      
            } else {
                txb.moveCall({
                    target:this.protocol.RepositoryFn('reference_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), 
                        txb.pure(array_unique(references), 'vector<address>'),
                        Protocol.TXB_OBJECT(txb, this.permission)]
                })  
            }  
        }
    }
    // add or modify the old 
    add_policies(policies:Repository_Policy[], passport?:PassportObject)  {
        if (policies.length === 0) return;

        let bValid = true;
        policies.forEach((p) => {
            if (!IsValidDesription(p.description) || !Repository.IsValidName(p.key)) {
                bValid = false
            }
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'policies')
        }

        let txb = this.protocol.CurrentSession();
        policies.forEach((policy) => {
            let permission_index = policy?.permission ? txb.pure(Bcs.getInstance().ser(ValueType.TYPE_OPTION_U64, policy.permission)) : OptionNone(txb);
            if (passport) {
                txb.moveCall({
                    target:this.protocol.RepositoryFn('policy_add_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), 
                        txb.pure(policy.key), 
                        txb.pure(policy.description),
                        permission_index, txb.pure(policy.data_type, BCS.U8),
                        Protocol.TXB_OBJECT(txb, this.permission)]
                })              
            } else {
                txb.moveCall({
                    target:this.protocol.RepositoryFn('policy_add') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb, this.object), 
                        txb.pure(policy.key), 
                        txb.pure(policy.description),
                        permission_index, txb.pure(policy.data_type, BCS.U8),
                        Protocol.TXB_OBJECT(txb, this.permission)]
                })  
            }
        });    
    }

    remove_policies(policy_keys:string[], passport?:PassportObject)  {
        if (policy_keys.length === 0) return ;
        if (!IsValidArray(policy_keys, Repository.IsValidName)){
            ERROR(Errors.InvalidParam, 'policy_keys')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.RepositoryFn('policy_remove_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), 
                    txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, array_unique(policy_keys))), 
                    Protocol.TXB_OBJECT(txb, this.permission)]
            })                
        } else {
            txb.moveCall({
                target:this.protocol.RepositoryFn('policy_remove') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), 
                    txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, array_unique(policy_keys))), 
                    Protocol.TXB_OBJECT(txb, this.permission)]
            })                     
        }
    }
    rename_policy(policy_key:string, new_policy_key:string, passport?:PassportObject) {
        if (!IsValidName(policy_key) || !IsValidName(new_policy_key)) {
            ERROR(Errors.IsValidName, 'change_policy')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.RepositoryFn('policy_rename_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), 
                    txb.pure(policy_key, BCS.STRING), txb.pure(new_policy_key, BCS.STRING), 
                    Protocol.TXB_OBJECT(txb, this.permission)]
            })     
        } else {
            txb.moveCall({
                target:this.protocol.RepositoryFn('policy_rename') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), 
                    txb.pure(policy_key, BCS.STRING), txb.pure(new_policy_key, BCS.STRING), 
                    Protocol.TXB_OBJECT(txb, this.permission)]
            })       
        }
    }

    // PermissionIndex.description_set
    set_description(description:string, passport?:PassportObject)  {
        if (!IsValidDesription(description)){
            ERROR(Errors.IsValidDesription)
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.RepositoryFn('description_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(description), Protocol.TXB_OBJECT(txb, this.permission)]
            }) 
        } else {
            txb.moveCall({
                target:this.protocol.RepositoryFn('description_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(description), Protocol.TXB_OBJECT(txb, this.permission)]
            }) 
        }        
        
    }

    set_policy_mode(policy_mode:Repository_Policy_Mode, passport?:PassportObject)  {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.RepositoryFn('policy_mode_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(policy_mode), Protocol.TXB_OBJECT(txb, this.permission)]
            })  
        } else {
            txb.moveCall({
                target:this.protocol.RepositoryFn('policy_mode_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(policy_mode), Protocol.TXB_OBJECT(txb, this.permission)]
            })  
        }  
    }

    set_policy_description(policy:string, description:string, passport?:PassportObject)  {
        if (!Repository.IsValidName(policy)) {
            ERROR(Errors.IsValidName, 'policy')
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.RepositoryFn('policy_description_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(policy), txb.pure(description), 
                    Protocol.TXB_OBJECT(txb, this.permission)]
            })   
        } else {
            txb.moveCall({
                target:this.protocol.RepositoryFn('policy_description_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(policy), txb.pure(description), 
                    Protocol.TXB_OBJECT(txb, this.permission)]
            })   
        } 
    }

    set_policy_permission(policy:string, permission_index?:number, passport?:PassportObject)  {
        if (!Repository.IsValidName(policy)) {
            ERROR(Errors.IsValidName, 'policy')
        }

        let txb = this.protocol.CurrentSession();
        let index = OptionNone(txb);

        if (permission_index) {
            if(!Permission.IsValidPermissionIndex(permission_index)) {
                ERROR(Errors.IsValidPermissionIndex)
            }
            index = txb.pure(Bcs.getInstance().ser(ValueType.TYPE_OPTION_U64, permission_index));
        }

        if (passport) {
            txb.moveCall({
                target:this.protocol.RepositoryFn('policy_permission_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), index, Protocol.TXB_OBJECT(txb, this.permission)]
            })   
        } else {
            txb.moveCall({
                target:this.protocol.RepositoryFn('policy_permission_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), index, Protocol.TXB_OBJECT(txb, this.permission)]
            })   
        }     
    }

    change_permission(new_permission:PermissionObject) {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects)
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.RepositoryFn('permission_set') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission), Protocol.TXB_OBJECT(txb, new_permission)],
            typeArguments:[]            
        })  
        this.permission = new_permission  
    }

    static MAX_POLICY_COUNT = 200;
    static MAX_KEY_LENGTH = 128;
    static MAX_VALUE_LENGTH = 204800;
    static MAX_REFERENCE_COUNT = 100;
    static IsValidName = (key:string)  => {
        return key.length <= Repository.MAX_KEY_LENGTH && key.length != 0;
    }
    static IsValidValue = (value:Uint8Array)  => {
        return value.length < Repository.MAX_VALUE_LENGTH;
    }
    static parseObjectType = (chain_type:string) : string =>  {
        if (chain_type) {
            const s = 'repository::Repository<'
            const i = chain_type.indexOf(s);
            if (i > 0) {
                let r = chain_type.slice(i + s.length, chain_type.length-1);
                return r
            }
        }
        return '';
    }

    static rpc_de_data(fields:any) : RepData [] {
        const rep: RepData[] = fields?.map((v:any) => {
            const value = new Uint8Array((v?.data?.content?.fields as any)?.value);
            const type = value?.length > 0 ? value[0] as ValueType : null;
            var d : any = value.length > 0 ? value.slice(1) : Uint8Array.from([]);
            if (type === ValueType.TYPE_STRING) {
                d = Bcs.getInstance().de(ValueType.TYPE_VEC_U8, d);
                d = new TextDecoder().decode(Uint8Array.from(d));
            } else if (type === ValueType.TYPE_VEC_STRING) {
                d = Bcs.getInstance().de(ValueType.TYPE_VEC_VEC_U8, d) as [];
                d = d.map((i:any) => {
                    return new TextDecoder().decode(Uint8Array.from(i));
                })
            } else {
                d = Bcs.getInstance().de(value[0], d);
                if (type === ValueType.TYPE_ADDRESS) {
                    d = '0x' + d;
                } else if (type === ValueType.TYPE_VEC_ADDRESS) {
                    d = d.map((v:string) => { return ('0x' + v) } );
                }
            };
            return {object:v?.data?.content?.fields?.id?.id, id:(v?.data?.content?.fields as any)?.name?.fields?.id, 
                name:(v?.data?.content?.fields as any)?.name?.fields?.key, 
                data:d, dataType: ValueTypeConvert(type)
            }
        });
        return rep;
    }
}

