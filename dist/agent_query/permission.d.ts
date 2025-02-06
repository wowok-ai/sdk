/**
 * Provides permission lookup for an address:
 * not only the permission table, but also the administrator or Builder identity.
 */
import { PermissionAnswer } from '../permission';
export interface PermissionQuery {
    permission_object: string;
    address: string;
}
export declare namespace PERMISSION_QUERY {
    const permission_json: (json: string) => Promise<string>;
    const permission: (query: PermissionQuery) => Promise<PermissionAnswer>;
}
//# sourceMappingURL=permission.d.ts.map