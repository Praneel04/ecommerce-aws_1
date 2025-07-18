"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = void 0;
const utils_1 = require("./utils");
const models_1 = require("../models");
const uuid_1 = require("uuid");
// Mock data - will be replaced with DynamoDB in Step 5
const mockUsers = [
    {
        id: 'user_1',
        email: 'admin@medusa.com',
        firstName: 'Admin',
        lastName: 'User',
        role: models_1.UserRole.ADMIN,
        password: 'hashed_password_123', // In real app, this would be properly hashed
        isEmailVerified: true,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];
const login = async (event) => {
    const corsResponse = await (0, utils_1.handleCors)(event);
    if (corsResponse)
        return corsResponse;
    try {
        const body = (0, utils_1.parseBody)(event);
        if (!body) {
            return (0, utils_1.createErrorResponse)('INVALID_BODY', 'Request body is required', 400);
        }
        const validationError = (0, utils_1.validateRequired)(body, ['email', 'password']);
        if (validationError) {
            return (0, utils_1.createErrorResponse)('VALIDATION_ERROR', validationError, 400);
        }
        // Simple mock authentication - in real app, verify password hash
        const user = mockUsers.find(u => u.email === body.email && u.isEmailVerified);
        if (!user || body.password !== 'password123') {
            return (0, utils_1.createErrorResponse)('INVALID_CREDENTIALS', 'Invalid email or password', 401);
        }
        // Mock JWT token - in real app, generate proper JWT
        const token = `mock_jwt_token_${user.id}_${Date.now()}`;
        return (0, utils_1.createSuccessResponse)({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            token,
            expiresIn: '24h'
        });
    }
    catch (error) {
        console.error('Error during login:', error);
        return (0, utils_1.createErrorResponse)('LOGIN_ERROR', 'Login failed', 500);
    }
};
exports.login = login;
const register = async (event) => {
    const corsResponse = await (0, utils_1.handleCors)(event);
    if (corsResponse)
        return corsResponse;
    try {
        const body = (0, utils_1.parseBody)(event);
        if (!body) {
            return (0, utils_1.createErrorResponse)('INVALID_BODY', 'Request body is required', 400);
        }
        const validationError = (0, utils_1.validateRequired)(body, ['email', 'firstName', 'lastName']);
        if (validationError) {
            return (0, utils_1.createErrorResponse)('VALIDATION_ERROR', validationError, 400);
        }
        // Check if user already exists
        const existingUser = mockUsers.find(u => u.email === body.email);
        if (existingUser) {
            return (0, utils_1.createErrorResponse)('USER_EXISTS', 'User with this email already exists', 409);
        }
        const newUser = {
            id: (0, uuid_1.v4)(),
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            role: body.role || models_1.UserRole.BUYER,
            password: 'hashed_password_' + Date.now(), // Mock hash
            isEmailVerified: false,
            metadata: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockUsers.push(newUser);
        // Return user without password
        const { password, ...userResponse } = newUser;
        return (0, utils_1.createSuccessResponse)(userResponse, 201);
    }
    catch (error) {
        console.error('Error during registration:', error);
        return (0, utils_1.createErrorResponse)('REGISTRATION_ERROR', 'Registration failed', 500);
    }
};
exports.register = register;
