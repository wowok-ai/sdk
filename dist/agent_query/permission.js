/**
 * Provides permission lookup for an address:
 * not only the permission table, but also the administrator or Builder identity.
 */
import { Transaction as TransactionBlock, } from '@mysten/sui/transactions';
import { Protocol, } from '../protocol';
import { Bcs, IsValidAddress } from '../utils';
import { Errors, ERROR } from '../exception';
import { Permission } from '../permission';
import { BCS } from '@mysten/bcs';
export var PERMISSION_QUERY;
(function (PERMISSION_QUERY) {
    /*json: PermissionQuery; return PermissionAnswer */
    PERMISSION_QUERY.permission_json = async (json) => {
        try {
            const q = JSON.parse(json);
            return JSON.stringify({ data: await PERMISSION_QUERY.permission(q) });
        }
        catch (e) {
            return JSON.stringify({ error: e });
        }
    };
    PERMISSION_QUERY.permission = async (query) => {
        if (!IsValidAddress(query.permission_object)) {
            ERROR(Errors.IsValidAddress, 'permission.permission_object');
        }
        if (!IsValidAddress(query.address)) {
            ERROR(Errors.IsValidAddress, 'permission.address');
        }
        const txb = new TransactionBlock();
        const object = Permission.From(txb, query.permission_object);
        object.query_permissions_all(query.address);
        const res = await Protocol.Client().devInspectTransactionBlock({ sender: query.address, transactionBlock: txb });
        if (res.results && res.results[0].returnValues && res.results[0].returnValues.length !== 3) {
            ERROR(Errors.Fail, 'permission.retValues');
        }
        const perm = Bcs.getInstance().de(BCS.U8, Uint8Array.from(res.results[0].returnValues[0][0]));
        if (perm === Permission.PERMISSION_ADMIN || perm === Permission.PERMISSION_OWNER_AND_ADMIN) {
            return { who: query.address, admin: true, owner: perm % 2 === 1, items: [], object: query.permission_object };
        }
        else {
            const perms = Bcs.getInstance().de('vector<u64>', Uint8Array.from(res.results[0].returnValues[1][0]));
            const guards = Bcs.getInstance().de_guards(Uint8Array.from(res.results[0].returnValues[2][0]));
            const items = [];
            for (let i = 0; i < perms.length; ++i) {
                items.push({ query: perms[i], permission: true, guard: guards[i] ? ('0x' + guards[i]) : undefined });
            }
            return { who: query.address, admin: false, owner: perm % 2 === 1, items: items, object: query.permission_object };
        }
    };
})(PERMISSION_QUERY || (PERMISSION_QUERY = {}));
