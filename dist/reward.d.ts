import { type TransactionResult } from '@mysten/sui.js/transactions';
import { GuardObject, PassportObject, PermissionObject, RewardAddress, Protocol, TxbObject } from './protocol.js';
export type CoinReward = TransactionResult;
export type RewardGuardPortions = {
    guard: GuardObject;
    portions: number;
};
export declare class Reward {
    protected earnest_type: string;
    protected permission: any;
    protected object: TxbObject;
    protected protocol: Protocol;
    get_earnest_type(): string;
    get_object(): any;
    private constructor();
    static From(protocol: Protocol, earnest_type: string, permission: PermissionObject, object: TxbObject): Reward;
    static New(protocol: Protocol, earnest_type: string, permission: PermissionObject, description: string, minutes_duration: number, passport?: PassportObject): Reward;
    launch(): RewardAddress;
    destroy(): void;
    refund(passport?: PassportObject): void;
    expand_time(minutes_expand: number, passport?: PassportObject): void;
    add_guard(gurads: RewardGuardPortions[], passport?: PassportObject): void;
    remove_guard(guards: string[], removeall?: boolean, passport?: PassportObject): void;
    allow_repeat_claim(allow_repeat_claim: boolean, passport?: PassportObject): void;
    set_description(description: string, passport?: PassportObject): void;
    lock_guards(passport?: PassportObject): void;
    claim(passport?: PassportObject): void;
    deposit(rewards: CoinReward[]): void;
    change_permission(new_permission: PermissionObject): void;
    static MAX_PORTIONS_COUNT: number;
}
//# sourceMappingURL=reward.d.ts.map