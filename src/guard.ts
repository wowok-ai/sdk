

import { Protocol, LogicsInfo, GuardAddress, FnCallType, Data_Type, MODULES, ContextType, ValueType,  OperatorType, ConstantType, SER_VALUE} from './protocol';
import { concatenate, array_equal } from './utils';
import { IsValidDesription, Bcs, IsValidInt, IsValidAddress, FirstLetterUppercase, insertAtHead } from './utils';
import { ERROR, Errors } from './exception';
import { Transaction as TransactionBlock } from '@mysten/sui/transactions';

export type GuardConstant = Map<number, Guard_Variable>;

export interface Guard_Variable {
    type: ConstantType ,
    value?: Uint8Array,
    witness?: Uint8Array,
}

export  interface Guard_Options {
    from: 'query' | 'type';
    name: string;
    value: number;  
    group?: string;
}

export class Guard {
    static MAX_INPUT_LENGTH = 10240;
    static launch(txb:TransactionBlock, description:string, maker:GuardMaker) : GuardAddress  {
        if (!maker.IsReady()) {
            ERROR(Errors.InvalidParam, 'launch maker');
        }

        if (!IsValidDesription(description)) {
            ERROR(Errors.IsValidDesription)
        }
        let bcs_input = maker.get_input()[0];
        let constants = maker.get_constant();
        if (bcs_input.length == 0 || bcs_input.length > Guard.MAX_INPUT_LENGTH) {
            ERROR(Errors.InvalidParam, 'launch input')
        }
    
        let bValid = true;
        constants?.forEach((v, k) => {
            if (!GuardConstantHelper.IsValidIndentifier(k)) bValid = false;
            if (!v.value && !v.witness) bValid =  false;
        })
        if (!bValid) {
            ERROR(Errors.InvalidParam, 'launch constants')
        }
        
        let input = new  Uint8Array(bcs_input); // copy new uint8array to reserve!

        // reserve the  bytes for guard
        let guard = txb.moveCall({
            target: Protocol.Instance().GuardFn('new') as FnCallType,
            arguments: [txb.pure.string(description), txb.pure.vector('u8', [].slice.call(input.reverse()))],  
        });

        constants?.forEach((v, k) => {
            if (v.type == ContextType.TYPE_WITNESS_ID) {
                if (!v.witness) {
                    ERROR(Errors.InvalidParam, 'constants type')
                }
                const n = insertAtHead(v.witness!, v.type);
                txb.moveCall({
                    target:Protocol.Instance().GuardFn("constant_add") as FnCallType,
                    arguments:[guard, txb.pure.u8(k), txb.pure.vector('u8', [].slice.call(n)), txb.pure.bool(true)]
                })            
            } else {
                if (!v.value)   {
                    ERROR(Errors.InvalidParam, 'constants type')
                }
                const n = insertAtHead(v.value!, v.type);
                txb.moveCall({
                    target:Protocol.Instance().GuardFn("constant_add") as FnCallType,
                    arguments:[guard, txb.pure.u8(k), txb.pure.vector('u8', [].slice.call(n)), txb.pure.bool(true)]
                }) 
            }
        });
    
        return txb.moveCall({
            target:Protocol.Instance().GuardFn("create") as FnCallType,
            arguments:[guard]
        });
    }
    
    static signer_guard(txb: TransactionBlock) : GuardAddress {
        return txb.moveCall({
            target: Protocol.Instance().GuardFn('signer_guard') as FnCallType,
            arguments: []
        }); 
    }
    
    static everyone_guard(txb:TransactionBlock) : GuardAddress {
        return txb.moveCall({
            target: Protocol.Instance().GuardFn('everyone_guard') as FnCallType,
            arguments: []
        }); 
    }

