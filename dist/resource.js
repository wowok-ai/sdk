import { Protocol } from './protocol';
import { IsValidAddress, IsValidName, IsValidArray, } from './utils';
import { ERROR, Errors } from './exception';
export var MarkName;
(function (MarkName) {
    MarkName["LikeName"] = "like";
    MarkName["DislikeName"] = "dislike";
    MarkName["FavorName"] = "favor";
    MarkName["LaunchName"] = "launch";
    MarkName["OrderName"] = "order";
})(MarkName || (MarkName = {}));
export class Resource {
    static MAX_ADDRESS_COUNT = 600;
    static MAX_TAGS = 8;
    object;
    txb;
    get_object() { return this.object; }
    constructor(txb) {
        this.txb = txb;
        this.object = '';
    }
    static From(txb, object) {
        let r = new Resource(txb);
        r.object = Protocol.TXB_OBJECT(txb, object);
        return r;
    }
    launch() {
        if (!this.object)
            ERROR(Errors.Fail, 'launch object Invalid');
        this.txb.moveCall({
            target: Protocol.Instance().resourceFn('create'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object)]
        });
    }
    add(name, object) {
        var bString = true;
        if (!IsValidName(name))
            ERROR(Errors.IsValidName, 'add.name');
        if (!IsValidArray(object, (item) => {
            if (typeof (item) === 'string') {
                return IsValidAddress(item);
            }
            else {
                bString = false;
            }
            return true;
        })) {
            ERROR(Errors.IsValidArray, 'add.object');
        }
        if (bString) {
            this.txb.moveCall({
                target: Protocol.Instance().resourceFn('add'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name),
                    this.txb.pure.vector('address', object)]
            });
        }
        else {
            this.txb.moveCall({
                target: Protocol.Instance().resourceFn('add'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name),
                    this.txb.makeMoveVec({ elements: object, type: 'address' })]
            });
        }
    }
    add2(object, name) {
        if (typeof (object) === 'string' && !IsValidAddress(object))
            ERROR(Errors.IsValidAddress, 'add2');
        if (!IsValidArray(name, IsValidName))
            ERROR(Errors.IsValidArray, 'add2');
        if (!name)
            return;
        this.txb.moveCall({
            target: Protocol.Instance().resourceFn('add2'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), typeof (object) === 'string' ? this.txb.pure.address(object) : object,
                this.txb.pure.vector('string', name)]
        });
    }
    remove(name, object, removeall) {
        if (!IsValidName(name))
            ERROR(Errors.IsValidName, 'Resource: remove');
        if (object.length === 0 && !removeall)
            return;
        if (removeall) {
            this.txb.moveCall({
                target: Protocol.Instance().resourceFn('remove_all'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name)]
            });
        }
        else if (object) {
            if (!IsValidArray(object, IsValidAddress))
                ERROR(Errors.IsValidArray, 'Resource: remove');
            this.txb.moveCall({
                target: Protocol.Instance().resourceFn('remove'),
                arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(name),
                    this.txb.pure.vector('address', object)]
            });
        }
    }
    remove2(object, name) {
        if (!IsValidAddress(object))
            ERROR(Errors.IsValidAddress, 'Resource: remove2');
        if (!IsValidArray(name, IsValidName))
            ERROR(Errors.InvalidParam, 'Resource: remove2');
        if (!name)
            return;
        this.txb.moveCall({
            target: Protocol.Instance().resourceFn('remove2'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(object),
                this.txb.pure.vector('string', name)]
        });
    }
    rename(old_name, new_name) {
        if (!IsValidName(new_name))
            ERROR(Errors.IsValidName, 'Resource: rename');
        this.txb.moveCall({
            target: Protocol.Instance().resourceFn('rename'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.string(old_name),
                this.txb.pure.string(new_name)]
        });
    }
    add_tags(object, nick, tags) {
        if (!IsValidAddress(object))
            ERROR(Errors.IsValidAddress, 'add_tags');
        if (!nick || !tags)
            return;
        if (!IsValidName(nick))
            ERROR(Errors.IsValidName, 'add_tags');
        if (!IsValidArray(tags, IsValidName))
            ERROR(Errors.IsValidArray, 'add_tags');
        if (tags.length > Resource.MAX_TAGS)
            ERROR(Errors.InvalidParam, 'add_tags');
        const encode = new TextEncoder();
        this.txb.moveCall({
            target: Protocol.Instance().resourceFn('tags_add'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(object),
                this.txb.pure.string(nick),
                this.txb.pure.vector('string', tags)
            ]
        });
    }
    remove_tags(object) {
        if (!IsValidAddress(object))
            ERROR(Errors.IsValidAddress, 'Resource: remove_tags');
        this.txb.moveCall({
            target: Protocol.Instance().resourceFn('tags_remove'),
            arguments: [Protocol.TXB_OBJECT(this.txb, this.object), this.txb.pure.address(object)]
        });
    }
}
