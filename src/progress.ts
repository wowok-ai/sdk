import { SuiClient, getFullnodeUrl, SuiObjectResponse } from '@mysten/sui.js/client';
import { TransactionBlock, Inputs, type TransactionResult } from '@mysten/sui.js/transactions';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { BCS, getSuiMoveConfig, toHEX, fromHEX, BcsReader } from '@mysten/bcs';
import { name_data, FnCallType, PROTOCOL,} from './protocol';
import { verify,  PassportObject} from './passport'
import { PermissionIndex, PermissionObject } from './permission'
import { RepositoryObject } from './repository';
import { MachineObject } from './machine';

export type ProgressObject = TransactionResult;
export type ProgressAddress = TransactionResult;
export const MAX_NAMED_OPERATOR_COUNT = 64;

export function progress(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, passport?:PassportObject) : ProgressObject {
    if (passport) {
        return txb.moveCall({
            target:PROTOCOL.ProgressFn('new_with_passport') as FnCallType,
            arguments: [passport, machine, permission],
        })    
    } else {
        return txb.moveCall({
            target:PROTOCOL.ProgressFn('new') as FnCallType,
            arguments: [machine, permission],
        })    
    }
}
export function launch(txb:TransactionBlock, progress:ProgressObject) : ProgressAddress {
    return txb.moveCall({
        target:PROTOCOL.ProgressFn('create') as FnCallType,
        arguments: [progress],
    })   
}
export function launch_as_child(txb:TransactionBlock, progress:ProgressObject, parent:ProgressObject, parent_next:ProgressNext) : ProgressAddress {
    return txb.moveCall({
        target:PROTOCOL.ProgressFn('create_as_child') as FnCallType,
        arguments: [progress, parent, txb.pure(parent_next.next_node_name), txb.pure(name_data(parent_next.forward))],
    })   
}
export function destroy(txb:TransactionBlock, progress:ProgressObject) {
    return txb.moveCall({
        target:PROTOCOL.ProgressFn('destroy') as FnCallType,
        arguments: [progress],
    })   
}
export function progress_set_namedOperator(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, progress:ProgressObject, name:string, addresses:string[], passport?:PassportObject) {
    if (addresses.length == 0 || name.length == 0 || addresses.length > MAX_NAMED_OPERATOR_COUNT) return undefined;

    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ProgressFn('namedOperator_set_with_passport') as FnCallType,
            arguments: [passport, progress, txb.pure(name_data(name)), txb.pure(addresses, 'vector<address>'), 
                machine, permission],
        })  
    } else {
        txb.moveCall({
            target:PROTOCOL.ProgressFn('namedOperator_set') as FnCallType,
            arguments: [progress, txb.pure(name_data(name)), txb.pure(addresses, 'vector<address>'), 
                machine, permission],
        })  
    }  
}
export function progress_bind_task(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, progress:ProgressObject, task_address:string, passport?:PassportObject) {
    if (passport) {
        txb.moveCall({
            target:PROTOCOL.ProgressFn('task_set_with_passport') as FnCallType,
            arguments: [passport, progress, txb.pure(task_address, BCS.ADDRESS), machine, permission],
        })   
    } else {
        txb.moveCall({
            target:PROTOCOL.ProgressFn('task_set') as FnCallType,
            arguments: [progress, txb.pure(task_address, BCS.ADDRESS), machine, permission],
        })   
    } 
}
export function progress_set_context_repository(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, progress:ProgressObject, repository?:RepositoryObject, passport?:PassportObject) {
    if (passport) {
        if (repository) {
            txb.moveCall({
                target:PROTOCOL.ProgressFn('context_repository_set_with_passport') as FnCallType,
                arguments: [passport, progress, repository, machine, permission],
            })            
        } else {
            txb.moveCall({
                target:PROTOCOL.ProgressFn('context_repository_none_with_passport') as FnCallType,
                arguments: [passport, progress, machine, permission],
            })           
        }
    } else {
        if (repository) {
            txb.moveCall({
                target:PROTOCOL.ProgressFn('context_repository_set') as FnCallType,
                arguments: [progress, repository, machine, permission],
            })            
        } else {
            txb.moveCall({
                target:PROTOCOL.ProgressFn('context_repository_none') as FnCallType,
                arguments: [progress, machine, permission],
            })           
        }
    }
}
export function progress_unhold(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, progress:ProgressObject, next:ProgressNext) {
    txb.moveCall({
        target:PROTOCOL.ProgressFn('unhold') as FnCallType,
        arguments: [progress, machine, txb.pure(next.next_node_name), txb.pure(name_data(next.forward)), permission],
    })   
}

export type ProgressNext = {
    next_node_name: string;
    forward: string;
}
export function next(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, progress:ProgressObject, next:ProgressNext,
    deliverables_address?:string, passport?:PassportObject) {
        let diliverable = txb.pure([], BCS.U8);
        if (deliverables_address) { diliverable = txb.pure(deliverables_address, BCS.ADDRESS)}

        if (passport) {
            txb.moveCall({
                target:PROTOCOL.ProgressFn('run_with_passport') as FnCallType,
                arguments: [passport, progress, machine, txb.pure(next.next_node_name), 
                    txb.pure(name_data(next.forward)), diliverable, permission],
            })    
        } else {
            txb.moveCall({
                target:PROTOCOL.ProgressFn('run') as FnCallType,
                arguments: [progress, machine, txb.pure(next.next_node_name), 
                    txb.pure(name_data(next.forward)), diliverable, permission],
            })               
        }
}
export function hold(txb:TransactionBlock, machine:MachineObject, permission:PermissionObject, progress:ProgressObject, next:ProgressNext, hold:boolean) {
    txb.moveCall({
        target:PROTOCOL.ProgressFn('hold') as FnCallType,
        arguments: [progress, machine, txb.pure(next.next_node_name), 
            txb.pure(name_data(next.forward)), txb.pure(hold, BCS.BOOL), permission],
    })  
}