    static QUERIES:any[] = [ 
        // module, 'name', 'id', [input], output
        [MODULES.permission, 'Owner', 1, [], ValueType.TYPE_ADDRESS, "Owner's address."],
        [MODULES.permission, 'Is Admin', 2, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Is a certain address an administrator?', 'Input:address'],
        [MODULES.permission, 'Has Rights', 3, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_BOOL, 'Does an address have a certain permission(Admin always have permissions)?', 'Input 1:address; Input 2:permission index'],
        [MODULES.permission, 'Contains Address', 4, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether an address is included in the personnel permission table?', 'Input:address'],
        [MODULES.permission, 'Contains Permission', 5, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_BOOL, 'Whether a certain permission for a certain address is defined in the personnel permission table?', 'Input 1:address; Input 2:permission index'],
        [MODULES.permission, 'Contains Permission Guard', 6, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_BOOL, 'Whether a permission guard for a certain address is defined in the personnel permission table?', 'Input 1:address; Input 2:permission index'],
        [MODULES.permission, 'Permission Guard', 7, [ValueType.TYPE_ADDRESS, ValueType.TYPE_U64], ValueType.TYPE_ADDRESS, 'Permission guard for a certain address.', 'Input 1:address; Input 2:permission index'],
        [MODULES.permission, 'Number of Entities', 8, [], ValueType.TYPE_U64, 'Number of entities in the personnel permission table.'],
        [MODULES.permission, 'Number of Admin', 9, [], ValueType.TYPE_U64, 'Number of administrators.'],
    
        [MODULES.repository, 'Permission', 100, [], ValueType.TYPE_ADDRESS, 'Permission object address.'],
        [MODULES.repository, 'Contains Policy', 101, [ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Is a consensus policy included?', 'Input:the filed name'],
        [MODULES.repository, 'Is Permission set of Policy', 102, [ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Does a certain consensus policy set data operation permissions?', 'Input:the policy name'],
        [MODULES.repository, 'Permission of Policy', 103, [ValueType.TYPE_STRING], ValueType.TYPE_U64, 'The permission index of a certain consensus policy in the Permission object.', 'Input:the policy name'],
        [MODULES.repository, 'Value Type of Policy',  104, [ValueType.TYPE_STRING], ValueType.TYPE_U8, 'Data types defined by consensus policy.', 'Input:the policy name'],
        [MODULES.repository, 'Contains Data for An Address', 105, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether data exists at a certain address?', 'Input:address'],   
        [MODULES.repository, 'Contains Data', 106, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Does it contain data for a certain field of an address?', 'Input 1:address, Input 2:the field name'],
        [MODULES.repository, 'Raw data without Type', 107, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_VEC_U8, 'Data for a field at an address and does not contain data type information.', 'Input 1:address, Input 2:the field name'],       
        [MODULES.repository, 'Raw data', 108, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_VEC_U8, 'Data for a field at an address, and the first byte contains data type information.', 'Input 1:address, Input 2:the field name'],
        [MODULES.repository, 'Type', 109, [], ValueType.TYPE_U8, 'The repository Type. 0: Normal; 1: Wowok greenee.'],   
        [MODULES.repository, 'Policy Mode', 110, [], ValueType.TYPE_U8, 'Policy Mode. 0: Free mode;  1: Strict mode.'],   
        [MODULES.repository, 'Reference Count', 111, [], ValueType.TYPE_U64, 'The number of times it is referenced by other objects.'],   
        [MODULES.repository, 'Is Referenced by An Object', 112, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Is it referenced by an object?', 'Input:address'],   
        [MODULES.repository, 'Data Number', 113, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_U256, 'Data for a field at an address and get unsigned integer type data.', 'Input 1:address, Input 2:the field name'],       
        [MODULES.repository, 'Data String', 114, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_STRING, 'Data for a field at an address and get string type data.', 'Input 1:address, Input 2:the field name'],       
        [MODULES.repository, 'Data Address', 115, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_ADDRESS, 'Data for a field at an address and get address type data.', 'Input 1:address, Input 2:the field name'],       
        [MODULES.repository, 'Data Bool', 116, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Data for a field at an address and get bool type data.', 'Input 1:address, Input 2:the field name'],       
        [MODULES.repository, 'Data Number Vector', 117, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_VEC_U256, 'Data for a field at an address and get unsigned integer vector type data.', 'Input 1:address, Input 2:the field name'],       
        [MODULES.repository, 'Data String Vector', 118, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_VEC_STRING, 'Data for a field at an address and get string vector type data.', 'Input 1:address, Input 2:the field name'],  
        [MODULES.repository, 'Data Address Vector', 119, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_VEC_ADDRESS, 'Data for a field at an address and get address vector type data.', 'Input 1:address, Input 2:the field name'],       
        [MODULES.repository, 'Data Bool Vector', 120, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_VEC_BOOL, 'Data for a field at an address and get bool vector type data.', 'Input 1:address, Input 2:the field name'],            
        
        [MODULES.entity, 'Contains Entity?', 200, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Is an entity already registered?', 'Input:address'], 
        [MODULES.entity, 'Likes', 201, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The number of likes for an address by other addresses.', 'Input:address'], 
        [MODULES.entity, 'Dislikes', 202, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The number of dislikes for an address by other addresses.', 'Input:address'], 
        [MODULES.entity, 'Entity Info', 203, [ValueType.TYPE_ADDRESS], ValueType.TYPE_VEC_U8, 'Public information about an entity.', 'Input:address'], 
        [MODULES.entity, 'Has Resource by Entity?', 204, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether an entity created a resource?', 'Input:address'], 
        [MODULES.entity, 'Entity Resource', 205, [ValueType.TYPE_ADDRESS], ValueType.TYPE_ADDRESS, 'The address of a resource object created by an entity.', 'Input:address'], 

        [MODULES.demand, 'Permission', 300, [], ValueType.TYPE_ADDRESS, 'Permission object address.'],       
        [MODULES.demand, 'Has Deadline', 301, [], ValueType.TYPE_BOOL, 'Whether to set the expiration time of presenting?'],
        [MODULES.demand, 'Deadline', 302, [], ValueType.TYPE_U64, 'The expiration time of presenting.'],   
        [MODULES.demand, 'Bounty Count', 303, [], ValueType.TYPE_U64, 'Number of Bounties.'],   
        [MODULES.demand, 'Has Guard', 304, [], ValueType.TYPE_BOOL, 'Whether the present guard is set?'],       
        [MODULES.demand, 'Guard', 305, [], ValueType.TYPE_ADDRESS, 'The present guard address.'],
        [MODULES.demand, 'Has Service Picked', 306, [], ValueType.TYPE_BOOL, 'Whether a service has been picked and bounties given?'],   
        [MODULES.demand, 'Service Picked', 307, [], ValueType.TYPE_ADDRESS, 'Service address that has been picked.'], 
        [MODULES.demand, 'Presenter Count', 308, [], ValueType.TYPE_U64, 'Number of presenters.'],
        [MODULES.demand, 'Has Presenter', 309, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Is a certain address a presenter?', 'Input:address'],   
        [MODULES.demand, 'Who Got Bounty', 310, [ValueType.TYPE_ADDRESS], ValueType.TYPE_ADDRESS, 'The address that bounties given.', 'Input:address'], 
   
        [MODULES.service, 'Permission', 400, [], ValueType.TYPE_ADDRESS, 'Permission object address.'],       
        [MODULES.service, 'Payee', 401, [], ValueType.TYPE_ADDRESS, 'Payee address, that all order withdrawals will be collected to this address.'],
        [MODULES.service, 'Has Buying Guard', 402, [], ValueType.TYPE_BOOL, 'Is the guard condition of buying set?'],   
        [MODULES.service, 'Buying Guard', 403, [], ValueType.TYPE_ADDRESS, 'Buying guard, that Purchase only if you meet the conditions of the guard.'],   
        [MODULES.service, 'Contains Repository', 404, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, "Is a certain repository one of the service's consensus repositories?", 'Input:address'],       
        [MODULES.service, 'Has Withdrawing Guard', 405, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether a certain guard is set when withdrawing money?', 'Input:address'],
        [MODULES.service, 'Withdrawing Guard Percent', 406, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The percentage of withdrawals allowed by a certain withdrawal guard.', 'Input:address'],   
        [MODULES.service, 'Has Refunding Guard', 407, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether a certain guard is set when refunding money?', 'Input:address'], 
        [MODULES.service, 'Refunding Guard Percent', 408, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The percentage of refund allowed by a certain refund guard.', 'Input:address'],
        [MODULES.service, 'Has Sales Item', 409, [ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Is there a sales item for the service?', 'Input:the item name'],   
        [MODULES.service, 'Sale Item Price', 410, [ValueType.TYPE_STRING], ValueType.TYPE_U64, 'What is the price of a certain sale item?', 'Input:the item name'], 
        [MODULES.service, 'Sale Item Inventory', 411, [ValueType.TYPE_STRING], ValueType.TYPE_U64, 'How much inventory is there for a certain sales item?', 'Input:the item name'], 
        [MODULES.service, 'Has Machine', 412, [], ValueType.TYPE_BOOL, "Has the machine(progress generator) that serves the order been set up?"],
        [MODULES.service, 'Machine', 413, [], ValueType.TYPE_ADDRESS, 'Machine address, that generate progresses serving the execution process of order.'],  
        [MODULES.service, 'Paused', 414, [], ValueType.TYPE_BOOL, 'Pause the creation of new order?'], 
        [MODULES.service, 'Published', 415, [], ValueType.TYPE_BOOL, 'Is it allowed to create orders?'], 
        [MODULES.service, 'Has Required Info', 416, [], ValueType.TYPE_BOOL, 'Whether the necessary information that needs to be provided by the customer is set?'],
        [MODULES.service, 'Required Info of Service-Pubkey', 417, [], ValueType.TYPE_STRING, 'The public key used to encrypt customer information, and only the service provider can decrypt and view customer information.'],   
        [MODULES.service, 'Required Info', 418, [], ValueType.TYPE_VEC_STRING, 'Names of the required information item that needs to be provided by the customer.'],  

        [MODULES.order, 'Amount', 500, [], ValueType.TYPE_U64, 'Order amount.'],       
        [MODULES.order, 'Payer', 501, [], ValueType.TYPE_ADDRESS, 'Order payer.'],
        [MODULES.order, 'Service', 502, [], ValueType.TYPE_ADDRESS, 'Service for creating orders.'],   
        [MODULES.order, 'Has Progress', 503, [], ValueType.TYPE_BOOL, 'Is there a Progress for executing the order process?'],   
        [MODULES.order, 'Progress', 504, [], ValueType.TYPE_ADDRESS, 'Progress address for executing the order process.'],       
        [MODULES.order, 'Required Info Counts', 505, [], ValueType.TYPE_U64, 'How much customer information is required for this order?'],
        [MODULES.order, 'Discount Used', 506, [], ValueType.TYPE_BOOL, 'Discount coupon used for this order?'],   
        [MODULES.order, 'Discount', 507, [], ValueType.TYPE_ADDRESS, 'Discount address that already used.'], 
        [MODULES.order, 'Balance', 508, [], ValueType.TYPE_U64, 'The amount currently in the order.'], 
        [MODULES.order, 'Refunded', 509, [], ValueType.TYPE_BOOL, 'Whether a refund has occurred?'],
        [MODULES.order, 'Withdrawed', 510, [], ValueType.TYPE_BOOL, 'Whether a service provider withdrawal has occurred?'],   
     
        [MODULES.reward, 'Permission', 600, [], ValueType.TYPE_ADDRESS, 'Permission object address.'],       
        [MODULES.reward, 'Rewards Remaining', 601, [], ValueType.TYPE_U64, 'Number of rewards to be claimed.'],
        [MODULES.reward, 'Reward Count Supplied', 602, [], ValueType.TYPE_U64, 'Total rewards supplied.'],   
        [MODULES.reward, 'Guard Count', 603, [], ValueType.TYPE_U64, 'The number of claiming guards.'],   
        [MODULES.reward, 'Has Guard', 604, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether a claiming guard is set up?', 'Input:address'],       
        [MODULES.reward, 'Guard Portion', 605, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The portions of rewards, that can be claimed if a certain guard condition is met.', 'Input:address'],
        [MODULES.reward, 'Deadline', 606, [], ValueType.TYPE_U64, 'The expiration time of claiming.'],   
        [MODULES.reward, 'Has Claimed by An Address', 607, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether a certain address has claimed rewards?', 'Input:address'], 
        [MODULES.reward, 'Portions Claimed by An Address', 608, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The portions of rewards that have been claimed by a certain address.'],
        [MODULES.reward, 'Number of Addresses Claimed', 609, [], ValueType.TYPE_U64, 'Number of addresses that have claimed rewards.'],   
        [MODULES.reward, 'Is Sponsor', 620, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether an address is a sponsor of the reward pool?', 'Input:address'], 
        [MODULES.reward, 'Portions by A Sponsor', 611, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The portions of sponsorship reward pools for a certain address.', 'Input:address'], 
        [MODULES.reward, 'Number of Sponsors', 612, [], ValueType.TYPE_U64, 'Number of sponsors in the sponsorship reward pool.'],
        [MODULES.reward, 'Allow Repeated Claims', 613, [], ValueType.TYPE_BOOL, 'Whether to allow repeated claims?'],  
    
        // , means that data fields and data outside the consensus policy definition are allowed to be written
        // , means that only data fields and data defined by the consensus policy are allowed to be written.
        [MODULES.machine, 'Permission', 700, [], ValueType.TYPE_ADDRESS, 'Permission object address.'],
        [MODULES.machine, 'Paused', 701, [], ValueType.TYPE_BOOL, 'Pause the creation of new Progress?'],
        [MODULES.machine, 'Published', 702, [], ValueType.TYPE_BOOL, 'Is it allowed to create Progress?'],
        [MODULES.machine, 'Is Consensus Repository', 703, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether an address is a consensus repository?', 'Input:adddress'],
        [MODULES.machine, 'Has Endpoint', 704, [], ValueType.TYPE_BOOL, 'Is the endpoint set?'],   
        [MODULES.machine, 'Endpoint', 705, [], ValueType.TYPE_STRING, 'Endpoint url/ipfs.'],
    
        [MODULES.progress, 'Machine', 800, [], ValueType.TYPE_ADDRESS, 'The Machine object that created this Progress.'],       
        [MODULES.progress, 'Current Node', 801, [], ValueType.TYPE_STRING, 'The name of the currently running node.'],
        [MODULES.progress, 'Has Parent', 802, [], ValueType.TYPE_BOOL, 'Is the parent Progress defined?'],   
        [MODULES.progress, 'Parent', 803, [], ValueType.TYPE_ADDRESS, 'The parent Progress, that contains some child Progress.'],   
        [MODULES.progress, 'Has Task', 804, [], ValueType.TYPE_BOOL, 'Does it contain clear task(eg. an Order)?'],       
        [MODULES.progress, 'Task', 805, [], ValueType.TYPE_ADDRESS, 'Task object address.'],
        [MODULES.progress, 'Has Unique Permission', 806, [ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Does Progress define a unique operation permission?', 'Input:opertor name'],   
        [MODULES.progress, 'Is Unique Permission Operator', 807, [ValueType.TYPE_STRING, ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Is an address an operator with unique permissions?', 'Input 1:operator name; Input 2:address'], 
        [MODULES.progress, 'Has Context Repository', 808, [], ValueType.TYPE_BOOL, 'Whether the repository reference for Progress is set?'],
        [MODULES.progress, 'Context Repository', 809, [], ValueType.TYPE_ADDRESS, 'Repository reference for Progress.'],   
        [MODULES.progress, 'Last Session Time', 810, [], ValueType.TYPE_U64, 'Time when the previous session was completed.'],
        [MODULES.progress, 'Last Session Node', 811, [], ValueType.TYPE_STRING, 'The name of the last completed node.'],  
        [MODULES.progress, 'Current Session-id', 812, [], ValueType.TYPE_U64, 'The session id of ongoing node.'],  
        [MODULES.progress, 'Parent Session-id', 813, [], ValueType.TYPE_U64, 'The child process was started in the Session-id phase of the parent process.'],   
        [MODULES.progress, 'Parent Next Node', 814, [], ValueType.TYPE_STRING, 'The child process is started at the next node stage of the parent process.'],
        [MODULES.progress, 'Parent Forward', 815, [], ValueType.TYPE_STRING, 'The child process is started in the Forward phase of the next node of the parent process.'],  
        [MODULES.progress, 'Parent Node', 816, [], ValueType.TYPE_STRING, 'The node name of the parent process where the child process is located.'],  
        [MODULES.progress, 'Forward Accomplished', 817, [ValueType.TYPE_U64, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Has a forward been accomplished?', 'Input 1:session-id; Input 2:next node name; Input 3:forward name'],  
        [MODULES.progress, 'Forward Operator', 818, [ValueType.TYPE_U64, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_ADDRESS, 'The forward operator.', 'Input 1:session-id; Input 2:next node name; Input 3:forward name'],   
        [MODULES.progress, 'Forward Sub-progress', 819, [ValueType.TYPE_U64, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_ADDRESS, 'The forward child process address(if set).', 'Input 1:session-id; Input 2:next node name; Input 3:forward name'],
        [MODULES.progress, 'Forward Deliverables', 820, [ValueType.TYPE_U64, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_ADDRESS, 'The forward deliverable(if set).', 'Input 1:session-id; Input 2:next node name; Input 3:forward name'],  
        [MODULES.progress, 'Forward time', 821, [ValueType.TYPE_U64, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_U64, 'The time when the forward was last triggered.', 'Input 1:session-id; Input 2:next node name; Input 3:forward name'],  
        [MODULES.progress, 'Closest Session Time', 822, [ValueType.TYPE_STRING], ValueType.TYPE_U64, 'The time a node that closest time to the current node completes its session.', 'Input:the node name'],  
        [MODULES.progress, 'Closest Forward Accomplished', 823, [ValueType.TYPE_STRING, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Has a forward been accomplished?', 'Input 1:node name; Input 2:next node name; Input 3:forward name'],  
        [MODULES.progress, 'Closest Forward Operator', 824, [ValueType.TYPE_STRING, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_ADDRESS, 'The operator of the forward that closest time to the current node.', 'Input 1:node name; Input 2:next node name; Input 3:forward name'],   
        [MODULES.progress, 'Closest Forward Sub-progress', 825, [ValueType.TYPE_STRING, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_ADDRESS, 'The child process address(if set) of the forward that closest time to the current node.', 'Input 1:node name; Input 2:next node name; Input 3:forward name'],
        [MODULES.progress, 'Closest Forward Deliverables', 826, [ValueType.TYPE_STRING, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_ADDRESS, 'The deliverable(if set) of the forward that closest time to the current node.', 'Input 1:node name; Input 2:next node name; Input 3:forward name'],  
        [MODULES.progress, 'Closest Forward time', 827, [ValueType.TYPE_STRING, ValueType.TYPE_STRING, ValueType.TYPE_STRING], ValueType.TYPE_U64, 'The time when the forward that closest time to the current node was last triggered.', 'Input 1:node name; Input 2:next node name; Input 3:forward name'],  

        [MODULES.wowok, 'Builder', 900, [], ValueType.TYPE_ADDRESS, 'Builder address of Wowok.'], 
        [MODULES.wowok, 'Everyone Guard', 901, [], ValueType.TYPE_ADDRESS, 'A guard that all addresses can pass through.'], 
        [MODULES.wowok, 'Object of Entities', 902, [], ValueType.TYPE_ADDRESS, 'The address of entity information object.'],
        [MODULES.wowok, 'Grantor Count', 903, [], ValueType.TYPE_U64, 'Number of registered grantors.'],   
        [MODULES.wowok, 'Has Grantor', 904, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether an address has been registered as a grantor?', , 'Input:address'], 
        [MODULES.wowok, 'Grantor Name', 905, [ValueType.TYPE_ADDRESS], ValueType.TYPE_STRING, "Name of a grantor.", 'Input:address'], 
        [MODULES.wowok, 'Grantor Registration Time', 906, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'Registration time of a grantor.', 'Input:address'], 
        [MODULES.wowok, 'Grantor Expired Time', 907, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The expiration time of a grantor.', 'Input:address'], 
        [MODULES.wowok, 'Grantee Object for Grantor', 908, [ValueType.TYPE_ADDRESS], ValueType.TYPE_ADDRESS, 'Grantee repository address of a grantor.', 'Input:address'], 
    
        [MODULES.payment, 'Sender', 1200, [], ValueType.TYPE_ADDRESS, 'Whether an address has been registered as a grantor?', , 'Input:address'], 
        [MODULES.payment, 'Total Amount', 1201, [], ValueType.TYPE_U64, "Name of a grantor.", 'Input:address'], 
        [MODULES.payment, 'Tips', 1202, [], ValueType.TYPE_STRING, 'Registration time of a grantor.', 'Input:address'], 
        [MODULES.payment, 'Has Guard for Perpose', 1203, [], ValueType.TYPE_BOOL, 'The expiration time of a grantor.', 'Input:address'], 
        [MODULES.payment, 'Has Object for Perpose', 1204, [], ValueType.TYPE_BOOL, 'Grantee repository address of a grantor.', 'Input:address'], 
        [MODULES.payment, 'Guard for Perpose', 1205, [], ValueType.TYPE_ADDRESS, 'Whether an address has been registered as a grantor?', , 'Input:address'], 
        [MODULES.payment, 'Object for Perpose', 1206, [], ValueType.TYPE_ADDRESS, "Name of a grantor.", 'Input:address'], 
        [MODULES.payment, 'Number of Transfer', 1207, [], ValueType.TYPE_U64, 'Registration time of a grantor.', 'Input:address'], 
        [MODULES.payment, 'Is a Recipient', 1208, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'The expiration time of a grantor.', 'Input:address'], 
        [MODULES.payment, 'Amount for a Recipient', 1209, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'Grantee repository address of a grantor.', 'Input:address'], 
        [MODULES.payment, 'Time', 1210, [], ValueType.TYPE_U64, 'Registration time of a grantor.', 'Input:address'], 
        [MODULES.payment, 'Is from Treasury', 1211, [], ValueType.TYPE_BOOL, 'The expiration time of a grantor.', 'Input:address'], 
        [MODULES.payment, 'Treasury Address', 1212, [], ValueType.TYPE_ADDRESS, 'Grantee repository address of a grantor.', 'Input:address'], 

        [MODULES.withholding, 'Has Deposited', 1300, [], ValueType.TYPE_BOOL, 'Whether an address has been registered as a grantor?', , 'Input:address'], 
        [MODULES.withholding, 'Original Type Deposited', 1301, [], ValueType.TYPE_STRING, "Name of a grantor.", 'Input:address'], 
        [MODULES.withholding, 'Original Package', 1302, [], ValueType.TYPE_ADDRESS, 'Registration time of a grantor.', 'Input:address'], 
        [MODULES.withholding, 'Original Module', 1303, [], ValueType.TYPE_STRING, 'The expiration time of a grantor.', 'Input:address'], 
        [MODULES.withholding, 'Type Deposited', 1304, [], ValueType.TYPE_STRING, 'Grantee repository address of a grantor.', 'Input:address'], 
        [MODULES.withholding, 'Package', 1305, [], ValueType.TYPE_ADDRESS, 'Whether an address has been registered as a grantor?', , 'Input:address'], 
        [MODULES.withholding, 'Module', 1306, [], ValueType.TYPE_STRING, 'The expiration time of a grantor.', 'Input:address'], 
        [MODULES.withholding, 'Guard for Withdrawing', 1307, [], ValueType.TYPE_ADDRESS, 'Registration time of a grantor.', 'Input:address'], 
        [MODULES.withholding, 'Guard for Refunding', 1308, [], ValueType.TYPE_STRING, 'The expiration time of a grantor.', 'Input:address'], 
        [MODULES.withholding, 'Deposit Time', 1309, [], ValueType.TYPE_U64, 'Grantee repository address of a grantor.', 'Input:address'], 
        [MODULES.withholding, 'Refund Time', 1310, [], ValueType.TYPE_U64, 'Whether an address has been registered as a grantor?', , 'Input:address'], 
        [MODULES.withholding, 'Depositor address', 1311, [], ValueType.TYPE_ADDRESS, 'The expiration time of a grantor.', 'Input:address'], 
        [MODULES.withholding, 'Re address', 1312, [], ValueType.TYPE_U64, 'Grantee repository address of a grantor.', 'Input:address'], 
       // [MODULES.withholding, 'Refund Time', 1313, [], ValueType.TYPE_U64, 'Whether an address has been registered as a grantor?', , 'Input:address'], 
       // [MODULES.withholding, 'Depositor address', 1314, [], ValueType.TYPE_ADDRESS, 'The expiration time of a grantor.', 'Input:address'], 

        [MODULES.treasury, 'Permission', 1400, [], ValueType.TYPE_ADDRESS, 'Whether an address has been registered as a grantor?', , 'Input:address'], 
        [MODULES.treasury, 'Balance', 1401, [], ValueType.TYPE_U64, "Name of a grantor.", 'Input:address'], 
        [MODULES.treasury, 'Number of Flow Records', 1402, [], ValueType.TYPE_U64, 'Registration time of a grantor.', 'Input:address'], 
        [MODULES.treasury, 'Deposit Flow', 1403, [], ValueType.TYPE_U128, 'The expiration time of a grantor.', 'Input:address'], 
        [MODULES.treasury, 'Take Flow', 1404, [], ValueType.TYPE_U128, 'Grantee repository address of a grantor.', 'Input:address'], 
        [MODULES.treasury, 'Flow over a Period of Time', 1405, [ValueType.TYPE_U64, ValueType.TYPE_U64], ValueType.TYPE_U128, 'Whether an address has been registered as a grantor?', , 'Input:address'], 
        [MODULES.treasury, 'Deposit Flow over a Period of Time', 1406, [ValueType.TYPE_U64, ValueType.TYPE_U64], ValueType.TYPE_U128, "Name of a grantor.", 'Input:address'], 
        [MODULES.treasury, 'Take Flow over a Period of Time', 1407, [ValueType.TYPE_U64, ValueType.TYPE_U64], ValueType.TYPE_U128, 'Registration time of a grantor.', 'Input:address'], 

/*      [MODULES.vote, 'Permission', 171, [], ValueType.TYPE_ADDRESS],       
        [MODULES.vote, 'Options Locked', 172, [], ValueType.TYPE_BOOL],
        [MODULES.vote, 'Deadline Locked', 173, [], ValueType.TYPE_BOOL],   
        [MODULES.vote, 'Vote-Guard Locked', 174, [], ValueType.TYPE_BOOL],   
        [MODULES.vote, 'Max Choice Count', 175, [], ValueType.TYPE_U8],       
        [MODULES.vote, 'Deadline', 176, [], ValueType.TYPE_U64],
        [MODULES.vote, 'Has Reference', 177, [], ValueType.TYPE_BOOL],   
        [MODULES.vote, 'Reference', 178, [], ValueType.TYPE_ADDRESS], 
        [MODULES.vote, 'Has Vote-Guard', 179, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL],
        [MODULES.vote, 'Vote-Guard', 180, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64],   
        [MODULES.vote, 'Has Voted by Address', 181, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL], 
        [MODULES.vote, 'Voted Weight by Address', 182, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64], 
        [MODULES.vote, 'Has Option', 183, [ValueType.TYPE_STRING], ValueType.TYPE_BOOL],
        [MODULES.vote, 'Has Object of Option', 184, [ValueType.TYPE_STRING], ValueType.TYPE_BOOL],   
        [MODULES.vote, 'Option Object', 185, [ValueType.TYPE_STRING], ValueType.TYPE_ADDRESS], 
        [MODULES.vote, 'Option Count', 186, [ValueType.TYPE_STRING], ValueType.TYPE_U64], 
        [MODULES.vote, 'Option Votes', 187, [ValueType.TYPE_STRING], ValueType.TYPE_U64],
        [MODULES.vote, 'Address Count Voted', 188, [], ValueType.TYPE_U64],   
        [MODULES.vote, 'Top1 Option by Addresses', 189, [], ValueType.TYPE_STRING], 
        [MODULES.vote, 'Top1 Count by Addresses', 190, [], ValueType.TYPE_U64], 
        [MODULES.vote, 'Top1 Option by Votes', 191, [], ValueType.TYPE_STRING], 
        [MODULES.vote, 'Top1 Count by Votes', 192, [], ValueType.TYPE_U64], */
    ];

    static BoolCmd = Guard.QUERIES.filter(q => q[4] === ValueType.TYPE_BOOL);
    static IsBoolCmd = (cmd:number) : boolean => { return Guard.BoolCmd.includes((q:any) => {return q[2] == cmd}) }

    static CmdFilter = (retType:ValueType) => { return Guard.QUERIES.filter((q)=> q[4] === retType)}
    static GetCmd = (cmd:number | undefined) : any => { 
        return Guard.QUERIES.find((q:any) => {return q[2] == cmd}) ;
    }
    static GetCmdOption = (cmd:number) : Guard_Options | undefined => { 
        const  r = Guard.GetCmd(cmd);
        if (!r) return r;
        return  {from:'query', name:r[1], value:r[2], group:FirstLetterUppercase(r[0])}
    }

    static GetInputParams = (cmd:number) : ValueType[] => { 
        const r = Guard.GetCmd(cmd);
        if (!r) return [];
        return (r as any[])[3];
    }
    static GetModuleName = (cmd:number) : string => {
        let r = Guard.GetCmd(cmd);
        if (!r) return '';
        return FirstLetterUppercase(r[0])
    }
    static NumberOptions = () : Guard_Options[] => {
        const r: Guard_Options[] = [...Guard.CmdFilter(ValueType.TYPE_U8), ...Guard.CmdFilter(ValueType.TYPE_U64), 
            ...Guard.CmdFilter(ValueType.TYPE_U128), ...Guard.CmdFilter(ValueType.TYPE_U256)].map((v)=> { 
                return {from:'query', name:v[1], value:v[2], group:FirstLetterUppercase(v[0])}});
        return r.concat(Guard.Crunchings);
    }

    static Signer:Guard_Options = {from:'type', name:'Txn Signer', value:ContextType.TYPE_SIGNER, group:'Txn Functions'};
    static Time:Guard_Options = {from:'type', name:'Txn Time', value:ContextType.TYPE_CLOCK, group:'Txn Functions'};
    static Logics = () :Guard_Options[] => LogicsInfo.map((v) => { return {from:'type', name:v[1] as string, value:v[0] as number, group:'Compare or Logic'}});
    static Crunchings: Guard_Options[] = [
        {from:'type', name:'Txn Time', value:ContextType.TYPE_CLOCK, group:'Txn Functions'},
        {from:'type', name:'PositiveNumber Add (+)', value:OperatorType.TYPE_NUMBER_ADD, group:'Number Crunching'},
        {from:'type', name:'PositiveNumber Subtract (-)', value:OperatorType.TYPE_NUMBER_SUBTRACT, group:'Number Crunching'},
        {from:'type', name:'PositiveNumber Multiply (*)', value:OperatorType.TYPE_NUMBER_MULTIPLY, group:'Number Crunching'},
        {from:'type', name:'PositiveNumber Devide (/)', value:OperatorType.TYPE_NUMBER_DEVIDE, group:'Number Crunching'},
        {from:'type', name:'PositiveNumber Mod (%)', value:OperatorType.TYPE_NUMBER_MOD, group:'Number Crunching'},
    ]

    static CommonOptions = (retType:ValueType) : Guard_Options[] => {
        return Guard.CmdFilter(retType).map((v)=> {return {from:'query', name:v[1], value:v[2], group:FirstLetterUppercase(v[0])}});
    }

    static AllOptions = () :  Guard_Options[] => {
        var r:Guard_Options[] =  Guard.QUERIES.map((v)=>{return {from:'query', name:v[1], value:v[2], group:FirstLetterUppercase(v[0])}});
        return [...r, ...Guard.Crunchings, ...Guard.Logics(), Guard.Signer, Guard.Time]
    }

    static StringOptions = () : Guard_Options[] => {
        return [...Guard.CmdFilter(ValueType.TYPE_STRING)].map((v) => {
            return {from:'query', name:v[1], value:v[2], group:FirstLetterUppercase(v[0])};
        });
    }
    static BoolOptions = () : Guard_Options[] => {
        const n1:Guard_Options[] = Guard.BoolCmd.map((v)=> { return {from:'query', name:v[1], value:v[2], group:FirstLetterUppercase(v[0])}});
        return [...n1, ...Guard.Logics()];
    }
    static AddressOptions = () : Guard_Options[] => {
        const n1:Guard_Options[] = Guard.QUERIES.filter(q => q[4] === ValueType.TYPE_ADDRESS).map((v)=> { return {from:'query', name:v[1], value:v[2], group:FirstLetterUppercase(v[0])}});
        n1.push(Guard.Signer);
        return [...n1]
    }

    static Options = (ret_type: ValueType | 'number' | 'any') : Guard_Options[] => {
        if (ret_type === 'number') {
            return Guard.NumberOptions();
        } else if (ret_type === 'any') {
            return Guard.AllOptions();
        }

        switch(ret_type as number) {
            case ValueType.TYPE_BOOL:
                return Guard.BoolOptions();
            case ValueType.TYPE_STRING:
                return Guard.StringOptions();
        }
        return Guard.CommonOptions(ret_type);
    }
}

export class GuardConstantHelper {
    static IsValidIndentifier = (identifier:number) : boolean => {
        if (!IsValidInt(identifier) || identifier > 255) return false;
        return true
    }
    static get_constant_value(constants:GuardConstant, identifier:number, type:ConstantType) : Uint8Array | undefined {
        if (constants.has(identifier)) {
            let v = constants.get(identifier);
            if (v?.value && v.type == type) {
                return v.value;
            }
        } 
    }
    static get_constant_witness(constants:GuardConstant, identifier:number) : Uint8Array | undefined {
        if (constants.has(identifier)) {
            let v = constants.get(identifier);
            if (v?.witness && v.type == ContextType.TYPE_WITNESS_ID) {
                return v.witness;
            }
        } 
    }

    static add_future_constant(constants:GuardConstant, identifier:number, witness:any, value?:any, bNeedSerialize=true)  {
        if (!GuardConstantHelper.IsValidIndentifier(identifier)) ERROR(Errors.IsValidIndentifier, 'add_future_constant');
        if (!witness && !value) ERROR(Errors.InvalidParam, 'both witness and value invalid');
        let v = constants.get(identifier);
        if (!v || v.type == ContextType.TYPE_WITNESS_ID) {
            if (bNeedSerialize) {
                constants.set(identifier, {type:ContextType.TYPE_WITNESS_ID, value:value ? Bcs.getInstance().ser(ValueType.TYPE_ADDRESS, value) : undefined, 
                    witness:witness ? Bcs.getInstance().ser(ValueType.TYPE_ADDRESS, witness) : undefined})
            } else {
                constants.set(identifier, {type:ContextType.TYPE_WITNESS_ID, value:value?value:undefined, witness:witness?witness:undefined});             
            }                     
        } 
    }
    
    static add_constant(constants:GuardConstant, identifier:number, type:ValueType, value:any, bNeedSerialize=true) {
        const e = SER_VALUE.find((v:any)=>v.type===type)?.name ?? '' + ' invalid';
        if (!GuardConstantHelper.IsValidIndentifier(identifier)) {
            ERROR(Errors.InvalidParam, 'add_constant identifier')
        }
        if (value === undefined) {
            ERROR(Errors.InvalidParam, 'add_constant value')
        }
    
        switch (type) {
            case ValueType.TYPE_BOOL:
            case ValueType.TYPE_ADDRESS:
            case ValueType.TYPE_U64:
            case ValueType.TYPE_U8:
            case ValueType.TYPE_U128:
            case ValueType.TYPE_U256:
            case ValueType.TYPE_VEC_U64:
            case ValueType.TYPE_VEC_VEC_U8:   
            case ValueType.TYPE_OPTION_ADDRESS:
            case ValueType.TYPE_OPTION_BOOL:
            case ValueType.TYPE_OPTION_U128:
            case ValueType.TYPE_OPTION_U256:
            case ValueType.TYPE_OPTION_U64:
            case ValueType.TYPE_OPTION_U8:
            case ValueType.TYPE_VEC_ADDRESS:
            case ValueType.TYPE_VEC_BOOL:
            case ValueType.TYPE_VEC_U128:
            case ValueType.TYPE_VEC_U256:
            case ValueType.TYPE_STRING:  
            case ValueType.TYPE_VEC_U8:
            case ValueType.TYPE_OPTION_STRING:
            case ValueType.TYPE_OPTION_VEC_U8:
            case ValueType.TYPE_VEC_STRING:
                let ser = SER_VALUE.find(s=>s.type==type);
                if (!ser) ERROR(Errors.Fail, 'add_constant: invalid type:'+e);
                if (bNeedSerialize) {
                    constants.set(identifier, {type:type, value:Bcs.getInstance().ser(type, value)}) 
                } else {
                    constants.set(identifier, {type:type, value:value}) 
                }
                return    
            default:
                ERROR(Errors.Fail, 'add_constant  serialize not impl yet:'+e)
        }
    }
}
export class GuardMaker {
    protected data : Uint8Array[] = [];
    protected type_validator : Data_Type[] = [];
    protected constant : GuardConstant = new Map<number, Guard_Variable>();

    private static index: number = 1;
    private static get_index() { 
        if (GuardMaker.index == 256) {
            GuardMaker.index = 1;
        }
        return GuardMaker.index++
    }

    constructor() { }

    add_constant(type:ConstantType, value:any, identifier?:number, bNeedSerialize=true) : number {
        if (identifier === undefined) identifier = GuardMaker.get_index();
        if (type === ContextType.TYPE_WITNESS_ID) {
            // add witness to constant
            GuardConstantHelper.add_future_constant(this.constant, identifier, value, undefined, bNeedSerialize);
        } else {
            GuardConstantHelper.add_constant(this.constant, identifier, type, value, bNeedSerialize);
        }
        return identifier
    }

    private  serValueParam(type:ValueType, param?:any) {
        if (param === undefined) ERROR(Errors.InvalidParam, 'param');
        this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
        let ser = SER_VALUE.find(s=>s.type==type);
        if (!ser) ERROR(Errors.Fail, 'serValueParam: invalid type');
        this.data.push(Bcs.getInstance().ser(ser!.type as number, param));
        this.type_validator.push(type);
    }

    // serialize const & data
    add_param(type:ValueType | ContextType, param?:any) : GuardMaker {
        const e = SER_VALUE.find((v:any)=>v.type===type)?.name ?? '' + ' invalid';
        switch(type)  {
        case ValueType.TYPE_ADDRESS: 
        case ValueType.TYPE_BOOL:
        case ValueType.TYPE_U8:
        case ValueType.TYPE_U64: 
        case ValueType.TYPE_U128: 
        case ValueType.TYPE_U256: 
        case ValueType.TYPE_VEC_ADDRESS: 
        case ValueType.TYPE_VEC_BOOL: 
        case ValueType.TYPE_VEC_U128: 
        case ValueType.TYPE_VEC_U64: 
        case ValueType.TYPE_VEC_VEC_U8: 
        case ValueType.TYPE_OPTION_U64: 
        case ValueType.TYPE_OPTION_ADDRESS:
        case ValueType.TYPE_OPTION_BOOL:
        case ValueType.TYPE_OPTION_U128:
        case ValueType.TYPE_OPTION_U256:
        case ValueType.TYPE_OPTION_U8:
        case ValueType.TYPE_VEC_U256:
            this.serValueParam(type, param);
            break;
        case ValueType.TYPE_STRING:
        case ValueType.TYPE_VEC_U8:
            if (!param) ERROR(Errors.InvalidParam, 'param:'+e);
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type)); //@ USE VEC-U8
            if (typeof(param) == 'string') {
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_STRING, param));
            } else {
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_VEC_U8, param));
            }
            this.type_validator.push(type);
            break;
        case ContextType.TYPE_SIGNER:
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
            this.type_validator.push(ValueType.TYPE_ADDRESS);
            break;
        case ContextType.TYPE_CLOCK:
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
            this.type_validator.push(ValueType.TYPE_U64);
            break;
        case ContextType.TYPE_WITNESS_ID:
            if (!param) ERROR(Errors.InvalidParam, 'param:'+e);
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_ADDRESS, param));
            this.type_validator.push(ValueType.TYPE_ADDRESS);
            break;   
        case ContextType.TYPE_CONSTANT: 
            if (!param) {
                ERROR(Errors.InvalidParam, 'param invalid:'+e);
            }
            if (typeof(param) != 'number' || !IsValidInt(param) || param > 255) {
                ERROR(Errors.InvalidParam, 'add_param param:'+type);
            }
            
            var v = this.constant.get(param);
            if (!v) ERROR(Errors.Fail, 'identifier not in constant:'+e);
            var t = v!.type; 
            if (v?.type === ContextType.TYPE_WITNESS_ID) {
                t = ValueType.TYPE_ADDRESS;
            }
            this.type_validator.push(t); //@ type validator convert
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type)); // constant flag
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, param)); // identifier
            break;
        default:
            ERROR(Errors.InvalidParam, 'add_param type:'+e);
        };
        return this;
    }

    // object_address_from: string for static address; number as identifier  inconstant
    add_query(module:MODULES, query_name:string, object_address_from:string | number, bWitness:boolean=false) : GuardMaker {        
        let query_index = Guard.QUERIES.findIndex((q) => { return q[0] ==  module && q[1]  == query_name})
        if (query_index == -1)  {
            ERROR(Errors.InvalidParam, 'query_name:'+query_name);
        }

        if (typeof(object_address_from) == 'number' ) {
            if (!GuardConstantHelper.IsValidIndentifier(object_address_from)) {
                ERROR(Errors.InvalidParam, 'object_address_from:'+query_name);
            }
        } else {
            if (!IsValidAddress(object_address_from)) {
                ERROR(Errors.InvalidParam, 'object_address_from:'+query_name);
            }
        }

        let offset = this.type_validator.length - Guard.QUERIES[query_index][3].length;
        if (offset < 0) { 
            ERROR(Errors.InvalidParam, 'query_name:'+query_name);
        }

        let types = this.type_validator.slice(offset);
        if (!array_equal(types, Guard.QUERIES[query_index][3])) { // type validate 
            ERROR(Errors.Fail, 'array_equal:'+query_name);
        }
        
        this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, OperatorType.TYPE_QUERY)); // QUERY TYPE
        if (typeof(object_address_from) == 'string') {
            bWitness ? this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, ContextType.TYPE_WITNESS_ID)) :
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, ValueType.TYPE_ADDRESS)); 
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_ADDRESS, object_address_from)); // object address            
        } else {
            let v =  this.constant.get(object_address_from);
            if (!v) ERROR(Errors.Fail, 'object_address_from not in constant:'+query_name);
            if ((bWitness && v?.type == ContextType.TYPE_WITNESS_ID) || (!bWitness && v?.type == ValueType.TYPE_ADDRESS)) {
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, ContextType.TYPE_CONSTANT));
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, object_address_from)); // object identifer in constants
            } else {
                ERROR(Errors.Fail, 'type bWitness not match:'+query_name)
            }
        }

        this.data.push(Bcs.getInstance().ser('u16', Guard.QUERIES[query_index][2])); // cmd(u16)
        this.type_validator.splice(offset, Guard.QUERIES[query_index][3].length); // delete type stack
        this.type_validator.push(Guard.QUERIES[query_index][4]); // add the return value type to type stack
        return this;
    }

    add_logic(type:OperatorType, logic_count:number=2) : GuardMaker {
        var e:any = LogicsInfo.find((v:any) => v[0] === type);
        if (e) { e=e[1] }

        let splice_len = 2;
        let ret = ValueType.TYPE_BOOL;
        switch (type) {
            case OperatorType.TYPE_LOGIC_AS_U256_GREATER:
            case OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL:
            case OperatorType.TYPE_LOGIC_AS_U256_LESSER:
            case OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL:
            case OperatorType.TYPE_LOGIC_AS_U256_EQUAL:
                if (this.type_validator.length < splice_len)  { ERROR(Errors.Fail, 'type_validator.length:' + e) }
                if (!GuardMaker.match_u256(this.type_validator[this.type_validator.length - 1])) { ERROR(Errors.Fail, 'type_validator check:'+e) }
                if (!GuardMaker.match_u256(this.type_validator[this.type_validator.length - 2])) { ERROR(Errors.Fail, 'type_validator check:'+e)  }
                break;
            case OperatorType.TYPE_LOGIC_EQUAL:
                if (this.type_validator.length < splice_len)  { ERROR(Errors.Fail, 'type_validator.length:' + e) }
                if (GuardMaker.match_u256(this.type_validator[this.type_validator.length - 1]) && 
                    GuardMaker.match_u256(this.type_validator[this.type_validator.length - 2])) {
                    break;
                } else if (this.type_validator[this.type_validator.length - 1] === this.type_validator[this.type_validator.length - 2]) {
                    break;
                } else {
                    ERROR(Errors.Fail, 'type_validator check:' + e)  ;
                }
                break;
            case OperatorType.TYPE_LOGIC_HAS_SUBSTRING:
                if (this.type_validator.length < splice_len)  { ERROR(Errors.Fail, 'type_validator.length:' + e) }
                if (this.type_validator[this.type_validator.length - 1] !== ValueType.TYPE_STRING || 
                    this.type_validator[this.type_validator.length - 2] !== ValueType.TYPE_STRING) {
                        ERROR(Errors.Fail, 'type_validator check:' + e)  ;
                }
                break;
            case OperatorType.TYPE_LOGIC_NOT:
                splice_len =  1;
                if (this.type_validator.length < splice_len) { ERROR(Errors.Fail, 'type_validator.length:'+e) }
                if (this.type_validator[this.type_validator.length -1] != ValueType.TYPE_BOOL) { ERROR(Errors.Fail, 'type_validator check:'+e)  }
                break;
            case OperatorType.TYPE_LOGIC_AND:
            case OperatorType.TYPE_LOGIC_OR: //@ logics count
                if (!logic_count || logic_count < 2) ERROR(Errors.Fail, 'logic param invalid:'+e);
                splice_len = logic_count!;
                if (this.type_validator.length < splice_len)  { ERROR(Errors.Fail, 'type_validator.length:'+e) }
                for (let i = 1; i <= splice_len; ++i) {
                    if (this.type_validator[this.type_validator.length -i] != ValueType.TYPE_BOOL) { ERROR(Errors.Fail, 'type_validator check:'+e)  }
                }
                break;
            case OperatorType.TYPE_LOGIC_ALWAYS_TRUE:
                break;
            case OperatorType.TYPE_NUMBER_ADD:
            case OperatorType.TYPE_NUMBER_DEVIDE:
            case OperatorType.TYPE_NUMBER_MULTIPLY:
            case OperatorType.TYPE_NUMBER_SUBTRACT:
            case OperatorType.TYPE_NUMBER_MOD:
                if (this.type_validator.length < splice_len)  { ERROR(Errors.Fail, 'type_validator.length:'+e) }
                if (!GuardMaker.IsNumberType(this.type_validator[this.type_validator.length -1])) { ERROR(Errors.Fail, 'type_validator check:'+e)  }
                if (!GuardMaker.IsNumberType(this.type_validator[this.type_validator.length -2])) { ERROR(Errors.Fail, 'type_validator check:'+e)  }
                ret = ValueType.TYPE_U256;
                break;
            default:
                ERROR(Errors.InvalidParam, 'add_logic type invalid:' + e) 
        }

        this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type)); // TYPE 
        if (type === OperatorType.TYPE_LOGIC_AND || type === OperatorType.TYPE_LOGIC_OR) {
            this.data.push((Bcs.getInstance().ser(ValueType.TYPE_U8, logic_count))); //@ logics
        }    
        this.type_validator.splice(this.type_validator.length - splice_len); // delete type stack   
        this.type_validator.push(ret); // add bool to type stack
        return this;
    }

    static IsNumberType(type:Data_Type) : boolean {
        return (type === ValueType.TYPE_U8 || type === ValueType.TYPE_U64 || type === ValueType.TYPE_U128 || type === ValueType.TYPE_U256)
    }

    hasIdentifier(id:number) : boolean {
        return this.constant.has(id)
    }

    build(bNot = false) : GuardMaker {
        //console.log(this.type_validator);
        //this.data.forEach((value:Uint8Array) => console.log(value));
        if (this.type_validator.length != 1 || this.type_validator[0] != ValueType.TYPE_BOOL) { 
            ERROR(Errors.Fail, 'type_validator check') 
        } // ERROR
        if (bNot) {
            this.add_logic(OperatorType.TYPE_LOGIC_NOT);
        }
        this.data.push(concatenate(Uint8Array, ...this.data) as Uint8Array);
        this.data.splice(0, this.data.length-1);
        return this;
    }

    IsReady() : boolean {
        return this.type_validator.length == 1 && this.type_validator[0] == ValueType.TYPE_BOOL && this.data.length == 1;
    }

    combine(otherBuilt:GuardMaker, bAnd:boolean = true, bCombinConstant=false) : GuardMaker {
        if (!otherBuilt.IsReady() || !this.IsReady()) { ERROR(Errors.Fail, 'both should built yet')};
        let maker = new GuardMaker();
        this.constant.forEach((v, k) => {
            maker.constant.set(k,  {type:v.type, value:v.value, witness:v.witness});
        })
        otherBuilt.constant.forEach((v, k) => {
            if (maker.constant.has(k) && !bCombinConstant) {
                ERROR(Errors.Fail, 'constant identifier exist');
            }
            maker.constant.set(k, {type:v.type, value:v.value, witness:v.witness});
        })
        let op = bAnd ? OperatorType.TYPE_LOGIC_AND :  OperatorType.TYPE_LOGIC_OR;
        maker.data.push(concatenate(Uint8Array, ...this.data, ...otherBuilt.data, Bcs.getInstance().ser(ValueType.TYPE_U8, op), Bcs.getInstance().ser(ValueType.TYPE_U8, 2)));
        this.data.splice(0, this.data.length-1);
        maker.type_validator = this.type_validator;
        return maker
    }

    get_constant() { return this.constant  }
    get_input() { return this.data }

    // and/or + logics count
    static input_combine(input1:Uint8Array, input2:Uint8Array, bAnd:boolean = true) : Uint8Array {
        let op = bAnd ? OperatorType.TYPE_LOGIC_AND :  OperatorType.TYPE_LOGIC_OR;
        return concatenate(Uint8Array, input1, input2, Bcs.getInstance().ser(ValueType.TYPE_U8, op), Bcs.getInstance().ser(ValueType.TYPE_U8, 2), ) as  Uint8Array;
    }
    static input_not(input:Uint8Array) : Uint8Array {
        return concatenate(Uint8Array, input, Bcs.getInstance().ser(ValueType.TYPE_U8, OperatorType.TYPE_LOGIC_NOT)) as Uint8Array;
    }

    static match_u256(type:number) : boolean {
        return (type == ValueType.TYPE_U8 || type == ValueType.TYPE_U64 || type == ValueType.TYPE_U128 || type == ValueType.TYPE_U256);
    }
}




