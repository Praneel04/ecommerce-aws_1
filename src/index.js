"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var helmet_1 = require("helmet");
var dotenv_1 = require("dotenv");
var ProductService_1 = require("./services/ProductService");
// Load environment variables
dotenv_1.default.config();
var app = (0, express_1.default)();
var port = process.env.PORT || 3000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Services (will be replaced with DynamoDB in Step 5)
var productService = new ProductService_1.ProductService();
// Health check
app.get('/health', function (req, res) {
    res.json({
        status: 'OK',
        message: 'Medusa Serverless MVP is running',
        timestamp: new Date().toISOString()
    });
});
// Product routes (simplified for Step 1)
app.get('/api/products', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var filters, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                filters = {
                    search: req.query.search,
                    category: req.query.category,
                    sellerId: req.query.sellerId,
                    priceMin: req.query.priceMin ? parseFloat(req.query.priceMin) : undefined,
                    priceMax: req.query.priceMax ? parseFloat(req.query.priceMax) : undefined,
                };
                return [4 /*yield*/, productService.listProducts(filters)];
            case 1:
                result = _a.sent();
                res.json({
                    success: true,
                    data: result.products,
                    pagination: {
                        hasMore: result.hasMore,
                        lastEvaluatedKey: result.lastEvaluatedKey
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error listing products:', error_1);
                res.status(500).json({
                    success: false,
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'Failed to list products'
                    }
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/api/products/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var product, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, productService.getProduct(req.params.id)];
            case 1:
                product = _a.sent();
                if (!product) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            error: {
                                code: 'NOT_FOUND',
                                message: 'Product not found'
                            }
                        })];
                }
                res.json({
                    success: true,
                    data: product
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error getting product:', error_2);
                res.status(500).json({
                    success: false,
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'Failed to get product'
                    }
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/products', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var sellerId, productData, product, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                sellerId = req.headers['x-seller-id'] || 'default-seller';
                productData = req.body;
                return [4 /*yield*/, productService.createProduct(sellerId, productData)];
            case 1:
                product = _a.sent();
                res.status(201).json({
                    success: true,
                    data: product
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error creating product:', error_3);
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error_3 instanceof Error ? error_3.message : 'Failed to create product'
                    }
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Simple auth routes (placeholder for Step 4)
app.post('/api/auth/login', function (req, res) {
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
app.use(function (error, req, res, next) {
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
app.use('*', function (req, res) {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: "Route ".concat(req.originalUrl, " not found")
        }
    });
});
// Start server
app.listen(port, function () {
    console.log("\uD83D\uDE80 Medusa Serverless MVP running on port ".concat(port));
    console.log("\uD83D\uDCCB Health check: http://localhost:".concat(port, "/health"));
    console.log("\uD83D\uDCE6 Products API: http://localhost:".concat(port, "/api/products"));
    console.log("\uD83D\uDD11 Auth API: http://localhost:".concat(port, "/api/auth/login"));
});
exports.default = app;
