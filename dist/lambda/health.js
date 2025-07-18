"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const utils_1 = require("./utils");
const handler = async (event) => {
    // Handle CORS preflight
    const corsResponse = await (0, utils_1.handleCors)(event);
    if (corsResponse)
        return corsResponse;
    const healthData = {
        message: "Medusa Serverless MVP Health Check",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        stage: process.env.STAGE || 'dev',
        region: process.env.REGION || 'us-east-1',
        status: "healthy",
        lambda: true,
        endpoints: {
            health: "/health",
            products: "/api/products",
            productById: "/api/products/{id}",
            createProduct: "POST /api/products",
            auth: "/api/auth/login",
            cart: "/api/cart",
            orders: "/api/orders"
        }
    };
    return (0, utils_1.createSuccessResponse)(healthData);
};
exports.handler = handler;
