export declare const PACKAGE = "0x6b9dec1b3ca2e92f366eeeff47d119712f44d3a6cef8959f95b3a09bac2c9840";
export declare const SENDER_PRIV = "0xc9bbc30f72ef7d9aa674a3be1448b9267141a676b59f3f4315231617a5bbc0e8";
export declare class Config {
    constructor();
}
export declare enum ENTRYPOINT {
    mainnet = "mainnet",
    testnet = "testnet",
    devnet = "devnet",
    localnet = "localnet"
}
export declare enum MODULES {
    machine = "machine",
    community = "community"
}
export type FnCallType = `${string}::${string}::${string}`;
export declare const ContractFn: (mod: any, fn: any) => string;
export declare const MachineFn: (fn: any) => string;
export declare const CommunityFn: (fn: any) => string;
