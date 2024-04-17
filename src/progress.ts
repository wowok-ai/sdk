import { TransactionBlock } from '@mysten/sui.js/transactions';
import { BCS } from '@mysten/bcs';
import { FnCallType, PROTOCOL, PermissionObject, RepositoryObject, PassportObject, MachineObject, TXB_OBJECT, 
    ProgressObject, ProgressAddress, IsValidName, IsValidAddress, IsValidArray, OptionNone,  IsValidObjects, 
    IsValidInt} from './protocol';
import { BCS_CONVERT, array_unique } from './utils'

export const MAX_NAMED_OPERATOR_COUNT = 100;

export function progress(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, passport?:PassportObject) : ProgressObject | boolean {
    if (!IsValidObjects([machine, permission])) return false;
    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.ProgressFn('new_with_passport') as FnCallType,
            arguments: [passport, TXB_OBJECT(txb, machine), TXB_OBJECT(txb, permission)],
        })    
    } else {
        return txb.moveCall({
            target:PROTOCOL.ProgressFn('new') as FnCallType,
            arguments: [TXB_OBJECT(txb, machine), TXB_OBJECT(txb, permission)],
        })    
    }
}
export function launch(txb:TransactionBlock, progress:ProgressObject) : ProgressAddress | boolean {
    if (!IsValidObjects([progress])) return false;
    return txb.moveCall({
        target:PROTOCOL.ProgressFn('create') as FnCallType,
        arguments: [TXB_OBJECT(txb, progress)],
    })   
}
export function launch_as_child(txb:TransactionBlock, progress:ProgressObject, parent:ProgressObject, parent_next:ProgressNext) : ProgressAddress | boolean {
    if (!IsValidObjects([progress, parent])) return false;
    if (!IsValidProgressNext(parent_next)) return false;

    return txb.moveCall({
        target:PROTOCOL.ProgressFn('create_as_child') as FnCallType,
        arguments: [TXB_OBJECT(txb, progress), TXB_OBJECT(txb, parent), txb.pure(parent_next.next_node_name), txb.pure(parent_next.forward)],
    })   
}
export function destroy(txb:TransactionBlock, progress:ProgressObject) : boolean {
    if (!IsValidObjects([progress])) return false;
    txb.moveCall({
        target:PROTOCOL.ProgressFn('destroy') as FnCallType,
        arguments: [TXB_OBJECT(txb, progress)],
    })   
    return true
}
export function progress_set_namedOperator(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, 
    progress:ProgressObject, name:string, addresses:string[], passport?:PassportObject) : boolean {
    if (!IsValidObjects([machine, permission, progress])) return false;
    if (!IsValidName(name)) return false;
    if (!addresses || addresses.length > MAX_NAMED_OPERATOR_COUNT) return false;
    if (!IsValidArray(addresses, IsValidAddress)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ProgressFn('namedOperator_set_with_passport') as FnCallType,
            arguments: [passport, TXB_OBJECT(txb, progress), txb.pure(name, BCS.STRING), txb.pure(array_unique(addresses), 'vector<address>'), 
            TXB_OBJECT(txb, machine), TXB_OBJECT(txb, permission)],
        })  
    } else {
        txb.moveCall({
            target:PROTOCOL.ProgressFn('namedOperator_set') as FnCallType,
            arguments: [TXB_OBJECT(txb, progress), txb.pure(name, BCS.STRING), txb.pure(array_unique(addresses), 'vector<address>'), 
            TXB_OBJECT(txb, machine), TXB_OBJECT(txb, permission)],
        })  
    }  
    return true
}
export function progress_bind_task(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, 
    progress:ProgressObject, task_address:string, passport?:PassportObject) : boolean {
    if (!IsValidObjects([machine, permission, progress])) return false;
    if (!IsValidAddress(task_address)) return false;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ProgressFn('task_set_with_passport') as FnCallType,
            arguments: [passport, TXB_OBJECT(txb, progress), txb.pure(task_address, BCS.ADDRESS), TXB_OBJECT(txb, machine), TXB_OBJECT(txb, permission)],
        })   
    } else {
        txb.moveCall({
            target:PROTOCOL.ProgressFn('task_set') as FnCallType,
            arguments: [TXB_OBJECT(txb, progress), txb.pure(task_address, BCS.ADDRESS), TXB_OBJECT(txb, machine), TXB_OBJECT(txb, permission)],
        })   
    } 
    return true
}
export function progress_set_context_repository(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, 
    progress:ProgressObject, repository?:RepositoryObject, passport?:PassportObject) : boolean {
    if (!IsValidObjects([machine, permission, progress])) return false;
    if (passport) {
        if (repository) {
            txb.moveCall({
                target:PROTOCOL.ProgressFn('context_repository_set_with_passport') as FnCallType,
                arguments: [passport, TXB_OBJECT(txb, progress), TXB_OBJECT(txb, repository), TXB_OBJECT(txb, machine), TXB_OBJECT(txb, permission)],
            })            
        } else {
            txb.moveCall({
                target:PROTOCOL.ProgressFn('context_repository_none_with_passport') as FnCallType,
                arguments: [passport, TXB_OBJECT(txb, progress), TXB_OBJECT(txb, machine), TXB_OBJECT(txb, permission)],
            })           
        }
    } else {
        if (repository) {
            txb.moveCall({
                target:PROTOCOL.ProgressFn('context_repository_set') as FnCallType,
                arguments: [TXB_OBJECT(txb, progress), TXB_OBJECT(txb, repository), TXB_OBJECT(txb, machine), TXB_OBJECT(txb, permission)],
            })            
        } else {
            txb.moveCall({
                target:PROTOCOL.ProgressFn('context_repository_none') as FnCallType,
                arguments: [TXB_OBJECT(txb, progress), TXB_OBJECT(txb, machine), TXB_OBJECT(txb, permission)],
            })           
        }
    }
    return true
}
export function progress_unhold(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, 
    progress:ProgressObject, next:ProgressNext, passport?:PassportObject) : boolean {
    if (!IsValidObjects([machine, permission, progress])) return false;
    if (!IsValidProgressNext(next)) return false;
    
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ProgressFn('unhold_with_passport') as FnCallType,
            arguments: [passport, TXB_OBJECT(txb, progress), TXB_OBJECT(txb, machine), txb.pure(next.next_node_name), txb.pure(next.forward), TXB_OBJECT(txb, permission)],
        })     
    } else {
        txb.moveCall({
            target:PROTOCOL.ProgressFn('unhold') as FnCallType,
            arguments: [TXB_OBJECT(txb, progress), TXB_OBJECT(txb, machine), txb.pure(next.next_node_name), txb.pure(next.forward), TXB_OBJECT(txb, permission)],
        })           
    }

    return true
}

