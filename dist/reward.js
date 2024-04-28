import { BCS } from '@mysten/bcs';
import { Protocol, } from './protocol';
import { array_unique, IsValidAddress, IsValidArgType, IsValidArray, IsValidDesription, IsValidUint, } from './utils';
import { ERROR, Errors } from './exception';
export class Reward {
    earnest_type;
    permission;
    object;
    protocol;
    get_earnest_type() { return this.earnest_type; }
    get_object() { return this.object; }
    constructor(protocol, earnest_type, permission) {
        this.protocol = protocol;
        this.earnest_type = earnest_type;
        this.permission = permission;
        this.object = '';
    }
    static From(protocol, earnest_type, permission, object) {
        let r = new Reward(protocol, earnest_type, permission);
        r.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), object);
        return r;
    }
    static New(protocol, earnest_type, permission, description, minutes_duration, passport) {
        let r = new Reward(protocol, earnest_type, permission);
        if (!Protocol.IsValidObjects([permission])) {
            ERROR(Errors.IsValidObjects, 'permission');
        }
        if (!IsValidArgType(earnest_type)) {
            ERROR(Errors.IsValidArgType, 'earnest_type');
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        if (!IsValidUint(minutes_duration)) {
            ERROR(Errors.IsValidUint, 'minutes_duration');
        }
        let txb = protocol.CurrentSession();
        if (passport) {
            r.object = txb.moveCall({
                target: protocol.RewardFn('new_with_passport'),
                arguments: [passport, txb.pure(description), txb.pure(minutes_duration, BCS.U64),
                    txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [earnest_type]
            });
        }
        else {
            r.object = txb.moveCall({
                target: protocol.RewardFn('new'),
                arguments: [txb.pure(description), txb.pure(minutes_duration, BCS.U64),
                    txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [earnest_type]
            });
        }
        return r;
    }
    launch() {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target: this.protocol.RewardFn('create'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
            typeArguments: [this.earnest_type]
        });
    }
    destroy() {
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.RewardFn('destroy'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
        });
    }
    refund(passport) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.RewardFn('refund_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.earnest_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.RewardFn('refund'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.earnest_type]
            });
        }
    }
    expand_time(minutes_expand, passport) {
        if (!IsValidUint(minutes_expand)) {
            ERROR(Errors.IsValidUint, 'minutes_expand');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.RewardFn('time_expand_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(minutes_expand, BCS.U64), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.earnest_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.RewardFn('time_expand'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(minutes_expand, BCS.U64), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.earnest_type]
            });
        }
    }
    add_guard(gurads, passport) {
        if (!gurads) {
            ERROR(Errors.InvalidParam, 'gurads');
        }
        let bValid = true;
        gurads.forEach((v) => {
            if (!IsValidUint(v.portions) || v.portions > Reward.MAX_PORTIONS_COUNT)
                bValid = false;
            if (!Protocol.IsValidObjects([v.guard]))
                bValid = false;
        });
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'gurads');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            gurads.forEach((guard) => txb.moveCall({
                target: this.protocol.RewardFn('guard_add_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object),
                    Protocol.TXB_OBJECT(txb, guard.guard), txb.pure(guard.portions, BCS.U8),
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.earnest_type]
            }));
        }
        else {
            gurads.forEach((guard) => txb.moveCall({
                target: this.protocol.RewardFn('guard_add'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard.guard),
                    txb.pure(guard.portions, BCS.U8), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.earnest_type]
            }));
        }
    }
    remove_guard(guards, removeall, passport) {
        if (!removeall && !guards) {
            ERROR(Errors.AllInvalid, 'guards & removeall');
        }
        if (guards && !IsValidArray(guards, IsValidAddress)) {
            ERROR(Errors.IsValidArray, 'guards');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (removeall) {
                txb.moveCall({
                    target: this.protocol.RewardFn('guard_remove_all_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.earnest_type]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.RewardFn('guard_remove_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(array_unique(guards), 'vector<address>'),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.earnest_type]
                });
            }
        }
        else {
            if (removeall) {
                txb.moveCall({
                    target: this.protocol.RewardFn('guard_remove_all'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.earnest_type]
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.RewardFn('guard_remove'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(guards, 'vector<address>'),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.earnest_type]
                });
            }
        }
    }
    allow_repeat_claim(allow_repeat_claim, passport) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.RewardFn('allow_repeat_claim_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission),
                    txb.pure(allow_repeat_claim, BCS.BOOL)],
                typeArguments: [this.earnest_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.RewardFn('allow_repeat_claim'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission),
                    txb.pure(allow_repeat_claim, BCS.BOOL)],
                typeArguments: [this.earnest_type]
            });
        }
    }
    set_description(description, passport) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.RewardFn('description_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(description), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.earnest_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.RewardFn('description_set'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(description), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.earnest_type]
            });
        }
    }
    lock_guards(passport) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.RewardFn('guard_lock_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.earnest_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.RewardFn('guard_lock'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.earnest_type]
            });
        }
    }
    claim(passport) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.RewardFn('claim_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.object(Protocol.CLOCK_OBJECT)],
                typeArguments: [this.earnest_type]
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.RewardFn('claim'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.object(Protocol.CLOCK_OBJECT)],
                typeArguments: [this.earnest_type]
            });
        }
        ;
    }
    deposit(rewards) {
        if (!rewards || !Protocol.IsValidObjects(rewards)) {
            ERROR(Errors.IsValidArray);
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.RewardFn('deposit'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.makeMoveVec({ objects: array_unique(rewards) })],
            typeArguments: [this.earnest_type]
        });
    }
    change_permission(new_permission) {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects);
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.RewardFn('this.permission_set'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission), Protocol.TXB_OBJECT(txb, new_permission)],
            typeArguments: [this.earnest_type]
        });
        this.permission = new_permission;
    }
    static MAX_PORTIONS_COUNT = 255;
}
