"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const ProductService_1 = require("./services/ProductService");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Services (will be replaced with DynamoDB in Step 5)
const productService = new ProductService_1.ProductService();
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Medusa Serverless MVP is running',
        timestamp: new Date().toISOString()
    });
});
// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Medusa Serverless MVP!',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            products: '/api/products',
            productById: '/api/products/:id',
            createProduct: 'POST /api/products'
        },
        status: 'Step 1 Complete: Stripped down Medusa core is running!'
    });
});
// Product routes (simplified for Step 1)
app.get('/api/products', async (req, res) => {
    try {
        const filters = {
            search: req.query.search,
            category: req.query.category,
            sellerId: req.query.sellerId,
            priceMin: req.query.priceMin ? parseFloat(req.query.priceMin) : undefined,
            priceMax: req.query.priceMax ? parseFloat(req.query.priceMax) : undefined,
        };
        const result = await productService.listProducts(filters);
        res.json({
            success: true,
            data: result.products,
            pagination: {
                hasMore: result.hasMore,
                lastEvaluatedKey: result.lastEvaluatedKey
            }
        });
    }
    catch (error) {
        console.error('Error listing products:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to list products'
            }
        });
    }
});
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await productService.getProduct(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: 'Product not found'
                }
            });
        }
        res.json({
            success: true,
            data: product
        });
    }
    catch (error) {
        console.error('Error getting product:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to get product'
            }
        });
    }
});
app.post('/api/products', async (req, res) => {
    try {
        // TODO: Add authentication middleware in Step 4
        const sellerId = req.headers['x-seller-id'] || 'default-seller';
        const productData = req.body;
        const product = await productService.createProduct(sellerId, productData);
        res.status(201).json({
            success: true,
            data: product
        });
    }
    catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: error instanceof Error ? error.message : 'Failed to create product'
            }
        });
    }
});
// Simple auth routes (placeholder for Step 4)
app.post('/api/auth/login', (req, res) => {
    res.json({
        success: true,
        data: {
            user: {
                id: 'user_123',
                email: 'demo@example.com',
                role: 'seller'
            },
            token: 'demo-jwt-token'
        }
    });
});
// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred'
        }
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.originalUrl} not found`
        }
    });
});
// Start server
app.listen(port, () => {
    console.log(`🚀 Medusa Serverless MVP running on port ${port}`);
    console.log(`📋 Health check: http://localhost:${port}/health`);
    console.log(`📦 Products API: http://localhost:${port}/api/products`);
    console.log(`🔑 Auth API: http://localhost:${port}/api/auth/login`);
});
exports.default = app;
