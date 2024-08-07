import { BCS } from '@mysten/bcs';
import { FnCallType, PermissionObject, RepositoryObject, PassportObject, MachineObject, 
    ProgressObject, ProgressAddress, Protocol, ValueType,
    TxbObject} from './protocol';
import { Bcs, array_unique,IsValidName, IsValidAddress, IsValidArray, OptionNone, IsValidInt  } from './utils'
import { ERROR, Errors } from './exception';
import { Resource } from './resource';

export type ProgressNext = {
    next_node_name: string;
    forward: string;
}

export type ParentProgress = {
    parent_id: string;
    parent_session_id: number;
    next_node: string;
    forward: string;
}

export interface Holder {
    forward: string;
    who?:string;
    sub_progress?:string;
    deliverables?:string;
    accomplished:boolean;
}
export interface Session {
    id?:number; // for parent progress's history
    next_node: string;
    holders: Holder[];
    weights: number;
    threshold: number;
    node?:string;
    bComplete?: boolean;
}

export class Progress {
    protected permission ;
    protected machine;
    protected object : TxbObject;
    protected protocol;

    get_object() { return this.object }
    private constructor(protocol:Protocol, machine:MachineObject, permission:PermissionObject) {
        this.permission = permission;
        this.protocol = protocol;
        this.machine = machine;
        this.object = '';
    }
    static From(protocol:Protocol, machine:MachineObject, permission:PermissionObject, object:TxbObject) : Progress{
        let p = new Progress(protocol, machine, permission)
        p.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), object);
        return p
    }
    static New(protocol:Protocol, machine:MachineObject, permission:PermissionObject, task?:string, passport?:PassportObject) : Progress {
        if (!Protocol.IsValidObjects([machine, permission])) {
            ERROR(Errors.IsValidObjects, 'machine & permission')
        }

        let p = new Progress(protocol, machine, permission);
        let txb = protocol.CurrentSession();
        let t = task? txb.pure(Bcs.getInstance().ser(ValueType.TYPE_OPTION_ADDRESS, task)) : OptionNone(txb);

        if (passport) {
            p.object = txb.moveCall({
                target:protocol.ProgressFn('new_with_passport') as FnCallType,
                arguments: [passport, t, Protocol.TXB_OBJECT(txb, machine), Protocol.TXB_OBJECT(txb, permission)],
            })    
        } else {
            p.object = txb.moveCall({
                target:protocol.ProgressFn('new') as FnCallType,
                arguments: [t, Protocol.TXB_OBJECT(txb, machine), Protocol.TXB_OBJECT(txb, permission)],
            })    
        }
        return p
    }

    launch() : ProgressAddress {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target:this.protocol.ProgressFn('create') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
        })   
    }

    launch_as_child(parent:ProgressObject, parent_next:ProgressNext) : ProgressAddress {
        if (!Protocol.IsValidObjects([parent])) {
            ERROR(Errors.IsValidObjects, 'parent')
        }
        if (!Progress.IsValidProgressNext(parent_next)) {
            ERROR(Errors.InvalidParam, 'parent_next')
        }
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target:this.protocol.ProgressFn('create_as_child') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, parent), 
                txb.pure(parent_next.next_node_name), txb.pure(parent_next.forward)],
        })   
    }

    destroy()  {
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.ProgressFn('destroy') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb, this.object)],
        })   
    }

    set_namedOperator(name:string, addresses:string[], passport?:PassportObject)  {
        if (!IsValidName(name)) {
            ERROR(Errors.IsValidName, 'name')
        }
        if (addresses.length > Progress.MAX_NAMED_OPERATOR_COUNT || !IsValidArray(addresses, IsValidAddress)) {
            ERROR(Errors.InvalidParam, 'addresses')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ProgressFn('namedOperator_set_with_passport') as FnCallType,
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(name), 
                    txb.pure(array_unique(addresses), 'vector<address>'), 
                Protocol.TXB_OBJECT(txb, this.machine), Protocol.TXB_OBJECT(txb, this.permission)],
            })  
        } else {
            txb.moveCall({
                target:this.protocol.ProgressFn('namedOperator_set') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(name), 
                    txb.pure(array_unique(addresses), 'vector<address>'), 
                Protocol.TXB_OBJECT(txb, this.machine), Protocol.TXB_OBJECT(txb, this.permission)],
            })  
        }  
    }

    bind_task(task_address:string, passport?:PassportObject)  {
        if (!IsValidAddress(task_address)) {
            ERROR(Errors.IsValidAddress)
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ProgressFn('task_set_with_passport') as FnCallType,
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), 
                    txb.pure(task_address, BCS.ADDRESS), Protocol.TXB_OBJECT(txb, this.machine), Protocol.TXB_OBJECT(txb, this.permission)],
            })   
        } else {
            txb.moveCall({
                target:this.protocol.ProgressFn('task_set') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(txb, this.object), txb.pure(task_address, BCS.ADDRESS), 
                    Protocol.TXB_OBJECT(txb, this.machine), Protocol.TXB_OBJECT(txb, this.permission)],
            })   
        } 
    }
    set_context_repository(repository?:RepositoryObject, passport?:PassportObject)  {
        if (repository && !Protocol.IsValidObjects([repository])) {
            ERROR(Errors.IsValidObjects, 'repository')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (repository) {
                txb.moveCall({
                    target:this.protocol.ProgressFn('context_repository_set_with_passport') as FnCallType,
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, repository), 
                        Protocol.TXB_OBJECT(txb, this.machine), Protocol.TXB_OBJECT(txb, this.permission)],
                })            
            } else {
                txb.moveCall({
                    target:this.protocol.ProgressFn('context_repository_none_with_passport') as FnCallType,
                    arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), 
                        Protocol.TXB_OBJECT(txb, this.machine), Protocol.TXB_OBJECT(txb, this.permission)],
                })           
            }
        } else {
            if (repository) {
                txb.moveCall({
                    target:this.protocol.ProgressFn('context_repository_set') as FnCallType,
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, repository), 
                        Protocol.TXB_OBJECT(txb, this.machine), Protocol.TXB_OBJECT(txb, this.permission)],
                })            
            } else {
                txb.moveCall({
                    target:this.protocol.ProgressFn('context_repository_none') as FnCallType,
                    arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.machine), Protocol.TXB_OBJECT(txb, this.permission)],
                })           
            }
        }
    }
    unhold(next:ProgressNext, passport?:PassportObject)  {
        if (!Progress.IsValidProgressNext(next)) {
            ERROR(Errors.InvalidParam, 'next')
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ProgressFn('unhold_with_passport') as FnCallType,
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), 
                    Protocol.TXB_OBJECT(txb, this.machine), txb.pure(next.next_node_name), 
                    txb.pure(next.forward), Protocol.TXB_OBJECT(txb, this.permission)],
            })     
        } else {
            txb.moveCall({
                target:this.protocol.ProgressFn('unhold') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.machine), 
                    txb.pure(next.next_node_name), txb.pure(next.forward), 
                    Protocol.TXB_OBJECT(txb, this.permission)],
            })           
        }
    }
    parent_none(passport?:PassportObject) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ProgressFn('parent_none_with_passport') as FnCallType,
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), 
                    Protocol.TXB_OBJECT(txb, this.machine), Protocol.TXB_OBJECT(txb, this.permission)],
            }) 
        } else {
            txb.moveCall({
                target:this.protocol.ProgressFn('parent_none') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.machine), 
                    Protocol.TXB_OBJECT(txb, this.permission)],
            }) 
        }
    }

    parent(parent:ParentProgress, passport?:PassportObject)  {
        if (!IsValidAddress(parent.parent_id) || !IsValidInt(parent.parent_session_id)) {
            ERROR(Errors.InvalidParam, 'parent')
        }
        if (!parent.next_node || !parent.forward) {
            ERROR(Errors.InvalidParam, 'parent')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.ProgressFn('parent_set_with_passport') as FnCallType,
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.machine), 
                    txb.pure(parent.parent_id, BCS.ADDRESS), 
                    txb.pure(parent.parent_session_id, BCS.U64), 
                    txb.pure(parent.next_node),
                    txb.pure(parent.forward),
                    Protocol.TXB_OBJECT(txb, this.permission)],
            })  
        } else {
            txb.moveCall({
                target:this.protocol.ProgressFn('parent_set') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.machine), 
                    txb.pure(parent.parent_id, BCS.ADDRESS), 
                    txb.pure(parent.parent_session_id, BCS.U64), 
                    txb.pure(parent.next_node),
                    txb.pure(parent.forward),
                    Protocol.TXB_OBJECT(txb, this.permission)],
            })  
        }
    }

    next(next:ProgressNext, deliverables_address?:string, sub_id?:string, passport?:PassportObject)  {
        if (!Progress.IsValidProgressNext(next)) {
            ERROR(Errors.InvalidParam, 'next')
        }
        if (deliverables_address && !IsValidAddress(deliverables_address)) {
            ERROR(Errors.IsValidAddress, 'deliverables_address');
        }
        if (sub_id && !IsValidAddress(sub_id)) {
            ERROR(Errors.IsValidAddress, 'sub_id');
        }

        let txb = this.protocol.CurrentSession();
        let diliverable = deliverables_address? txb.pure(Bcs.getInstance().ser(ValueType.TYPE_OPTION_ADDRESS, deliverables_address)) : OptionNone(txb)
        let sub = sub_id? txb.pure(Bcs.getInstance().ser(ValueType.TYPE_OPTION_ADDRESS, sub_id)) : OptionNone(txb)
        
        if (passport) {
            txb.moveCall({
                target:this.protocol.ProgressFn('next_with_passport') as FnCallType,
                arguments: [passport, Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.machine), 
                    txb.pure(next.next_node_name), 
                    txb.pure(next.forward), diliverable, sub, 
                    Protocol.TXB_OBJECT(txb, this.permission)],
            })    
        } else {
            txb.moveCall({
                target:this.protocol.ProgressFn('next') as FnCallType,
                arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.machine), txb.pure(next.next_node_name), 
                    txb.pure(next.forward), diliverable, sub, Protocol.TXB_OBJECT(txb, this.permission)],
            })               
        }
    }

    hold(next:ProgressNext, hold:boolean)  {
        if (!Progress.IsValidProgressNext(next)) {
            ERROR(Errors.InvalidParam, 'next')
        }

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.ProgressFn('hold') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb, this.object), Protocol.TXB_OBJECT(txb, this.machine), txb.pure(next.next_node_name), 
                txb.pure(next.forward), txb.pure(hold, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
        })  
    }
    static rpc_de_sessions = (session: any) : Session[] => {
        let sessions : Session[] = [];
        session?.fields?.contents?.forEach((v:any) => {
            var s:Session = {next_node: v.fields.key, holders:[], weights:v.fields.value.fields.weights, threshold:v.fields.value.fields.threshold};
            v.fields.value.fields.forwards.fields.contents.forEach((i:any) => {
              s.holders.push({forward:i.fields.key, accomplished:i.fields.value.fields.accomplished, 
                who:i.fields.value.fields.who, deliverables:i.fields.value.fields.deliverables ?? undefined,
                sub_progress: i.fields.value.fields.sub_progress ?? undefined
              })
            })
            sessions.push(s);
        })
        return sessions;
    }

    static rpc_de_history = (fields: any) : Session[] => {
        let sessions : Session[] = [];
        fields?.forEach((v:any) => {
          const next_node = v.data.content.fields.value.fields.next_node;
          v.data.content.fields.value.fields.session.fields.contents.forEach((i:any) => {
            var s:Session = {id:v.data.content.fields.name,
                node:v.data.content.fields.value.fields.node, next_node: i.fields.key, holders:[], 
              weights:i.fields.value.fields.weights, threshold:i.fields.value.fields.threshold, bComplete:i.fields.key === next_node};
              i.fields.value.fields.forwards.fields.contents.forEach((k:any) => {
              s.holders.push({forward:k.fields.key, who:k.fields.value.fields.who, accomplished:k.fields.value.fields.accomplished,
                sub_progress:k.fields.value.fields.sub_progress ?? undefined, deliverables:k.fields.value.fields.deliverables ?? undefined});
            })
            sessions.push(s);
          })
        })
        return sessions;
    }

    static MAX_NAMED_OPERATOR_COUNT = 20;
    static IsValidProgressNext = (next:ProgressNext) => {
        return IsValidName(next.forward)  && IsValidName(next.next_node_name);
    }
}