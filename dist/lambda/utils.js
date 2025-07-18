"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCors = exports.validateRequired = exports.getQueryParameter = exports.getPathParameter = exports.parseBody = exports.createErrorResponse = exports.createSuccessResponse = exports.createResponse = void 0;
const createResponse = (statusCode, data, headers = {}) => {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            ...headers,
        },
        body: JSON.stringify(data),
    };
};
exports.createResponse = createResponse;
const createSuccessResponse = (data, statusCode = 200, pagination) => {
    const response = {
        success: true,
        data,
        ...(pagination && { pagination }),
    };
    return (0, exports.createResponse)(statusCode, response);
};
exports.createSuccessResponse = createSuccessResponse;
const createErrorResponse = (code, message, statusCode = 400, details) => {
    const response = {
        success: false,
        error: {
            code,
            message,
            ...(details && { details }),
        },
    };
    return (0, exports.createResponse)(statusCode, response);
};
exports.createErrorResponse = createErrorResponse;
const parseBody = (event) => {
    try {
        return event.body ? JSON.parse(event.body) : null;
    }
    catch (error) {
        return null;
    }
};
exports.parseBody = parseBody;
const getPathParameter = (event, key) => {
    return event.pathParameters?.[key] || null;
};
exports.getPathParameter = getPathParameter;
const getQueryParameter = (event, key) => {
    return event.queryStringParameters?.[key] || null;
};
exports.getQueryParameter = getQueryParameter;
const validateRequired = (data, fields) => {
    for (const field of fields) {
        if (!data || data[field] === undefined || data[field] === null || data[field] === '') {
            return `Missing required field: ${field}`;
        }
    }
    return null;
};
exports.validateRequired = validateRequired;
const handleCors = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return (0, exports.createSuccessResponse)('CORS preflight');
    }
    return null; // Continue with normal processing
};
exports.handleCors = handleCors;
