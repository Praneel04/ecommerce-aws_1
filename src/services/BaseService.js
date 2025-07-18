"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
// Base service class for common functionality
var BaseService = /** @class */ (function () {
    function BaseService(tableName) {
        this.tableName = tableName;
    }
    BaseService.prototype.generateId = function (prefix) {
        return "".concat(prefix, "_").concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
    };
    BaseService.prototype.getCurrentTimestamp = function () {
        return new Date().toISOString();
    };
    BaseService.prototype.validateRequired = function (data, fields) {
        for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var field = fields_1[_i];
            if (!data[field]) {
                throw new Error("".concat(field, " is required"));
            }
        }
    };
    BaseService.prototype.sanitizeForDynamoDB = function (item) {
        var sanitized = __assign({}, item);
        // Remove undefined values (DynamoDB doesn't allow them)
        Object.keys(sanitized).forEach(function (key) {
            if (sanitized[key] === undefined) {
                delete sanitized[key];
            }
            // Convert empty strings to null if needed
            if (sanitized[key] === '') {
                sanitized[key] = null;
            }
        });
        return sanitized;
    };
    BaseService.prototype.createPaginationResponse = function (items, lastEvaluatedKey, limit) {
        return {
            data: items,
            count: items.length,
            hasMore: !!lastEvaluatedKey,
            lastEvaluatedKey: lastEvaluatedKey ? JSON.stringify(lastEvaluatedKey) : undefined
        };
    };
    return BaseService;
}());
exports.BaseService = BaseService;
