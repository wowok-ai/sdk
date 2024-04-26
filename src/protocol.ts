import { SuiClient, SuiObjectResponse, SuiObjectDataOptions, SuiTransactionBlockResponseOptions, 
    SuiTransactionBlockResponse, SuiObjectChange } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { BCS, getSuiMoveConfig, toHEX, fromHEX, BcsReader } from '@mysten/bcs';
import { TransactionBlock, Inputs, TransactionResult, TransactionArgument } from '@mysten/sui.js/transactions';
import { capitalize, IsValidArray } from './utils.js'
import { VariableType } from './guard.js';


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

export type PermissionAddress = TransactionResult;
export type PermissionObject = TransactionResult | string;
export type RepositoryAddress = TransactionResult;
export type RepositoryObject = TransactionResult | string;
export type GuardAddress = TransactionResult;
export type GuardObject = TransactionResult | string ;
export type MachineAddress = TransactionResult;
export type MachineObject = TransactionResult | string;
export type PassportObject = TransactionResult;
export type DemandAddress = TransactionResult;
export type DemandObject = TransactionResult | string;
export type ServiceObject = TransactionResult  | string;
export type ServiceAddress = TransactionResult;
export type ProgressObject = TransactionResult | string;
export type ProgressAddress = TransactionResult;
export type RewardObject = TransactionResult | string;
export type RewardAddress = TransactionResult;
export type OrderObject = TransactionResult | string;
export type OrderAddress = TransactionResult;
export type DiscountObject = TransactionResult | string;
export type CoinObject = TransactionResult | string;
export type VoteObject = TransactionResult | string;
export type VoteAddress = TransactionResult;

export type TxbObject = string | TransactionResult | GuardObject |  RepositoryObject | PermissionObject | MachineObject | PassportObject |
    DemandObject | ServiceObject | RewardObject | OrderObject | DiscountObject | VoteObject | DemandObject;

export type WowokObject = TransactionResult;
export type FnCallType = `${string}::${string}::${string}`;

export enum OperatorType {
    TYPE_QUERY = 1, // query wowok object
    TYPE_FUTURE_QUERY = 2,
    TYPE_QUERY_FROM_CONTEXT = 3, 

    TYPE_LOGIC_OPERATOR_U128_GREATER = 11,
    TYPE_LOGIC_OPERATOR_U128_GREATER_EQUAL = 12,
    TYPE_LOGIC_OPERATOR_U128_LESSER = 13,
    TYPE_LOGIC_OPERATOR_U128_LESSER_EQUAL = 14,
    TYPE_LOGIC_OPERATOR_U128_EQUAL = 15,
    TYPE_LOGIC_OPERATOR_EQUAL = 16, // TYPE&DATA(vector<u8>) MUST BE EQUAL
    TYPE_LOGIC_OPERATOR_HAS_SUBSTRING = 17, // SUBSTRING
    TYPE_LOGIC_ALWAYS_TRUE = 18, // aways true
}

export enum ContextType {
    TYPE_CONTEXT_SIGNER  = 60,
    TYPE_CONTEXT_CLOCK = 61,
    TYPE_CONTEXT_FUTURE_ID = 62, 
    
    TYPE_CONTEXT_bool = 70,
    TYPE_CONTEXT_address = 71,
    TYPE_CONTEXT_u64 = 72,
    TYPE_CONTEXT_u8 = 73,
    TYPE_CONTEXT_vec_u8 = 74,
 /*   TYPE_CONTEXT_u128 = 75,
    TYPE_CONTEXT_vec_address = 76,
    TYPE_CONTEXT_vec_bool = 77,
    TYPE_CONTEXT_vec_vec_u8 = 78,
    TYPE_CONTEXT_vec_u64 = 79,
    TYPE_CONTEXT_vec_u128 = 80,
    TYPE_CONTEXT_option_address = 81,
    TYPE_CONTEXT_option_bool = 82,
    TYPE_CONTEXT_option_u8 = 83,
    TYPE_CONTEXT_option_u64 = 84,
    TYPE_CONTEXT_option_u128 = 85,*/
}

export enum ValueType {
    TYPE_STATIC_bool = 100,
    TYPE_STATIC_address = 101,
    TYPE_STATIC_u64 = 102,
    TYPE_STATIC_u8 = 103,
    TYPE_STATIC_vec_u8 = 104,
    TYPE_STATIC_u128 = 105,
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
}

