import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleCors, 
  parseBody, 
  getPathParameter,
  getQueryParameter,
  validateRequired 
} from './utils';
import { Product, CreateProductRequest, UpdateProductRequest } from '../models';
import { v4 as uuidv4 } from 'uuid';

// Mock data - will be replaced with DynamoDB in Step 5
const mockProducts: Product[] = [
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

export const getProducts: APIGatewayProxyHandler = async (event) => {
  const corsResponse = await handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const limit = parseInt(getQueryParameter(event, 'limit') || '10');
    const offset = parseInt(getQueryParameter(event, 'offset') || '0');
    
    const paginatedProducts = mockProducts.slice(offset, offset + limit);
    
    return createSuccessResponse(paginatedProducts, 200, {
      count: paginatedProducts.length,
      hasMore: offset + limit < mockProducts.length,
      total: mockProducts.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return createErrorResponse('FETCH_ERROR', 'Failed to fetch products', 500);
  }
};

export const getProduct: APIGatewayProxyHandler = async (event) => {
  const corsResponse = await handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const productId = getPathParameter(event, 'id');
    if (!productId) {
      return createErrorResponse('MISSING_PARAMETER', 'Product ID is required', 400);
    }

    const product = mockProducts.find(p => p.id === productId);
    if (!product) {
      return createErrorResponse('NOT_FOUND', 'Product not found', 404);
    }

    return createSuccessResponse(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return createErrorResponse('FETCH_ERROR', 'Failed to fetch product', 500);
  }
};

export const createProduct: APIGatewayProxyHandler = async (event) => {
  const corsResponse = await handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const body = parseBody<CreateProductRequest>(event);
    if (!body) {
      return createErrorResponse('INVALID_BODY', 'Request body is required', 400);
    }

    const validationError = validateRequired(body, ['title', 'price', 'inventory']);
    if (validationError) {
      return createErrorResponse('VALIDATION_ERROR', validationError, 400);
    }

    const newProduct: Product = {
      id: uuidv4(),
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

    return createSuccessResponse(newProduct, 201);
  } catch (error) {
    console.error('Error creating product:', error);
    return createErrorResponse('CREATE_ERROR', 'Failed to create product', 500);
  }
};

export const updateProduct: APIGatewayProxyHandler = async (event) => {
  const corsResponse = await handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const productId = getPathParameter(event, 'id');
    if (!productId) {
      return createErrorResponse('MISSING_PARAMETER', 'Product ID is required', 400);
    }

    const body = parseBody<UpdateProductRequest>(event);
    if (!body) {
      return createErrorResponse('INVALID_BODY', 'Request body is required', 400);
    }

    const productIndex = mockProducts.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      return createErrorResponse('NOT_FOUND', 'Product not found', 404);
    }

    const updatedProduct: Product = {
      ...mockProducts[productIndex],
      ...body,
      id: productId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    mockProducts[productIndex] = updatedProduct;

    return createSuccessResponse(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return createErrorResponse('UPDATE_ERROR', 'Failed to update product', 500);
  }
};

export const deleteProduct: APIGatewayProxyHandler = async (event) => {
  const corsResponse = await handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const productId = getPathParameter(event, 'id');
    if (!productId) {
      return createErrorResponse('MISSING_PARAMETER', 'Product ID is required', 400);
    }

    const productIndex = mockProducts.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      return createErrorResponse('NOT_FOUND', 'Product not found', 404);
    }

    const deletedProduct = mockProducts.splice(productIndex, 1)[0];

    return createSuccessResponse({ 
      message: 'Product deleted successfully', 
      product: deletedProduct 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return createErrorResponse('DELETE_ERROR', 'Failed to delete product', 500);
  }
};
