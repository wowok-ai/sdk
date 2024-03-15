"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.change_permission = exports.agree = exports.vote_lock_guard = exports.vote_expand_deadline = exports.vote_lock_deadline = exports.vote_open_voting = exports.vote_set_max_choice_count = exports.vote_remove_option = exports.vote_add_option = exports.vote_remove_guard = exports.vote_add_guard = exports.vote_set_reference = exports.vote_set_description = exports.destroy = exports.launch = exports.vote = void 0;
const bcs_1 = require("@mysten/bcs");
const protocol_1 = require("./protocol");
function vote(txb, permission, description, minutes_duration, max_choice_count, reference_address, passport) {
    let reference = txb.pure([], bcs_1.BCS.U8);
    if (reference_address) {
        reference = txb.pure(reference_address, bcs_1.BCS.ADDRESS);
    }
    if (passport) {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('new_with_passport'),
            arguments: [passport, txb.pure((0, protocol_1.description_data)(description)), reference, txb.pure(protocol_1.CLOCK_OBJECT),
                txb.pure(minutes_duration, bcs_1.BCS.U64), txb.pure(max_choice_count, bcs_1.BCS.U8), permission]
        });
    }
    else {
        return txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('new'),
            arguments: [txb.pure((0, protocol_1.description_data)(description)), reference, txb.pure(protocol_1.CLOCK_OBJECT),
                txb.pure(minutes_duration, bcs_1.BCS.U64), txb.pure(max_choice_count, bcs_1.BCS.U8), permission]
        });
    }
}
exports.vote = vote;
function launch(txb, vote) {
    return txb.moveCall({
        target: protocol_1.PROTOCOL.VoteFn('create'),
        arguments: [vote]
    });
}
exports.launch = launch;
function destroy(txb, vote) {
    txb.moveCall({
        target: protocol_1.PROTOCOL.VoteFn('destroy'),
        arguments: [vote]
    });
}
exports.destroy = destroy;
function vote_set_description(txb, vote, permission, description, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('description_set_with_passport'),
            arguments: [passport, vote, txb.pure((0, protocol_1.description_data)(description)), permission]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('description_set'),
            arguments: [vote, txb.pure((0, protocol_1.description_data)(description)), permission]
        });
    }
}
exports.vote_set_description = vote_set_description;
function vote_set_reference(txb, vote, permission, reference_address, passport) {
    let reference = txb.pure([], bcs_1.BCS.U8);
    if (reference_address) {
        reference = txb.pure(reference_address, bcs_1.BCS.ADDRESS);
    }
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('reference_set_with_passport'),
            arguments: [passport, vote, reference, permission]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('reference_set'),
            arguments: [vote, reference, permission]
        });
    }
}
exports.vote_set_reference = vote_set_reference;
function vote_add_guard(txb, vote, permission, guard, vote_weight, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('guard_add_with_passport'),
            arguments: [passport, vote, guard, txb.pure(vote_weight, bcs_1.BCS.U64), permission]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('guard_add'),
            arguments: [vote, guard, txb.pure(vote_weight, bcs_1.BCS.U64), permission]
        });
    }
}
exports.vote_add_guard = vote_add_guard;
function vote_remove_guard(txb, vote, permission, guard_address, removeall, passport) {
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.VoteFn('guard_remove_all_with_passport'),
                arguments: [passport, vote, permission]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.VoteFn('guard_remove_with_passport'),
                arguments: [passport, vote, txb.pure(guard_address, 'vector<address>'), permission]
            });
        }
    }
    else {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.VoteFn('guard_remove_all'),
                arguments: [vote, permission]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.VoteFn('guard_remove'),
                arguments: [vote, txb.pure(guard_address, 'vector<address>'), permission]
            });
        }
    }
}
exports.vote_remove_guard = vote_remove_guard;
function vote_add_option(txb, vote, permission, options, passport) {
    options.forEach((option) => {
        let reference = txb.pure([], bcs_1.BCS.U8);
        if (option.reference_address) {
            reference = txb.pure(option.reference_address, bcs_1.BCS.ADDRESS);
        }
        if (passport) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.VoteFn('agrees_add_with_passport'),
                arguments: [passport, vote, txb.pure((0, protocol_1.name_data)(option.name)), reference, permission]
            });
        }
        else {
            txb.moveCall({
                target: protocol_1.PROTOCOL.VoteFn('agrees_add'),
                arguments: [vote, txb.pure((0, protocol_1.name_data)(option.name)), reference, permission]
            });
        }
    });
}
exports.vote_add_option = vote_add_option;
function vote_remove_option(txb, vote, permission, options, removeall, passport) {
    if (passport) {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.VoteFn('agrees_remove_all_with_passport'),
                arguments: [passport, vote, permission]
            });
        }
        else {
            options.forEach((option) => {
                txb.moveCall({
                    target: protocol_1.PROTOCOL.VoteFn('agrees_remove_with_passport'),
                    arguments: [passport, vote, txb.pure((0, protocol_1.name_data)(option)), permission]
                });
            });
        }
    }
    else {
        if (removeall) {
            txb.moveCall({
                target: protocol_1.PROTOCOL.VoteFn('agrees_remove_all'),
                arguments: [vote, permission]
            });
        }
        else {
            options.forEach((option) => {
                txb.moveCall({
                    target: protocol_1.PROTOCOL.VoteFn('agrees_remove'),
                    arguments: [vote, txb.pure((0, protocol_1.name_data)(option)), permission]
                });
            });
        }
    }
}
exports.vote_remove_option = vote_remove_option;
function vote_set_max_choice_count(txb, vote, permission, max_choice_count, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('max_choice_count_set_with_passport'),
            arguments: [passport, vote, txb.pure(max_choice_count, bcs_1.BCS.U8), permission]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('max_choice_count_set'),
            arguments: [vote, txb.pure(max_choice_count, bcs_1.BCS.U8), permission]
        });
    }
}
exports.vote_set_max_choice_count = vote_set_max_choice_count;
function vote_open_voting(txb, vote, permission, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('options_locked_for_voting_with_passport'),
            arguments: [passport, vote, permission]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('options_locked_for_voting'),
            arguments: [vote, permission]
        });
    }
}
exports.vote_open_voting = vote_open_voting;
function vote_lock_deadline(txb, vote, permission, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('deadline_locked_with_passport'),
            arguments: [passport, vote, txb.object(protocol_1.CLOCK_OBJECT), permission]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('deadline_locked'),
            arguments: [vote, txb.object(protocol_1.CLOCK_OBJECT), permission]
        });
    }
}
exports.vote_lock_deadline = vote_lock_deadline;
function vote_expand_deadline(txb, vote, permission, minutes_expand, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('deadline_expand_with_passport'),
            arguments: [passport, vote, txb.pure(minutes_expand, bcs_1.BCS.U64), permission]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('deadline_expand'),
            arguments: [vote, txb.pure(minutes_expand, bcs_1.BCS.U64), permission]
        });
    }
}
exports.vote_expand_deadline = vote_expand_deadline;
function vote_lock_guard(txb, vote, permission, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('guard_lock_with_passport'),
            arguments: [passport, vote, permission]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('guard_lock'),
            arguments: [vote, permission]
        });
    }
}
exports.vote_lock_guard = vote_lock_guard;
function agree(txb, vote, options, passport) {
    if (passport) {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('vote_with_passport'),
            arguments: [passport, vote, txb.pure(options, 'vector<string>')]
        });
    }
    else {
        txb.moveCall({
            target: protocol_1.PROTOCOL.VoteFn('vote'),
            arguments: [vote, txb.pure(options, 'vector<string>')]
        });
    }
}
exports.agree = agree;
function change_permission(txb, vote, old_permission, new_permission) {
    txb.moveCall({
        target: protocol_1.PROTOCOL.VoteFn('permission_set'),
        arguments: [vote, old_permission, new_permission],
    });
}
exports.change_permission = change_permission;
