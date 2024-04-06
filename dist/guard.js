"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sense_objects_fn = exports.description_fn = exports.parse_sense_bsc = exports.SenseMaker = exports.Sense_Cmd = exports.signer_guard = exports.launch = exports.Guard_Sense_Binder = exports.MAX_SENSE_COUNT = void 0;
const bcs_1 = require("@mysten/bcs");
const protocol_1 = require("./protocol");
const util_1 = require("./util");
exports.MAX_SENSE_COUNT = 16;
var Guard_Sense_Binder;
(function (Guard_Sense_Binder) {
    Guard_Sense_Binder[Guard_Sense_Binder["AND"] = 0] = "AND";
    Guard_Sense_Binder[Guard_Sense_Binder["OR"] = 1] = "OR";
})(Guard_Sense_Binder || (exports.Guard_Sense_Binder = Guard_Sense_Binder = {}));
function launch(txb, creation) {
    if (!(0, protocol_1.IsValidDesription)(creation.description))
        return false;
    if (!creation.senses)
        return false;
    let bValid = true;
    creation.senses.forEach((v) => {
        if (v.input.length == 0)
            bValid = false;
    });
    if (!bValid)
        return false;
    let guard = txb.moveCall({
        target: protocol_1.PROTOCOL.GuardFn('new'),
        arguments: [txb.pure(creation.description, bcs_1.BCS.STRING)],
    });
    creation.senses.forEach((sense) => {
        txb.moveCall({
            target: protocol_1.PROTOCOL.GuardFn('sense_add'),
            arguments: [guard, txb.pure([].slice.call(sense.input)),
                txb.pure(sense.notAfterSense, bcs_1.BCS.BOOL),
                txb.pure(sense.binder, bcs_1.BCS.U8),
            ]
        });
    });
    return txb.moveCall({
        target: protocol_1.PROTOCOL.GuardFn("create"),
        arguments: [guard]
    });
}
exports.launch = launch;
function signer_guard(txb) {
    txb.moveCall({
        target: protocol_1.PROTOCOL.GuardFn('signer_guard'),
        arguments: []
    }); // { kind: 'Result', index: 0 }, ref to address could used by PTB
    return true;
}
exports.signer_guard = signer_guard;
exports.Sense_Cmd = [[protocol_1.MODULES.permission, 'creator', 1, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.permission, 'is_admin', 2, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.permission, 'has_rights', 3, [protocol_1.ValueType.TYPE_STATIC_address, protocol_1.ValueType.TYPE_STATIC_u64], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.permission, 'contains_address', 4, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.permission, 'contains_index', 5, [protocol_1.ValueType.TYPE_STATIC_address, protocol_1.ValueType.TYPE_STATIC_u64], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.permission, 'contains_guard', 6, [protocol_1.ValueType.TYPE_STATIC_address, protocol_1.ValueType.TYPE_STATIC_u64], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.repository, 'permission', 1, [], protocol_1.ValueType.TYPE_STATIC_address],
    [protocol_1.MODULES.repository, 'policy_contains', 2, [protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.repository, 'policy_has_permission_index', 3, [protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.repository, 'policy_permission_index', 4, [protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_u64],
    [protocol_1.MODULES.repository, 'policy_value_type', 5, [protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_u8],
    [protocol_1.MODULES.repository, 'contains_id', 6, [protocol_1.ValueType.TYPE_STATIC_address], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.repository, 'contains_value', 7, [protocol_1.ValueType.TYPE_STATIC_address, protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_bool],
    [protocol_1.MODULES.repository, 'value_without_type', 8, [protocol_1.ValueType.TYPE_STATIC_address, protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_vec_u8],
    [protocol_1.MODULES.repository, 'value', 9, [protocol_1.ValueType.TYPE_STATIC_address, protocol_1.ValueType.TYPE_STATIC_vec_u8], protocol_1.ValueType.TYPE_STATIC_vec_u8],
    [protocol_1.MODULES.repository, 'type', 10, [], protocol_1.ValueType.TYPE_STATIC_u8],
    [protocol_1.MODULES.repository, 'policy_mode', 11, [], protocol_1.ValueType.TYPE_STATIC_u8],
];
class SenseMaker {
    data = [];
    type_validator = [];
    constructor() { }
    // serialize const & data
    add_param(type, param) {
        const bcs = new bcs_1.BCS((0, bcs_1.getSuiMoveConfig)());
        switch (type) {
            case protocol_1.ValueType.TYPE_STATIC_address:
                this.data.push(bcs.ser(bcs_1.BCS.U8, type).toBytes());
                this.data.push(bcs.ser(bcs_1.BCS.ADDRESS, param).toBytes());
                this.type_validator.push(type);
                break;
            case protocol_1.ValueType.TYPE_STATIC_bool:
                this.data.push(bcs.ser(bcs_1.BCS.U8, type).toBytes());
                this.data.push(bcs.ser(bcs_1.BCS.BOOL, param).toBytes());
                this.type_validator.push(type);
                break;
            case protocol_1.ValueType.TYPE_STATIC_u8:
                this.data.push(bcs.ser(bcs_1.BCS.U8, type).toBytes());
                this.data.push(bcs.ser(bcs_1.BCS.U8, param).toBytes());
                this.type_validator.push(type);
                break;
            case protocol_1.ValueType.TYPE_STATIC_u64:
                this.data.push(bcs.ser(bcs_1.BCS.U8, type).toBytes());
                this.data.push(bcs.ser(bcs_1.BCS.U64, param).toBytes());
                this.type_validator.push(type);
                break;
            case protocol_1.ValueType.TYPE_STATIC_vec_u8:
                this.data.push(bcs.ser(bcs_1.BCS.U8, type).toBytes());
                this.data.push(bcs.ser("vector<u8>", param).toBytes());
                this.type_validator.push(type);
                // this.data[this.data.length-1].forEach((item : number) => console.log(item))
                break;
            case protocol_1.ContextType.TYPE_CONTEXT_SIGNER:
                this.data.push(bcs.ser(bcs_1.BCS.U8, type).toBytes());
                this.type_validator.push(protocol_1.ValueType.TYPE_STATIC_address);
                break;
            case protocol_1.ContextType.TYPE_CONTEXT_CURRENT_CLOCK:
                this.data.push(bcs.ser(bcs_1.BCS.U8, type).toBytes());
                this.type_validator.push(protocol_1.ValueType.TYPE_STATIC_u64);
                break;
            case protocol_1.ContextType.TYPE_CONTEXT_CURRENT_PROGRESS:
                this.data.push(bcs.ser(bcs_1.BCS.U8, type).toBytes());
                this.type_validator.push(protocol_1.ValueType.TYPE_STATIC_address);
                break;
            default:
                return false;
        }
        ;
        return true;
    }
    add_cmd(object_address, sense_index) {
        if (!object_address || sense_index >= exports.Sense_Cmd.length) {
            return false;
        }
        let offset = this.type_validator.length - exports.Sense_Cmd[sense_index][3].length;
        if (offset < 0) {
            return false;
        }
        let types = this.type_validator.slice(offset);
        if (!(0, util_1.array_equal)(types, exports.Sense_Cmd[sense_index][3])) { // type validate 
            return false;
        }
        const bcs = new bcs_1.BCS((0, bcs_1.getSuiMoveConfig)());
        this.data.push(bcs.ser(bcs_1.BCS.U8, protocol_1.OperatorType.TYPE_DYNAMIC_QUERY).toBytes()); // TYPE
        this.data.push(bcs.ser(bcs_1.BCS.ADDRESS, object_address).toBytes()); // object address
        this.data.push(bcs.ser(bcs_1.BCS.U8, exports.Sense_Cmd[sense_index][2]).toBytes()); // cmd
        this.type_validator.splice(offset, exports.Sense_Cmd[sense_index][3].length); // delete type stack
        this.type_validator.push(exports.Sense_Cmd[sense_index][4]); // add the return value type to type stack
        // console.log(this.type_validator)
        return true;
    }
    add_logic(type) {
        switch (type) {
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_EQUAL:
                if (this.type_validator.length < 2) {
                    return false;
                }
                if (!match_u128(this.type_validator[this.type_validator.length - 1])) {
                    return false;
                }
                if (!match_u128(this.type_validator[this.type_validator.length - 2])) {
                    return false;
                }
                break;
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_HAS_SUBSTRING:
                if (this.type_validator.length < 2) {
                    return false;
                }
                break;
            default:
                return false;
        }
        const bcs = new bcs_1.BCS((0, bcs_1.getSuiMoveConfig)());
        this.data.push(bcs.ser(bcs_1.BCS.U8, type).toBytes()); // TYPE     
        this.type_validator.splice(this.type_validator.length - 2); // delete type stack   
        this.type_validator.push(protocol_1.ValueType.TYPE_STATIC_bool); // add bool to type stack
        return true;
    }
    make(bNotAfterSense, binder) {
        //console.log(this.type_validator);
        //this.data.forEach((value:Uint8Array) => console.log(value));
        if (this.type_validator.length != 1 || this.type_validator[0] != protocol_1.ValueType.TYPE_STATIC_bool) {
            return false;
        } // ERROR
        let input = (0, util_1.concatenate)(Uint8Array, ...this.data);
        const sense = { input: input, notAfterSense: bNotAfterSense, binder: binder };
        return sense;
    }
}
exports.SenseMaker = SenseMaker;
function match_u128(type) {
    if (type == protocol_1.ValueType.TYPE_STATIC_option_u8 ||
        type == protocol_1.ValueType.TYPE_STATIC_option_u64 ||
        type == protocol_1.ValueType.TYPE_STATIC_option_u128) {
        return true;
    }
    return false;
}
// parse guard senses input bytes of a guard, return [objectids] for 'query_cmd' 
function parse_sense_bsc(chain_sense_bsc) {
    // console.log(data);
    var array = [].slice.call(chain_sense_bsc.reverse());
    const bcs = new bcs_1.BCS((0, bcs_1.getSuiMoveConfig)());
    var result = [];
    while (array.length > 0) {
        var type = array.shift();
        // console.log(type);
        switch (type) {
            case protocol_1.ContextType.TYPE_CONTEXT_SIGNER:
            case protocol_1.ContextType.TYPE_CONTEXT_CURRENT_CLOCK:
            case protocol_1.ContextType.TYPE_CONTEXT_CURRENT_PROGRESS:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_GREATER_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_LESSER_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_U128_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_EQUAL:
            case protocol_1.OperatorType.TYPE_LOGIC_OPERATOR_HAS_SUBSTRING:
                break;
            case protocol_1.ValueType.TYPE_STATIC_address:
                //console.log('0x' + bcs.de(BCS.ADDRESS,  Uint8Array.from(array)).toString());
                array.splice(0, 32);
                break;
            case protocol_1.ValueType.TYPE_STATIC_bool:
            case protocol_1.ValueType.TYPE_STATIC_u8:
                array.splice(0, 1);
                break;
            case protocol_1.ValueType.TYPE_STATIC_u64:
                array.splice(0, 8);
                break;
            case protocol_1.ValueType.TYPE_STATIC_u128:
                array.splice(0, 16);
                break;
            case protocol_1.ValueType.TYPE_STATIC_vec_u8:
                let { value, length } = (0, util_1.ulebDecode)(Uint8Array.from(array));
                array.splice(0, value + length);
                break;
            case protocol_1.OperatorType.TYPE_DYNAMIC_QUERY:
                result.push('0x' + bcs.de(bcs_1.BCS.ADDRESS, Uint8Array.from(array)).toString());
                array.splice(0, 33); // address + cmd
                break;
            default:
                // console.log('parse_sense_bsc:undefined');
                return false; // error
        }
    }
    return result;
}
exports.parse_sense_bsc = parse_sense_bsc;
const MODULE_GUARD_INDEX = 7;
const description_fn = (response, param, option) => {
    if (!response.error) {
        let c = response?.data?.content;
        if (c.type == protocol_1.OBJECTS_TYPE[MODULE_GUARD_INDEX] && c.fields.id.id == param.objectid) { // GUARD OBJECT
            let description = c.fields.description;
            if (!param.data.includes(description)) {
                param.data.push(description);
            }
        }
    }
};
exports.description_fn = description_fn;
const sense_objects_fn = (response, param, option) => {
    if (!response.error) {
        let c = response?.data?.content;
        if (c.type == protocol_1.OBJECTS_TYPE[MODULE_GUARD_INDEX] && c.fields.id.id == param.objectid) { // GUARD OBJECT
            for (let i = 0; i < c.fields.senses.length; i++) {
                let sense = c.fields.senses[i];
                if (sense.type == (protocol_1.OBJECTS_TYPE_PREFIX[MODULE_GUARD_INDEX] + 'Sense')) { // ...::guard::Sense                    
                    let ids = parse_sense_bsc(Uint8Array.from(sense.fields.input.fields.bytes));
                    param.data = (0, util_1.array_unique)(param.data.concat(ids));
                }
            }
        }
    }
};
exports.sense_objects_fn = sense_objects_fn;
