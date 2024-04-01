import { SuiClient, SuiObjectResponse, SuiObjectDataOptions, SuiTransactionBlockResponseOptions, 
    SuiTransactionBlockResponse, SuiObjectChange } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { BCS, getSuiMoveConfig, toHEX, fromHEX, BcsReader } from '@mysten/bcs';
import { TransactionBlock, Inputs, type TransactionResult } from '@mysten/sui.js/transactions';
import { capitalize } from './util'

export type GuardObject = TransactionResult;
export type GuardAddress = TransactionResult;

export const MAX_DESCRIPTION_LENGTH = 1024;
export const MAX_NAME_LENGTH = 64;
export const MAX_ENDPOINT_LENGTH = 1024;

export function description_data(description:string) : string {
    return description.substring(0, MAX_DESCRIPTION_LENGTH);
}
export function endpoint_data(endpoint:string) : string {
    return endpoint.substring(0, MAX_ENDPOINT_LENGTH);
}
export function name_data(name:string) : string {
    return name.substring(0, MAX_NAME_LENGTH);
}
export enum MODULES {
    machine = 'machine',
    node = 'node',
    progress = 'progress',
    community = 'community',
    repository = 'repository',
    permission = 'permission',
    passport = 'passport',
    guard = 'guard',
    vote = 'vote',
    demand = 'demand',
    order = 'order',
    reward = 'reward',
    service = 'service',
    wowok = 'wowok',
}

export type TxbObject = string | TransactionResult;
export function TXB_OBJECT(txb:TransactionBlock, arg:TxbObject) : TransactionResult {
    if (typeof arg == 'string') return txb.object(arg) as TransactionResult;
    return arg;
}

export type WowokObject = TransactionResult;
export type FnCallType = `${string}::${string}::${string}`;

export const CLOCK_OBJECT = Inputs.SharedObjectRef({
    objectId:"0x6",
    mutable: false,
    initialSharedVersion: 1,
});

export enum Data_Type {
    TYPE_DYNAMIC_QUERY = 1,
    TYPE_LOGIC_OPERATOR_U128_GREATER = 11,
    TYPE_LOGIC_OPERATOR_U128_GREATER_EQUAL = 12,
    TYPE_LOGIC_OPERATOR_U128_LESSER = 13,
    TYPE_LOGIC_OPERATOR_U128_LESSER_EQUAL = 14,
    TYPE_LOGIC_OPERATOR_U128_EQUAL = 15,
    TYPE_LOGIC_OPERATOR_EQUAL = 16, // TYPE&DATA(vector<u8>) MUST BE EQUAL
    TYPE_LOGIC_OPERATOR_HAS_SUBSTRING = 17, // SUBSTRING
    TYPE_LOGIC_ALWAYS_TRUE = 18, // aways true
    // TYPE_LOGIC_OPERATOR_VECU8_CONTAINS = 18, // SUB VEC<U8>
    TYPE_CONTEXT_SIGNER  = 60,
    TYPE_CONTEXT_CURRENT_PROGRESS = 61,
    TYPE_CONTEXT_CURRENT_CLOCK = 62,
    TYPE_STATIC_bool = 100,
    TYPE_STATIC_address = 101,
    TYPE_STATIC_u64 = 102,
    TYPE_STATIC_u8 = 103,
    TYPE_STATIC_u128 = 104,
    TYPE_STATIC_vec_u8 = 105,
    TYPE_STATIC_vec_address = 106,
    TYPE_STATIC_vec_bool = 107,
    TYPE_STATIC_vec_vec_u8 = 108,
    TYPE_STATIC_vec_u64 = 109,
    TYPE_STATIC_vec_u128 = 110,
    TYPE_STATIC_option_address = 111,
    TYPE_STATIC_option_bool = 112,
    TYPE_STATIC_option_u8 = 113,
    TYPE_STATIC_option_u64 = 114,
    TYPE_STATIC_option_u128 = 115,
    TYPE_STATIC_by_value_specified = 126,
    TYPE_STATIC_error = 127,
}

export enum ENTRYPOINT {
    mainnet = 'mainnet',
    testnet = 'testnet',
    devnet = 'devnet',
    localnet = 'localnet'
}

export class Protocol {
    protected network = '';
    protected package = '';
    protected signer = '';
    protected everyone_guard = '';

