"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = exports.getOrders = void 0;
const utils_1 = require("./utils");
const models_1 = require("../models");
const uuid_1 = require("uuid");
// Mock data - will be replaced with DynamoDB in Step 5
const mockOrders = [];
const getOrders = async (event) => {
    const corsResponse = await (0, utils_1.handleCors)(event);
    if (corsResponse)
        return corsResponse;
    try {
        const limit = parseInt((0, utils_1.getQueryParameter)(event, 'limit') || '10');
        const offset = parseInt((0, utils_1.getQueryParameter)(event, 'offset') || '0');
        const paginatedOrders = mockOrders.slice(offset, offset + limit);
        return (0, utils_1.createSuccessResponse)(paginatedOrders, 200, {
            count: paginatedOrders.length,
            hasMore: offset + limit < mockOrders.length,
            total: mockOrders.length
        });
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        return (0, utils_1.createErrorResponse)('FETCH_ERROR', 'Failed to fetch orders', 500);
    }
};
exports.getOrders = getOrders;
const createOrder = async (event) => {
    const corsResponse = await (0, utils_1.handleCors)(event);
    if (corsResponse)
        return corsResponse;
    try {
        const body = (0, utils_1.parseBody)(event);
        if (!body) {
            return (0, utils_1.createErrorResponse)('INVALID_BODY', 'Request body is required', 400);
        }
        const validationError = (0, utils_1.validateRequired)(body, ['items']);
        if (validationError) {
            return (0, utils_1.createErrorResponse)('VALIDATION_ERROR', validationError, 400);
        }
        // Mock user ID - in real app, get from auth context
        const userId = 'user_1';
        const email = 'customer@example.com';
        // Convert simple items to full OrderItems with mock data
        const orderItems = body.items.map(item => ({
            id: (0, uuid_1.v4)(),
            productId: item.productId,
            variantId: undefined,
            title: 'Sample Product', // In real app, fetch from products service
            description: 'Sample product description',
            quantity: item.quantity,
            unitPrice: 29.99, // Mock price
            totalPrice: 29.99 * item.quantity,
            metadata: {},
        }));
        // Calculate totals
        const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const taxTotal = subtotal * 0.1; // 10% tax
        const shippingTotal = 10.00; // Flat shipping
        const total = subtotal + taxTotal + shippingTotal;
        const newOrder = {
            id: (0, uuid_1.v4)(),
            userId,
            email,
            status: models_1.OrderStatus.PENDING,
            currency: 'USD',
            items: orderItems,
            subtotal,
            taxTotal,
            shippingTotal,
            total,
            shippingAddress: body.shippingAddress,
            billingAddress: body.billingAddress,
            paymentStatus: models_1.PaymentStatus.PENDING,
            fulfillmentStatus: models_1.FulfillmentStatus.NOT_FULFILLED,
            metadata: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockOrders.push(newOrder);
        return (0, utils_1.createSuccessResponse)(newOrder, 201);
    }
    catch (error) {
        console.error('Error creating order:', error);
        return (0, utils_1.createErrorResponse)('CREATE_ERROR', 'Failed to create order', 500);
    }
};
exports.createOrder = createOrder;
