import { TxbObject } from './protocol';
import { type TransactionResult, Transaction as TransactionBlock } from '@mysten/sui/transactions';
export interface Tags {
    address: string;
    nick: string;
    tags: string[];
}
export interface ResourceData {
    name: string;
    address: string[];
}
export declare enum MarkName {
    LikeName = "like",
    DislikeName = "dislike",
    FavorName = "favor",
    LaunchName = "launch",
    OrderName = "order"
}
export declare class Resource {
    static MAX_ADDRESS_COUNT: number;
    static MAX_TAGS: number;
    protected object: TxbObject;
    protected txb: TransactionBlock;
    get_object(): TxbObject;
    private constructor();
    static From(txb: TransactionBlock, object: TxbObject): Resource;
    launch(): void;
    add(name: string, object: string[] | TransactionResult[]): void;
    add2(object: TxbObject, name: string[]): void;
    remove(name: string, object: string[], removeall?: boolean): void;
    remove2(object: string, name: string[]): void;
    rename(old_name: string, new_name: string): void;
    add_tags(object: string, nick: string, tags: string[]): void;
    remove_tags(object: string): void;
}
//# sourceMappingURL=resource.d.ts.map