export type Data_Type = ValueType | OperatorType | ContextType;

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
    protected graphql = '';
    protected txb:any;

    constructor(network:ENTRYPOINT, signer_address:string) {
        this.signer = signer_address;
        this.UseNetwork(network);
        this.NewSession();
    }
    UseNetwork(network:ENTRYPOINT=ENTRYPOINT.testnet) {
        this.network = network;
        switch(network) {
            case ENTRYPOINT.localnet:
                this.package = "0xe9721254e97dd074e06c5efe5c57be169b64b39ae48939d89c00bf2f62b19e10";
                this.everyone_guard = "0xb2a3fe7881cb883743c4e962b7e3c7716a1cd47a67adad01dc79795def4f769d";
                break;
            case ENTRYPOINT.devnet:
                break;
            case ENTRYPOINT.testnet:
                this.package = "0xf4233055f40a9f301c85c020496b58ad761fdd2cd6a5d82da7a912adb4608f7f";
                this.everyone_guard = "0x78a41fcc4f566360839613f6b917fb101ae015e56b43143f496f265b6422fddc";
                this.graphql = 'https://sui-testnet.mystenlabs.com/graphql';
                break;
            case ENTRYPOINT.mainnet:
                break;
        };
    }
    Package(): string { return this.package }
    EveryoneGuard(): string { return this.everyone_guard }
    GraphqlUrl() : string { return this.graphql }
    
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
        const client =  new SuiClient({ url: this.NetworkUrl() });  
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
    NewSession = () : TransactionBlock => {
        this.txb = new  TransactionBlock();
        return this.txb
    }
    CurrentSession = () : TransactionBlock => { return this.txb }

    SignExcute = async (exes: ((protocol:Protocol, param:any) => void)[], priv_key:string, param?:any, options:SuiTransactionBlockResponseOptions={showObjectChanges:true}) : Promise<SuiTransactionBlockResponse> => {
        const client =  new SuiClient({ url: this.NetworkUrl() });  
        const txb = new TransactionBlock();

        exes.forEach((e) => { e(this, param) });

        const privkey = fromHEX(priv_key);
        const keypair = Ed25519Keypair.fromSecretKey(privkey);
    
        const response = await client.signAndExecuteTransactionBlock({
            transactionBlock: txb, 
            signer: keypair,
            options,
            
        });
        return response;
    }
    static SUI_COIN_TYPE = '0x2::coin::Coin<0x2::sui::SUI>';
    static CLOCK_OBJECT = Inputs.SharedObjectRef({
        objectId:"0x6",
        mutable: false,
        initialSharedVersion: 1,
    });
    static TXB_OBJECT(txb:TransactionBlock, arg:TxbObject) : TransactionResult {
        if (typeof arg == 'string') return txb.object(arg) as TransactionResult;
        return arg;
    }
    static IsValidObjects = (arr:TxbObject[]) : boolean => { 
        return IsValidArray(arr, (v:TxbObject)=>{ 
            if (!v)  return false
            return true
        })
    }  

    WOWOK_COIN_TYPE = () => {return '0x2::coin::Coin<' + this.package + '::wowok::WOWOK'}
    WOWOK_OBJECTS_TYPE = () => (Object.keys(MODULES) as Array<keyof typeof MODULES>).map((key) => 
        { let i = this.package + '::' + key + '::';  return i + capitalize(key); })
    WOWOK_OBJECTS_PREFIX_TYPE = () => (Object.keys(MODULES) as Array<keyof typeof MODULES>).map((key) => 
        { return this.package + '::' + key + '::'; })
}

export class RpcResultParser {
    static Object_Type_Extra = () => {
        let names = (Object.keys(MODULES) as Array<keyof typeof MODULES>).map((key) => { return key + '::' + capitalize(key); });
        names.push('order::Discount');
        return names;
    }
    static objectids_from_response = (protocol:Protocol, response:SuiTransactionBlockResponse, concat_result?:Map<string, string[]>): Map<string, string[]> => {
        let ret = new Map<string, string[]>();
        if (response?.objectChanges) {
            response.objectChanges.forEach((change) => {
                RpcResultParser.Object_Type_Extra().forEach((name) => {
                    let type = protocol.Package() + '::' + name;
                    if (change.type == 'created' && change.objectType.includes(type)) {
                        if (ret.has(name)) {
                            ret.get(name)?.push(change.objectId);
                        } else {
                            ret.set(name, [change.objectId]);
                        }
                    }                    
                })
            });    
        }
        if (concat_result) {
            ret.forEach((value, key) => {
                if (concat_result.has(key)) {
                    concat_result.set(key, concat_result.get(key)!.concat(value));
                } else {
                    concat_result.set(key, value);
                }
            })
        }
        return ret;
    }
}

export type Query_Param = {
    protocol: Protocol;
    objectid: string;
    callback: (response:SuiObjectResponse, param:Query_Param, option:SuiObjectDataOptions)=>void;
    parser?: (result:any[], guardid: string, chain_sense_bsc:Uint8Array, variable?:VariableType)  => boolean;
    data?: any; // response data filted by callback
    variables?: VariableType;
};
