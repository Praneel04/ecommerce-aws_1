"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToCart = exports.createCart = exports.getCart = void 0;
const utils_1 = require("./utils");
const uuid_1 = require("uuid");
// Mock data - will be replaced with DynamoDB in Step 5
const mockCarts = [];
const getCart = async (event) => {
    const corsResponse = await (0, utils_1.handleCors)(event);
    if (corsResponse)
        return corsResponse;
    try {
        const cartId = (0, utils_1.getPathParameter)(event, 'id');
        if (!cartId) {
            return (0, utils_1.createErrorResponse)('MISSING_PARAMETER', 'Cart ID is required', 400);
        }
        const cart = mockCarts.find(c => c.id === cartId);
        if (!cart) {
            return (0, utils_1.createErrorResponse)('NOT_FOUND', 'Cart not found', 404);
        }
        return (0, utils_1.createSuccessResponse)(cart);
    }
    catch (error) {
        console.error('Error fetching cart:', error);
        return (0, utils_1.createErrorResponse)('FETCH_ERROR', 'Failed to fetch cart', 500);
    }
};
exports.getCart = getCart;
const createCart = async (event) => {
    const corsResponse = await (0, utils_1.handleCors)(event);
    if (corsResponse)
        return corsResponse;
    try {
        const newCart = {
            id: (0, uuid_1.v4)(),
            userId: undefined, // Guest cart initially
            sessionId: (0, uuid_1.v4)(),
            items: [],
            subtotal: 0,
            taxTotal: 0,
            shippingTotal: 0,
            total: 0,
            currency: 'USD',
            metadata: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        };
        mockCarts.push(newCart);
        return (0, utils_1.createSuccessResponse)(newCart, 201);
    }
    catch (error) {
        console.error('Error creating cart:', error);
        return (0, utils_1.createErrorResponse)('CREATE_ERROR', 'Failed to create cart', 500);
    }
};
exports.createCart = createCart;
const addToCart = async (event) => {
    const corsResponse = await (0, utils_1.handleCors)(event);
    if (corsResponse)
        return corsResponse;
    try {
        const cartId = (0, utils_1.getPathParameter)(event, 'id');
        if (!cartId) {
            return (0, utils_1.createErrorResponse)('MISSING_PARAMETER', 'Cart ID is required', 400);
        }
        const body = (0, utils_1.parseBody)(event);
        if (!body) {
            return (0, utils_1.createErrorResponse)('INVALID_BODY', 'Request body is required', 400);
        }
        const validationError = (0, utils_1.validateRequired)(body, ['productId', 'quantity']);
        if (validationError) {
            return (0, utils_1.createErrorResponse)('VALIDATION_ERROR', validationError, 400);
        }
        const cartIndex = mockCarts.findIndex(c => c.id === cartId);
        if (cartIndex === -1) {
            return (0, utils_1.createErrorResponse)('NOT_FOUND', 'Cart not found', 404);
        }
        // Mock product lookup - in real app, get from products service
        const mockPrice = 29.99;
        const mockTitle = 'Sample Product';
        const newItem = {
            id: (0, uuid_1.v4)(),
            productId: body.productId,
            variantId: body.variantId,
            title: mockTitle,
            description: 'Sample product description',
            quantity: body.quantity,
            unitPrice: mockPrice,
            totalPrice: mockPrice * body.quantity,
            metadata: {},
        };
        // Check if item already exists
        const existingItemIndex = mockCarts[cartIndex].items.findIndex(item => item.productId === body.productId && item.variantId === body.variantId);
        if (existingItemIndex !== -1) {
            // Update existing item
            mockCarts[cartIndex].items[existingItemIndex].quantity += body.quantity;
            mockCarts[cartIndex].items[existingItemIndex].totalPrice =
                mockCarts[cartIndex].items[existingItemIndex].unitPrice *
                    mockCarts[cartIndex].items[existingItemIndex].quantity;
        }
        else {
            // Add new item
            mockCarts[cartIndex].items.push(newItem);
        }
        // Recalculate totals
        const cart = mockCarts[cartIndex];
        cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
        cart.taxTotal = cart.subtotal * 0.1; // 10% tax
        cart.total = cart.subtotal + cart.taxTotal + cart.shippingTotal;
        cart.updatedAt = new Date().toISOString();
        return (0, utils_1.createSuccessResponse)(cart);
    }
    catch (error) {
        console.error('Error adding item to cart:', error);
        return (0, utils_1.createErrorResponse)('ADD_TO_CART_ERROR', 'Failed to add item to cart', 500);
    }
};
exports.addToCart = addToCart;
