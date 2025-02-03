/**
 * Provide a query interface for AI
 * 
 */

import { Protocol } from '../protocol';
import { Treasury_WithdrawMode, Treasury_Operation } from '../treasury';
import { Repository_Type, Repository_Policy_Mode, Repository_Policy } from '../repository';
import { Service_Discount_Type, Service_Sale } from '../service';
import { Machine_Node, Machine } from '../machine';
import { Progress, History } from '../progress';
import { ERROR, Errors } from '../exception';
import { IsValidAddress, Bcs } from '../utils';
export interface ObjectBase {
    object: string;
    type?: string | 'Demand' | 'Progress' | 'Service' | 'Machine' | 'Order' | 'Treasury' | 'Arbitration' | 'Arb' | 'Payment' | 'Guard' |
        'Entity' | 'Permission' | 'Resource' | 'Repository' | 'TableItem_ProgressHistory' | 'TableItem_PermissionEntity' | 
        'TableItem_DemandPresenter' | 'TableItem_MachineNode' | 'TableItem_ServiceSale' | 'TableItem_TreasuryHistory' | 'TableItem_ArbVote' |
        'TableItem_RepositoryData' | 'TableItem_ResourceMark';
    type_raw?: string;
    owner?: any;
    version?: string;
}
export interface ObjectPermission extends ObjectBase {
    builder: string;
    admin: string[];
    description: string;
    entity_count: number;
    biz_permission: {id:number; name:string}[];
}

export interface TableItem_PermissionEntity extends ObjectBase {
    entity: string;
    permission: {id:number; guard?:string|null}[];
}

export interface ObjectDemand extends ObjectBase {
    permission: string;
    guard?: {object:string; service_id_in_guard?:number|null} | null;
    description: string;
    time_expire: string;
    yes?: string | null;
    presenter_count: number;
    bounty: {object:string; balance:string; type:string}[];
}

export interface TableItem_DemandPresenter extends ObjectBase {
    service: string;
    presenter: string;
    recommendation: string;
}

export interface ObjectMachine extends ObjectBase {
    permission: string;
    bPaused: boolean;
    bPublished: boolean;
    consensus_repository: string[];
    description: string;
    endpoint?: string | null;
    node_count: number;
}

export interface TableItem_MachineNode extends ObjectBase {
    node: Machine_Node;
}

export interface ObjectProgressHolder {
    forward_name: string;
    holder?: string | null;
    orders: string[];
    msg: string;
    accomplished: boolean;
    time: string;
}

export interface ObjectProgressSession {
    forward: ObjectProgressHolder[];
    weights: number;
    threshold: number;
    next_node: string;
}

export interface ObjectProgress extends ObjectBase {
    machine: string;
    current: string;
    context_repository?: string | null;
    parent?: string | null;
    task?: string | null;
    session: ObjectProgressSession[];
    history_count: number;
    namedOperator: {name:string, operator:string[]}[];
}

export interface TableItem_ProgressHistory extends ObjectBase {
    history: History;
}

export interface ObjectService extends ObjectBase {
    permission: string;
    bPaused: boolean;
    bPublished: boolean;
    description: string;
    arbitration: string[];
    buy_guard?: string | null;
    endpoint?: string | null;
    extern_withdraw_treasuries: string[];
    machine?: string | null;
    payee: string;
    repository: string[];
    sales_count: number;
    withdraw_guard: {guard:string, percent:number}[];
    refund_guard: {guard:string, percent:number}[];
    customer_required_info?: {pubkey:string; required_info:string[]};
}

export interface TableItem_ServiceSale extends ObjectBase {
    item: Service_Sale;
}
export interface ObjectOrder extends ObjectBase {
    service: string;
    amount: string;
    balance: string;
    payer: string;
    arb: string[];
    agent: string[];
    progress?: string | null;
    discount?: string | null;
    required_info?: {pubkey:string; msg_encrypted:string};
    item: Service_Sale[];
}

