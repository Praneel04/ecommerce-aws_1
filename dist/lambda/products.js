"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const utils_1 = require("./utils");
const uuid_1 = require("uuid");
// Mock data - will be replaced with DynamoDB in Step 5
const mockProducts = [
    {
        id: 'prod_1',
        title: 'Serverless T-Shirt',
        description: 'Comfortable serverless-themed t-shirt',
        price: 29.99,
        inventory: 100,
        sellerId: 'seller_1',
        status: 'published',
        images: ['https://example.com/tshirt.jpg'],
        category: 'apparel',
        tags: ['serverless', 'aws'],
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'prod_2',
        title: 'Lambda Function Mug',
        description: 'Coffee mug for serverless developers',
        price: 19.99,
        inventory: 50,
        sellerId: 'seller_1',
        status: 'published',
        images: ['https://example.com/mug.jpg'],
        category: 'accessories',
        tags: ['lambda', 'coffee'],
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];
const getProducts = async (event) => {
    const corsResponse = await (0, utils_1.handleCors)(event);
    if (corsResponse)
        return corsResponse;
    try {
        const limit = parseInt((0, utils_1.getQueryParameter)(event, 'limit') || '10');
        const offset = parseInt((0, utils_1.getQueryParameter)(event, 'offset') || '0');
        const paginatedProducts = mockProducts.slice(offset, offset + limit);
        return (0, utils_1.createSuccessResponse)(paginatedProducts, 200, {
            count: paginatedProducts.length,
            hasMore: offset + limit < mockProducts.length,
            total: mockProducts.length
        });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        return (0, utils_1.createErrorResponse)('FETCH_ERROR', 'Failed to fetch products', 500);
    }
};
exports.getProducts = getProducts;
const getProduct = async (event) => {
    const corsResponse = await (0, utils_1.handleCors)(event);
    if (corsResponse)
        return corsResponse;
    try {
        const productId = (0, utils_1.getPathParameter)(event, 'id');
        if (!productId) {
            return (0, utils_1.createErrorResponse)('MISSING_PARAMETER', 'Product ID is required', 400);
        }
        const product = mockProducts.find(p => p.id === productId);
        if (!product) {
            return (0, utils_1.createErrorResponse)('NOT_FOUND', 'Product not found', 404);
        }
        return (0, utils_1.createSuccessResponse)(product);
    }
    catch (error) {
        console.error('Error fetching product:', error);
        return (0, utils_1.createErrorResponse)('FETCH_ERROR', 'Failed to fetch product', 500);
    }
};
exports.getProduct = getProduct;
const createProduct = async (event) => {
    const corsResponse = await (0, utils_1.handleCors)(event);
    if (corsResponse)
        return corsResponse;
    try {
        const body = (0, utils_1.parseBody)(event);
        if (!body) {
            return (0, utils_1.createErrorResponse)('INVALID_BODY', 'Request body is required', 400);
        }
        const validationError = (0, utils_1.validateRequired)(body, ['title', 'price', 'inventory']);
        if (validationError) {
            return (0, utils_1.createErrorResponse)('VALIDATION_ERROR', validationError, 400);
        }
        const newProduct = {
            id: (0, uuid_1.v4)(),
            title: body.title,
            description: body.description,
            price: body.price,
            inventory: body.inventory,
            sellerId: 'seller_1', // TODO: Get from auth context
            status: 'draft',
            images: body.images || [],
            category: body.category,
            tags: body.tags || [],
            metadata: body.metadata || {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockProducts.push(newProduct);
        return (0, utils_1.createSuccessResponse)(newProduct, 201);
    }
    catch (error) {
        console.error('Error creating product:', error);
        return (0, utils_1.createErrorResponse)('CREATE_ERROR', 'Failed to create product', 500);
    }
};
exports.createProduct = createProduct;
const updateProduct = async (event) => {
    const corsResponse = await (0, utils_1.handleCors)(event);
    if (corsResponse)
        return corsResponse;
    try {
        const productId = (0, utils_1.getPathParameter)(event, 'id');
        if (!productId) {
            return (0, utils_1.createErrorResponse)('MISSING_PARAMETER', 'Product ID is required', 400);
        }
        const body = (0, utils_1.parseBody)(event);
        if (!body) {
            return (0, utils_1.createErrorResponse)('INVALID_BODY', 'Request body is required', 400);
        }
        const productIndex = mockProducts.findIndex(p => p.id === productId);
        if (productIndex === -1) {
            return (0, utils_1.createErrorResponse)('NOT_FOUND', 'Product not found', 404);
        }
        const updatedProduct = {
            ...mockProducts[productIndex],
            ...body,
            id: productId, // Ensure ID doesn't change
            updatedAt: new Date().toISOString(),
        };
        mockProducts[productIndex] = updatedProduct;
        return (0, utils_1.createSuccessResponse)(updatedProduct);
    }
    catch (error) {
        console.error('Error updating product:', error);
        return (0, utils_1.createErrorResponse)('UPDATE_ERROR', 'Failed to update product', 500);
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (event) => {
    const corsResponse = await (0, utils_1.handleCors)(event);
    if (corsResponse)
        return corsResponse;
    try {
        const productId = (0, utils_1.getPathParameter)(event, 'id');
        if (!productId) {
            return (0, utils_1.createErrorResponse)('MISSING_PARAMETER', 'Product ID is required', 400);
        }
        const productIndex = mockProducts.findIndex(p => p.id === productId);
        if (productIndex === -1) {
            return (0, utils_1.createErrorResponse)('NOT_FOUND', 'Product not found', 404);
        }
        const deletedProduct = mockProducts.splice(productIndex, 1)[0];
        return (0, utils_1.createSuccessResponse)({
            message: 'Product deleted successfully',
            product: deletedProduct
        });
    }
    catch (error) {
        console.error('Error deleting product:', error);
        return (0, utils_1.createErrorResponse)('DELETE_ERROR', 'Failed to delete product', 500);
    }
};
exports.deleteProduct = deleteProduct;
