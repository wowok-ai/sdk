import { TxbObject, ResourceAddress, ResourceObject } from './protocol';
import { MarkName, Resource } from './resource';
import { Transaction as TransactionBlock } from '@mysten/sui/transactions';
export interface Safer {
    name: string;
    value: string;
}
export interface Entity_Info {
    name: string;
    description?: string;
    avatar?: string;
    twitter?: string;
    discord?: string;
    homepage?: string;
}
export declare class Entity {
    protected object: TxbObject;
    protected txb: TransactionBlock;
    get_object(): TxbObject;
    private constructor();
    static From(txb: TransactionBlock): Entity;
    mark(resource: Resource, address: string, like: MarkName.LikeName | MarkName.DislikeName): void;
    update(info: Entity_Info): void;
    create_resource(): ResourceAddress;
    create_resource2(): ResourceObject;
    destroy_resource(resource: Resource): import("@mysten/sui/transactions").TransactionResult;
    transfer_resource(resource: Resource, new_address: string): import("@mysten/sui/transactions").TransactionResult;
    query_ent(address_queried: string): void;
}
//# sourceMappingURL=entity.d.ts.map