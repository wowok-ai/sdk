import { BCS } from '@mysten/bcs';
import { Protocol } from './protocol';
import { IsValidDesription, IsValidUint, IsValidAddress, IsValidArgType, } from './utils';
import { Errors, ERROR } from './exception';
export class Demand {
    earnest_type;
    permission;
    object;
    protocol;
    get_earnest_type() { return this.earnest_type; }
    get_object() { return this.object; }
    static From(protocol, earnest_type, permission, object) {
        let d = new Demand(protocol, earnest_type, permission);
        d.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), object);
        return d;
    }
    constructor(protocol, earnest_type, permission) {
        this.earnest_type = earnest_type;
        this.permission = permission;
        this.protocol = protocol;
        this.object = '';
    }
    static New(protocol, earnest_type, permission, description, earnest, passport) {
        let d = new Demand(protocol, earnest_type, permission);
        if (!Protocol.IsValidObjects([permission, earnest])) {
            ERROR(Errors.IsValidObjects, 'permission, earnest');
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        if (!IsValidArgType(earnest_type)) {
            ERROR(Errors.IsValidArgType, earnest_type);
        }
        let txb = protocol.CurrentSession();
        if (passport) {
            d.object = txb.moveCall({
                target: protocol.DemandFn('new_with_passport'),
                arguments: [passport, txb.pure(description), earnest, Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [earnest_type],
            });
        }
        else {
            d.object = txb.moveCall({
                target: protocol.DemandFn('new'),
                arguments: [txb.pure(description), earnest, Protocol.TXB_OBJECT(txb, permission)],
                typeArguments: [earnest_type],
            });
        }
        return d;
    }
    launch() {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target: this.protocol.DemandFn('create'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
            typeArguments: [this.earnest_type],
        });
    }
    destroy() {
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.DemandFn('destroy'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
            typeArguments: [this.earnest_type]
        });
    }
    refund(passport) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.DemandFn('refund_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.earnest_type],
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.DemandFn('refund'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.earnest_type],
            });
        }
    }
    expand_time(minutes_duration, passport) {
        if (!IsValidUint(minutes_duration)) {
            ERROR(Errors.IsValidUint, 'minutes_duration');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.DemandFn('time_expand_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(minutes_duration, BCS.U64),
                    txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.earnest_type],
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.DemandFn('time_expand'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(minutes_duration, BCS.U64),
                    txb.object(Protocol.CLOCK_OBJECT), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.earnest_type],
            });
        }
    }
    set_guard(guard, passport) {
        if (guard && !Protocol.IsValidObjects([guard])) {
            ERROR(Errors.IsValidObjects, 'guard');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (guard) {
                txb.moveCall({
                    target: this.protocol.DemandFn('guard_set_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.earnest_type],
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.DemandFn('guard_none_with_passport'),
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.earnest_type],
                });
            }
        }
        else {
            if (guard) {
                txb.moveCall({
                    target: this.protocol.DemandFn('guard_set'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, guard),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.earnest_type],
                });
            }
            else {
                txb.moveCall({
                    target: this.protocol.DemandFn('guard_none'),
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                    typeArguments: [this.earnest_type],
                });
            }
        }
    }
    set_description(description, passport) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription);
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.DemandFn('description_set_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(description),
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.earnest_type],
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.DemandFn('description_set'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(description), Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.earnest_type],
            });
        }
    }
    yes(service_address, passport) {
        if (!IsValidAddress(service_address)) {
            ERROR(Errors.IsValidAddress);
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.DemandFn('yes_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object),
                    txb.pure(service_address, BCS.ADDRESS),
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.earnest_type],
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.DemandFn('yes'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object),
                    txb.pure(service_address, BCS.ADDRESS),
                    Protocol.TXB_OBJECT(txb, this.permission)],
                typeArguments: [this.earnest_type],
            });
        }
    }
    deposit(earnest) {
        if (!Protocol.IsValidObjects([earnest])) {
            ERROR(Errors.IsValidObjects);
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.DemandFn('deposit'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, earnest)],
            typeArguments: [this.earnest_type],
        });
    }
    present(service_address, service_pay_type, tips, passport) {
        if (!IsValidDesription(tips)) {
            ERROR(Errors.IsValidDesription, 'tips');
        }
        if (!IsValidAddress(service_address)) {
            ERROR(Errors.IsValidAddress, 'service_address');
        }
        if (!IsValidArgType(service_pay_type)) {
            ERROR(Errors.IsValidArgType, 'service_pay_type');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target: this.protocol.DemandFn('present_with_passport'),
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, service_address),
                    txb.pure(tips, BCS.STRING)],
                typeArguments: [this.earnest_type, service_pay_type],
            });
        }
        else {
            txb.moveCall({
                target: this.protocol.DemandFn('present'),
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, service_address),
                    txb.pure(tips, BCS.STRING)],
                typeArguments: [this.earnest_type, service_pay_type],
            });
        }
    }
    change_permission(new_permission) {
        if (!Protocol.IsValidObjects([new_permission])) {
            ERROR(Errors.IsValidObjects);
        }
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target: this.protocol.DemandFn('permission_set'),
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.permission), Protocol.TXB_OBJECT(txb, new_permission)],
            typeArguments: [this.earnest_type]
        });
        this.permission = new_permission;
    }
    static MAX_EARNEST_COUNT = 200;
    static MAX_PRESENTERS_COUNT = 200;
}
