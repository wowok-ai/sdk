
/**
 * Provide AI with Basic WoWok event queries: 
 * for real-time detail tracking.
 */

import { Protocol } from '../protocol';

export interface EventQueryOption {
    /** optional paging cursor */
    cursor?: {eventSeq: string; txDigest: string} | null | undefined;
    /** maximum number of items per page, default to [QUERY_MAX_RESULT_LIMIT] if not specified. */
    limit?: number | null | undefined;
    /** query result ordering, default to false (ascending order), oldest record first. */
    order?: 'ascending' | 'descending' | null | undefined;
}

export interface EventBase {
    id: {eventSeq: string; txDigest: string};
    sender: string;
    type: string | 'NewArbEvent' | 'NewOrderEvent' | 'NewProgressEvent' | 'PresentServiceEvent';
    type_raw: string;
    time: string;
}

export interface NewArbEvent extends EventBase {
    arb: string,
    arbitration: string,
    order: string,
}

export interface NewOrderEvent extends EventBase {
    order: string,
    service: string,
    progress?: string | null,
    amount: string,
}

export interface NewProgressEvent extends EventBase {
    progress: string,
    machine: string,
    task?: string | null,
}

export interface PresentServiceEvent extends EventBase {
    demand: string,
    service: string,
    recommendation: string,
}

export interface EventAnswer {
    data: EventBase[];
    hasNextPage: boolean;
    nextCursor?: {eventSeq: string; txDigest: string} | null;
}

export namespace EVENT_QUERY {
    export const newArbEvents = async(option?:EventQueryOption) : Promise<EventAnswer> => {
        return await queryEvents(Protocol.Instance().Package('wowok') + '::arb::NewArbEvent', option)
    }
    export const presentServiceEvents = async(option?:EventQueryOption) : Promise<EventAnswer> => {
        return await queryEvents(Protocol.Instance().Package('wowok') + '::demand::PresentEvent', option)
    }
    export const newProgressEvents = async(option?:EventQueryOption) : Promise<EventAnswer> => {
        return await queryEvents(Protocol.Instance().Package('wowok') + '::progress::NewProgressEvent', option)
    }
    export const newOrderEvents = async(option?:EventQueryOption) : Promise<EventAnswer> => {
        return await queryEvents(Protocol.Instance().Package('wowok') + '::order::NewOrderEvent', option)
    }
    const queryEvents = async(type:string, option?:EventQueryOption) : Promise<EventAnswer> => {
        const res = await Protocol.Client().queryEvents({query:{MoveEventType:type}, cursor:option?.cursor, limit:option?.limit, order:option?.order});
        const data = res?.data?.map((v:any) => {
            if (v?.packageId === Protocol.Instance().Package('wowok')) {
                if (v?.type?.includes('::order::NewOrderEvent')) {
                    return {
                        id: v?.id, time: v?.timestampMs, type_raw:v?.type, sender:v?.sender, type:'NewOrderEvent',
                        order: v?.parsedJson?.object, service: v?.parsedJson?.service, progress: v?.parsedJson?.progress, amount: v?.parsedJson?.amount
                    } as NewOrderEvent
                } else if (v?.type?.includes('::demand::PresentEvent')) {
                    return {
                        id: v?.id, time: v?.timestampMs, type_raw:v?.type, sender:v?.sender, type:'NewOrderEvent',
                        demand:v?.parsedJson?.object, service: v?.parsedJson?.service, recommendation:v?.parsedJson?.tips
                    } as PresentServiceEvent
                } else if (v?.type?.includes('::progress::NewProgressEvent')) {
                    return {
                        id: v?.id, time: v?.timestampMs, type_raw:v?.type, sender:v?.sender, type:'NewOrderEvent',
                        progress:v?.parsedJson?.object, machine: v?.parsedJson?.machine, task:v?.parsedJson?.task
                    } as NewProgressEvent
                } else if (v?.type?.includes('::arb::NewArbEvent')) {
                    return {
                        id: v?.id, time: v?.timestampMs, type_raw:v?.type, sender:v?.sender, type:'NewOrderEvent',
                        arb:v?.parsedJson?.object, arbitration:v?.parsedJson?.arbitration, order:v?.parsedJson?.order
                    } as NewArbEvent
                } 
            }
            return {id: v?.id, time: v?.timestampMs, type_raw:v?.type, sender:v?.sender, type:'',}
        })
        return {data:data, hasNextPage:res?.hasNextPage, nextCursor:res?.nextCursor}
    }
}