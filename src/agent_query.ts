/**
 * Provide a JSON query interface for AI
 * 
 */

import { Transaction as TransactionBlock,  } from '@mysten/sui/transactions';
import { Protocol, } from './protocol';
import { Bcs, IsValidAddress, IsValidArgType, IsValidU64, parseObjectType, IsValidU8 } from './utils'
import { Errors, ERROR}  from './exception'
import { MultiGetObjectsParams } from '@mysten/sui/client';
import { Permission } from './permission';
import { BCS } from '@mysten/bcs';
import { PermissionAnswerItem, PermissionIndexType } from './permission';
import { Entity } from './entity';

export interface PermissionQuery {
    permission_object: string;
    address: string;
    permission: number[]; // [] for all permissions
}
export interface EntityQuery {
    address: string;
    showTags?: boolean;
    showMarks?: boolean;
}

export interface EntityDetail {
    name: string;
    description: string;
    avatar: string;
    x: string;
    discord: string;
    homepage: string;
}

export interface ObjectTag {
    object: string;
    nick_name: string;
    tags: string[];
}

export interface ObjectMark {
    mark_name: string;
    objects: string[];
}

export interface EntityAnswer {
    address: string; 
    like: number;
    dislike: number;
    details: EntityDetail;
    resource_object?: string;
    lastActive_digest?: string; 
    marks?: ObjectMark[];
    tags?: ObjectTag[];
}

export class AgentQuery {
    /* json: MultiGetObjectsParams string; return SuiObjectResponse string */
    static objects = async (json:string) : Promise<string> => {
        try {
            const q : MultiGetObjectsParams = JSON.parse(json);
            if (q?.ids && q.ids.length > 0) {
                const res = await Protocol.Client().multiGetObjects({ids:q.ids, options:q.options});
                return JSON.stringify({data:res});
            }
        } catch (e) {
            return JSON.stringify({'error':e});
        }
        return JSON.stringify({data:[]});
    }

    /*json: PermissionQuery; return PermissionAnswer */
    static permission = async (json:string) : Promise<string> => {
        try {
            const q : PermissionQuery = JSON.parse(json);
            if (!IsValidAddress(q.permission_object)) {
                ERROR(Errors.IsValidAddress, 'permission.permission_object');
            }
            if (!IsValidAddress(q.address)) {
                ERROR(Errors.IsValidAddress, 'permission.address')
            }
            const txb = new TransactionBlock();
            const object = Permission.From(txb, q.permission_object);
            if (q.permission.length === 0) {
                object.query_permissions_all(q.address);
            } else {
                object.query_permissions(q.address, q.permission);
            }

            const res = await Protocol.Client().devInspectTransactionBlock({sender:q.address, transactionBlock:txb});
            if (res.results && res.results[0].returnValues && res.results[0].returnValues.length !== 3 )  {
                ERROR(Errors.Fail, 'permission.retValues')
            }

            const perm = Bcs.getInstance().de(BCS.U8, Uint8Array.from((res.results as any)[0].returnValues[0][0]));
            if (perm === Permission.PERMISSION_ADMIN || perm === Permission.PERMISSION_OWNER_AND_ADMIN) {
                return JSON.stringify({who:q.address, admin:true, owner:perm%2===1, items:[], object:q.permission_object})
            } else {
                if (q.permission.length === 0) {
                    const perms = Bcs.getInstance().de('vector<u64>', Uint8Array.from((res.results as any)[0].returnValues[1][0]));
                    const guards = Bcs.getInstance().de_guards(Uint8Array.from((res.results as any)[0].returnValues[2][0]));
                    const items: PermissionAnswerItem[] = [];
                    for(let i = 0; i < perms.length; ++i) {
                        items.push({query:perms[i], permission:true, guard:guards[i] ? ('0x'+guards[i]) : undefined})
                    }
                    return JSON.stringify({who:q.address, admin:false, owner:perm%2===1, items:items, object:q.permission_object});  
                } else {
                    const perms = Bcs.getInstance().de('vector<u8>', Uint8Array.from((res.results as any)[0].returnValues[1][0]));
                    const guards = Bcs.getInstance().de('vector<address>', Uint8Array.from((res.results as any)[0].returnValues[2][0]));
                    if (perms.length !== q.permission.length) {
                        return JSON.stringify({'error':Errors.Fail})
                    }

                    const items: PermissionAnswerItem[] = (q.permission as PermissionIndexType[]).map((v, index) => {
                        const p = perms[index] === Permission.PERMISSION_QUERY_NONE ? false : true;
                        let g : any = undefined;
                        if (p && perms[index] < guards.length) {
                            g = '0x' + guards[perms[index] as number];
                        }
                        return {query:v, permission:p, guard:g} 
                    })
                    return JSON.stringify({who:q.address, admin:false, owner:perm%2===1, items:items, object:q.permission_object});                    
                }
            }
        } catch (e) {
            return JSON.stringify({error:e});
        }
    }

    /*json: EntityQuery; return EntityAnswer */
    static entity = async (json:string) : Promise<string> => {
        try {
            const q : EntityQuery = JSON.parse(json);
            if (!IsValidAddress(q.address)) {
                ERROR(Errors.IsValidAddress, 'entity.address')
            }

            const txb = new TransactionBlock();
            Entity.From(txb).query_ent(q.address);

            const res = await Protocol.Client().devInspectTransactionBlock({sender:q.address, transactionBlock:txb});
            if (res.results && res.results?.length === 1 && res.results[0].returnValues?.length === 1 )  {
                const r1 = Bcs.getInstance().de_ent(Uint8Array.from(res.results[0].returnValues[0][0]));
                const a = Bcs.getInstance().de_entInfo(Uint8Array.from(r1.avatar));
                var ret : EntityAnswer = {address:q.address, like:r1.like, dislike:r1.dislike, resource_object:r1.resource?.some ?? undefined,
                    details:{homepage:a.homepage, name:a.name, avatar:a.avatar, x:a.twitter, discord:a.discord, description:a.description}, 
                    }; 

                if (r1.resource?.some && q.showTags) {
                    const res2 = await Protocol.Client().getObject({id:r1.resource?.some, options:{showContent:true, showPreviousTransaction:true, showType:true}});
                    ret.tags = (res2?.data?.content as any)?.fields?.tags?.map((v:any) => {
                        return {address:v.fields.object, nick:v.fields.nick, tags:v.fields.tags}
                    })
                    
                    ret.lastActive_digest = res2.data?.previousTransaction ?? '';
                }

                if (r1.resource?.some && q.showMarks) {
                    const fields = await Protocol.Client().getDynamicFields({parentId:r1.resource?.some});
                    if (fields.data.length > 0) {
                        const objects = await Protocol.Client().multiGetObjects({ids:fields.data.map(v => v.objectId), options:{showContent:true}});
                        ret.marks = objects.map((i:any) => {
                            return {mark_name:i.data.content.fields.name, objects:i.data.content.fields.value}
                        })
                    }
                }
                return JSON.stringify(ret)
            }
        } catch (e) {
           return JSON.stringify({error:e}); 
        }
        return JSON.stringify({'error':Errors.Fail})
    }
}
