import { TransactionBlock, Inputs, type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS } from '@mysten/bcs';
import { Protocol, FnCallType, PermissionObject, RepositoryObject,  PassportObject, MachineObject, MachineAddress,  GuardObject, TxbObject} from './protocol';
import { IsValidInt, IsValidUint, Bcs, array_unique, IsValidArray, IsValidAddress, IsValidName, IsValidName_AllowEmpty, 
    IsValidEndpoint, OptionNone, IsValidDesription} from './utils'
import { Permission, PermissionIndexType } from './permission';
import { Errors, ERROR}  from './exception'
import { Resource } from './resource';


export type MachineNodeObject = TransactionResult | String;

export interface Machine_Forward {
    name: string; // foward name
    namedOperator?: string; // dynamic operator
    permission?: PermissionIndexType; // this.permission-index or named-operator MUST one defined.
    weight?: number;
    guard?: GuardObject;
}
export interface Machine_Node_Pair {
    prior_node: string;
    forwards: Machine_Forward[];
    threshold?: number;
}
export interface Machine_Node {
    name: string;
    description: string;
    pairs: Machine_Node_Pair[];
}

export class Machine {
    protected protocol;
    protected object : TxbObject;
    protected permission;

    get_object() { return this.object }

    static From(protocol:Protocol, permission:PermissionObject, object:TxbObject) : Machine {
        let d = new Machine(protocol, permission)
        d.object = Protocol.TXB_OBJECT(protocol.CurrentSession(), object)
        return d
    }

    private constructor(protocol:Protocol, permission:PermissionObject) {
        this.protocol = protocol;
        this.permission = permission;
        this.object =  '';
    }
    static New(protocol:Protocol, permission:PermissionObject, description:string, endpoint?:string, passport?:PassportObject) : Machine {
        if (!Protocol.IsValidObjects([permission])) {
            ERROR(Errors.IsValidObjects, 'permission')
        }
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        if (endpoint && !IsValidEndpoint(endpoint)) {
            ERROR(Errors.IsValidEndpoint)
        }

        let m = new Machine(protocol, permission);
        let txb = protocol.CurrentSession();
        let ep = endpoint? txb.pure(Bcs.getInstance().ser_option_string(endpoint)) : OptionNone(txb);
    
        if (passport) {
            m.object = txb.moveCall({
                target:protocol.MachineFn('new_with_passport') as FnCallType,
                arguments:[passport, txb.pure(description), ep, Protocol.TXB_OBJECT(txb, permission)],
            })
        } else {
            m.object = txb.moveCall({
                target:protocol.MachineFn('new') as FnCallType,
                arguments:[txb.pure(description), ep, Protocol.TXB_OBJECT(txb, permission)],
            })
        }
        return m
    }
   
