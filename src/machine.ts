import { TransactionBlock, Inputs, type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS } from '@mysten/bcs';
import { PROTOCOL, FnCallType, PermissionObject, RepositoryObject, IsValidEndpoint, OptionNone, IsValidDesription, PassportObject,
    TXB_OBJECT, MachineObject, MachineAddress, IsValidArray, IsValidAddress, IsValidName, IsValidName_AllowEmpty, GuardObject, 
    IsValidInt, IsValidUint, IsValidObjects} from './protocol';
import { BCS_CONVERT, array_unique } from './utils'
import { IsValidPermissionIndex, PermissionIndexType } from './permission';


export type MachineNodeObject = TransactionResult | String;
export const INITIAL_NODE_NAME = '';
export const namedOperator_ORDER_PAYER = 'order payer';

export type Machine_Forward = {
    name: string; // foward name
    namedOperator?: string; // dynamic operator
    permission?: PermissionIndexType; // permission-index or named-operator MUST one defined.
    weight?: number;
    guard?: GuardObject;
}
export type Machine_Node_Pair = {
    prior_node: string;
    forwards: Machine_Forward[];
    threshold?: number;
}
export type Machine_Node = {
    name: string;
    description: string;
    pairs: Machine_Node_Pair[];
}

// create new nodes for machine
export function machine_add_node(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, 
    nodes:Machine_Node[], passport?:PassportObject) : boolean {
    if (!IsValidObjects([machine, permission])) return false;
    let bValid = true;
    nodes.forEach((node) => {
        if (!IsValidDesription(node.description) || !IsValidName(node.name))  { bValid = false; }

        node.pairs.forEach((p) => {
            if (!IsValidName_AllowEmpty(p.prior_node)) { bValid = false; }
            if (p?.threshold && !IsValidInt(p.threshold)) { bValid = false; }
            p.forwards.forEach((f) => {
                if (!IsValidName(f.name)) { bValid = false }
                if (f?.namedOperator && !IsValidName_AllowEmpty(f?.namedOperator)) { bValid = false }
                if (f?.permission && !IsValidPermissionIndex(f?.permission)) { bValid = false }
                if (!f?.permission && !f?.namedOperator) { bValid = false; }
                if (f?.weight && !IsValidUint(f.weight)) { bValid = false; }
            })
        })
    })
    if (!bValid) return false

    let new_nodes: MachineNodeObject[] = [];
    nodes.forEach((node) => {
        let n = txb.moveCall({
            target:PROTOCOL.NodeFn('new') as FnCallType,
            arguments:[txb.pure(node.name), txb.pure(node.description)]
        });
        node.pairs.forEach((pair) => {
            let threshold = pair?.threshold ? txb.pure(BCS_CONVERT.ser_option_u64(pair.threshold)) : OptionNone(txb);

            pair.forwards.forEach((forward) => {
                let weight = forward?.weight ? forward.weight : 1;
                let perm = forward?.permission ? txb.pure(BCS_CONVERT.ser_option_u64(forward.permission)) : OptionNone(txb); 
                let namedOperator = forward?.namedOperator ?  txb.pure(forward.namedOperator) : txb.pure('');
                let f;

                if (forward?.guard) {
                    f = txb.moveCall({ 
                        target:PROTOCOL.NodeFn('forward') as FnCallType,
                            arguments:[namedOperator, txb.pure(weight), txb.object(TXB_OBJECT(txb, forward.guard)), perm]
                    });                        
                } else {
                    f = txb.moveCall({ 
                        target:PROTOCOL.NodeFn('forward2') as FnCallType,
                            arguments:[namedOperator, txb.pure(weight), perm]
                    });                
                }
                txb.moveCall({ // add forward
                    target:PROTOCOL.NodeFn('forward_add') as FnCallType,
                        arguments:[n, txb.pure(pair.prior_node), txb.pure(forward.name),  threshold, f]
                });                
            }); 
        }); 
        new_nodes.push(n); 
    }); return machine_add_node2(txb, machine, permission, new_nodes, passport)
}
// move MachineNodeObject to the machine from signer-owned MachineNode object 
export function machine_add_node2(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, 
    nodes:MachineNodeObject[], passport?:PassportObject) : boolean {
    if (!IsValidObjects([machine, permission])) return false;
    if (!nodes) return false;

    let n: TransactionResult[] = [];
    array_unique(nodes).forEach((v) => {
        n.push(TXB_OBJECT(txb, v));
    })

    if (passport) {
        txb.moveCall({ // add node
            target:PROTOCOL.MachineFn('node_add_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, machine), txb.makeMoveVec({objects:n}), TXB_OBJECT(txb, permission)]
        });     
    } else {
        txb.moveCall({ // add node
            target:PROTOCOL.MachineFn('node_add') as FnCallType,
            arguments:[TXB_OBJECT(txb, machine), txb.makeMoveVec({objects:n}), TXB_OBJECT(txb, permission)]
        });     
    }    
    return true
}
// move MachineNodeObject from machine to signer-owned MachineNode object 
export function machine_remove_node(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, 
    nodes_name:string[], bTransferMyself:boolean = false, passport?:PassportObject) : boolean {
    if (!IsValidObjects([machine, permission])) return false;
    if (!nodes_name || !IsValidArray(nodes_name, IsValidName)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.MachineFn('node_remove_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, machine), txb.pure(BCS_CONVERT.ser_vector_string(nodes_name)), 
                txb.pure(bTransferMyself, BCS.BOOL), TXB_OBJECT(txb, permission)],
        });  
    } else {
        txb.moveCall({
            target:PROTOCOL.MachineFn('node_remove') as FnCallType,
            arguments:[TXB_OBJECT(txb, machine), txb.pure(BCS_CONVERT.ser_vector_string(nodes_name)), txb.pure(bTransferMyself, BCS.BOOL), TXB_OBJECT(txb, permission)],
        });
    } 
    return true;
}
export function machine(txb:TransactionBlock, permission:PermissionObject, description:string, 
    endpoint?:string, passport?:PassportObject) : MachineObject | boolean {
    if (!IsValidObjects([permission])) return false;    
    if (!IsValidDesription(description)) return false;
    if (endpoint && !IsValidEndpoint(endpoint)) return false;
    let ep = endpoint? txb.pure(BCS_CONVERT.ser_option_string(endpoint)) : OptionNone(txb);

    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.MachineFn('new_with_passport') as FnCallType,
            arguments:[passport, txb.pure(description), ep, TXB_OBJECT(txb, permission)],
        })
    } else {
        return txb.moveCall({
            target:PROTOCOL.MachineFn('new') as FnCallType,
            arguments:[txb.pure(description), ep, TXB_OBJECT(txb, permission)],
        })
    }
}
export function destroy(txb:TransactionBlock, machine:MachineObject) : boolean{
    if (!IsValidObjects([machine])) return false;
    txb.moveCall({
        target:PROTOCOL.MachineFn('destroy') as FnCallType,
        arguments: [TXB_OBJECT(txb, machine)],
    })  
    return true 
}
export function launch(txb:TransactionBlock, machine:MachineObject) : MachineAddress | boolean {
    if (!IsValidObjects([machine])) return false;
    return txb.moveCall({
        target:PROTOCOL.MachineFn('create') as FnCallType,
        arguments:[TXB_OBJECT(txb, machine)],
    })
}
export function machine_set_description(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, 
    description:string, passport?:PassportObject) : boolean {
    if (!IsValidObjects([machine, permission])) return false;
    if (!IsValidDesription(description)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.MachineFn('description_set_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, machine), txb.pure(description), TXB_OBJECT(txb, permission)],
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.MachineFn('description_set') as FnCallType,
            arguments:[TXB_OBJECT(txb, machine), txb.pure(description), TXB_OBJECT(txb, permission)],
        })
    }
    return true
}
export function machine_add_repository(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, 
    repository:RepositoryObject, passport?:PassportObject) : boolean {
    if (!IsValidObjects([machine, permission, repository])) return false;
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.MachineFn('repository_add_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, machine), TXB_OBJECT(txb, repository), TXB_OBJECT(txb, permission)],
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.MachineFn('repository_add') as FnCallType,
            arguments:[TXB_OBJECT(txb, machine), TXB_OBJECT(txb, repository), TXB_OBJECT(txb, permission)],
        })
    }
    return true
}

