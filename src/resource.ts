import { BCS } from '@mysten/bcs';
import { Protocol, FnCallType, TxbObject, ResourceAddress} from './protocol';
import { IsValidDesription, IsValidAddress, IsValidName, IsValidArray,  } from './utils';
import { ERROR, Errors } from './exception';
export interface Tags {
    address: string;
    nick: string;
    tags: string[];
}

export interface ResourceData {
    name: string;
    address: string[];
}

export class Resource {
    static MAX_ADDRESS_COUNT = 600;
    static MAX_TAGS = 8;

    static LikeName = "like";
    static DislikeName = "dislike";
    static FavorName = "favor";

    protected object:TxbObject;
    protected protocol;

    get_object() { return this.object }
    private constructor(protocol:Protocol) {
        this.protocol = protocol;
        this.object = '';
    }

    static From(protocol:Protocol, object:TxbObject) : Resource {
        let r = new Resource(protocol);
        r.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), object);
        return r
    }

    launch() {
        if (!this.object) ERROR(Errors.Fail, 'launch object Invalid');
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.ResourceFn('create')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object)]
        });
    }
    add(name:string, object:string[])  {
        if (!IsValidName(name)) ERROR(Errors.IsValidName, 'add');
        if (!object) ERROR(Errors.InvalidParam, 'add')
        if (!IsValidArray(object, IsValidAddress)) ERROR(Errors.IsValidArray, 'add');

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.ResourceFn('add')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(name, BCS.STRING), txb.pure(object, 'vector<address>')]
        });
    }

    add2(object:string, name:string[])  {
        if (!IsValidAddress(object)) ERROR(Errors.IsValidAddress, 'add2');
        if (!IsValidArray(name, IsValidName)) ERROR(Errors.IsValidArray, 'add2');
        if (!name) return 

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.ResourceFn('add2')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(object, BCS.ADDRESS), txb.pure(name, 'vector<string>')]
        });
    }

    remove(name:string, object:string[], removeall?:boolean)  {
        if (!IsValidName(name)) ERROR(Errors.IsValidName, 'Resource: remove');
        if (object.length===0 && !removeall) return;
        
        let txb = this.protocol.CurrentSession();
        if (removeall) {
            txb.moveCall({
                target:this.protocol.ResourceFn('remove_all')  as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(name, BCS.STRING)]
            });
        } else if(object) {
            if (!IsValidArray(object, IsValidAddress)) ERROR(Errors.IsValidArray, 'Resource: remove');

            txb.moveCall({
                target:this.protocol.ResourceFn('remove')  as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(name, BCS.STRING), txb.pure(object, 'vector<address>')]
            });
        }
    }

    remove2(object:string, name:string[])  {
        if (!IsValidAddress(object)) ERROR(Errors.IsValidAddress, 'Resource: remove2');
        if (!IsValidArray(name, IsValidName)) ERROR(Errors.InvalidParam, 'Resource: remove2');
        if (!name) return
        
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.ResourceFn('remove2')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(object, BCS.ADDRESS), txb.pure(name, 'vector<string>')]
        });
    }

    rename(old_name:string, new_name:string)  {
        if (!IsValidName(new_name)) ERROR(Errors.IsValidName, 'Resource: rename');
        
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.ResourceFn('rename')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(old_name, BCS.STRING), txb.pure(new_name, BCS.STRING)]
        }); 
    }

    add_tags(object:string, nick:string, tags:string[]) {
        if (!IsValidAddress(object)) ERROR(Errors.IsValidAddress, 'add_tags');
        if (!nick || !tags) return;
        if (!IsValidName(nick)) ERROR(Errors.IsValidName, 'add_tags');
        if (!IsValidArray(tags, IsValidName)) ERROR(Errors.IsValidArray, 'add_tags');
        if (tags.length > Resource.MAX_TAGS) ERROR(Errors.InvalidParam, 'add_tags');

        const txb = this.protocol.CurrentSession();
        const encode = new TextEncoder();

        txb.moveCall({
            target:this.protocol.ResourceFn('tags_add')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(object, BCS.ADDRESS), 
                txb.pure(nick, BCS.STRING),
                txb.pure(tags, 'vector<string>')
            ]
        });
    }

    remove_tags(object:string) {
        if (!IsValidAddress(object)) ERROR(Errors.IsValidAddress, 'Resource: remove_tags');

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.ResourceFn('tags_remove')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(object, BCS.ADDRESS)]
        });
    }
}

