import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { ProductService } from './services/ProductService';
import { CreateProductRequest, ProductFilters } from './models';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Services (will be replaced with DynamoDB in Step 5)
const productService = new ProductService();

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
    const filters: ProductFilters = {
      search: req.query.search as string,
      category: req.query.category as string,
      sellerId: req.query.sellerId as string,
      priceMin: req.query.priceMin ? parseFloat(req.query.priceMin as string) : undefined,
      priceMax: req.query.priceMax ? parseFloat(req.query.priceMax as string) : undefined,
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
  } catch (error) {
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
  } catch (error) {
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
    const sellerId = req.headers['x-seller-id'] as string || 'default-seller';
    
    const productData: CreateProductRequest = req.body;
    const product = await productService.createProduct(sellerId, productData);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
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
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

export default app;
