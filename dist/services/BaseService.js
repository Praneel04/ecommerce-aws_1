"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
// Base service class for common functionality
class BaseService {
    constructor(tableName) {
        this.tableName = tableName;
    }
    generateId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getCurrentTimestamp() {
        return new Date().toISOString();
    }
    validateRequired(data, fields) {
        for (const field of fields) {
            if (!data[field]) {
                throw new Error(`${field} is required`);
            }
        }
    }
    sanitizeForDynamoDB(item) {
        const sanitized = { ...item };
        // Remove undefined values (DynamoDB doesn't allow them)
        Object.keys(sanitized).forEach(key => {
            if (sanitized[key] === undefined) {
                delete sanitized[key];
            }
            // Convert empty strings to null if needed
            if (sanitized[key] === '') {
                sanitized[key] = null;
            }
        });
        return sanitized;
    }
    createPaginationResponse(items, lastEvaluatedKey, limit) {
        return {
            data: items,
            count: items.length,
            hasMore: !!lastEvaluatedKey,
            lastEvaluatedKey: lastEvaluatedKey ? JSON.stringify(lastEvaluatedKey) : undefined
        };
    }
}
exports.BaseService = BaseService;
