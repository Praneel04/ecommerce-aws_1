import { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import { createSuccessResponse, handleCors } from './utils';

export const handler: APIGatewayProxyHandler = async (event) => {
  // Handle CORS preflight
  const corsResponse = await handleCors(event);
  if (corsResponse) return corsResponse;

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

  return createSuccessResponse(healthData);
};