export interface ObjectTreasury extends ObjectBase {
    permission: string;
    description: string;
    inflow: string;
    outflow: string;
    withdraw_mode: Treasury_WithdrawMode;
    withdraw_guard: {guard:string, percent:number}[];
    deposit_guard?: string | null;
    balance: string;
    history_count: number;
}
export interface TableItem_TreasuryHistory extends ObjectBase {
    id: number,
    operation: Treasury_Operation,
    signer: string,
    payment: string,
    amount: string,
    time: string,
}
export interface ObjectArbitration extends ObjectBase {
    permission: string;
    description: string;
    bPaused: boolean;
    endpoint?: string | null;
    fee: string;
    fee_treasury: string;
    usage_guard?: string | null;
    voting_guard: {guard:string, weights:number}[];
}

export interface ObjectArb extends ObjectBase {
    arbitration: string;
    order: string;
    description: string;
    bWithdrawn: boolean;
    fee: string;
    feedback: string;
    indemnity?: string | null;
    proposition: {proposition:string, votes:string};
    voted_count: number;
}
export interface TableItem_ArbVote extends ObjectBase {
    singer: string;
    vote: number[];
    weight: string;
    time: string;
}
export interface ObjectRepository extends ObjectBase {
    permission: string;
    description: string;
    policy_mode: Repository_Policy_Mode;
    rep_type: Repository_Type;
    reference: string[];
    policy: Repository_Policy[];
    data_count: number;
}
export interface TableItem_RepositoryData extends ObjectBase {
    address: string;
    key: string;
    data: Uint8Array;
}
export interface ObjectPayment extends ObjectBase {
    amount: string;
    for_guard?: string | null;
    for_object?: string | null;
    from ?: string | null;
    biz_id: string;
    remark: string;
    signer: string;
    time: string;
    record: {recipient:string; amount:string}[];
}
export interface ObjectDiscount extends ObjectBase {
    service: string;
    name: string;
    off_type: Service_Discount_Type;
    price_greater?: string | null;
    off: string;
    time_start: string;
    time_end: string;
}

export interface ObjectGuard extends ObjectBase {
    description: string;
    input: Uint8Array;
    identifier: {id:number; bWitness:boolean; value:Uint8Array}[];
}
export interface ObjectEntity extends ObjectBase {
    address: string; 
    like: number;
    dislike: number;

    name?: string;
    description?: string;
    avatar?: string;
    x?: string;
    discord?: string;

    homepage?: string;
    resource_object?: string | null;
    lastActive_digest?: string; 
}

export interface ObjectResouorce_Tag {
    object: string;
    nick_name: string;
    tags: string[];
}

export interface ObjectResouorce extends ObjectBase {
    marks_count: number;
    tags: ObjectResouorce_Tag[];
}

export interface TableItem_ResourceMark extends ObjectBase {
    mark_name: string;
    objects: string[];
}

export interface ObjectsQuery {
    objects: string[];
    showType?: boolean;
    showContent?: boolean;
    showOwner?: boolean;
}
export interface ObjectsAnswer {
    objects?: ObjectBase[];
    error?: string;
}

export interface TableQuery {
    parent: string;
    cursor?: string | null | undefined;
    limit?: number | null | undefined;
}
export interface TableAnswerItem {
    key: {type:string; value:unknown};
    object: string;
    version: string;
}
export interface TableAnswer {
    items: TableAnswerItem[];
    nextCursor: string | null;
    hasNextPage: boolean;
}

interface TableItemQuery {
    parent: string;
    key: {type:string, value:unknown};
}

export namespace OBJECT_QUERY {
    /* json: ObjectsQuery string */
    export const objects_json = async (json:string) : Promise<string> => {
        try {
            const q : ObjectsQuery = JSON.parse(json);
            return JSON.stringify({data:await objects(q)});
        } catch (e) {
            return JSON.stringify({error:e?.toString()})
        }
    }

    /* json: TableQuery string */
    export const table_json = async (json:string) : Promise<string> => {
        try {
            const q : TableQuery = JSON.parse(json);
            return JSON.stringify({data:await table(q)});
        } catch (e) {
            return JSON.stringify({error:e?.toString()})
        }
    }

    export const objects = async (query: ObjectsQuery) : Promise<ObjectsAnswer> => {
        if (query.objects.length > 0) {
            const res = await Protocol.Client().multiGetObjects({ids:query.objects, 
                options:{showContent:query.showContent, showType:query.showType, showOwner:query.showOwner}});
            console.log(JSON.stringify(res))
            return {objects:res.map(v=>data2object(v?.data))}                
        } 
        return {objects:[]}
    }
    export const entity = async (address:string) : Promise<ObjectEntity> => {
        if (!IsValidAddress(address))  ERROR(Errors.IsValidAddress, 'entity.address')
        const res = await Protocol.Client().getDynamicFieldObject({parentId:Protocol.Instance().EntityObject(), name:{type:'address', value:address}});
        return data2object(res?.data) as ObjectEntity
    }

