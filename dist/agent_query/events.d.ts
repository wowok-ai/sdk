/**
 * Provide AI with Basic WoWok event queries:
 * for real-time detail tracking.
 */
export interface EventQueryOption {
    /** optional paging cursor */
    cursor?: {
        eventSeq: string;
        txDigest: string;
    } | null | undefined;
    /** maximum number of items per page, default to [QUERY_MAX_RESULT_LIMIT] if not specified. */
    limit?: number | null | undefined;
    /** query result ordering, default to false (ascending order), oldest record first. */
    order?: 'ascending' | 'descending' | null | undefined;
}
export interface EventBase {
    id: {
        eventSeq: string;
        txDigest: string;
    };
    sender: string;
    type: string | 'NewArbEvent' | 'NewOrderEvent' | 'NewProgressEvent' | 'PresentServiceEvent';
    type_raw: string;
    time: string;
}
export interface NewArbEvent extends EventBase {
    arb: string;
    arbitration: string;
    order: string;
}
export interface NewOrderEvent extends EventBase {
    order: string;
    service: string;
    progress?: string | null;
    amount: string;
}
export interface NewProgressEvent extends EventBase {
    progress: string;
    machine: string;
    task?: string | null;
}
export interface PresentServiceEvent extends EventBase {
    demand: string;
    service: string;
    recommendation: string;
}
export interface EventAnswer {
    data: EventBase[];
    hasNextPage: boolean;
    nextCursor?: {
        eventSeq: string;
        txDigest: string;
    } | null;
}
export declare namespace EVENT_QUERY {
    const newArbEvents: (option?: EventQueryOption) => Promise<EventAnswer>;
    const presentServiceEvents: (option?: EventQueryOption) => Promise<EventAnswer>;
    const newProgressEvents: (option?: EventQueryOption) => Promise<EventAnswer>;
    const newOrderEvents: (option?: EventQueryOption) => Promise<EventAnswer>;
}
//# sourceMappingURL=events.d.ts.map