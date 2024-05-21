import { BCS } from '@mysten/bcs';
import { Protocol } from './protocol';
import { IsValidDesription, IsValidAddress, IsValidName, } from './utils';
import { ERROR, Errors } from './exception';
export class Resource {
    static MAX_WORDS_LEN = 102400;
    static IsValidWords(words) {
        return words.length <= Resource.MAX_WORDS_LEN;
    }
    object;
    protocol;
    get_object() { return this.object; }
    constructor(protocol) {
        this.protocol = protocol;
        this.object = '';
    }
    static From(protocol, object) {
        let r = new Resource(protocol);
        r.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), object);
        return r;
    }
    static New(protocol, description) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        let r = new Resource(protocol);
        let txb = protocol.CurrentSession();
        r.object = txb.moveCall({
            target: protocol.ResourceFn('new'),
            arguments: [txb.pure(description)],
        });
        return r;
    }
    launch() {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target: this.protocol.ResourceFn('create'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
        });
    }
    destroy() {
        if (!Protocol.IsValidObjects([this.object]))
            return false;
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.ResourceFn('destroy'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
        });
    }
    add(name, object) {
        if (!IsValidName(name))
            ERROR(Errors.IsValidName, 'Resource: add');
        if (!IsValidAddress(object))
            ERROR(Errors.IsValidAddress, 'Resource: add');
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.ResourceFn('add'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(name, BCS.STRING), txb.pure(object, BCS.ADDRESS)]
        });
    }
    remove(name, object, removeall) {
        if (!IsValidName(name))
            ERROR(Errors.IsValidName, 'Resource: remove');
        let txb = this.protocol.CurrentSession();
        if (removeall) {
            txb.moveCall({
                target: this.protocol.ResourceFn('remove_all'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(name, BCS.STRING)]
            });
        }
        else {
            if (!IsValidAddress(object))
                ERROR(Errors.IsValidAddress, 'Resource: remove');
            txb.moveCall({
                target: this.protocol.ResourceFn('remove'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(name, BCS.STRING), txb.pure(object, BCS.ADDRESS)]
            });
        }
    }
    rename(old_name, new_name) {
        if (!IsValidName(new_name))
            ERROR(Errors.IsValidName, 'Resource: rename');
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.ResourceFn('rename'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(old_name, BCS.STRING), txb.pure(new_name, BCS.STRING)]
        });
    }
    add_words(object, words) {
        if (!IsValidAddress(object))
            ERROR(Errors.IsValidAddress, 'Resource: add_words');
        if (!Resource.IsValidWords(words))
            ERROR(Errors.Fail, 'Resource: add_words');
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.ResourceFn('words_add'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(object, BCS.ADDRESS), txb.pure(words, BCS.STRING)]
        });
    }
    remove_words(object) {
        if (!IsValidAddress(object))
            ERROR(Errors.IsValidAddress, 'Resource: remove_words');
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.ResourceFn('words_remove'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(object, BCS.ADDRESS)]
        });
    }
}
