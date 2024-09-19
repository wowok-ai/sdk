

import { Protocol, LogicsInfo, GuardAddress, FnCallType, Data_Type, MODULES, ContextType, ValueType,  OperatorType, ConstantType, SER_VALUE} from './protocol';
import { concatenate, array_equal } from './utils';
import { IsValidDesription, Bcs, IsValidInt, IsValidAddress, FirstLetterUppercase } from './utils';
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

                txb.moveCall({
                    target:Protocol.Instance().GuardFn("constant_add") as FnCallType,
                    arguments:[guard, txb.pure.u8(k), txb.pure.u8(v.type), txb.pure.vector('u8', [].slice.call(v.witness)), txb.pure.bool(true)]
                })            
            } else {
                if (!v.value)   {
                    ERROR(Errors.InvalidParam, 'constants type')
                }
    
                txb.moveCall({
                    target:Protocol.Instance().GuardFn("constant_add") as FnCallType,
                    arguments:[guard, txb.pure.u8(k), txb.pure.u8(v.type), txb.pure.vector('u8', [].slice.call(v.value)), txb.pure.bool(true)]
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
    
        [MODULES.repository, 'Permission', 11, [], ValueType.TYPE_ADDRESS, 'Permission object address.'],
        [MODULES.repository, 'Contains Policy', 12, [ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Is a consensus policy included?', 'Input:the filed name'],
        [MODULES.repository, 'Is Permission set of Policy', 13, [ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Does a certain consensus policy set data operation permissions?', 'Input:the policy name'],
        [MODULES.repository, 'Permission of Policy', 14, [ValueType.TYPE_STRING], ValueType.TYPE_U64, 'The permission index of a certain consensus policy in the Permission object.', 'Input:the policy name'],
        [MODULES.repository, 'Value Type of Policy',  15, [ValueType.TYPE_STRING], ValueType.TYPE_U8, 'Data types defined by consensus policy.', 'Input:the policy name'],
        [MODULES.repository, 'Contains Data for An Address', 16, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether data exists at a certain address?', 'Input:address'],   
        [MODULES.repository, 'Contains Data', 17, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Does it contain data for a certain field of an address?', 'Input 1:address, Input 2:the field name'],
        [MODULES.repository, 'Data without Type', 18, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_VEC_U8, 'Data for a field at an address and does not contain data type information.', 'Input 1:address, Input 2:the field name'],       
        [MODULES.repository, 'Value', 19, [ValueType.TYPE_ADDRESS, ValueType.TYPE_STRING], ValueType.TYPE_VEC_U8, 'Data for a field at an address, and the first byte contains data type information.', 'Input 1:address, Input 2:the field name'],
        [MODULES.repository, 'Type', 20, [], ValueType.TYPE_U8, 'The repository Type. 0: Normal; 1: Wowok greenee.'],   
        [MODULES.repository, 'Policy Mode', 21, [], ValueType.TYPE_U8, 'Policy Mode. 0: Free mode;  1: Strict mode.'],   
        [MODULES.repository, 'Reference Count', 22, [], ValueType.TYPE_U64, 'The number of times it is referenced by other objects.'],   
        [MODULES.repository, 'Is Referenced by An Object', 23, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Is it referenced by an object?', 'Input:address'],   
        // , means that data fields and data outside the consensus policy definition are allowed to be written
        // , means that only data fields and data defined by the consensus policy are allowed to be written.
        [MODULES.machine, 'Permission', 31, [], ValueType.TYPE_ADDRESS, 'Permission object address.'],
        [MODULES.machine, 'Paused', 32, [], ValueType.TYPE_BOOL, 'Pause the creation of new Progress?'],
        [MODULES.machine, 'Published', 33, [], ValueType.TYPE_BOOL, 'Is it allowed to create Progress?'],
        [MODULES.machine, 'Is Consensus Repository', 34, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether an address is a consensus repository?', 'Input:adddress'],
        [MODULES.machine, 'Has Endpoint', 35, [], ValueType.TYPE_BOOL, 'Is the endpoint set?'],   
        [MODULES.machine, 'Endpoint', 36, [], ValueType.TYPE_STRING, 'Endpoint url/ipfs.'],
    
        [MODULES.progress, 'Machine', 51, [], ValueType.TYPE_ADDRESS, 'The Machine object that created this Progress.'],       
        [MODULES.progress, 'Current Node', 52, [], ValueType.TYPE_STRING, 'The name of the currently running node.'],
        [MODULES.progress, 'Has Parent', 53, [], ValueType.TYPE_BOOL, 'Is the parent Progress defined?'],   
        [MODULES.progress, 'Parent', 54, [], ValueType.TYPE_ADDRESS, 'The parent Progress, that contains some child Progress.'],   
        [MODULES.progress, 'Has Task', 55, [], ValueType.TYPE_BOOL, 'Does it contain clear task(eg. an Order)?'],       
        [MODULES.progress, 'Task', 56, [], ValueType.TYPE_ADDRESS, 'Task object address.'],
        [MODULES.progress, 'Has Unique Permission', 57, [ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Does Progress define a unique operation permission?', 'Input:opertor name'],   
        [MODULES.progress, 'Is Unique Permission Operator', 58, [ValueType.TYPE_STRING, ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Is an address an operator with unique permissions?', 'Input 1:operator name; Input 2:address'], 
        [MODULES.progress, 'Has Context Repository', 59, [], ValueType.TYPE_BOOL, 'Whether the repository reference for Progress is set?'],
        [MODULES.progress, 'Context Repository', 60, [], ValueType.TYPE_ADDRESS, 'Repository reference for Progress.'],   
        [MODULES.progress, 'Last Session Time', 61, [], ValueType.TYPE_U64, 'Time when the previous session was completed.'],
        [MODULES.progress, 'Session Time', 62, [ValueType.TYPE_STRING], ValueType.TYPE_U64, 'Time a node completes its session.', 'Input:the node name'],  

        [MODULES.demand, 'Permission', 71, [], ValueType.TYPE_ADDRESS, 'Permission object address.'],       
        [MODULES.demand, 'Has Deadline', 72, [], ValueType.TYPE_BOOL, 'Whether to set the expiration time of presenting?'],
        [MODULES.demand, 'Deadline', 73, [], ValueType.TYPE_U64, 'The expiration time of presenting.'],   
        [MODULES.demand, 'Bounty Count', 74, [], ValueType.TYPE_U64, 'Number of Bounties.'],   
        [MODULES.demand, 'Has Guard', 75, [], ValueType.TYPE_BOOL, 'Whether the present guard is set?'],       
        [MODULES.demand, 'Guard', 76, [], ValueType.TYPE_ADDRESS, 'The present guard address.'],
        [MODULES.demand, 'Has Service Picked', 77, [], ValueType.TYPE_BOOL, 'Whether a service has been picked and bounties given?'],   
        [MODULES.demand, 'Service Picked', 78, [], ValueType.TYPE_ADDRESS, 'Service address that has been picked.'], 
        [MODULES.demand, 'Presenter Count', 79, [], ValueType.TYPE_U64, 'Number of presenters.'],
        [MODULES.demand, 'Has Presenter', 80, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Is a certain address a presenter?', 'Input:address'],   
        [MODULES.demand, 'Who Got Bounty', 81, [ValueType.TYPE_ADDRESS], ValueType.TYPE_ADDRESS, 'The address that bounties given.', 'Input:address'], 
    
        [MODULES.order, 'Amount', 91, [], ValueType.TYPE_U64, 'Order amount.'],       
        [MODULES.order, 'Payer', 92, [], ValueType.TYPE_ADDRESS, 'Order payer.'],
        [MODULES.order, 'Service', 93, [], ValueType.TYPE_ADDRESS, 'Service for creating orders.'],   
        [MODULES.order, 'Has Progress', 94, [], ValueType.TYPE_BOOL, 'Is there a Progress for executing the order process?'],   
        [MODULES.order, 'Progress', 95, [], ValueType.TYPE_ADDRESS, 'Progress address for executing the order process.'],       
        [MODULES.order, 'Required Info Counts', 96, [], ValueType.TYPE_U64, 'How much customer information is required for this order?'],
        [MODULES.order, 'Discount Used', 97, [], ValueType.TYPE_BOOL, 'Discount coupon used for this order?'],   
        [MODULES.order, 'Discount', 98, [], ValueType.TYPE_ADDRESS, 'Discount address that already used.'], 
        [MODULES.order, 'Balance', 99, [], ValueType.TYPE_U64, 'The amount currently in the order.'], 
        [MODULES.order, 'Refunded', 100, [], ValueType.TYPE_BOOL, 'Whether a refund has occurred?'],
        [MODULES.order, 'Withdrawed', 101, [], ValueType.TYPE_BOOL, 'Whether a service provider withdrawal has occurred?'],   
    
        [MODULES.service, 'Permission', 111, [], ValueType.TYPE_ADDRESS, 'Permission object address.'],       
        [MODULES.service, 'Payee', 112, [], ValueType.TYPE_ADDRESS, 'Payee address, that all order withdrawals will be collected to this address.'],
        [MODULES.service, 'Has Buying Guard', 113, [], ValueType.TYPE_BOOL, 'Is the guard condition of buying set?'],   
        [MODULES.service, 'Buying Guard', 114, [], ValueType.TYPE_ADDRESS, 'Buying guard, that Purchase only if you meet the conditions of the guard.'],   
        [MODULES.service, 'Contains Repository', 115, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, "Is a certain repository one of the service's consensus repositories?", 'Input:address'],       
        [MODULES.service, 'Has Withdrawing Guard', 116, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether a certain guard is set when withdrawing money?', 'Input:address'],
        [MODULES.service, 'Withdrawing Guard Percent', 117, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The percentage of withdrawals allowed by a certain withdrawal guard.', 'Input:address'],   
        [MODULES.service, 'Has Refunding Guard', 118, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether a certain guard is set when refunding money?', 'Input:address'], 
        [MODULES.service, 'Refunding Guard Percent', 119, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The percentage of refund allowed by a certain refund guard.', 'Input:address'],
        [MODULES.service, 'Has Sales Item', 120, [ValueType.TYPE_STRING], ValueType.TYPE_BOOL, 'Is there a sales item for the service?', 'Input:the item name'],   
        [MODULES.service, 'Sale Item Price', 121, [ValueType.TYPE_STRING], ValueType.TYPE_U64, 'What is the price of a certain sale item?', 'Input:the item name'], 
        [MODULES.service, 'Sale Item Inventory', 122, [ValueType.TYPE_STRING], ValueType.TYPE_U64, 'How much inventory is there for a certain sales item?', 'Input:the item name'], 
        [MODULES.service, 'Has Machine', 123, [], ValueType.TYPE_BOOL, "Has the machine(progress generator) that serves the order been set up?"],
        [MODULES.service, 'Machine', 124, [], ValueType.TYPE_ADDRESS, 'Machine address, that generate progresses serving the execution process of order.'],  
        [MODULES.service, 'Paused', 125, [], ValueType.TYPE_BOOL, 'Pause the creation of new order?'], 
        [MODULES.service, 'Published', 126, [], ValueType.TYPE_BOOL, 'Is it allowed to create orders?'], 
        [MODULES.service, 'Has Required Info', 127, [], ValueType.TYPE_BOOL, 'Whether the necessary information that needs to be provided by the customer is set?'],
        [MODULES.service, 'Required Info of Service-Pubkey', 128, [], ValueType.TYPE_STRING, 'The public key used to encrypt customer information, and only the service provider can decrypt and view customer information.'],   
        [MODULES.service, 'Required Info', 129, [], ValueType.TYPE_VEC_STRING, 'Names of the required information item that needs to be provided by the customer.'],  
    
        [MODULES.reward, 'Permission', 151, [], ValueType.TYPE_ADDRESS, 'Permission object address.'],       
        [MODULES.reward, 'Rewards Remaining', 152, [], ValueType.TYPE_U64, 'Number of rewards to be claimed.'],
        [MODULES.reward, 'Reward Count Supplied', 153, [], ValueType.TYPE_U64, 'Total rewards supplied.'],   
        [MODULES.reward, 'Guard Count', 154, [], ValueType.TYPE_U64, 'The number of claiming guards.'],   
        [MODULES.reward, 'Has Guard', 155, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether a claiming guard is set up?', 'Input:address'],       
        [MODULES.reward, 'Guard Portion', 156, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The portions of rewards, that can be claimed if a certain guard condition is met.', 'Input:address'],
        [MODULES.reward, 'Deadline', 157, [], ValueType.TYPE_U64, 'The expiration time of claiming.'],   
        [MODULES.reward, 'Has Claimed by An Address', 158, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether a certain address has claimed rewards?', 'Input:address'], 
        [MODULES.reward, 'Portions Claimed by An Address', 159, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The portions of rewards that have been claimed by a certain address.'],
        [MODULES.reward, 'Number of Addresses Claimed', 160, [], ValueType.TYPE_U64, 'Number of addresses that have claimed rewards.'],   
        [MODULES.reward, 'Is Sponsor', 161, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether an address is a sponsor of the reward pool?', 'Input:address'], 
        [MODULES.reward, 'Portions by A Sponsor', 162, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The portions of sponsorship reward pools for a certain address.', 'Input:address'], 
        [MODULES.reward, 'Number of Sponsors', 163, [], ValueType.TYPE_U64, 'Number of sponsors in the sponsorship reward pool.'],
        [MODULES.reward, 'Allow Repeated Claims', 164, [], ValueType.TYPE_BOOL, 'Whether to allow repeated claims?'],  
    
/*        [MODULES.vote, 'Permission', 171, [], ValueType.TYPE_ADDRESS],       
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

        [MODULES.wowok, 'Builder', 210, [], ValueType.TYPE_ADDRESS, 'Builder address of Wowok.'], 
        [MODULES.wowok, 'Everyone Guard', 211, [], ValueType.TYPE_ADDRESS, 'A guard that all addresses can pass through.'], 
        [MODULES.wowok, 'Object of Entities', 212, [], ValueType.TYPE_ADDRESS, 'The address of entity information object.'],
        [MODULES.wowok, 'Grantor Count', 213, [], ValueType.TYPE_U64, 'Number of registered grantors.'],   
        [MODULES.wowok, 'Has Grantor', 214, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether an address has been registered as a grantor?', , 'Input:address'], 
        [MODULES.wowok, 'Grantor Name', 215, [ValueType.TYPE_ADDRESS], ValueType.TYPE_STRING, "Name of a grantor.", 'Input:address'], 
        [MODULES.wowok, 'Grantor Registration Time', 216, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'Registration time of a grantor.', 'Input:address'], 
        [MODULES.wowok, 'Grantor Expired Time', 217, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The expiration time of a grantor.', 'Input:address'], 
        [MODULES.wowok, 'Grantee Object for Grantor', 218, [ValueType.TYPE_ADDRESS], ValueType.TYPE_ADDRESS, 'Grantee repository address of a grantor.', 'Input:address'], 

        [MODULES.entity, 'Contains Entity?', 230, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Is an entity already registered?', 'Input:address'], 
        [MODULES.entity, 'Likes', 231, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The number of likes for an address by other addresses.', 'Input:address'], 
        [MODULES.entity, 'Dislikes', 232, [ValueType.TYPE_ADDRESS], ValueType.TYPE_U64, 'The number of dislikes for an address by other addresses.', 'Input:address'], 
        [MODULES.entity, 'Entity Info', 233, [ValueType.TYPE_ADDRESS], ValueType.TYPE_VEC_U8, 'Public information about an entity.', 'Input:address'], 
        [MODULES.entity, 'Has Resource by Entity?', 234, [ValueType.TYPE_ADDRESS], ValueType.TYPE_BOOL, 'Whether an entity created a resource?', 'Input:address'], 
        [MODULES.entity, 'Entity Resource', 235, [ValueType.TYPE_ADDRESS], ValueType.TYPE_ADDRESS, 'The address of a resource object created by an entity.', 'Input:address'], 
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
        return [...Guard.CmdFilter(ValueType.TYPE_VEC_U8), ...Guard.CmdFilter(ValueType.TYPE_STRING)].map((v) => {
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
    
    static add_constant(constants:GuardConstant, identifier:number, type:ValueType|ContextType, value:any, bNeedSerialize=true) {
        if (!GuardConstantHelper.IsValidIndentifier(identifier)) {
            ERROR(Errors.InvalidParam, 'add_constant identifier')
        }
        if (!value) {
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
                let ser = SER_VALUE.find(s=>s.type==type);
                if (!ser) ERROR(Errors.Fail, 'add_constant: invalid type');
                if (bNeedSerialize) {
                    constants.set(identifier, {type:type, value:Bcs.getInstance().ser(ser!.type as number, value)}) 
                } else {
                    constants.set(identifier, {type:type, value:value}) 
                }
                return    
            default:
                ERROR(Errors.Fail, 'add_constant  serialize not impl yet')
        }
    }
}
export class GuardMaker {
    protected data : Uint8Array[] = [];
    protected type_validator : Data_Type[] = [];
    protected constant : GuardConstant = new Map<number, Guard_Variable>();

    private static index: number = 0;
    private static get_index() { 
        if (GuardMaker.index == 256) {
            GuardMaker.index = 0;
        }
        return GuardMaker.index++
    }

    constructor() { }

    add_constant(type:ConstantType, value:any, identifier?:number, bNeedSerialize=true) : number {
        if (identifier === undefined) identifier = GuardMaker.get_index();
        if (type == ContextType.TYPE_WITNESS_ID) {
            // add witness to constant
            GuardConstantHelper.add_future_constant(this.constant, identifier, value, undefined, bNeedSerialize);
        } else {
            GuardConstantHelper.add_constant(this.constant, identifier, type, value, bNeedSerialize);
        }
        return identifier
    }

    private  serValueParam(type:ValueType, param?:any) {
        if (!param) ERROR(Errors.InvalidParam, 'param');
        this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
        let ser = SER_VALUE.find(s=>s.type==type);
        if (!ser) ERROR(Errors.Fail, 'serValueParam: invalid type');
        this.data.push(Bcs.getInstance().ser(ser!.type as number, param));
        this.type_validator.push(type);
    }

    // serialize const & data
    add_param(type:ValueType | ContextType, param?:any) : GuardMaker {
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
            if (!param) ERROR(Errors.InvalidParam, 'param');
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
            if (!param) ERROR(Errors.InvalidParam, 'param');
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_ADDRESS, param));
            this.type_validator.push(ValueType.TYPE_ADDRESS);
            break;   
        case ContextType.TYPE_CONSTANT:
            if (!param) {
                ERROR(Errors.InvalidParam, 'param invalid');
            }
            if (typeof(param) != 'number' || !IsValidInt(param) || param > 255) {
                ERROR(Errors.InvalidParam, 'add_param param');
            }
            
            var v = this.constant.get(param);
            if (!v) ERROR(Errors.Fail, 'identifier not in constant');
            this.type_validator.push(v!.type);
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type));
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, param));
            break;
        default:
            ERROR(Errors.InvalidParam, 'add_param type' + type);
        };
        return this;
    }

    // object_address_from: string for static address; number as identifier  inconstant
    add_query(module:MODULES, query_name:string, object_address_from:string | number, bWitness:boolean=false) : GuardMaker {
        let query_index = Guard.QUERIES.findIndex((q) => { return q[0] ==  module && q[1]  == query_name})
        if (query_index == -1)  {
            ERROR(Errors.InvalidParam, 'query_name');
        }

        if (typeof(object_address_from) == 'number' ) {
            if (!GuardConstantHelper.IsValidIndentifier(object_address_from)) {
                ERROR(Errors.InvalidParam, 'object_address_from');
            }
        } else {
            if (!IsValidAddress(object_address_from)) {
                ERROR(Errors.InvalidParam, 'object_address_from');
            }
        }

        let offset = this.type_validator.length - Guard.QUERIES[query_index][3].length;
        if (offset < 0) { 
            ERROR(Errors.InvalidParam, 'query_name');
        }

        let types = this.type_validator.slice(offset);
        if (!array_equal(types, Guard.QUERIES[query_index][3])) { // type validate 
            ERROR(Errors.Fail, 'array_equal');
        }
        
        this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, OperatorType.TYPE_QUERY)); // QUERY TYPE
        if (typeof(object_address_from) == 'string') {
            bWitness ? this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, ContextType.TYPE_WITNESS_ID)) :
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, ValueType.TYPE_ADDRESS)); 
            this.data.push(Bcs.getInstance().ser(ValueType.TYPE_ADDRESS, object_address_from)); // object address            
        } else {
            let v =  this.constant.get(object_address_from);
            if (!v) ERROR(Errors.Fail, 'object_address_from not in constant');
            if ((bWitness && v?.type == ContextType.TYPE_WITNESS_ID) || (!bWitness && v?.type == ValueType.TYPE_ADDRESS)) {
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, ContextType.TYPE_CONSTANT));
                this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, object_address_from)); // object identifer in constants
            } else {
                ERROR(Errors.Fail, 'type bWitness not match')
            }
        }

        this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, Guard.QUERIES[query_index][2])); // cmd
        this.type_validator.splice(offset, Guard.QUERIES[query_index][3].length); // delete type stack
        this.type_validator.push(Guard.QUERIES[query_index][4]); // add the return value type to type stack
        return this;
    }

    add_logic(type:OperatorType) : GuardMaker {
        let splice_len = 2;
        let ret = ValueType.TYPE_BOOL;
        switch (type) {
            case OperatorType.TYPE_LOGIC_AS_U256_GREATER:
            case OperatorType.TYPE_LOGIC_AS_U256_GREATER_EQUAL:
            case OperatorType.TYPE_LOGIC_AS_U256_LESSER:
            case OperatorType.TYPE_LOGIC_AS_U256_LESSER_EQUAL:
            case OperatorType.TYPE_LOGIC_AS_U256_EQUAL:
                if (this.type_validator.length < splice_len)  { ERROR(Errors.Fail, 'type_validator.length') }
                if (!GuardMaker.match_u256(this.type_validator[this.type_validator.length - 1])) { ERROR(Errors.Fail, 'type_validator check') }
                if (!GuardMaker.match_u256(this.type_validator[this.type_validator.length - 2])) { ERROR(Errors.Fail, 'type_validator check')  }
                break;
            case OperatorType.TYPE_LOGIC_EQUAL:
                if (this.type_validator.length < splice_len)  { ERROR(Errors.Fail, 'type_validator.length') }
                break;
            case OperatorType.TYPE_LOGIC_HAS_SUBSTRING:
                if (this.type_validator.length < splice_len)  { ERROR(Errors.Fail, 'type_validator.length') }
                break;
            case OperatorType.TYPE_LOGIC_NOT:
                splice_len =  1;
                if (this.type_validator.length < splice_len) { ERROR(Errors.Fail, 'type_validator.length') }
                if (this.type_validator[this.type_validator.length -1] != ValueType.TYPE_BOOL) { ERROR(Errors.Fail, 'type_validator check')  }
                break;
            case OperatorType.TYPE_LOGIC_AND:
            case OperatorType.TYPE_LOGIC_OR:
                if (this.type_validator.length < splice_len)  { ERROR(Errors.Fail, 'type_validator.length') }
                if (this.type_validator[this.type_validator.length -1] != ValueType.TYPE_BOOL) { ERROR(Errors.Fail, 'type_validator check')  }
                if (this.type_validator[this.type_validator.length -2] != ValueType.TYPE_BOOL) { ERROR(Errors.Fail, 'type_validator check')  }
                break;
            case OperatorType.TYPE_LOGIC_ALWAYS_TRUE:
                break;
            case OperatorType.TYPE_NUMBER_ADD:
            case OperatorType.TYPE_NUMBER_DEVIDE:
            case OperatorType.TYPE_NUMBER_MULTIPLY:
            case OperatorType.TYPE_NUMBER_SUBTRACT:
            case OperatorType.TYPE_NUMBER_MOD:
                if (this.type_validator.length < splice_len)  { ERROR(Errors.Fail, 'type_validator.length') }
                if (!GuardMaker.IsNumberType(this.type_validator[this.type_validator.length -1])) { ERROR(Errors.Fail, 'type_validator check')  }
                if (!GuardMaker.IsNumberType(this.type_validator[this.type_validator.length -2])) { ERROR(Errors.Fail, 'type_validator check')  }
                ret = ValueType.TYPE_U256;
                break;
            default:
                ERROR(Errors.InvalidParam, 'add_logic type invalid' + type) 
        }
        this.data.push(Bcs.getInstance().ser(ValueType.TYPE_U8, type)); // TYPE     
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
        maker.data.push(concatenate(Uint8Array, ...this.data, ...otherBuilt.data, Bcs.getInstance().ser(ValueType.TYPE_U8, op)));
        this.data.splice(0, this.data.length-1);
        maker.type_validator = this.type_validator;
        return maker
    }

    get_constant() { return this.constant  }
    get_input() { return this.data }

    static input_combine(input1:Uint8Array, input2:Uint8Array, bAnd:boolean = true) : Uint8Array {
        let op = bAnd ? OperatorType.TYPE_LOGIC_AND :  OperatorType.TYPE_LOGIC_OR;
        return concatenate(Uint8Array, input1, input2, Bcs.getInstance().ser(ValueType.TYPE_U8, op)) as  Uint8Array;
    }
    static input_not(input:Uint8Array) : Uint8Array {
        return concatenate(Uint8Array, input, Bcs.getInstance().ser(ValueType.TYPE_U8, OperatorType.TYPE_LOGIC_NOT)) as Uint8Array;
    }

    static match_u256(type:number) : boolean {
        if (type == ValueType.TYPE_U8 || 
            type == ValueType.TYPE_U64 || 
            type == ValueType.TYPE_U128 ||
            type == ValueType.TYPE_U256) {
                return true;
        }
        return false;
    }
}




