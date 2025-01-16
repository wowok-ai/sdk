/**
 * Provide a JSON query interface for AI
 * 
 */

import { Transaction as TransactionBlock } from '@mysten/sui/transactions';
import { Protocol, } from '../protocol';
import { Bcs, IsValidAddress } from '../utils'
import { Errors, ERROR}  from '../exception'
import { Entity } from '../entity';


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

export class ENTITY_QUERY {
    /*json: EntityQuery; return EntityAnswer */
    static entity_json = async (json:string) : Promise<string> => {
        try {
            const q : EntityQuery = JSON.parse(json);
            return JSON.stringify(await ENTITY_QUERY.entity(q));
        } catch (e) {
           return JSON.stringify({error:e}); 
        }
    }

    static entity = async (query:EntityQuery) : Promise<EntityAnswer> => {
        if (!IsValidAddress(query.address)) {
            ERROR(Errors.IsValidAddress, 'entity.address')
        }

        const txb = new TransactionBlock();
        Entity.From(txb).query_ent(query.address);

        const res = await Protocol.Client().devInspectTransactionBlock({sender:query.address, transactionBlock:txb});
        if (!res.results || res.results?.length !== 1 || res.results[0].returnValues?.length !== 1 )  {
            ERROR(Errors.Fail, 'entity.fail')
        }

        const r1 = Bcs.getInstance().de_ent(Uint8Array.from(res!.results![0].returnValues![0][0]));
        const a = Bcs.getInstance().de_entInfo(Uint8Array.from(r1.avatar));
        var ret : EntityAnswer = {address:query.address, like:r1.like, dislike:r1.dislike, resource_object:r1.resource?.some ?? undefined,
            details:{homepage:a.homepage, name:a.name, avatar:a.avatar, x:a.twitter, discord:a.discord, description:a.description}, 
            }; 

        if (r1.resource?.some && query.showTags) {
            const res2 = await Protocol.Client().getObject({id:r1.resource?.some, options:{showContent:true, showPreviousTransaction:true, showType:true}});
            ret.tags = (res2?.data?.content as any)?.fields?.tags?.map((v:any) => {
                return {address:v.fields.object, nick:v.fields.nick, tags:v.fields.tags}
            })
            
            ret.lastActive_digest = res2.data?.previousTransaction ?? '';
        }

        if (r1.resource?.some && query.showMarks) {
            const fields = await Protocol.Client().getDynamicFields({parentId:r1.resource?.some});
            if (fields.data.length > 0) {
                const objects = await Protocol.Client().multiGetObjects({ids:fields.data.map(v => v.objectId), options:{showContent:true}});
                ret.marks = objects.map((i:any) => {
                    return {mark_name:i.data.content.fields.name, objects:i.data.content.fields.value}
                })
            }
        }
        return ret
    }
}
