/**
 * Provide a query interface for AI
 *
 */
import { Treasury_WithdrawMode, Treasury_Operation } from '../treasury';
import { Repository_Type, Repository_Policy_Mode, Repository_Policy } from '../repository';
import { Service_Discount_Type, Service_Sale } from '../service';
import { Machine_Node } from '../machine';
import { History } from '../progress';
export interface ObjectBase {
    object: string;
    type?: string | 'Demand' | 'Progress' | 'Service' | 'Machine' | 'Order' | 'Treasury' | 'Arbitration' | 'Arb' | 'Payment' | 'Guard' | 'Entity' | 'Permission' | 'Resource' | 'Repository' | 'TableItem_ProgressHistory' | 'TableItem_PermissionEntity' | 'TableItem_DemandPresenter' | 'TableItem_MachineNode' | 'TableItem_ServiceSale' | 'TableItem_TreasuryHistory' | 'TableItem_ArbVote' | 'TableItem_RepositoryData' | 'TableItem_ResourceMark';
    type_raw?: string;
    owner?: any;
    version?: string;
}
export interface ObjectPermission extends ObjectBase {
    builder: string;
    admin: string[];
    description: string;
    entity_count: number;
    biz_permission: {
        id: number;
        name: string;
    }[];
}
export interface TableItem_PermissionEntity extends ObjectBase {
    entity: string;
    permission: {
        id: number;
        guard?: string | null;
    }[];
}
export interface ObjectDemand extends ObjectBase {
    permission: string;
    guard?: {
        object: string;
        service_id_in_guard?: number | null;
    } | null;
    description: string;
    time_expire: string;
    yes?: string | null;
    presenter_count: number;
    bounty: {
        object: string;
        balance: string;
        type: string;
    }[];
}
export interface TableItem_DemandPresenter extends ObjectBase {
    service: string;
    presenter: string;
    recommendation: string;
}
export interface ObjectMachine extends ObjectBase {
    permission: string;
    bPaused: boolean;
    bPublished: boolean;
    consensus_repository: string[];
    description: string;
    endpoint?: string | null;
    node_count: number;
}
export interface TableItem_MachineNode extends ObjectBase {
    node: Machine_Node;
}
export interface ObjectProgressHolder {
    forward_name: string;
    holder?: string | null;
    orders: string[];
    msg: string;
    accomplished: boolean;
    time: string;
}
export interface ObjectProgressSession {
    forward: ObjectProgressHolder[];
    weights: number;
    threshold: number;
    next_node: string;
}
export interface ObjectProgress extends ObjectBase {
    machine: string;
    current: string;
    context_repository?: string | null;
    parent?: string | null;
    task?: string | null;
    session: ObjectProgressSession[];
    history_count: number;
    namedOperator: {
        name: string;
        operator: string[];
    }[];
}
export interface TableItem_ProgressHistory extends ObjectBase {
    history: History;
}
export interface ObjectService extends ObjectBase {
    permission: string;
    bPaused: boolean;
    bPublished: boolean;
    description: string;
    arbitration: string[];
    buy_guard?: string | null;
    endpoint?: string | null;
    extern_withdraw_treasuries: string[];
    machine?: string | null;
    payee: string;
    repository: string[];
    sales_count: number;
    withdraw_guard: {
        guard: string;
        percent: number;
    }[];
    refund_guard: {
        guard: string;
        percent: number;
    }[];
    customer_required_info?: {
        pubkey: string;
        required_info: string[];
    };
}
export interface TableItem_ServiceSale extends ObjectBase {
    item: Service_Sale;
}
export interface ObjectOrder extends ObjectBase {
    service: string;
    amount: string;
    balance: string;
    payer: string;
    arb: string[];
    agent: string[];
    progress?: string | null;
    discount?: string | null;
    required_info?: {
        pubkey: string;
        msg_encrypted: string;
    };
    item: Service_Sale[];
}
export interface ObjectTreasury extends ObjectBase {
    permission: string;
    description: string;
    inflow: string;
    outflow: string;
    withdraw_mode: Treasury_WithdrawMode;
    withdraw_guard: {
        guard: string;
        percent: number;
    }[];
    deposit_guard?: string | null;
    balance: string;
    history_count: number;
}
export interface TableItem_TreasuryHistory extends ObjectBase {
    id: number;
    operation: Treasury_Operation;
    signer: string;
    payment: string;
    amount: string;
    time: string;
}
export interface ObjectArbitration extends ObjectBase {
    permission: string;
    description: string;
    bPaused: boolean;
    endpoint?: string | null;
    fee: string;
    fee_treasury: string;
    usage_guard?: string | null;
    voting_guard: {
        guard: string;
        weights: number;
    }[];
}
export interface ObjectArb extends ObjectBase {
    arbitration: string;
    order: string;
    description: string;
    bWithdrawn: boolean;
    fee: string;
    feedback: string;
    indemnity?: string | null;
    proposition: {
        proposition: string;
        votes: string;
    };
    voted_count: number;
}
export interface TableItem_ArbVote extends ObjectBase {
    singer: string;
    vote: number[];
    weight: string;
    time: string;
}
export interface ObjectRepository extends ObjectBase {
    permission: string;
    description: string;
    policy_mode: Repository_Policy_Mode;
    rep_type: Repository_Type;
    reference: string[];
    policy: Repository_Policy[];
    data_count: number;
}
export interface TableItem_RepositoryData extends ObjectBase {
    address: string;
    key: string;
    data: Uint8Array;
}
export interface ObjectPayment extends ObjectBase {
    amount: string;
    for_guard?: string | null;
    for_object?: string | null;
    from?: string | null;
    biz_id: string;
    remark: string;
    signer: string;
    time: string;
    record: {
        recipient: string;
        amount: string;
    }[];
}
export interface ObjectDiscount extends ObjectBase {
    service: string;
    name: string;
    off_type: Service_Discount_Type;
    price_greater?: string | null;
    off: string;
    time_start: string;
    time_end: string;
}
export interface ObjectGuard extends ObjectBase {
    description: string;
    input: Uint8Array;
    identifier: {
        id: number;
        bWitness: boolean;
        value: Uint8Array;
    }[];
}
export interface ObjectEntity extends ObjectBase {
    address: string;
    like: number;
    dislike: number;
    name?: string;
    description?: string;
    avatar?: string;
    x?: string;
    discord?: string;
    homepage?: string;
    resource_object?: string | null;
    lastActive_digest?: string;
}
export interface ObjectResouorce_Tag {
    object: string;
    nick_name: string;
    tags: string[];
}
export interface ObjectResouorce extends ObjectBase {
    marks_count: number;
    tags: ObjectResouorce_Tag[];
}
export interface TableItem_ResourceMark extends ObjectBase {
    mark_name: string;
    objects: string[];
}
export interface ObjectsQuery {
    objects: string[];
    showType?: boolean;
    showContent?: boolean;
    showOwner?: boolean;
}
export interface ObjectsAnswer {
    objects?: ObjectBase[];
    error?: string;
}
export interface TableQuery {
    parent: string;
    cursor?: string | null | undefined;
    limit?: number | null | undefined;
}
export interface TableAnswerItem {
    key: {
        type: string;
        value: unknown;
    };
    object: string;
    version: string;
}
export interface TableAnswer {
    items: TableAnswerItem[];
    nextCursor: string | null;
    hasNextPage: boolean;
}
export declare namespace OBJECT_QUERY {
    const objects_json: (json: string) => Promise<string>;
    const table_json: (json: string) => Promise<string>;
    const objects: (query: ObjectsQuery) => Promise<ObjectsAnswer>;
    const entity: (address: string) => Promise<ObjectEntity>;
    const table: (query: TableQuery) => Promise<TableAnswer>;
    const queryTableItem_DemandPresenter: (demand_object: string | ObjectDemand, address: string) => Promise<ObjectBase>;
    const queryTableItem_PermissionEntity: (permission_object: string | ObjectDemand, address: string) => Promise<ObjectBase>;
    const queryTableItem_ArbVote: (arb_object: string | ObjectDemand, address: string) => Promise<ObjectBase>;
    const tableItemQuery_MachineNode: (machine_object: string | ObjectMachine, name: string) => Promise<ObjectBase>;
    const tableItemQuery_ServiceSale: (service_object: string | ObjectService, name: string) => Promise<ObjectBase>;
    const tableItemQuery_ProgressHistory: (progress_object: string | ObjectProgress, index: BigInt) => Promise<ObjectBase>;
    const tableItemQuery_TreasuryHistory: (treasury_object: string | ObjectTreasury, index: BigInt) => Promise<ObjectBase>;
    const tableItemQuery_RepositoryData: (repository_object: string | ObjectRepository, address: string, name: string) => Promise<ObjectBase>;
    const tableItemQuery_ResourceMark: (resource_object: string | ObjectResouorce, name: string) => Promise<ObjectBase>;
}
//# sourceMappingURL=objects.d.ts.map