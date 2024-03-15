import { TransactionBlock, Inputs, type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS } from '@mysten/bcs';
import { name_data, CLOCK_OBJECT, PROTOCOL, FnCallType, description_data, MAX_ENDPOINT_LENGTH} from './protocol';
import { verify,  PassportObject} from './passport'
import { PermissionIndex, PermissionObject } from './permission'
import { RepositoryObject } from './repository';
import { BCS_CONVERT } from './util'


export type MachineAddress = TransactionResult;
export type MachineObject = TransactionResult;
export type MachineNodeObject = TransactionResult;

export const INITIAL_NODE_NAME = '';

export type Machine_Forward = {
    name: string; // foward name
    namedOperator?: string; 
    permission?: number; // permission-index or named-operator MUST one defined.
    weight?: number;
    guard_address?: string;
}
export type Machine_Node_Pair = {
    prior_node: string;
    threshold: number;
    forwards: Machine_Forward[];
}
export type Machine_Node = {
    name: string;
    description: string;
    pairs: Machine_Node_Pair[];
}

// node & forward & forward permission string length validation
export function is_valid_name(name:string):boolean { return name.length > 0 && name.length < 33 }

// 创建新的node加入到machine
export function machine_add_node(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, nodes:Machine_Node[], passport?:PassportObject) {
    let new_nodes: MachineNodeObject[] = [];
    nodes.forEach((node) => {
        let n = txb.moveCall({
            target:PROTOCOL.NodeFn('new') as FnCallType,
            arguments:[txb.pure(name_data(node.name)), txb.pure(description_data(node.description))]
        });
        node.pairs.forEach((pair) => {
            pair.forwards.forEach((forward) => {
                if (!forward?.namedOperator && !forward?.permission) { return }
                let weight = txb.pure(1); 
                if (forward?.weight && forward.weight >  0) { 
                    weight = txb.pure(forward.weight) 
                }
                
                let per = txb.pure([], BCS.U8); 
                if (forward?.permission) {
                    per = txb.pure(BCS_CONVERT.ser_option_u64(forward.permission as number));
                }; 
                let namedOperator = txb.pure('');
                if (forward?.namedOperator) {
                    namedOperator = txb.pure(forward.namedOperator)
                }; let f;

                if (forward?.guard_address) {
                    f = txb.moveCall({ 
                        target:PROTOCOL.NodeFn('forward') as FnCallType,
                            arguments:[namedOperator, weight, txb.object(forward.guard_address), per]
                    });                        
                } else {
                    f = txb.moveCall({ 
                        target:PROTOCOL.NodeFn('forward2') as FnCallType,
                            arguments:[namedOperator, weight, per]
                    });                
                }
                txb.moveCall({ // add forward
                    target:PROTOCOL.NodeFn('forward_add') as FnCallType,
                        arguments:[n, txb.pure(pair.prior_node), txb.pure(name_data(forward.name)),  
                            txb.pure(BCS_CONVERT.ser_option_u64(pair.threshold)), f]
                });                
            }); 
        }); 
        new_nodes.push(n); 
    }); machine_add_node2(txb, machine, permission, new_nodes, passport)
}
// 把个人拥有的node加入到machine
export function machine_add_node2(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, nodes:MachineNodeObject[], passport?:PassportObject) {
    if (passport) {
        txb.moveCall({ // add node
            target:PROTOCOL.MachineFn('node_add_with_passport') as FnCallType,
            arguments:[passport, machine, txb.makeMoveVec({objects:nodes}), permission]
        });     
    } else {
        txb.moveCall({ // add node
            target:PROTOCOL.MachineFn('node_add') as FnCallType,
            arguments:[machine, txb.makeMoveVec({objects:nodes}), permission]
        });     
    }    
}
// 从machine把node移动到个人地址
export function machine_remove_node(txb:TransactionBlock, machine:MachineObject, permission:TransactionResult, nodes_name:string[], receive_address:string, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.MachineFn('node_remove_with_passport') as FnCallType,
            arguments:[passport, machine, txb.pure(BCS_CONVERT.ser_vector_string(nodes_name)), permission],
        });  
    } else {
        txb.moveCall({
            target:PROTOCOL.MachineFn('node_remove') as FnCallType,
            arguments:[machine, txb.pure(BCS_CONVERT.ser_vector_string(nodes_name)), permission],
        });
    } 
}
export function machine(txb:TransactionBlock, permission:PermissionObject, description:string, endpoint_url?:string, passport?:PassportObject) : MachineObject | undefined {
    if (endpoint_url && endpoint_url.length > MAX_ENDPOINT_LENGTH) return undefined;
    let endpoint = endpoint_url? txb.pure(BCS_CONVERT.ser_option_string(endpoint_url)) : txb.pure([], BCS.U8);

    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.MachineFn('new_with_passport') as FnCallType,
            arguments:[passport, txb.pure(description_data(description)), endpoint, permission],
        })
    } else {
        //console.log(endpoint)
        return txb.moveCall({
            target:PROTOCOL.MachineFn('new') as FnCallType,
            arguments:[txb.pure(description_data(description)), endpoint, permission],
        })
    }
}
export function destroy(txb:TransactionBlock, machine:MachineObject) {
    return txb.moveCall({
        target:PROTOCOL.MachineFn('destroy') as FnCallType,
        arguments: [machine],
    })   
}
export function launch(txb:TransactionBlock, machine:MachineObject) : MachineAddress {
    return txb.moveCall({
        target:PROTOCOL.MachineFn('create') as FnCallType,
        arguments:[machine],
    })
}
export function machine_set_description(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, description:string, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.MachineFn('description_set_with_passport') as FnCallType,
            arguments:[passport, machine, txb.pure(description_data(description)), permission],
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.MachineFn('description_set') as FnCallType,
            arguments:[machine, txb.pure(description_data(description)), permission],
        })
    }
}
export function machine_add_repository(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, repository:RepositoryObject, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.MachineFn('repository_add_with_passport') as FnCallType,
            arguments:[passport, machine, repository, permission],
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.MachineFn('repository_add') as FnCallType,
            arguments:[machine, repository, permission],
        })
    }
}

