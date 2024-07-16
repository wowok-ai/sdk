import { BCS, encodeStr, getSuiMoveConfig } from '@mysten/bcs';
import { Protocol, FnCallType, TxbObject, ResourceAddress, PermissionObject, ResourceObject} from './protocol';
import { IsValidDesription, IsValidAddress, IsValidName, isValidHttpUrl, Bcs,  } from './utils';
import { ERROR, Errors } from './exception';
import { Resource } from './resource';

export interface Entity_Info {
    name: string;
    description?: string;
    avatar?: string;
    twitter?: string;
    discord?: string;
    homepage?: string;
}

export class Entity {

    protected object:TxbObject;
    protected protocol;

    get_object() { return this.object }
    private constructor(protocol:Protocol) {
        this.protocol = protocol;
        this.object = '';
    }

    static From(protocol:Protocol) : Entity {
        let r = new Entity(protocol);
        r.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), protocol.EntityObject());
        return r
    }

    mark(resource:Resource, address:string, like:'like' | 'dislike') {
        if (!IsValidAddress(address)) ERROR(Errors.IsValidAddress, like);

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.EntityFn(like) as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, resource.get_object()), txb.pure(address, BCS.ADDRESS)]
        })
    }
 
    update(info: Entity_Info) {
        if (!IsValidName(info.name)) ERROR(Errors.IsValidName, 'update');
        if (info?.description && !IsValidDesription(info.description)) ERROR(Errors.IsValidDesription, 'update');
        if (info?.avatar && !isValidHttpUrl(info.avatar)) ERROR(Errors.isValidHttpUrl, 'update:avatar');
        if (info?.twitter && !IsValidName(info.twitter)) ERROR(Errors.IsValidName, 'update:twitter');
        if (info?.homepage && !isValidHttpUrl(info.homepage)) ERROR(Errors.isValidHttpUrl, 'update:homepage');
        if (info?.discord && !IsValidName(info.discord)) ERROR(Errors.IsValidName, 'update:discord');
        
        const txb = this.protocol.CurrentSession();
        const bytes = Bcs.getInstance().bcs.ser('PersonalInfo', {
            name:info.name ? new TextEncoder().encode(info.name) :'',
            description : info?.description ? new TextEncoder().encode(info.description) :  '',
            avatar : info?.avatar ?? '',
            twitter : info?.twitter ?? '',
            discord : info?.discord ?? '',
            homepage : info?.homepage ?? '',
        }).toBytes();    
        txb.moveCall({
            target:this.protocol.EntityFn('avatar_update') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure([].slice.call(bytes), 'vector<u8>')]
        })
    }

    create_resource() : ResourceAddress {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target:this.protocol.EntityFn('resource_create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object)]
        })
    }

    create_resource2(): ResourceObject {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target:this.protocol.EntityFn('resource_create2') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object)]
        }) 
    }
    
    destroy_resource(resource:Resource) {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target:this.protocol.EntityFn('resource_destroy') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, resource.get_object())]
        })
    }

    transfer_resource(resource:Resource, new_address:string) {
        if (!IsValidAddress(new_address)) ERROR(Errors.IsValidAddress, 'transfer_resource');
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target:this.protocol.EntityFn('resource_transfer') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, resource.get_object()), txb.pure(new_address, BCS.ADDRESS)]
        })   
    }

    query_ent(address_queried:string) {
        if (!address_queried) {
            ERROR(Errors.InvalidParam, 'query_ent');
        }

        const txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.EntityFn('QueryEnt') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(address_queried, BCS.ADDRESS)]
        })   
    }
}