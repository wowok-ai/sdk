/**
 * Provide a query interface for AI
 *
 */
import { Protocol } from '../protocol';
import { Machine } from '../machine';
import { Progress } from '../progress';
import { ERROR, Errors } from '../exception';
import { IsValidAddress, Bcs } from '../utils';
export var OBJECT_QUERY;
(function (OBJECT_QUERY) {
    /* json: ObjectsQuery string */
    OBJECT_QUERY.objects_json = async (json) => {
        try {
            const q = JSON.parse(json);
            return JSON.stringify({ data: await OBJECT_QUERY.objects(q) });
        }
        catch (e) {
            return JSON.stringify({ error: e?.toString() });
        }
    };
    /* json: TableQuery string */
    OBJECT_QUERY.table_json = async (json) => {
        try {
            const q = JSON.parse(json);
            return JSON.stringify({ data: await OBJECT_QUERY.table(q) });
        }
        catch (e) {
            return JSON.stringify({ error: e?.toString() });
        }
    };
    OBJECT_QUERY.objects = async (query) => {
        if (query.objects.length > 0) {
            const res = await Protocol.Client().multiGetObjects({ ids: query.objects,
                options: { showContent: query.showContent, showType: query.showType, showOwner: query.showOwner } });
            console.log(JSON.stringify(res));
            return { objects: res.map(v => data2object(v?.data)) };
        }
        return { objects: [] };
    };
    OBJECT_QUERY.entity = async (address) => {
        if (!IsValidAddress(address))
            ERROR(Errors.IsValidAddress, 'entity.address');
        const res = await Protocol.Client().getDynamicFieldObject({ parentId: Protocol.Instance().EntityObject(), name: { type: 'address', value: address } });
        return data2object(res?.data);
    };
    OBJECT_QUERY.table = async (query) => {
        const res = await Protocol.Client().getDynamicFields({ parentId: query.parent, cursor: query.cursor, limit: query.limit });
        return { items: res?.data?.map(v => {
                return { object: v.objectId, type: v.type, version: v.version, key: {
                        type: v.name.type, value: v.name.value
                    } };
            }), nextCursor: res.nextCursor, hasNextPage: res.hasNextPage };
    };
    OBJECT_QUERY.queryTableItem_DemandPresenter = async (demand_object, address) => {
        return await tableItem(tableItemQuery_byAddress(demand_object, address));
    };
    OBJECT_QUERY.queryTableItem_PermissionEntity = async (permission_object, address) => {
        return await tableItem(tableItemQuery_byAddress(permission_object, address));
    };
    OBJECT_QUERY.queryTableItem_ArbVote = async (arb_object, address) => {
        return await tableItem(tableItemQuery_byAddress(arb_object, address));
    };
    OBJECT_QUERY.tableItemQuery_MachineNode = async (machine_object, name) => {
        return await tableItem(tableItemQuery_byString(machine_object, name));
    };
    OBJECT_QUERY.tableItemQuery_ServiceSale = async (service_object, name) => {
        return await tableItem(tableItemQuery_byString(service_object, name));
    };
    OBJECT_QUERY.tableItemQuery_ProgressHistory = async (progress_object, index) => {
        return await tableItem(tableItemQuery_byU64(progress_object, index));
    };
    OBJECT_QUERY.tableItemQuery_TreasuryHistory = async (treasury_object, index) => {
        return await tableItem(tableItemQuery_byU64(treasury_object, index));
    };
    OBJECT_QUERY.tableItemQuery_RepositoryData = async (repository_object, address, name) => {
        if (typeof (repository_object) !== 'string') {
            repository_object = repository_object.object;
        }
        return await tableItem({ parent: repository_object, key: { type: Protocol.Instance().Package('wowok') + '::repository::DataKey', value: { id: address, key: name } } });
    };
    OBJECT_QUERY.tableItemQuery_ResourceMark = async (resource_object, name) => {
        return await tableItem(tableItemQuery_byString(resource_object, name));
    };
    function tableItemQuery_byAddress(parent, address) {
        if (typeof (parent) !== 'string') {
            parent = parent.object;
        }
        return { parent: parent, key: { type: 'address', value: address } };
    }
    function tableItemQuery_byString(parent, name) {
        if (typeof (parent) !== 'string') {
            parent = parent.object;
        }
        return { parent: parent, key: { type: '0x1::string::String', value: name } };
    }
    function tableItemQuery_byU64(parent, index) {
        if (typeof (parent) !== 'string') {
            parent = parent.object;
        }
        return { parent: parent, key: { type: 'u64', value: index } };
    }
    const tableItem = async (query) => {
        const res = await Protocol.Client().getDynamicFieldObject({ parentId: query.parent, name: { type: query.key.type, value: query.key.value } });
        return data2object(res?.data);
    };
    function data2object(data) {
        const content = data?.content?.fields;
        const id = data?.objectId ?? (content?.id?.id ?? undefined);
        const type_raw = data?.type ?? (data?.content?.type ?? undefined);
        const version = data?.version ?? undefined;
        const owner = data?.owner ?? undefined;
        const type = type_raw ? Protocol.Instance().object_name_from_type_repr(type_raw) : undefined;
        if (type) {
            switch (type) {
                case 'Permission':
                    return { object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        builder: content?.builder ?? '', admin: content?.admin, description: content?.description ?? '',
                        entity_count: parseInt(content?.table?.fields?.size),
                        biz_permission: content?.user_define?.fields?.contents?.map((v) => {
                            return { id: parseInt(v?.fields?.key), name: v?.fields?.value };
                        })
                    };
                case 'Demand':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        permission: content?.permission, description: content?.description,
                        guard: content?.guard ? { object: content?.guard, service_id_in_guard: content?.service_identifier } : undefined,
                        time_expire: content?.time_expire, yes: content?.yes,
                        presenter_count: parseInt(content?.presenters?.fields?.size),
                        bounty: content?.bounty?.map((v) => {
                            return { type: v?.fields?.type, object: v?.fields?.id?.id, balance: v?.fields?.balance };
                        })
                    };
                case 'Machine':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        permission: content?.permission ?? '', description: content?.description ?? '',
                        bPaused: content?.bPaused, bPublished: content?.bPublished, endpoint: content?.endpoint,
                        consensus_repository: content?.consensus_repositories, node_count: parseInt(content?.nodes?.fields?.size),
                    };
                case 'Progress':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        machine: content?.machine, current: content?.current, task: content?.task,
                        parent: content?.parent, history_count: parseInt(content?.history?.fields?.contents?.fields?.size),
                        namedOperator: content?.namedOperator?.fields?.contents?.map((v) => {
                            return { name: v?.fields?.key, operator: v?.fields?.value };
                        }),
                        session: content?.session?.fields?.contents?.map((v) => {
                            return { weights: v?.fields?.value?.fields?.weight, threshold: v?.fields?.value?.fields?.threshold,
                                next_node: v?.fields?.key, forward: v?.fields?.value?.fields?.forwards?.fields?.contents?.map((i) => {
                                    return { forward_name: i?.fields?.key, accomplished: i?.fields?.value?.fields?.accomplished,
                                        msg: i?.fields?.value?.fields?.msg, orders: i?.fields?.value?.fields?.orders,
                                        time: i?.fields?.value?.fields?.time, holder: i?.fields?.value?.fields?.who
                                    };
                                })
                            };
                        })
                    };
                case 'Order':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        service: content?.service, amount: content?.amount, agent: content?.agent, arb: content?.dispute,
                        payer: content?.payer, progress: content?.progress, discount: content?.discount, balance: content?.payed,
                        required_info: content?.required_info ?
                            { pubkey: content?.required_info?.fields?.customer_pub, msg_encrypted: content?.required_info?.fields?.info }
                            : undefined,
                        item: content?.items?.map((v) => {
                            return { name: v?.fields?.name, price: v?.fields?.price, stock: v?.fields?.stock, endpoint: v?.fields?.endpoint };
                        }),
                    };
                case 'Service':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        machine: content?.machine, permission: content?.permission, description: content?.description,
                        arbitration: content?.arbitrations, bPaused: content?.bPaused, bPublished: content?.bPublished,
                        buy_guard: content?.buy_guard, endpoint: content?.endpoint, payee: content?.payee, repository: content?.repositories,
                        withdraw_guard: content?.withdraw_guard?.fields?.contents?.map((v) => {
                            return { object: v?.fields?.key, percent: v?.fields?.value };
                        }),
                        refund_guard: content?.refund_guard?.fields?.contents?.map((v) => {
                            return { object: v?.fields?.key, percent: v?.fields?.value };
                        }),
                        sales_count: parseInt(content?.sales?.fields?.size), extern_withdraw_treasuries: content?.extern_withdraw_treasuries,
                        customer_required_info: content?.customer_required ?
                            { pubkey: content?.customer_required?.fields?.service_pubkey, required_info: content?.customer_required?.fields?.customer_required_info }
                            : undefined,
                    };
                case 'Treasury':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        permission: content?.permission, description: content?.description, withdraw_mode: content?.withdraw_mode,
                        history_count: parseInt(content?.history?.fields?.contents?.fields?.size), balance: content?.balance,
                        deposit_guard: content?.deposit_guard, withdraw_guard: content?.withdraw_guard?.fields?.contents?.map((v) => {
                            return { object: v?.fields?.key, percent: v?.fields?.value };
                        })
                    };
                case 'Arbitration':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        permission: content?.permission, description: content?.description, fee: content?.fee,
                        fee_treasury: content?.fee_treasury, usage_guard: content?.usage_guard,
                        endpoint: content?.endpoint, bPaused: content?.bPaused, voting_guard: content?.voting_guard?.fields?.contents?.map((v) => {
                            return { object: v?.fields?.key, weights: v?.fields?.value };
                        })
                    };
                case 'Arb':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        arbitration: content?.arbitration, description: content?.description, fee: content?.fee,
                        feedback: content?.feedback, indemnity: content?.indemnity, order: content?.order,
                        voted_count: parseInt(content?.voted?.fields?.size),
                        proposition: content?.proposition?.fields?.contents?.map((v) => {
                            return { proposition: v?.fields?.key, votes: v?.fields?.value };
                        })
                    };
                case 'Repository':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        permission: content?.permission, description: content?.description, policy_mode: content?.policy_mode,
                        data_count: parseInt(content?.data?.fields?.size), reference: content?.reference, rep_type: content?.type,
                        policy: content?.policies?.fields?.contents?.map((v) => {
                            return { key: v?.fields?.key, description: v?.fields?.value?.fields?.description,
                                permissionIndex: v?.fields?.value?.fields?.permission_index, dataType: v?.fields?.value?.fields?.value_type };
                        })
                    };
                case 'Payment':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        signer: content?.signer, time: content?.time, remark: content?.remark, from: content?.from,
                        biz_id: content?.index, for_guard: content?.for_guard, for_object: content?.for_object,
                        amount: content?.amount, record: content?.record?.map((v) => {
                            return { recipient: v?.fields?.recipient, amount: v?.fields?.amount };
                        })
                    };
                case 'Discount':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        service: content?.service, time_start: content?.time_start, time_end: content?.time_end,
                        price_greater: content?.price_greater, off_type: content?.type, off: content?.off,
                        name: content?.name
                    };
                case 'Guard':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        description: content?.description, input: Uint8Array.from(content?.input?.fields?.bytes),
                        identifier: content?.constants?.map((v) => {
                            return { id: v?.fields?.identifier, bWitness: v?.fields?.bWitness, value: Uint8Array.from(v?.fields?.value) };
                        })
                    };
                case 'Resource':
                    return {
                        object: id, type: type, type_raw: type_raw, owner: owner, version: version,
                        marks_count: parseInt(content?.marks?.fields?.size),
                        tags: content?.tags?.map((v) => {
                            return { object: v?.fields?.object, nick_name: v?.fields?.nick, tags: v?.fields?.tags };
                        })
                    };
            }
        }
        const start = type_raw?.indexOf('0x2::dynamic_field::Field<');
        if (start === 0) {
            const end = type_raw?.substring('0x2::dynamic_field::Field<'.length);
            if (end && Protocol.Instance().hasPackage(end)) {
                if (end.includes('::demand::Tips>')) {
                    return {
                        object: id, type: 'DemandTable_Presenter', type_raw: type_raw, owner: owner, version: version,
                        service: content?.name, presenter: content?.value?.fields?.who, recommendation: content?.value?.fields?.tips
                    };
                }
                else if (end.includes('::machine::NodePair>>>')) {
                    return {
                        object: id, type: 'MachineTable_Node', type_raw: type_raw, owner: owner, version: version,
                        node: { name: content?.name, pairs: Machine.rpc_de_pair(content?.value) }
                    };
                }
                else if (end.includes('::progress::History>')) {
                    return {
                        object: id, type: 'ProgressTable_History', type_raw: type_raw, owner: owner, version: version,
                        history: Progress.rpc_de_history(content)
                    };
                }
                else if (end.includes('::service::Sale>')) {
                    return {
                        object: id, type: 'ServiceTable_Sale', type_raw: type_raw, owner: owner, version: version,
                        item: { item: content?.name, stock: content?.value?.fields?.stock, price: content?.value?.fields?.price,
                            endpoint: content?.value?.fields?.endpoint
                        }
                    };
                }
                else if (end.includes('::treasury::Record>')) {
                    return {
                        object: id, type: 'TreasuryTable_History', type_raw: type_raw, owner: owner, version: version,
                        id: content?.name, payment: content?.value?.fields?.payment, signer: content?.value?.fields?.signer,
                        operation: content?.value?.fields?.op, amount: content?.value?.fields?.amount, time: content?.value?.fields?.time
                    };
                }
                else if (end.includes('::arb::Voted>')) {
                    return {
                        object: id, type: 'ArbTable_Vote', type_raw: type_raw, owner: owner, version: version,
                        singer: content?.name, vote: content?.value?.fields?.agrees, time: content?.value?.fields?.time,
                        weight: content?.value?.fields?.weight
                    };
                }
                else if (end.includes('::permission::Perm>>')) {
                    return {
                        object: id, type: 'TableItem_PermissionEntity', type_raw: type_raw, owner: owner, version: version,
                        entity: content?.name, permission: content?.value?.map((v) => {
                            return { id: v?.fields.index, guard: v?.fields.guard };
                        })
                    };
                }
                else if (end.includes('::repository::DataKey')) {
                    return {
                        object: id, type: 'TableItem_RepositoryData', type_raw: type_raw, owner: owner, version: version,
                        address: content?.name?.fields?.id, key: content?.name?.fields?.key, data: Uint8Array.from(content?.value)
                    };
                }
                else if (end.includes('::entity::Ent>')) {
                    const info = Bcs.getInstance().de_entInfo(Uint8Array.from(content?.value?.fields?.avatar));
                    return {
                        object: id, type: 'Entity', type_raw: type_raw, owner: owner, version: version,
                        address: content?.name, like: content?.value?.fields?.like, dislike: content?.value?.fields?.dislike,
                        resource_object: content?.value?.fields?.resource, lastActive_digest: data?.previousTransaction,
                        homepage: info?.homepage, name: info?.name, avatar: info?.avatar, x: info?.twitter, discord: info?.discord,
                        description: info?.description
                    };
                }
                else if (end.includes('::resource::Addresses>')) {
                    return {
                        object: id, type: 'Entity', type_raw: type_raw, owner: owner, version: version,
                        mark_name: content?.name, objects: content?.value?.fields?.addresses
                    };
                }
            }
        }
        return { object: id, type: type, type_raw: type_raw, owner: owner, version: version };
    }
})(OBJECT_QUERY || (OBJECT_QUERY = {}));
