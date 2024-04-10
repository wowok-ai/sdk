"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.machine_destroy = exports.machine_launch = exports.machine_set_endpoint = exports.machine_set_description = exports.machine_remove_repository = exports.machine_remove_node = exports.machine_publish = exports.machine_pause = exports.machine_clone = exports.machine_add_repository = exports.machine_add_node2 = exports.machine_add_node = exports.machine = exports.MAX_PRESENTERS_COUNT = exports.MAX_EARNEST_COUNT = exports.demand_change_permission = exports.present = exports.demand_launch = exports.demand_destroy = exports.demand_deposit = exports.demand_yes = exports.demand_set_guard = exports.demand_set_description = exports.demand_refund = exports.demand_expand_time = exports.demand = void 0;
__exportStar(require("./protocol"), exports);
var demand_1 = require("./demand");
Object.defineProperty(exports, "demand", { enumerable: true, get: function () { return demand_1.demand; } });
Object.defineProperty(exports, "demand_expand_time", { enumerable: true, get: function () { return demand_1.demand_expand_time; } });
Object.defineProperty(exports, "demand_refund", { enumerable: true, get: function () { return demand_1.demand_refund; } });
Object.defineProperty(exports, "demand_set_description", { enumerable: true, get: function () { return demand_1.demand_set_description; } });
Object.defineProperty(exports, "demand_set_guard", { enumerable: true, get: function () { return demand_1.demand_set_guard; } });
Object.defineProperty(exports, "demand_yes", { enumerable: true, get: function () { return demand_1.demand_yes; } });
Object.defineProperty(exports, "demand_deposit", { enumerable: true, get: function () { return demand_1.deposit; } });
Object.defineProperty(exports, "demand_destroy", { enumerable: true, get: function () { return demand_1.destroy; } });
Object.defineProperty(exports, "demand_launch", { enumerable: true, get: function () { return demand_1.launch; } });
Object.defineProperty(exports, "present", { enumerable: true, get: function () { return demand_1.present; } });
Object.defineProperty(exports, "demand_change_permission", { enumerable: true, get: function () { return demand_1.change_permission; } });
Object.defineProperty(exports, "MAX_EARNEST_COUNT", { enumerable: true, get: function () { return demand_1.MAX_EARNEST_COUNT; } });
Object.defineProperty(exports, "MAX_PRESENTERS_COUNT", { enumerable: true, get: function () { return demand_1.MAX_PRESENTERS_COUNT; } });
var machine_1 = require("./machine");
Object.defineProperty(exports, "machine", { enumerable: true, get: function () { return machine_1.machine; } });
Object.defineProperty(exports, "machine_add_node", { enumerable: true, get: function () { return machine_1.machine_add_node; } });
Object.defineProperty(exports, "machine_add_node2", { enumerable: true, get: function () { return machine_1.machine_add_node2; } });
Object.defineProperty(exports, "machine_add_repository", { enumerable: true, get: function () { return machine_1.machine_add_repository; } });
Object.defineProperty(exports, "machine_clone", { enumerable: true, get: function () { return machine_1.machine_clone; } });
Object.defineProperty(exports, "machine_pause", { enumerable: true, get: function () { return machine_1.machine_pause; } });
Object.defineProperty(exports, "machine_publish", { enumerable: true, get: function () { return machine_1.machine_publish; } });
Object.defineProperty(exports, "machine_remove_node", { enumerable: true, get: function () { return machine_1.machine_remove_node; } });
Object.defineProperty(exports, "machine_remove_repository", { enumerable: true, get: function () { return machine_1.machine_remove_repository; } });
Object.defineProperty(exports, "machine_set_description", { enumerable: true, get: function () { return machine_1.machine_set_description; } });
Object.defineProperty(exports, "machine_set_endpoint", { enumerable: true, get: function () { return machine_1.machine_set_endpoint; } });
Object.defineProperty(exports, "machine_launch", { enumerable: true, get: function () { return machine_1.launch; } });
Object.defineProperty(exports, "machine_destroy", { enumerable: true, get: function () { return machine_1.destroy; } });
__exportStar(require("./passport"), exports);