export function machine_remove_repository(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, 
    repositories:string[], removeall?:boolean, passport?:PassportObject) : boolean {
    if (!IsValidObjects([machine, permission])) return false;
    if (!removeall && !repositories) return false;
    if (!IsValidArray(repositories, IsValidAddress)) return false;

    if (passport) {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.MachineFn('repository_remove_all_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, machine), TXB_OBJECT(txb, machine)],
            })
        } else {
            txb.moveCall({
                target:PROTOCOL.MachineFn('repository_remove_with_passport') as FnCallType,
                arguments:[passport, TXB_OBJECT(txb, machine), txb.pure(repositories, 'vector<address>'), TXB_OBJECT(txb, permission)],
            })
        }   
    } else {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.MachineFn('repository_remove_all') as FnCallType,
                arguments:[TXB_OBJECT(txb, machine), TXB_OBJECT(txb, permission)],
            })
        } else {
            txb.moveCall({
                target:PROTOCOL.MachineFn('repository_remove') as FnCallType,
                arguments:[TXB_OBJECT(txb, machine), txb.pure(repositories, 'vector<address>'), TXB_OBJECT(txb, permission)],
            })
        }   
    }   
    return true  
}

export function machine_clone(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, passport?:PassportObject) : MachineObject | boolean {
    if (!IsValidObjects([machine, permission])) return false;
    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.MachineFn('clone_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, machine), TXB_OBJECT(txb, permission)],
        })
    } else {
        return txb.moveCall({
            target:PROTOCOL.MachineFn('clone') as FnCallType,
            arguments:[TXB_OBJECT(txb, machine), TXB_OBJECT(txb, permission)],
        })
    }
}
export function machine_set_endpoint(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, 
    endpoint?:string, passport?:PassportObject) : boolean {
    if (!IsValidObjects([machine, permission])) return false;
    if (endpoint && !IsValidEndpoint(endpoint)) return false;
    let ep = endpoint? txb.pure(BCS_CONVERT.ser_option_string(endpoint)) : OptionNone(txb);

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.MachineFn('endpoint_set_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, machine), ep, TXB_OBJECT(txb, permission)],
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.MachineFn('endpoint_set') as FnCallType,
            arguments:[TXB_OBJECT(txb, machine), ep, TXB_OBJECT(txb, permission)],
        })
    }
    return true
}
export function machine_pause(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, bPaused:boolean, passport?:PassportObject) : boolean {
    if (!IsValidObjects([machine, permission])) return false;
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.MachineFn('pause_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, machine), txb.pure(bPaused), TXB_OBJECT(txb, permission)],
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.MachineFn('pause') as FnCallType,
            arguments:[TXB_OBJECT(txb, machine), txb.pure(bPaused), TXB_OBJECT(txb, permission)],
        })
    }
    return true
}
export function machine_publish(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, passport?:PassportObject) : boolean {
    if (!IsValidObjects([machine, permission])) return false;
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.MachineFn('publish_with_passport') as FnCallType,
            arguments:[passport, TXB_OBJECT(txb, machine), TXB_OBJECT(txb, permission)],
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.MachineFn('publish') as FnCallType,
            arguments:[TXB_OBJECT(txb, machine), TXB_OBJECT(txb, permission)],
        })
    }
    return true
}

export function change_permission(txb:TransactionBlock, machine:MachineObject, old_permission:PermissionObject, new_permission:PermissionObject) : boolean {
    if (!IsValidObjects([machine, old_permission, new_permission])) return false;
    txb.moveCall({
        target:PROTOCOL.MachineFn('permission_set') as FnCallType,
        arguments: [TXB_OBJECT(txb, machine), TXB_OBJECT(txb, old_permission), TXB_OBJECT(txb, new_permission)],
        typeArguments:[]            
    })    
    return true
}