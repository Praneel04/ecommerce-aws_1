import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleCors, 
  parseBody,
  getPathParameter,
  validateRequired 
} from './utils';
import { Cart, CartItem, AddItemToCartRequest } from '../models';
import { v4 as uuidv4 } from 'uuid';

// Mock data - will be replaced with DynamoDB in Step 5
const mockCarts: Cart[] = [];

export const getCart: APIGatewayProxyHandler = async (event) => {
  const corsResponse = await handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const cartId = getPathParameter(event, 'id');
    if (!cartId) {
      return createErrorResponse('MISSING_PARAMETER', 'Cart ID is required', 400);
    }

    const cart = mockCarts.find(c => c.id === cartId);
    if (!cart) {
      return createErrorResponse('NOT_FOUND', 'Cart not found', 404);
    }

    return createSuccessResponse(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return createErrorResponse('FETCH_ERROR', 'Failed to fetch cart', 500);
  }
};

export const createCart: APIGatewayProxyHandler = async (event) => {
  const corsResponse = await handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const newCart: Cart = {
      id: uuidv4(),
      userId: undefined, // Guest cart initially
      sessionId: uuidv4(),
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

    return createSuccessResponse(newCart, 201);
  } catch (error) {
    console.error('Error creating cart:', error);
    return createErrorResponse('CREATE_ERROR', 'Failed to create cart', 500);
  }
};

export const addToCart: APIGatewayProxyHandler = async (event) => {
  const corsResponse = await handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const cartId = getPathParameter(event, 'id');
    if (!cartId) {
      return createErrorResponse('MISSING_PARAMETER', 'Cart ID is required', 400);
    }

    const body = parseBody<AddItemToCartRequest>(event);
    if (!body) {
      return createErrorResponse('INVALID_BODY', 'Request body is required', 400);
    }

    const validationError = validateRequired(body, ['productId', 'quantity']);
    if (validationError) {
      return createErrorResponse('VALIDATION_ERROR', validationError, 400);
    }

    const cartIndex = mockCarts.findIndex(c => c.id === cartId);
    if (cartIndex === -1) {
      return createErrorResponse('NOT_FOUND', 'Cart not found', 404);
    }

    // Mock product lookup - in real app, get from products service
    const mockPrice = 29.99;
    const mockTitle = 'Sample Product';

    const newItem: CartItem = {
      id: uuidv4(),
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
    const existingItemIndex = mockCarts[cartIndex].items.findIndex(
      item => item.productId === body.productId && item.variantId === body.variantId
    );

    if (existingItemIndex !== -1) {
      // Update existing item
      mockCarts[cartIndex].items[existingItemIndex].quantity += body.quantity;
      mockCarts[cartIndex].items[existingItemIndex].totalPrice = 
        mockCarts[cartIndex].items[existingItemIndex].unitPrice * 
        mockCarts[cartIndex].items[existingItemIndex].quantity;
    } else {
      // Add new item
      mockCarts[cartIndex].items.push(newItem);
    }

    // Recalculate totals
    const cart = mockCarts[cartIndex];
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    cart.taxTotal = cart.subtotal * 0.1; // 10% tax
    cart.total = cart.subtotal + cart.taxTotal + cart.shippingTotal;
    cart.updatedAt = new Date().toISOString();

    return createSuccessResponse(cart);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return createErrorResponse('ADD_TO_CART_ERROR', 'Failed to add item to cart', 500);
  }
};