export function machine_remove_repository(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, repositories:string[], removeall?:boolean, passport?:PassportObject) {
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.MachineFn('repository_remove_all_with_passport') as FnCallType,
                arguments:[passport, machine, permission],
            })
        } else {
            txb.moveCall({
                target:PROTOCOL.MachineFn('repository_remove_with_passport') as FnCallType,
                arguments:[passport, machine, txb.pure(repositories, 'vector<address>'), permission],
            })
        }   
    } else {
        if (removeall) {
            txb.moveCall({
                target:PROTOCOL.MachineFn('repository_remove_all') as FnCallType,
                arguments:[machine, permission],
            })
        } else {
            txb.moveCall({
                target:PROTOCOL.MachineFn('repository_remove') as FnCallType,
                arguments:[machine, txb.pure(repositories, 'vector<address>'), permission],
            })
        }   
    }     
}

export function machine_clone(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, passport?:PassportObject) : MachineObject {
    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.MachineFn('clone_with_passport') as FnCallType,
            arguments:[passport, machine, permission],
        })
    } else {
        return txb.moveCall({
            target:PROTOCOL.MachineFn('clone') as FnCallType,
            arguments:[machine, permission],
        })
    }
}
export function machine_set_endpoint(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, endpoint_url?:string, passport?:PassportObject) {
    if (endpoint_url && endpoint_url.length > MAX_ENDPOINT_LENGTH) return undefined;
    let endpoint = endpoint_url? txb.pure(BCS_CONVERT.ser_option_string(endpoint_url)) : txb.pure([], BCS.U8);

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.MachineFn('endpoint_set_with_passport') as FnCallType,
            arguments:[passport, machine, endpoint, permission],
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.MachineFn('endpoint_set') as FnCallType,
            arguments:[machine, endpoint, permission],
        })
    }
}
export function machine_pause(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, bPaused:boolean, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.MachineFn('pause_with_passport') as FnCallType,
            arguments:[passport, machine, txb.pure(bPaused), permission],
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.MachineFn('pause') as FnCallType,
            arguments:[machine, txb.pure(bPaused), permission],
        })
    }
}
export function machine_publish(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.MachineFn('publish_with_passport') as FnCallType,
            arguments:[passport, machine, permission],
        })
    } else {
        txb.moveCall({
            target:PROTOCOL.MachineFn('publish') as FnCallType,
            arguments:[machine, permission],
        })
    }
}

export function change_permission(txb:TransactionBlock, machine:MachineObject, old_permission:PermissionObject, new_permission:PermissionObject) {
    txb.moveCall({
        target:PROTOCOL.MachineFn('permission_set') as FnCallType,
        arguments: [machine, old_permission, new_permission],
        typeArguments:[]            
    })    
}