    constructor(network:ENTRYPOINT=ENTRYPOINT.localnet, signer="0xe386bb9e01b3528b75f3751ad8a1e418b207ad979fea364087deef5250a73d3f") {
        this.signer = signer;
        this.UseNetwork(network);
    }
    UseNetwork(network:ENTRYPOINT=ENTRYPOINT.localnet) {
        this.network = network;
        switch(network) {
            case ENTRYPOINT.localnet:
                this.package = "0xe9721254e97dd074e06c5efe5c57be169b64b39ae48939d89c00bf2f62b19e10";
                this.everyone_guard = "0xb2a3fe7881cb883743c4e962b7e3c7716a1cd47a67adad01dc79795def4f769d";
                break;
            case ENTRYPOINT.devnet:
                break;
            case ENTRYPOINT.testnet:
                this.package = "0x27ab80fa4fed1755508558ed430453ee9aa36f9c9f0982cf8bbe94a5aac8543b";
                this.everyone_guard = "0xafc6ddc2509f17afb9b0617aebb38208218cf48cff39cd04ef4a127b1ea3bec0";
                break;
            case ENTRYPOINT.mainnet:
                break;
        };
    }
    Package(): string { return this.package }
    EveryoneGuard(): string { return this.everyone_guard }
    NetworkUrl() : string { 
        switch(this.network) {
            case ENTRYPOINT.localnet:
                return "http://127.0.0.1:9000";
            case ENTRYPOINT.devnet:
                return "https://fullnode.devnet.sui.io:443";
            case ENTRYPOINT.testnet:
                return "https://fullnode.testnet.sui.io:443";
            case ENTRYPOINT.mainnet:
                return "https://fullnode.mainnet.sui.io:443";
        }; return "";
    };
    MachineFn = (fn:any) => { return `${this.package}::${MODULES.machine}::${fn}`};
    NodeFn = (fn: any) => { return `${this.package}::${MODULES.node}::${fn}`};
    ProgressFn = (fn:any) => { return `${this.package}::${MODULES.progress}::${fn}`};
    CommunityFn = (fn: any) => { return `${this.package}::${MODULES.community}::${fn}`};
    RepositoryFn = (fn:any) => { return `${this.package}::${MODULES.repository}::${fn}`};
    PermissionFn = (fn: any) => { return `${this.package}::${MODULES.permission}::${fn}`};
    PassportFn = (fn:any) => { return `${this.package}::${MODULES.passport}::${fn}`};
    GuardFn = (fn: any) => { return `${this.package}::${MODULES.guard}::${fn}`};
    VoteFn = (fn:any) => { return `${this.package}::${MODULES.vote}::${fn}`};
    DemandFn = (fn: any) => { return `${this.package}::${MODULES.demand}::${fn}`};
    OrderFn = (fn:any) => { return `${this.package}::${MODULES.order}::${fn}`};
    RewardFn = (fn: any) => { return `${this.package}::${MODULES.reward}::${fn}`};
    ServiceFn = (fn: any) => { return `${this.package}::${MODULES.service}::${fn}`};
    WowokFn = (fn: any) => { return `${this.package}::${MODULES.wowok}::${fn}`};
    

    Query = async (objects: Query_Param[], options:SuiObjectDataOptions={showContent:true}) : Promise<SuiObjectResponse[]> => {
        const client =  new SuiClient({ url: PROTOCOL.NetworkUrl() });  
        const ids = objects.map((value) => value.objectid);
        const res = await client.call('sui_multiGetObjects', [ids, options]) as SuiObjectResponse[];
        let ret:any[] = [];
        for (let i = 0; i < res.length; i ++ ) {
            objects.forEach((object) => {
                object.callback(res[i], object, options);
            })
        }   
        return res;
    } 
    Sign_Excute = async (exes: (txb:TransactionBlock, param:any) => void, priv_key:string, param?:any, options:SuiTransactionBlockResponseOptions={showObjectChanges:true}) : Promise<SuiTransactionBlockResponse> => {
        const client =  new SuiClient({ url: PROTOCOL.NetworkUrl() });  
        const txb = new TransactionBlock();
    
        exes(txb, param);
        const privkey = fromHEX(priv_key);
        const keypair = Ed25519Keypair.fromSecretKey(privkey);
    
        const response = await client.signAndExecuteTransactionBlock({
            transactionBlock: txb, 
            signer: keypair,
            options
        });
        return response;
    }
}

export type Query_Param = {
    objectid: string;
    callback: (response:SuiObjectResponse, param:Query_Param, option:SuiObjectDataOptions)=>void;
    data?: any; // response data filted by callback
};


export const PROTOCOL = new Protocol();
export const OBJECTS_TYPE_PREFIX = (Object.keys(MODULES) as Array<keyof typeof MODULES>).map((key) => { return PROTOCOL.Package() + '::' + key + '::'; })
export const OBJECTS_TYPE = (Object.keys(MODULES) as Array<keyof typeof MODULES>).map((key) => { let i = PROTOCOL.Package() + '::' + key + '::'; return i + capitalize(key); })
