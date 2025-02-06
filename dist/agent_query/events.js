/**
 * Provide AI with Basic WoWok event queries:
 * for real-time detail tracking.
 */
import { Protocol } from '../protocol';
export var EVENT_QUERY;
(function (EVENT_QUERY) {
    EVENT_QUERY.newArbEvents = async (option) => {
        return await queryEvents(Protocol.Instance().Package('wowok') + '::arb::NewArbEvent', option);
    };
    EVENT_QUERY.presentServiceEvents = async (option) => {
        return await queryEvents(Protocol.Instance().Package('wowok') + '::demand::PresentEvent', option);
    };
    EVENT_QUERY.newProgressEvents = async (option) => {
        return await queryEvents(Protocol.Instance().Package('wowok') + '::progress::NewProgressEvent', option);
    };
    EVENT_QUERY.newOrderEvents = async (option) => {
        return await queryEvents(Protocol.Instance().Package('wowok') + '::order::NewOrderEvent', option);
    };
    const queryEvents = async (type, option) => {
        const res = await Protocol.Client().queryEvents({ query: { MoveEventType: type }, cursor: option?.cursor, limit: option?.limit, order: option?.order });
        const data = res?.data?.map((v) => {
            if (v?.packageId === Protocol.Instance().Package('wowok')) {
                if (v?.type?.includes('::order::NewOrderEvent')) {
                    return {
                        id: v?.id, time: v?.timestampMs, type_raw: v?.type, sender: v?.sender, type: 'NewOrderEvent',
                        order: v?.parsedJson?.object, service: v?.parsedJson?.service, progress: v?.parsedJson?.progress, amount: v?.parsedJson?.amount
                    };
                }
                else if (v?.type?.includes('::demand::PresentEvent')) {
                    return {
                        id: v?.id, time: v?.timestampMs, type_raw: v?.type, sender: v?.sender, type: 'NewOrderEvent',
                        demand: v?.parsedJson?.object, service: v?.parsedJson?.service, recommendation: v?.parsedJson?.tips
                    };
                }
                else if (v?.type?.includes('::progress::NewProgressEvent')) {
                    return {
                        id: v?.id, time: v?.timestampMs, type_raw: v?.type, sender: v?.sender, type: 'NewOrderEvent',
                        progress: v?.parsedJson?.object, machine: v?.parsedJson?.machine, task: v?.parsedJson?.task
                    };
                }
                else if (v?.type?.includes('::arb::NewArbEvent')) {
                    return {
                        id: v?.id, time: v?.timestampMs, type_raw: v?.type, sender: v?.sender, type: 'NewOrderEvent',
                        arb: v?.parsedJson?.object, arbitration: v?.parsedJson?.arbitration, order: v?.parsedJson?.order
                    };
                }
            }
            return { id: v?.id, time: v?.timestampMs, type_raw: v?.type, sender: v?.sender, type: '', };
        });
        return { data: data, hasNextPage: res?.hasNextPage, nextCursor: res?.nextCursor };
    };
})(EVENT_QUERY || (EVENT_QUERY = {}));
