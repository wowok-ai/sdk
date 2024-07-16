import { TransactionBlock, Inputs, type TransactionResult } from '@mysten/sui.js/transactions';
import { BCS } from '@mysten/bcs';
import { Protocol, FnCallType, PermissionObject, RepositoryObject,  PassportObject, MachineObject, MachineAddress,  GuardObject, TxbObject} from './protocol';
import { IsValidInt, Bcs, array_unique, IsValidArray, IsValidAddress, IsValidName, IsValidName_AllowEmpty, 
    IsValidEndpoint, OptionNone, IsValidDesription,
    IsValidUintLarge} from './utils'
import { Permission, PermissionIndexType } from './permission';
import { Errors, ERROR}  from './exception'
import { ValueType } from './protocol';


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
    static New(protocol:Protocol, permission:PermissionObject, description:string, endpoint?:string|null, passport?:PassportObject) : Machine {
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
        let ep = endpoint? txb.pure(Bcs.getInstance().ser(ValueType.TYPE_OPTION_STRING, endpoint)) : OptionNone(txb);
    
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
        if (nodes.length === 0) return ;

        let bValid = true;
        nodes.forEach((node) => {
            if (!IsValidName(node.name))  { bValid = false; }
            node.pairs.forEach((p) => {
                if (!IsValidName_AllowEmpty(p.prior_node)) { bValid = false; }
                if (p?.threshold && !IsValidInt(p.threshold)) { bValid = false; }
                p.forwards.forEach((f) => {
                    if (!Machine.isValidForward(f)) bValid = false;
                })
            })
        })
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'add_node')
        }

        let new_nodes: TxbObject[] = [];
        let txb = this.protocol.CurrentSession();
        nodes.forEach((node) => {
            let n = txb.moveCall({
                target:this.protocol.MachineFn('node_new') as FnCallType,
                arguments:[txb.pure(node.name, BCS.STRING)]
            }); 
            node.pairs.forEach((pair) => {
                let threshold = pair?.threshold ? txb.pure(Bcs.getInstance().ser_option_u32(pair.threshold)) : OptionNone(txb);

                pair.forwards.forEach((forward) => {
                    txb.moveCall({ // add forward
                        target:this.protocol.MachineFn('forward_add') as FnCallType,
                            arguments:[n, txb.pure(pair.prior_node), txb.pure(forward.name),  threshold, this.forward(forward)]
                    });                
                }); 
                if (pair.forwards.length === 0) {
                    txb.moveCall({ // add forward
                        target:this.protocol.MachineFn('forward_add_none') as FnCallType,
                            arguments:[n, txb.pure(pair.prior_node), threshold]
                    });         
                }
            }); 
            new_nodes.push(n); 
        }); 
        this.add_node2(new_nodes, passport)
    }

    forward(forward:Machine_Forward) : TransactionResult {
        const txb = this.protocol.CurrentSession();

        let weight = forward?.weight ? forward.weight : 1;
        let perm = forward?.permission ? txb.pure(Bcs.getInstance().ser(ValueType.TYPE_OPTION_U64, forward.permission)) : OptionNone(txb); 
        let namedOperator = forward?.namedOperator ?  txb.pure(forward.namedOperator) : txb.pure('');
        let f:any;

        if (forward?.guard) {
            f = txb.moveCall({ 
                target:this.protocol.MachineFn('forward') as FnCallType,
                    arguments:[namedOperator, txb.pure(weight), txb.object(Protocol.TXB_OBJECT(txb, forward.guard)), perm]
            });                        
        } else {
            f = txb.moveCall({ 
                target:this.protocol.MachineFn('forward2') as FnCallType,
                    arguments:[namedOperator, txb.pure(weight), perm]
            });                
        }
        return f
    }

    // move MachineNodeObject to the machine from signer-owned MachineNode object 
    add_node2(nodes:TxbObject[], passport?:PassportObject) {
        if (nodes.length === 0) {
            ERROR(Errors.InvalidParam, 'add_node2');
        }

        let txb = this.protocol.CurrentSession();
        let n: TransactionResult[] = nodes.map((v)=>Protocol.TXB_OBJECT(txb, v));

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
    
    fetch_node(node_name:string, passport?:PassportObject) : TxbObject {
        if (!IsValidName(node_name)) {
            ERROR(Errors.IsValidName, 'fetch_node');
        }
        let txb = this.protocol.CurrentSession();
        if (passport) {
            return txb.moveCall({
                target:this.protocol.MachineFn('node_fetch_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb,  this.object), txb.pure(node_name, BCS.STRING), 
                    Protocol.TXB_OBJECT(txb, this.permission)],
            });  
        } else {
            return txb.moveCall({
                target:this.protocol.MachineFn('node_fetch') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb,  this.object), txb.pure(node_name, BCS.STRING), Protocol.TXB_OBJECT(txb, this.permission)],
            });
        } 
    }
    rename_node(node_name:string, new_name:string, passport?:PassportObject) {
        if (node_name === new_name) return
        if (!IsValidName(node_name)) ERROR(Errors.IsValidName, 'rename_node');
        if (!IsValidName(new_name)) ERROR(Errors.IsValidName, 'rename_node');

        let txb = this.protocol.CurrentSession();

        if (passport) {
            txb.moveCall({
                target:this.protocol.MachineFn('node_rename_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb,  this.object), 
                    txb.pure(node_name, BCS.STRING), txb.pure(new_name, BCS.STRING),
                    Protocol.TXB_OBJECT(txb, this.permission)],
            });  
        } else {
            txb.moveCall({
                target:this.protocol.MachineFn('node_rename') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb,  this.object), 
                    txb.pure(node_name, BCS.STRING), txb.pure(new_name, BCS.STRING),
                    Protocol.TXB_OBJECT(txb, this.permission)],
            });
        } 
    }

    // move MachineNodeObject from  this.object to signer-owned MachineNode object 
    remove_node(nodes_name:string[], bTransferMyself:boolean = false, passport?:PassportObject) {
        if (nodes_name.length === 0) return;

        if (!IsValidArray(nodes_name, IsValidName)) {
            ERROR(Errors.IsValidArray, 'nodes_name')
        }

        let txb = this.protocol.CurrentSession();
        if (passport) {
            txb.moveCall({
                target:this.protocol.MachineFn('node_remove_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb,  this.object), txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, nodes_name)), 
                    txb.pure(bTransferMyself, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
            });  
        } else {
            txb.moveCall({
                target:this.protocol.MachineFn('node_remove') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb,  this.object), txb.pure(Bcs.getInstance().ser(ValueType.TYPE_VEC_STRING, nodes_name)), txb.pure(bTransferMyself, BCS.BOOL), Protocol.TXB_OBJECT(txb, this.permission)],
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
        if (!removeall && repositories.length===0) {
            return;
        }

        if (!IsValidArray(repositories, IsValidAddress)){
            ERROR(Errors.IsValidArray, 'remove_repository')
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
                    arguments:[passport, Protocol.TXB_OBJECT(txb,  this.object), txb.pure(array_unique(repositories), 'vector<address>'),
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
                    arguments:[Protocol.TXB_OBJECT(txb,  this.object), txb.pure(array_unique(repositories), 'vector<address>'), 
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

    set_endpoint(endpoint?:string|null, passport?:PassportObject) {
        if (endpoint && !IsValidEndpoint(endpoint)) {
            ERROR(Errors.IsValidEndpoint)
        }

        let txb = this.protocol.CurrentSession();
        let ep = endpoint? txb.pure(Bcs.getInstance().ser(ValueType.TYPE_OPTION_STRING, endpoint)) : OptionNone(txb);
        
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

    add_forward(node_prior:string, node_name:string, foward: Machine_Forward, threshold?:number, passport?:PassportObject) {
        if (!IsValidName_AllowEmpty(node_prior)) ERROR(Errors.IsValidName_AllowEmpty, 'add_forward');
        if (!IsValidName(node_name)) ERROR(Errors.IsValidName, 'add_forward');
        if (!Machine.isValidForward(foward)) ERROR(Errors.InvalidParam, 'add_forward');

        let txb = this.protocol.CurrentSession();
        let n : any;
        if (passport) {
            n = txb.moveCall({
                target:this.protocol.MachineFn('node_fetch_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb,  this.object), txb.pure(node_name, BCS.STRING), Protocol.TXB_OBJECT(txb, this.permission)],
            })

        } else {
            n = txb.moveCall({
                target:this.protocol.MachineFn('node_fetch') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb,  this.object), txb.pure(node_name, BCS.STRING), Protocol.TXB_OBJECT(txb, this.permission)],
            })
        }
        const f = this.forward(foward);
        const t = threshold ? txb.pure(Bcs.getInstance().ser_option_u32(threshold)) : OptionNone(txb);
        txb.moveCall({
            target:this.protocol.MachineFn('forward_add') as FnCallType,
            arguments:[n, txb.pure(node_prior, BCS.STRING), txb.pure(foward.name, BCS.STRING), t, f],
        })
    }

    remove_forward(node_prior:string, node_name:string, foward_name: string, passport?:PassportObject) {
        if (!IsValidName_AllowEmpty(node_prior)) ERROR(Errors.IsValidName_AllowEmpty, 'add_forward');
        if (!IsValidName(node_name)) ERROR(Errors.IsValidName, 'add_forward');

        let txb = this.protocol.CurrentSession();
        let n : any;
        if (passport) {
            n = txb.moveCall({
                target:this.protocol.MachineFn('node_fetch_with_passport') as FnCallType,
                arguments:[passport, Protocol.TXB_OBJECT(txb, this.object), txb.pure(node_name, BCS.STRING), Protocol.TXB_OBJECT(txb, this.permission)],
            })

        } else {
            n = txb.moveCall({
                target:this.protocol.MachineFn('node_fetch') as FnCallType,
                arguments:[Protocol.TXB_OBJECT(txb,  this.object), txb.pure(node_name, BCS.STRING), Protocol.TXB_OBJECT(txb, this.permission)],
            })
        }
        txb.moveCall({
            target:this.protocol.MachineFn('forward_remove') as FnCallType,
            arguments:[n, txb.pure(node_prior, BCS.STRING), txb.pure(foward_name, BCS.STRING)],
        })
    }

    static rpc_de_nodes(fields: any) : Machine_Node[] {
        const machine_nodes:Machine_Node[] = [];
        fields.forEach((n:any) => {
            let pairs:Machine_Node_Pair[] = [];
            n.data.content.fields.value.fields.value.fields.contents.forEach((p:any) => {
                let forwards:Machine_Forward[] = [];
                p.fields.value.fields.forwards.fields.contents.forEach((f:any) => {
                    let forward_name = f.fields.key;
                    let forward_weight = f.fields.value.fields.weight;
                    let forward_guard = f.fields.value.fields.guard;
                    let forward_namedOperator = f.fields.value.fields.namedOperator;
                    let forward_permission_index = f.fields.value.fields.permission_index;
                    forwards.push({name:forward_name, namedOperator:forward_namedOperator, permission:forward_permission_index,
                        weight:forward_weight, guard:forward_guard?forward_guard:''});
                });
                pairs.push({prior_node:p.fields.key, threshold:p.fields.value.fields.threshold, forwards:forwards});
            });
            machine_nodes.push({name:n.data.content.fields.name, pairs:pairs});    
        });
        return machine_nodes;
    }

    static namedOperators(nodes:Machine_Node[]) : string[] {
        let ret: string[] = [];
        nodes.forEach((v)=> {
            v.pairs.forEach((i) => {
                i.forwards.forEach((k) => {
                    if (k?.namedOperator && !ret.find((x)=>x===k.namedOperator)) {
                        ret.push(k.namedOperator);
                    }
                })
            })
        })
        return ret;
    }

    static isValidForward(forward:Machine_Forward) {
        if (!IsValidName(forward.name)) return false
        if (forward?.namedOperator && !IsValidName_AllowEmpty(forward?.namedOperator)) return false;
        if (forward?.permission && !Permission.IsValidPermissionIndex(forward?.permission)) return false;
        if (!forward?.permission && !forward?.namedOperator) return false;
        if (forward?.weight && !IsValidUintLarge(forward.weight)) return false;
        return true
    }

    static INITIAL_NODE_NAME = '';
/*    static NODE_NAME_RESERVED = 'origin';
    static IsNodeNameReserved = (name:string) => { 
        return name.toLowerCase() === Machine.NODE_NAME_RESERVED
    }*/
    static SolveNodeName = (name:string) => {
        return name ? name : '⚪';
    }
    static OPERATOR_ORDER_PAYER = 'OrderPayer';
}