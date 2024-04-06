"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.change_permission = exports.agree = exports.vote_lock_guard = exports.vote_expand_deadline = exports.vote_lock_deadline = exports.vote_open_voting = exports.vote_set_max_choice_count = exports.vote_remove_option = exports.vote_add_option = exports.vote_remove_guard = exports.vote_add_guard = exports.vote_set_reference = exports.vote_set_description = exports.destroy = exports.launch = exports.vote = exports.MAX_CHOICE_COUNT = exports.MAX_AGREES_COUNT = void 0;
const bcs_1 = require("@mysten/bcs");
const protocol_1 = require("./protocol");
const util_1 = require("./util");
exports.MAX_AGREES_COUNT = 200;
exports.MAX_CHOICE_COUNT = 200;
function vote(txb, permission, description, minutes_duration, max_choice_count, reference_address, passport) {
    if (!(0, protocol_1.IsValidObjects)([permission]))
        return false;
    if (!(0, protocol_1.IsValidDesription)(description))
        return false;
    if (!(0, protocol_1.IsValidUint)(minutes_duration))
        return false;
    if (max_choice_count && !(0, protocol_1.IsValidUint)(max_choice_count))
        return false;
    if (max_choice_count && max_choice_count > exports.MAX_CHOICE_COUNT)
        return false;
    if (reference_address && !(0, protocol_1.IsValidAddress)(reference_address))
        return false;
    let reference = reference_address ? txb.pure(util_1.BCS_CONVERT.ser_option_address(reference_address)) : (0, protocol_1.OptionNone)(txb);
    let choice_count = max_choice_count ? max_choice_count : 1;
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('new_with_passport'),
            arguments: [passport, txb.pure(description), reference, txb.pure(protocol_1.CLOCK_OBJECT),
                txb.pure(minutes_duration, bcs_1.BCS.U64), txb.pure(choice_count, bcs_1.BCS.U8), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('new'),
            arguments: [txb.pure(description), reference, txb.pure(protocol_1.CLOCK_OBJECT),
                txb.pure(minutes_duration, bcs_1.BCS.U64), txb.pure(choice_count, bcs_1.BCS.U8), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
}
exports.vote = vote;
function launch(txb, vote) {
    if (!(0, protocol_1.IsValidObjects)([vote]))
        return false;
    return txb.moveCall({
        target: protocol_1.PROTOCOL.VoteFn('create'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, vote)]
    });
}
exports.launch = launch;
function destroy(txb, vote) {
    if (!(0, protocol_1.IsValidObjects)([vote]))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.VoteFn('destroy'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, vote)]
    });
    return true;
}
exports.destroy = destroy;
function vote_set_description(txb, vote, permission, description, passport) {
    if (!(0, protocol_1.IsValidObjects)([vote, permission]))
        return false;
    if (!(0, protocol_1.IsValidDesription)(description))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('description_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, vote), txb.pure(description), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('description_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, vote), txb.pure(description), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    return true;
}
exports.vote_set_description = vote_set_description;
function vote_set_reference(txb, vote, permission, reference_address, passport) {
    if (!(0, protocol_1.IsValidObjects)([vote, permission]))
        return false;
    if (reference_address && !(0, protocol_1.IsValidAddress)(reference_address))
        return false;
    let reference = reference_address ? txb.pure(util_1.BCS_CONVERT.ser_option_address(reference_address)) : (0, protocol_1.OptionNone)(txb);
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('reference_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, vote), reference, (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('reference_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, vote), reference, (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    return true;
}
exports.vote_set_reference = vote_set_reference;
function vote_add_guard(txb, vote, permission, guard, vote_weight, passport) {
    if (!(0, protocol_1.IsValidObjects)([vote, permission, guard]))
        return false;
    if (!(0, protocol_1.IsValidUint)(vote_weight))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('guard_add_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, vote), (0, protocol_1.TXB_OBJECT)(txb, guard), txb.pure(vote_weight, bcs_1.BCS.U64), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('guard_add'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, vote), (0, protocol_1.TXB_OBJECT)(txb, guard), txb.pure(vote_weight, bcs_1.BCS.U64), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    return true;
}
exports.vote_add_guard = vote_add_guard;
function vote_remove_guard(txb, vote, permission, guard_address, removeall, passport) {
    if (!(0, protocol_1.IsValidObjects)([vote, permission]))
        return false;
    if (!removeall && !guard_address)
        return false;
    if (guard_address && !(0, protocol_1.IsValidArray)(guard_address, protocol_1.IsValidAddress))
        return false;
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.VoteFn('guard_remove_all_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, vote), (0, protocol_1.TXB_OBJECT)(txb, permission)]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.VoteFn('guard_remove_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, vote), txb.pure((0, util_1.array_unique)(guard_address), 'vector<address>'), (0, protocol_1.TXB_OBJECT)(txb, permission)]
            });
        }
    }
    else {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.VoteFn('guard_remove_all'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, vote), (0, protocol_1.TXB_OBJECT)(txb, permission)]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.VoteFn('guard_remove'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, vote), txb.pure((0, util_1.array_unique)(guard_address), 'vector<address>'), (0, protocol_1.TXB_OBJECT)(txb, permission)]
            });
        }
    }
    return true;
}
exports.vote_remove_guard = vote_remove_guard;
function vote_add_option(txb, vote, permission, options, passport) {
    if (!(0, protocol_1.IsValidObjects)([vote, permission]))
        return false;
    if (!options)
        return false;
    let bValid = true;
    options.forEach((v) => {
        if (!(0, protocol_1.IsValidName)(v.name))
            bValid = false;
        if (v?.reference_address && (0, protocol_1.IsValidAddress)(v.reference_address))
            bValid = false;
    });
    if (!bValid)
        return false;
    options.forEach((option) => {
        let reference = option?.reference_address ? txb.pure(util_1.BCS_CONVERT.ser_option_address(option.reference_address)) : (0, protocol_1.OptionNone)(txb);
        if (passport) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.VoteFn('agrees_add_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, vote), txb.pure(option.name), reference, (0, protocol_1.TXB_OBJECT)(txb, permission)]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.VoteFn('agrees_add'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, vote), txb.pure(option.name), reference, (0, protocol_1.TXB_OBJECT)(txb, permission)]
            });
        }
    });
    return true;
}
exports.vote_add_option = vote_add_option;
function vote_remove_option(txb, vote, permission, options, removeall, passport) {
    if (!(0, protocol_1.IsValidObjects)([vote, permission]))
        return false;
    if (!removeall && !options)
        return false;
    if (options && !(0, protocol_1.IsValidArray)(options, protocol_1.IsValidAddress))
        return false;
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.VoteFn('agrees_remove_all_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, vote), (0, protocol_1.TXB_OBJECT)(txb, permission)]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.VoteFn('agrees_remove_with_passport'),
                arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, vote), txb.pure(util_1.BCS_CONVERT.ser_vector_string((0, util_1.array_unique)(options))), (0, protocol_1.TXB_OBJECT)(txb, permission)]
            });
        }
    }
    else {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.VoteFn('agrees_remove_all'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, vote), (0, protocol_1.TXB_OBJECT)(txb, permission)]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.VoteFn('agrees_remove'),
                arguments: [(0, protocol_1.TXB_OBJECT)(txb, vote), txb.pure(util_1.BCS_CONVERT.ser_vector_string((0, util_1.array_unique)(options))), (0, protocol_1.TXB_OBJECT)(txb, permission)]
            });
        }
    }
    return true;
}
exports.vote_remove_option = vote_remove_option;
function vote_set_max_choice_count(txb, vote, permission, max_choice_count, passport) {
    if (!(0, protocol_1.IsValidObjects)([vote, permission]))
        return false;
    if (!(0, protocol_1.IsValidUint)(max_choice_count) || max_choice_count > exports.MAX_CHOICE_COUNT)
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('max_choice_count_set_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, vote), txb.pure(max_choice_count, bcs_1.BCS.U8), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('max_choice_count_set'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, vote), txb.pure(max_choice_count, bcs_1.BCS.U8), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    return true;
}
exports.vote_set_max_choice_count = vote_set_max_choice_count;
function vote_open_voting(txb, vote, permission, passport) {
    if (!(0, protocol_1.IsValidObjects)([vote, permission]))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('options_locked_for_voting_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, vote), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('options_locked_for_voting'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, vote), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    return true;
}
exports.vote_open_voting = vote_open_voting;
function vote_lock_deadline(txb, vote, permission, passport) {
    if (!(0, protocol_1.IsValidObjects)([vote, permission]))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('deadline_locked_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, vote), txb.object(protocol_1.CLOCK_OBJECT), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('deadline_locked'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, vote), txb.object(protocol_1.CLOCK_OBJECT), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    return true;
}
exports.vote_lock_deadline = vote_lock_deadline;
function vote_expand_deadline(txb, vote, permission, minutes_expand, passport) {
    if (!(0, protocol_1.IsValidObjects)([vote, permission]))
        return false;
    if (!(0, protocol_1.IsValidUint)(minutes_expand))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('deadline_expand_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, vote), txb.pure(minutes_expand, bcs_1.BCS.U64), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('deadline_expand'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, vote), txb.pure(minutes_expand, bcs_1.BCS.U64), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    return true;
}
exports.vote_expand_deadline = vote_expand_deadline;
function vote_lock_guard(txb, vote, permission, passport) {
    if (!(0, protocol_1.IsValidObjects)([vote, permission]))
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('guard_lock_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, vote), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('guard_lock'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, vote), (0, protocol_1.TXB_OBJECT)(txb, permission)]
        });
    }
    return true;
}
exports.vote_lock_guard = vote_lock_guard;
function agree(txb, vote, options, passport) {
    if (!(0, protocol_1.IsValidObjects)([vote]))
        return false;
    if (!options || options.length > exports.MAX_CHOICE_COUNT)
        return false;
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('vote_with_passport'),
            arguments: [passport, (0, protocol_1.TXB_OBJECT)(txb, vote), txb.pure(util_1.BCS_CONVERT.ser_vector_string((0, util_1.array_unique)(options)))]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('vote'),
            arguments: [(0, protocol_1.TXB_OBJECT)(txb, vote), txb.pure(util_1.BCS_CONVERT.ser_vector_string((0, util_1.array_unique)(options)))]
        });
    }
    return true;
}
exports.agree = agree;
function change_permission(txb, vote, old_permission, new_permission) {
    if (!(0, protocol_1.IsValidObjects)([vote, old_permission, new_permission]))
        return false;
    txb.moveCall({
        target: protocol_1.PROTOCOL.VoteFn('permission_set'),
        arguments: [(0, protocol_1.TXB_OBJECT)(txb, vote), (0, protocol_1.TXB_OBJECT)(txb, old_permission), (0, protocol_1.TXB_OBJECT)(txb, new_permission)],
    });
    return true;
}
exports.change_permission = change_permission;