    // create new nodes for machine
    add_node(nodes:Machine_Node[], passport?:PassportObject) {
        let bValid = true;
        nodes.forEach((node) => {
            if (!IsValidDesription(node.description) || !IsValidName(node.name))  { bValid = false; }
            node.pairs.forEach((p) => {
                if (!IsValidName_AllowEmpty(p.prior_node)) { bValid = false; }
                if (p?.threshold && !IsValidInt(p.threshold)) { bValid = false; }
                p.forwards.forEach((f) => {
                    if (!IsValidName(f.name)) { bValid = false }
                    if (f?.namedOperator && !IsValidName_AllowEmpty(f?.namedOperator)) { bValid = false }
                    if (f?.permission && !Permission.IsValidPermissionIndex(f?.permission)) { bValid = false }
                    if (!f?.permission && !f?.namedOperator) { bValid = false; }
                    if (f?.weight && !IsValidUint(f.weight)) { bValid = false; }
                })
            })
        })
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'nodes')
        }

        let new_nodes: MachineNodeObject[] = [];
        let txb = this.protocol.CurrentSession();
        nodes.forEach((node) => {
            let n = txb.moveCall({
                target:this.protocol.NodeFn('new') as FnCallType,
                arguments:[txb.pure(node.name), txb.pure(node.description)]
            });
            node.pairs.forEach((pair) => {
                let threshold = pair?.threshold ? txb.pure(Bcs.getInstance().ser_option_u64(pair.threshold)) : OptionNone(txb);

                pair.forwards.forEach((forward) => {
                    let weight = forward?.weight ? forward.weight : 1;
                    let perm = forward?.permission ? txb.pure(Bcs.getInstance().ser_option_u64(forward.permission)) : OptionNone(txb); 
                    let namedOperator = forward?.namedOperator ?  txb.pure(forward.namedOperator) : txb.pure('');
                    let f;

                    if (forward?.guard) {
                        f = txb.moveCall({ 
                            target:this.protocol.NodeFn('forward') as FnCallType,
                                arguments:[namedOperator, txb.pure(weight), txb.object(Protocol.TXB_OBJECT(txb, forward.guard)), perm]
                        });                        
                    } else {
                        f = txb.moveCall({ 
                            target:this.protocol.NodeFn('forward2') as FnCallType,
                                arguments:[namedOperator, txb.pure(weight), perm]
                        });                
                    }
                    txb.moveCall({ // add forward
                        target:this.protocol.NodeFn('forward_add') as FnCallType,
                            arguments:[n, txb.pure(pair.prior_node), txb.pure(forward.name),  threshold, f]
                    });                
                }); 
            }); 
            new_nodes.push(n); 
        }); 
        this.add_node2(new_nodes, passport)
    }

    // move MachineNodeObject to the machine from signer-owned MachineNode object 
    add_node2(nodes:MachineNodeObject[], passport?:PassportObject) {
        if (!nodes) {
            ERROR(Errors.InvalidParam, 'nodes');
        }

        let txb = this.protocol.CurrentSession();
        let n: TransactionResult[] = [];
        array_unique(nodes).forEach((v) => {
            n.push(Protocol.TXB_OBJECT(txb, v));
        })

        if (passport) {
            txb.moveCall({ // add node
                target:this.protocol.MachineFn('node_add_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.makeMoveVec({objects:n}), Protocol.TXB_OBJECT(txb, this.permission)]
            });     
        } else {
            txb.moveCall({ // add node
                target:this.protocol.MachineFn('node_add') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb,  this.object), txb.makeMoveVec({objects:n}), Protocol.TXB_OBJECT(txb, this.permission)]
            });     
        }    
    }

    // move MachineNodeObject from  this.object to signer-owned MachineNode object 
    remove_node(nodes_name:string[], bTransferMyself:boolean = false, passport?:PassportObject) {
        if (!nodes_name || !IsValidArray(nodes_name, IsValidName)) {
            ERROR(Errors.IsValidArray, 'nodes_name')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.MachineFn('node_remove_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb,  this.object), txb.pure(Bcs.getInstance().ser_vector_string(nodes_name)), 
                    txb.pure(bTransferMyself, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
            });  
        } else {
            txb.moveCall({
                target:this.protocol.MachineFn('node_remove') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb,  this.object), txb.pure(Bcs.getInstance().ser_vector_string(nodes_name)), txb.pure(bTransferMyself, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
            });
        } 
    }

    destroy() {
        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.MachineFn('destroy') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb,  this.object)],
        })  
    }

    launch() : MachineAddress {
        let txb = this.protocol.CurrentSession();
        return txb.moveCall({
            target:this.protocol.MachineFn('create') as FnCallType,
            arguments:[Protocol.TXB_OBJECT(txb,  this.object)],
        })
    }

    set_description(description:string, passport?:PassportObject) {
        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.MachineFn('description_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb,  this.object), txb.pure(description), Protocol.TXB_OBJECT(txb, this.permission)],
            })
        } else {
            txb.moveCall({
                target:this.protocol.MachineFn('description_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb,  this.object), txb.pure(description), Protocol.TXB_OBJECT(txb, this.permission)],
            })
        }
    }
    add_repository(repository:RepositoryObject, passport?:PassportObject) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.MachineFn('repository_add_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb,  this.object), Protocol.TXB_OBJECT(txb, repository), Protocol.TXB_OBJECT(txb, this.permission)],
            })
        } else {
            txb.moveCall({
                target:this.protocol.MachineFn('repository_add') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb,  this.object), Protocol.TXB_OBJECT(txb, repository), Protocol.TXB_OBJECT(txb, this.permission)],
            })
        }
    }

    remove_repository(repositories:string[], removeall?:boolean, passport?:PassportObject) {
        if (!removeall && !repositories) {
            ERROR(Errors.AllInvalid, 'repositories & removeall')
        }
        if (repositories && !IsValidArray(repositories, IsValidAddress)){
            ERROR(Errors.IsValidArray, 'repositories')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            if (removeall) {
                txb.moveCall({
                    target:this.protocol.MachineFn('repository_remove_all_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb,  this.object), Protocol.TXB_OBJECT(txb,  this.object)],
                })
            } else {
                txb.moveCall({
                    target:this.protocol.MachineFn('repository_remove_with_passport') as FnCallType,
                    arguments:[passport, Protocol.TXB_OBJECT(txb,  this.object), txb.pure(repositories, 'vector<address>'),
                        Protocol.TXB_OBJECT(txb, this.permission)],
                })
            }   
        } else {
            if (removeall) {
                txb.moveCall({
                    target:this.protocol.MachineFn('repository_remove_all') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb,  this.object), Protocol.TXB_OBJECT(txb, this.permission)],
                })
            } else {
                txb.moveCall({
                    target:this.protocol.MachineFn('repository_remove') as FnCallType,
                    arguments:[Protocol.TXB_OBJECT(txb,  this.object), txb.pure(repositories, 'vector<address>'), 
                        Protocol.TXB_OBJECT(txb, this.permission)],
                })
            }   
        }   
    }

    clone(passport?:PassportObject) : MachineObject  {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            return txb.moveCall({
                target:this.protocol.MachineFn('clone_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb,  this.object), Protocol.TXB_OBJECT(txb, this.permission)],
            })
        } else {
            return txb.moveCall({
                target:this.protocol.MachineFn('clone') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb,  this.object), Protocol.TXB_OBJECT(txb, this.permission)],
            })
        }
    }

    set_endpoint(endpoint?:string, passport?:PassportObject) {
        if (endpoint && !IsValidEndpoint(endpoint)) {
            ERROR(Errors.IsValidEndpoint)
        }

        let txb = this.protocol.CurrentSession();
        let ep = endpoint? txb.pure(Bcs.getInstance().ser_option_string(endpoint)) : OptionNone(txb);
        
        if (passport) {
            txb.moveCall({
                target:this.protocol.MachineFn('endpoint_set_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb,  this.object), ep, Protocol.TXB_OBJECT(txb, this.permission)],
            })
        } else {
            txb.moveCall({
                target:this.protocol.MachineFn('endpoint_set') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb,  this.object), ep, Protocol.TXB_OBJECT(txb, this.permission)],
            })
        }
    }
    pause(bPaused:boolean, passport?:PassportObject) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.MachineFn('pause_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb,  this.object), txb.pure(bPaused), Protocol.TXB_OBJECT(txb, this.permission)],
            })
        } else {
            txb.moveCall({
                target:this.protocol.MachineFn('pause') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb,  this.object), txb.pure(bPaused), Protocol.TXB_OBJECT(txb, this.permission)],
            })
        } 
    }
    publish(passport?:PassportObject) {
        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.MachineFn('publish_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb,  this.object), Protocol.TXB_OBJECT(txb, this.permission)],
            })
        } else {
            txb.moveCall({
                target:this.protocol.MachineFn('publish') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb,  this.object), Protocol.TXB_OBJECT(txb, this.permission)],
            })
        }
        
    }

    change_permission(new_permission:PermissionObject) {
        if (!Protocol.IsValidObjects([new_permission])){
            ERROR(Errors.IsValidObjects, 'new_permission')
        }

        let txb = this.protocol.CurrentSession();
        txb.moveCall({
            target:this.protocol.MachineFn('permission_set') as FnCallType,
            arguments: [Protocol.TXB_OBJECT(txb,  this.object), Protocol.TXB_OBJECT(txb, this.permission), Protocol.TXB_OBJECT(txb, new_permission)],
            typeArguments:[]            
        })   
        this.permission = new_permission;   
    }

    static INITIAL_NODE_NAME = '';
    static OPERATOR_ORDER_PAYER = 'order payer';
}