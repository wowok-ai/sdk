import { Protocol } from './protocol';
import { IsValidDesription, IsValidAddress, IsValidName, isValidHttpUrl, Bcs, } from './utils';
import { ERROR, Errors } from './exception';
export class Entity {
    object;
    txb;
    get_object() { return this.object; }
    constructor(txb) {
        this.txb = txb;
        this.object = '';
    }
    static From(txb) {
        let r = new Entity(txb);
        r.object = Protocol.TXB_OBJECT(txb, Protocol.Instance().objectEntity());
        return r;
    }
    mark(resource, address, like) {
        if (!IsValidAddress(address))
            ERROR(Errors.IsValidAddress, like);
        this.txb.moveCall({
            target: Protocol.Instance().entityFn(like),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, resource.get_object()),
                this.txb.pure.address(address)]
        });
    }
    /*
    add_safer(safer: Safer[], bExistModify:boolean=true) {
        if (safer.length === 0) return ;
        if (!IsValidArray(safer, (v:Safer) => {
            if (!IsValidName(v.name) || !IsValidDesription(v.value)) {
                return false
            }
        })) {
            ERROR(Errors.InvalidParam, 'add_safer');
        }

        const name = safer.map((v)=>v.name);
        const value = safer.map((v)=>v.value);
        this.txb.moveCall({
            target:Protocol.Instance().entityFn('safer_add') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', name),
                this.txb.pure.vector('string', value),  this.txb.pure.bool(bExistModify)]
        })
    }

    remove_safer(name:string[], removeall?:boolean) {
        if (name.length === 0 && !removeall) return;

        if (removeall) {
            this.txb.moveCall({
                target:Protocol.Instance().entityFn('safer_remove_all') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object)]
            })
        } else {
            this.txb.moveCall({
                target:Protocol.Instance().entityFn('safer_remove') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('string', name)]
            })
        }
    }*/
    update(info) {
        if (info?.name && !IsValidName(info.name))
            ERROR(Errors.IsValidName, 'update');
        if (info?.description && !IsValidDesription(info.description))
            ERROR(Errors.IsValidDesription, 'update');
        if (info?.avatar && !isValidHttpUrl(info.avatar))
            ERROR(Errors.isValidHttpUrl, 'update:avatar');
        if (info?.twitter && !IsValidName(info.twitter))
            ERROR(Errors.IsValidName, 'update:twitter');
        if (info?.homepage && !isValidHttpUrl(info.homepage))
            ERROR(Errors.isValidHttpUrl, 'update:homepage');
        if (info?.discord && !IsValidName(info.discord))
            ERROR(Errors.IsValidName, 'update:discord');
        const bytes = Bcs.getInstance().bcs.ser('PersonalInfo', {
            name: info.name ? new TextEncoder().encode(info.name) : '',
            description: info?.description ? new TextEncoder().encode(info.description) : '',
            avatar: info?.avatar ?? '',
            twitter: info?.twitter ?? '',
            discord: info?.discord ?? '',
            homepage: info?.homepage ?? '',
        }).toBytes();
        this.txb.moveCall({
            target: Protocol.Instance().entityFn('avatar_update'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.vector('u8', [].slice.call(bytes))]
        });
    }
    create_resource() {
        return this.txb.moveCall({
            target: Protocol.Instance().entityFn('resource_create'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object)]
        });
    }
    create_resource2() {
        return this.txb.moveCall({
            target: Protocol.Instance().entityFn('resource_create2'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object)]
        });
    }
    destroy_resource(resource) {
        return this.txb.moveCall({
            target: Protocol.Instance().entityFn('resource_destroy'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, resource.get_object())]
        });
    }
    transfer_resource(resource, new_address) {
        if (!IsValidAddress(new_address))
            ERROR(Errors.IsValidAddress, 'transfer_resource');
        return this.txb.moveCall({
            target: Protocol.Instance().entityFn('resource_transfer'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), Protocol.TXB_OBJECT(this.txb, resource.get_object()),
                this.txb.pure.address(new_address)]
        });
    }
    query_ent(address_queried) {
        if (!IsValidAddress(address_queried)) {
            ERROR(Errors.InvalidParam, 'query_ent');
        }
        this.txb.moveCall({
            target: Protocol.Instance().entityFn('QueryEnt'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(address_queried)]
        });
    }
}