    export const table = async (query:TableQuery) : Promise<TableAnswer> => {
        const res = await Protocol.Client().getDynamicFields({parentId:query.parent, cursor:query.cursor, limit:query.limit});
        return {items:res?.data?.map(v=>{
            return {object:v.objectId, type:v.type, version:v.version, key:{
                type:v.name.type, value:v.name.value
            }} 
        }), nextCursor:res.nextCursor, hasNextPage:res.hasNextPage}
    }
    
    export const queryTableItem_DemandPresenter = async (demand_object:string | ObjectDemand, address:string) : Promise<ObjectBase> => {
        return await tableItem(tableItemQuery_byAddress(demand_object, address))
    }
    export const queryTableItem_PermissionEntity = async (permission_object:string | ObjectDemand, address:string) : Promise<ObjectBase> => {
        return await tableItem(tableItemQuery_byAddress(permission_object, address))
    }
    export const queryTableItem_ArbVote = async (arb_object:string | ObjectDemand, address:string) : Promise<ObjectBase> => {
        return await tableItem(tableItemQuery_byAddress(arb_object, address))
    }
    export const tableItemQuery_MachineNode = async (machine_object:string | ObjectMachine, name:string) : Promise<ObjectBase> => {
        return await tableItem(tableItemQuery_byString(machine_object, name))
    }
    export const tableItemQuery_ServiceSale = async (service_object:string | ObjectService, name:string) : Promise<ObjectBase> => {
        return await tableItem(tableItemQuery_byString(service_object, name))
    }
    export const tableItemQuery_ProgressHistory = async (progress_object:string | ObjectProgress, index:BigInt) : Promise<ObjectBase> => {
        return await tableItem(tableItemQuery_byU64(progress_object, index))
    }
    export const tableItemQuery_TreasuryHistory = async (treasury_object:string | ObjectTreasury, index:BigInt) : Promise<ObjectBase> => {
        return await tableItem(tableItemQuery_byU64(treasury_object, index))
    }
    export const tableItemQuery_RepositoryData = async (repository_object:string | ObjectRepository, address:string, name:string) : Promise<ObjectBase> => {
        if (typeof(repository_object) !== 'string') {
            repository_object = repository_object.object;
        }
        return await tableItem({parent:repository_object, key:{type:Protocol.Instance().Package('wowok')+'::repository::DataKey', value:{id:address, key:name}}})
    }
    export const tableItemQuery_ResourceMark = async (resource_object:string | ObjectResouorce, name:string) : Promise<ObjectBase> => {
        return await tableItem(tableItemQuery_byString(resource_object, name))
    }

    function tableItemQuery_byAddress(parent:string | ObjectDemand | ObjectPermission | ObjectArb, address:string) : TableItemQuery {
        if (typeof(parent) !== 'string') {
            parent = parent.object;
        }
        return {parent:parent, key:{type:'address', value:address}};
    }
    function tableItemQuery_byString(parent:string | ObjectMachine | ObjectService | ObjectResouorce, name:string) : TableItemQuery  {
        if (typeof(parent) !== 'string') {
            parent = parent.object;
        }
        return {parent:parent, key:{type:'0x1::string::String', value:name}};
    }
    function tableItemQuery_byU64 (parent:string | ObjectProgress | ObjectTreasury, index:BigInt) : TableItemQuery {
        if (typeof(parent) !== 'string') {
            parent = parent.object;
        }
        return {parent:parent, key:{type:'u64', value:index}};
    }
    const tableItem = async (query:TableItemQuery) : Promise<ObjectBase> => {
        const res = await Protocol.Client().getDynamicFieldObject({parentId:query.parent, name:{type:query.key.type, value:query.key.value}});
        return data2object(res?.data)
    }

