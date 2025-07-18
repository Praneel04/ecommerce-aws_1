"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Express wrapper to test Lambda functions locally
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Import our Lambda handlers
const health_1 = require("./lambda/health");
const products_1 = require("./lambda/products");
const auth_1 = require("./lambda/auth");
const app = (0, express_1.default)();
const port = 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Helper function to convert Express request to Lambda event
const createLambdaEvent = (req) => {
    return {
        httpMethod: req.method,
        path: req.path,
        pathParameters: req.params,
        queryStringParameters: req.query,
        headers: req.headers,
        body: req.body ? JSON.stringify(req.body) : null,
        isBase64Encoded: false,
        requestContext: {},
        resource: '',
        stageVariables: null,
        multiValueHeaders: {},
        multiValueQueryStringParameters: null,
    };
};
// Health endpoint
app.get('/health', async (req, res) => {
    const event = createLambdaEvent(req);
    const result = await (0, health_1.handler)(event, {}, {});
    if (result && 'statusCode' in result) {
        res.status(result.statusCode).json(JSON.parse(result.body));
    }
});
// Products endpoints
app.get('/api/products', async (req, res) => {
    const event = createLambdaEvent(req);
    const result = await (0, products_1.getProducts)(event, {}, {});
    if (result && 'statusCode' in result) {
        res.status(result.statusCode).json(JSON.parse(result.body));
    }
});
app.get('/api/products/:id', async (req, res) => {
    const event = createLambdaEvent(req);
    const result = await (0, products_1.getProduct)(event, {}, {});
    if (result && 'statusCode' in result) {
        res.status(result.statusCode).json(JSON.parse(result.body));
    }
});
app.post('/api/products', async (req, res) => {
    const event = createLambdaEvent(req);
    const result = await (0, products_1.createProduct)(event, {}, {});
    if (result && 'statusCode' in result) {
        res.status(result.statusCode).json(JSON.parse(result.body));
    }
});
// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
    const event = createLambdaEvent(req);
    const result = await (0, auth_1.login)(event, {}, {});
    if (result && 'statusCode' in result) {
        res.status(result.statusCode).json(JSON.parse(result.body));
    }
});
app.post('/api/auth/register', async (req, res) => {
    const event = createLambdaEvent(req);
    const result = await (0, auth_1.register)(event, {}, {});
    if (result && 'statusCode' in result) {
        res.status(result.statusCode).json(JSON.parse(result.body));
    }
});
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Medusa Serverless MVP - Lambda Functions Test Server',
        version: '1.0.0',
        mode: 'lambda-simulation',
        endpoints: {
            health: '/health',
            products: '/api/products',
            productById: '/api/products/:id',
            createProduct: 'POST /api/products',
            login: 'POST /api/auth/login',
            register: 'POST /api/auth/register'
        },
        status: 'Step 2 Complete: Lambda functions running via Express wrapper!'
    });
});
app.listen(port, () => {
    console.log(`🚀 Lambda Functions Test Server running on port ${port}`);
    console.log(`📋 Health check: http://localhost:${port}/health`);
    console.log(`📦 Products API: http://localhost:${port}/api/products`);
    console.log(`🔑 Auth API: http://localhost:${port}/api/auth/login`);
    console.log('🎯 Step 2: AWS Lambda handlers are ready!');
});
