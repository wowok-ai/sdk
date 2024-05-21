import { BCS } from '@mysten/bcs';
import { Protocol, FnCallType, TxbObject, ResourceAddress} from './protocol';
import { IsValidDesription, IsValidAddress, IsValidName,  } from './utils';
import { ERROR, Errors } from './exception';


export class Resource {
    static MAX_WORDS_LEN = 102400;
    static IsValidWords(words:string) : boolean {
        return words.length <= Resource.MAX_WORDS_LEN
    }

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

    static New(protocol:Protocol, description:string) : Resource {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }

        let r = new Resource(protocol);
        let txb = protocol.CurrentSession();

        r.object = txb.moveCall({
            target:protocol.ResourceFn('new') as FnCallType,
            arguments:[txb.pure(description)],
        })

        return r
    }

    launch() : ResourceAddress {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target:this.protocol.ResourceFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object)],
        })    
    }

    destroy()  {
        if (!Protocol.IsValidObjects([this.object])) return false;
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.ResourceFn('destroy') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
        })   
    }

    add(name:string, object:string)  {
        if (!IsValidName(name)) ERROR(Errors.IsValidName, 'Resource: add');
        if (!IsValidAddress(object)) ERROR(Errors.IsValidAddress, 'Resource: add');

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.ResourceFn('add')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(name, BCS.STRING), txb.pure(object, BCS.ADDRESS)]
        });
    }

    remove(name:string, object:string, removeall?:boolean)  {
        if (!IsValidName(name)) ERROR(Errors.IsValidName, 'Resource: remove');
        
        let txb = this.protocol.CurrentSession();
        if (removeall) {
            txb.moveCall({
                target:this.protocol.ResourceFn('remove_all')  as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(name, BCS.STRING)]
            });
        } else {
            if (!IsValidAddress(object)) ERROR(Errors.IsValidAddress, 'Resource: remove');

            txb.moveCall({
                target:this.protocol.ResourceFn('remove')  as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(name, BCS.STRING), txb.pure(object, BCS.ADDRESS)]
            });
        }
    }

    rename(old_name:string, new_name:string)  {
        if (!IsValidName(new_name)) ERROR(Errors.IsValidName, 'Resource: rename');
        
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.ResourceFn('rename')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(old_name, BCS.STRING), txb.pure(new_name, BCS.STRING)]
        }); 
    }

    add_words(object:string, words:string) {
        if (!IsValidAddress(object)) ERROR(Errors.IsValidAddress, 'Resource: add_words');
        if (!Resource.IsValidWords(words)) ERROR(Errors.Fail, 'Resource: add_words');

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.ResourceFn('words_add')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(object, BCS.ADDRESS), txb.pure(words, BCS.STRING)]
        });
    }

    remove_words(object:string) {
        if (!IsValidAddress(object)) ERROR(Errors.IsValidAddress, 'Resource: remove_words');

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.ResourceFn('words_remove')  as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb, this.object), txb.pure(object, BCS.ADDRESS)]
        });
    }
}

