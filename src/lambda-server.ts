// Express wrapper to test Lambda functions locally
import express from 'express';
import cors from 'cors';
import { APIGatewayProxyEvent } from 'aws-lambda';

// Import our Lambda handlers
import { handler as healthHandler } from './lambda/health';
import { getProducts, getProduct, createProduct } from './lambda/products';
import { login, register } from './lambda/auth';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Helper function to convert Express request to Lambda event
const createLambdaEvent = (req: express.Request): APIGatewayProxyEvent => {
  return {
    httpMethod: req.method,
    path: req.path,
    pathParameters: req.params,
    queryStringParameters: req.query as any,
    headers: req.headers as any,
    body: req.body ? JSON.stringify(req.body) : null,
    isBase64Encoded: false,
    requestContext: {} as any,
    resource: '',
    stageVariables: null,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
  };
};

// Health endpoint
app.get('/health', async (req, res) => {
  const event = createLambdaEvent(req);
  const result = await healthHandler(event, {} as any, {} as any);
  if (result && 'statusCode' in result) {
    res.status(result.statusCode).json(JSON.parse(result.body));
  }
});

// Products endpoints
app.get('/api/products', async (req, res) => {
  const event = createLambdaEvent(req);
  const result = await getProducts(event, {} as any, {} as any);
  if (result && 'statusCode' in result) {
    res.status(result.statusCode).json(JSON.parse(result.body));
  }
});

app.get('/api/products/:id', async (req, res) => {
  const event = createLambdaEvent(req);
  const result = await getProduct(event, {} as any, {} as any);
  if (result && 'statusCode' in result) {
    res.status(result.statusCode).json(JSON.parse(result.body));
  }
});

app.post('/api/products', async (req, res) => {
  const event = createLambdaEvent(req);
  const result = await createProduct(event, {} as any, {} as any);
  if (result && 'statusCode' in result) {
    res.status(result.statusCode).json(JSON.parse(result.body));
  }
});

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  const event = createLambdaEvent(req);
  const result = await login(event, {} as any, {} as any);
  if (result && 'statusCode' in result) {
    res.status(result.statusCode).json(JSON.parse(result.body));
  }
});

app.post('/api/auth/register', async (req, res) => {
  const event = createLambdaEvent(req);
  const result = await register(event, {} as any, {} as any);
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
