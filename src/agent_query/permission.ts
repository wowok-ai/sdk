/**
 * Provide a JSON query interface for AI
 * 
 */

import { Transaction as TransactionBlock,  } from '@mysten/sui/transactions';
import { Protocol, } from '../protocol';
import { Bcs, IsValidAddress} from '../utils'
import { Errors, ERROR}  from '../exception'
import { Permission } from '../permission';
import { BCS } from '@mysten/bcs';
import { PermissionAnswerItem, PermissionIndexType, PermissionAnswer } from '../permission';

export interface PermissionQuery {
    permission_object: string;
    address: string;
    permission: number[] | undefined; // [] or undefined for all permissions
}

export class PERMISSION_QUERY {
    /*json: PermissionQuery; return PermissionAnswer */
    static permission_json = async (json:string) : Promise<string> => {
        try {
            const q : PermissionQuery = JSON.parse(json);
            return JSON.stringify(await PERMISSION_QUERY.permission(q));
        } catch (e) {
            return JSON.stringify({error:e});
        }
    }

    static permission = async (query:PermissionQuery) : Promise<PermissionAnswer> => {
        if (!IsValidAddress(query.permission_object)) {
            ERROR(Errors.IsValidAddress, 'permission.permission_object');
        }
        if (!IsValidAddress(query.address)) {
            ERROR(Errors.IsValidAddress, 'permission.address')
        }
        const txb = new TransactionBlock();
        const object = Permission.From(txb, query.permission_object);
        if (!query.permission || query.permission.length === 0) {
            object.query_permissions_all(query.address);
        } else {
            object.query_permissions(query.address, query.permission);
        }

        const res = await Protocol.Client().devInspectTransactionBlock({sender:query.address, transactionBlock:txb});
        if (res.results && res.results[0].returnValues && res.results[0].returnValues.length !== 3 )  {
            ERROR(Errors.Fail, 'permission.retValues')
        }

        const perm = Bcs.getInstance().de(BCS.U8, Uint8Array.from((res.results as any)[0].returnValues[0][0]));
        if (perm === Permission.PERMISSION_ADMIN || perm === Permission.PERMISSION_OWNER_AND_ADMIN) {
            return {who:query.address, admin:true, owner:perm%2===1, items:[], object:query.permission_object}
        } else {
            if (!query.permission || query.permission.length === 0) {
                const perms = Bcs.getInstance().de('vector<u64>', Uint8Array.from((res.results as any)[0].returnValues[1][0]));
                const guards = Bcs.getInstance().de_guards(Uint8Array.from((res.results as any)[0].returnValues[2][0]));
                const items: PermissionAnswerItem[] = [];
                for(let i = 0; i < perms.length; ++i) {
                    items.push({query:perms[i], permission:true, guard:guards[i] ? ('0x'+guards[i]) : undefined})
                }
                return {who:query.address, admin:false, owner:perm%2===1, items:items, object:query.permission_object};  
            } else {
                const perms = Bcs.getInstance().de('vector<u8>', Uint8Array.from((res.results as any)[0].returnValues[1][0]));
                const guards = Bcs.getInstance().de('vector<address>', Uint8Array.from((res.results as any)[0].returnValues[2][0]));
                if (perms.length !== query.permission.length) {
                    ERROR(Errors.Fail, 'permission.fail')
                }

                const items: PermissionAnswerItem[] = (query.permission as PermissionIndexType[]).map((v, index) => {
                    const p = perms[index] === Permission.PERMISSION_QUERY_NONE ? false : true;
                    let g : any = undefined;
                    if (p && perms[index] < guards.length) {
                        g = '0x' + guards[perms[index] as number];
                    }
                    return {query:v, permission:p, guard:g} 
                })
                return {who:query.address, admin:false, owner:perm%2===1, items:items, object:query.permission_object};                    
            }
        }
    }
}
