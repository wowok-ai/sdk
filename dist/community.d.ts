import { SuiClient } from '../node_modules/@mysten/sui.js/client';
import { ENTRYPOINT } from './config.js';
export * from './config.js';
export declare class Community {
    protected client: SuiClient;
    constructor(entry: ENTRYPOINT);
    create(data: any): Promise<import("@mysten/sui.js/dist/cjs/client/types/generated").SuiTransactionBlockResponse>;
}