    function data2object(data?:any) : ObjectBase {
        const content = (data?.content as any)?.fields;
        const id = data?.objectId ?? (content?.id?.id ?? undefined);
        const type_raw:string | undefined = data?.type ?? (data?.content?.type ?? undefined);
        const version = data?.version ?? undefined;
        const owner = data?.owner ?? undefined;
        const type:string | undefined = type_raw ? Protocol.Instance().object_name_from_type_repr(type_raw) : undefined;

        if (type) {
            switch(type) {
            case 'Permission':
                return {object:id, type:type, type_raw:type_raw, owner:owner, version:version,
                    builder: content?.builder ??'', admin:content?.admin, description:content?.description??'',
                    entity_count: parseInt(content?.table?.fields?.size), 
                    biz_permission:content?.user_define?.fields?.contents?.map((v:any) => {
                        return {id:parseInt(v?.fields?.key), name:v?.fields?.value}
                    })
                } as ObjectPermission;
            case 'Demand':
                return {
                    object:id, type:type, type_raw:type_raw, owner:owner, version:version,
                    permission: content?.permission, description:content?.description,
                    guard:content?.guard ? {object:content?.guard, service_id_in_guard:content?.service_identifier}:undefined,
                    time_expire:content?.time_expire, yes:content?.yes, 
                    presenter_count:parseInt(content?.presenters?.fields?.size),
                    bounty: content?.bounty?.map((v:any) => {
                        return {type:v?.fields?.type, object:v?.fields?.id?.id, balance:v?.fields?.balance}
                    })
                } as ObjectDemand;
            case 'Machine':
                return {
                    object:id, type:type, type_raw:type_raw, owner:owner, version:version,
                    permission: content?.permission ?? '', description:content?.description??'',
                    bPaused: content?.bPaused, bPublished:content?.bPublished, endpoint:content?.endpoint,
                    consensus_repository:content?.consensus_repositories, node_count:parseInt(content?.nodes?.fields?.size),
                } as ObjectMachine;
            case 'Progress':
                return {
                    object:id, type:type, type_raw:type_raw, owner:owner, version:version,
                    machine: content?.machine, current: content?.current, task:content?.task,
                    parent:content?.parent,  history_count:parseInt(content?.history?.fields?.contents?.fields?.size),
                    namedOperator:content?.namedOperator?.fields?.contents?.map((v:any) => {
                        return {name:v?.fields?.key, operator:v?.fields?.value}
                    }),
                    session:content?.session?.fields?.contents?.map((v:any) => {
                        return {weights:v?.fields?.value?.fields?.weight, threshold:v?.fields?.value?.fields?.threshold,
                            next_node:v?.fields?.key, forward: v?.fields?.value?.fields?.forwards?.fields?.contents?.map((i:any) => {
                                return {forward_name:i?.fields?.key, accomplished:i?.fields?.value?.fields?.accomplished,
                                    msg:i?.fields?.value?.fields?.msg, orders:i?.fields?.value?.fields?.orders, 
                                    time:i?.fields?.value?.fields?.time, holder:i?.fields?.value?.fields?.who
                                }
                            })
                        }
                    })
                } as ObjectProgress;
            case 'Order':
                return {
                    object:id, type:type, type_raw:type_raw, owner:owner, version:version,
                    service:content?.service, amount: content?.amount, agent:content?.agent, arb:content?.dispute, 
                    payer:content?.payer, progress:content?.progress, discount:content?.discount, balance:content?.payed,
                    required_info: content?.required_info ? 
                        {pubkey:content?.required_info?.fields?.customer_pub, msg_encrypted:content?.required_info?.fields?.info} 
                        : undefined,
                    item : content?.items?.map((v:any) => {
                        return {name:v?.fields?.name, price:v?.fields?.price, stock:v?.fields?.stock, endpoint:v?.fields?.endpoint}
                    }),
                } as ObjectOrder;
            case 'Service':
                return {
                    object:id, type:type, type_raw:type_raw, owner:owner, version:version,
                    machine:content?.machine, permission:content?.permission, description:content?.description,
                    arbitration:content?.arbitrations, bPaused:content?.bPaused, bPublished:content?.bPublished,
                    buy_guard:content?.buy_guard, endpoint:content?.endpoint, payee:content?.payee, repository:content?.repositories, 
                    withdraw_guard:content?.withdraw_guard?.fields?.contents?.map((v:any) => {
                        return {object:v?.fields?.key, percent:v?.fields?.value}
                    }),
                    refund_guard:content?.refund_guard?.fields?.contents?.map((v:any) => {
                        return {object:v?.fields?.key, percent:v?.fields?.value}
                    }),
                    sales_count:parseInt(content?.sales?.fields?.size), extern_withdraw_treasuries:content?.extern_withdraw_treasuries,
                    customer_required_info:content?.customer_required ? 
                        {pubkey:content?.customer_required?.fields?.service_pubkey, required_info:content?.customer_required?.fields?.customer_required_info}
                        :undefined,
                } as ObjectService;
            case 'Treasury':
                return {
                    object:id, type:type, type_raw:type_raw, owner:owner, version:version,
                    permission:content?.permission, description:content?.description, withdraw_mode:content?.withdraw_mode,
                    history_count:parseInt(content?.history?.fields?.contents?.fields?.size), balance: content?.balance, 
                    deposit_guard:content?.deposit_guard, withdraw_guard:content?.withdraw_guard?.fields?.contents?.map((v:any) => {
                        return {object:v?.fields?.key, percent:v?.fields?.value}
                    })
                } as ObjectTreasury;
            case 'Arbitration':
                return {
                    object:id, type:type, type_raw:type_raw, owner:owner, version:version,
                    permission:content?.permission, description:content?.description, fee:content?.fee,
                    fee_treasury:content?.fee_treasury, usage_guard:content?.usage_guard,
                    endpoint:content?.endpoint, bPaused:content?.bPaused, voting_guard:content?.voting_guard?.fields?.contents?.map((v:any) => {
                        return {object:v?.fields?.key, weights:v?.fields?.value}
                    }) 
                } as ObjectArbitration;  
            case 'Arb':
                return {
                    object:id, type:type, type_raw:type_raw, owner:owner, version:version,
                    arbitration:content?.arbitration, description:content?.description, fee:content?.fee,
                    feedback:content?.feedback, indemnity:content?.indemnity, order:content?.order,
                    voted_count:parseInt(content?.voted?.fields?.size), 
                    proposition:content?.proposition?.fields?.contents?.map((v:any) => {
                        return {proposition:v?.fields?.key, votes:v?.fields?.value}
                    }) 
                } as ObjectArb;  
            case 'Repository':
                return {
                    object:id, type:type, type_raw:type_raw, owner:owner, version:version,
                    permission:content?.permission, description:content?.description, policy_mode:content?.policy_mode,
                    data_count:parseInt(content?.data?.fields?.size), reference:content?.reference, rep_type:content?.type, 
                    policy:content?.policies?.fields?.contents?.map((v:any) => {
                        return {key:v?.fields?.key, description:v?.fields?.value?.fields?.description, 
                          permissionIndex:v?.fields?.value?.fields?.permission_index, dataType:v?.fields?.value?.fields?.value_type}
                      })
                } as ObjectRepository;  
            case 'Payment':
                return {
                    object:id, type:type, type_raw:type_raw, owner:owner, version:version,
                    signer:content?.signer, time:content?.time, remark:content?.remark, from: content?.from,
                    biz_id:content?.index, for_guard:content?.for_guard, for_object:content?.for_object,
                    amount:content?.amount, record:content?.record?.map((v:any) => {
                        return {recipient:v?.fields?.recipient, amount:v?.fields?.amount}
                    })
                } as ObjectPayment;  
            case 'Discount':
                return {
                    object:id, type:type, type_raw:type_raw, owner:owner, version:version,
                    service:content?.service, time_start:content?.time_start, time_end:content?.time_end, 
                    price_greater:content?.price_greater, off_type:content?.type, off:content?.off,
                    name:content?.name
                } as ObjectDiscount;   
            case 'Guard':
                return {
                    object:id, type:type, type_raw:type_raw, owner:owner, version:version,
                    description:content?.description, input:Uint8Array.from(content?.input?.fields?.bytes),
                    identifier:content?.constants?.map((v:any) => {
                        return {id:v?.fields?.identifier, bWitness:v?.fields?.bWitness, value:Uint8Array.from(v?.fields?.value)}
                    })
                } as ObjectGuard;  
            case 'Resource' :
                return {
                    object:id, type:type, type_raw:type_raw, owner:owner, version:version,
                    marks_count:parseInt(content?.marks?.fields?.size),
                    tags:content?.tags?.map((v:any) => {
                        return {object:v?.fields?.object, nick_name:v?.fields?.nick, tags:v?.fields?.tags}
                    })
                } as ObjectResouorce;   
            }
        } 
        
        const start = type_raw?.indexOf('0x2::dynamic_field::Field<');
        if (start === 0) {
            const end = type_raw?.substring('0x2::dynamic_field::Field<'.length);
            if(end && Protocol.Instance().hasPackage(end)) {
                if (end.includes('::demand::Tips>')) {
                    return {
                        object:id, type:'DemandTable_Presenter', type_raw:type_raw, owner:owner, version:version,
                        service:content?.name, presenter:content?.value?.fields?.who, recommendation:content?.value?.fields?.tips
                    } as TableItem_DemandPresenter;
                } else if (end.includes('::machine::NodePair>>>')) {
                    return {
                        object:id, type:'MachineTable_Node', type_raw:type_raw, owner:owner, version:version,
                        node:{name:content?.name, pairs:Machine.rpc_de_pair(content?.value)}
                    } as TableItem_MachineNode;
                } else if (end.includes('::progress::History>')) {
                    return {
                        object:id, type:'ProgressTable_History', type_raw:type_raw, owner:owner, version:version,
                        history:Progress.rpc_de_history(content)
                    } as TableItem_ProgressHistory;
                } else if (end.includes('::service::Sale>')) {
                    return {
                        object:id, type:'ServiceTable_Sale', type_raw:type_raw, owner:owner, version:version,
                        item:{item:content?.name, stock:content?.value?.fields?.stock, price:content?.value?.fields?.price,
                            endpoint:content?.value?.fields?.endpoint
                        }
                    } as TableItem_ServiceSale;
                } else if (end.includes('::treasury::Record>')) {
                    return {
                        object:id, type:'TreasuryTable_History', type_raw:type_raw, owner:owner, version:version,
                        id: content?.name, payment:content?.value?.fields?.payment, signer:content?.value?.fields?.signer,
                        operation: content?.value?.fields?.op, amount: content?.value?.fields?.amount, time:content?.value?.fields?.time
                    } as TableItem_TreasuryHistory;
                } else if (end.includes('::arb::Voted>')) {
                    return {
                        object:id, type:'ArbTable_Vote', type_raw:type_raw, owner:owner, version:version,
                        singer:content?.name, vote:content?.value?.fields?.agrees, time: content?.value?.fields?.time,
                        weight:content?.value?.fields?.weight
                    } as TableItem_ArbVote;
                } else if (end.includes('::permission::Perm>>')) {
                    return {
                        object:id, type:'TableItem_PermissionEntity', type_raw:type_raw, owner:owner, version:version,
                        entity:content?.name, permission:content?.value?.map((v:any) => {
                            return {id:v?.fields.index, guard:v?.fields.guard}
                        })
                    } as TableItem_PermissionEntity;
                } else if (end.includes('::repository::DataKey')) {
                    return {
                        object:id, type:'TableItem_RepositoryData', type_raw:type_raw, owner:owner, version:version,
                        address:content?.name?.fields?.id, key:content?.name?.fields?.key, data:Uint8Array.from(content?.value)
                    } as TableItem_RepositoryData;
                } else if (end.includes('::entity::Ent>')) {
                    const info = Bcs.getInstance().de_entInfo(Uint8Array.from(content?.value?.fields?.avatar));
                    return {
                        object:id, type:'Entity', type_raw:type_raw, owner:owner, version:version,
                        address:content?.name, like:content?.value?.fields?.like, dislike:content?.value?.fields?.dislike, 
                        resource_object: content?.value?.fields?.resource, lastActive_digest: data?.previousTransaction,
                        homepage:info?.homepage, name:info?.name, avatar:info?.avatar, x:info?.twitter, discord:info?.discord, 
                        description:info?.description
                    } as ObjectEntity;
                } else if (end.includes('::resource::Addresses>')) {
                    return {
                        object:id, type:'Entity', type_raw:type_raw, owner:owner, version:version,
                        mark_name:content?.name, objects:content?.value?.fields?.addresses
                    } as TableItem_ResourceMark;
                }
            }
        }
        return {object:id, type:type, type_raw:type_raw, owner:owner, version:version}
    }
}