export type ParentProgress = {
    parent_progress_id: string;
    parent_session_id: number;
}
export function progress_parent(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, progress:ProgressObject, 
    parent_progress?:ParentProgress, passport?:PassportObject) : boolean {
    if (!IsValidObjects([machine, permission, progress])) return false;
    if (parent_progress && (!IsValidAddress(parent_progress.parent_progress_id) || !IsValidInt(parent_progress.parent_session_id))) return false;

    if (passport) {
        if (parent_progress) {
            txb.moveCall({
                target:PROTOCOL.ProgressFn('parent_set_with_passport') as FnCallType,
                arguments: [passport, TXB_OBJECT(txb, progress), TXB_OBJECT(txb, machine), txb.pure(parent_progress.parent_progress_id, BCS.ADDRESS), 
                    txb.pure(parent_progress.parent_session_id, BCS.U64), TXB_OBJECT(txb, permission)],
            })  
        } else {
            txb.moveCall({
                target:PROTOCOL.ProgressFn('parent_none_with_passport') as FnCallType,
                arguments: [passport, TXB_OBJECT(txb, progress), TXB_OBJECT(txb, machine), TXB_OBJECT(txb, permission)],
            }) 
        }
    } else {
        if (parent_progress) {
            txb.moveCall({
                target:PROTOCOL.ProgressFn('parent_set') as FnCallType,
                arguments: [TXB_OBJECT(txb, progress), TXB_OBJECT(txb, machine), txb.pure(parent_progress.parent_progress_id, BCS.ADDRESS), 
                    txb.pure(parent_progress.parent_session_id, BCS.U64), TXB_OBJECT(txb, permission)],
            })  
        } else {
            txb.moveCall({
                target:PROTOCOL.ProgressFn('parent_none') as FnCallType,
                arguments: [TXB_OBJECT(txb, progress), TXB_OBJECT(txb, machine), TXB_OBJECT(txb, permission)],
            }) 
        } 
    }

    return true
}

export type ProgressNext = {
    next_node_name: string;
    forward: string;
}
function IsValidProgressNext(next:ProgressNext) : boolean {
    return IsValidName(next.forward)  && IsValidName(next.next_node_name);
}

export function next(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, progress:ProgressObject, 
    next:ProgressNext, deliverables_address?:string, sub_progress_id?:string, passport?:PassportObject) : boolean {
    if (!IsValidObjects([machine, permission, progress])) return false;
    if (!IsValidProgressNext(next)) return false;
    if (deliverables_address && !IsValidAddress(deliverables_address)) return false;
    if (sub_progress_id && !IsValidAddress(sub_progress_id)) return false;

    let diliverable = deliverables_address? txb.pure(BCS_CONVERT.ser_option_address(deliverables_address)) : OptionNone(txb)
    let sub = sub_progress_id? txb.pure(BCS_CONVERT.ser_option_address(sub_progress_id)) : OptionNone(txb)
    
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ProgressFn('next_with_passport') as FnCallType,
            arguments: [passport, TXB_OBJECT(txb, progress), TXB_OBJECT(txb, machine), txb.pure(next.next_node_name, BCS.STRING), 
                txb.pure(next.forward, BCS.STRING), diliverable, sub, TXB_OBJECT(txb, permission)],
        })    
    } else {
        txb.moveCall({
            target:PROTOCOL.ProgressFn('next') as FnCallType,
            arguments: [TXB_OBJECT(txb, progress), TXB_OBJECT(txb, machine), txb.pure(next.next_node_name, BCS.STRING), 
                txb.pure(next.forward, BCS.STRING), diliverable, sub, TXB_OBJECT(txb, permission)],
        })               
    }
    return true
}

export function hold(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, progress:ProgressObject, 
    next:ProgressNext, hold:boolean) : boolean {
    if (!IsValidObjects([machine, permission, progress])) return false;
    if (!IsValidProgressNext(next)) return false;

    txb.moveCall({
        target:PROTOCOL.ProgressFn('hold') as FnCallType,
        arguments: [TXB_OBJECT(txb, progress), TXB_OBJECT(txb, machine), txb.pure(next.next_node_name), 
            txb.pure(next.forward), txb.pure(hold, BCS.BOOL), TXB_OBJECT(txb, permission)],
    })  
    return true
}


