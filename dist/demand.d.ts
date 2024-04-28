import { type TransactionResult } from '@mysten/sui.js/transactions';
import { Protocol, PassportObject, PermissionObject, GuardObject, DemandAddress, TxbObject } from './protocol';
import { Service } from './service';
export declare class Demand {
    protected earnest_type: string;
    protected permission: PermissionObject;
    protected object: TxbObject;
    protected protocol: Protocol;
    get_earnest_type(): string;
    get_object(): TxbObject;
    static From(protocol: Protocol, earnest_type: string, permission: PermissionObject, object: TxbObject): Demand;
    private constructor();
    static New(protocol: Protocol, earnest_type: string, permission: PermissionObject, description: string, earnest: TransactionResult, passport?: PassportObject): Demand;
    launch(): DemandAddress;
    destroy(): void;
    refund(passport?: PassportObject): void;
    expand_time(minutes_duration: number, passport?: PassportObject): void;
    set_guard(guard?: GuardObject, passport?: PassportObject): void;
    set_description(description: string, passport?: PassportObject): void;
    yes(service_id: string, passport?: PassportObject): void;
    deposit(earnest: TxbObject): void;
    present(service: Service, tips: string, passport?: PassportObject): void;
    change_permission(new_permission: PermissionObject): void;
    static MAX_EARNEST_COUNT: number;
    static MAX_PRESENTERS_COUNT: number;
}
//# sourceMappingURL=demand.d.ts.map