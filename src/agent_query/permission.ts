/**
 * Provides permission lookup for an address: 
 * not only the permission table, but also the administrator or Builder identity.
 */

import { Transaction as TransactionBlock,  } from '@mysten/sui/transactions';
import { Protocol, } from '../protocol';
import { Bcs, IsValidAddress} from '../utils'
import { Errors, ERROR}  from '../exception'
import { Permission } from '../permission';
import { BCS } from '@mysten/bcs';
import { PermissionAnswerItem, PermissionAnswer } from '../permission';

export interface PermissionQuery {
    permission_object: string;
    address: string;
}

export namespace PERMISSION_QUERY {
    /*json: PermissionQuery; return PermissionAnswer */
    export const permission_json = async (json:string) : Promise<string> => {
        try {
            const q : PermissionQuery = JSON.parse(json);
            return JSON.stringify({data:await permission(q)});
        } catch (e) {
            return JSON.stringify({error:e});
        }
    }

    export const permission = async (query:PermissionQuery) : Promise<PermissionAnswer> => {
        if (!IsValidAddress(query.permission_object)) {
            ERROR(Errors.IsValidAddress, 'permission.permission_object');
        }
        if (!IsValidAddress(query.address)) {
            ERROR(Errors.IsValidAddress, 'permission.address')
        }
        const txb = new TransactionBlock();
        const object = Permission.From(txb, query.permission_object);
        object.query_permissions_all(query.address);


        const res = await Protocol.Client().devInspectTransactionBlock({sender:query.address, transactionBlock:txb});
        if (res.results && res.results[0].returnValues && res.results[0].returnValues.length !== 3 )  {
            ERROR(Errors.Fail, 'permission.retValues')
        }

        const perm = Bcs.getInstance().de(BCS.U8, Uint8Array.from((res.results as any)[0].returnValues[0][0]));
        if (perm === Permission.PERMISSION_ADMIN || perm === Permission.PERMISSION_OWNER_AND_ADMIN) {
            return {who:query.address, admin:true, owner:perm%2===1, items:[], object:query.permission_object}
        } else {
            const perms = Bcs.getInstance().de_perms(Uint8Array.from((res.results as any)[0].returnValues[1][0]));
            return {who:query.address, admin:false, owner:perm%2===1, items:perms.map((v:any)=>{
                return {query:v?.index, permission:true, guard:v?.guard}
            }), object:query.permission_object};  
        }
    }
}
