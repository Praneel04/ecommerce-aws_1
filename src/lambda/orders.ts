import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleCors, 
  parseBody,
  getQueryParameter,
  validateRequired 
} from './utils';
import { Order, OrderItem, CreateOrderRequest, OrderStatus, PaymentStatus, FulfillmentStatus } from '../models';
import { v4 as uuidv4 } from 'uuid';

// Mock data - will be replaced with DynamoDB in Step 5
const mockOrders: Order[] = [];

export const getOrders: APIGatewayProxyHandler = async (event) => {
  const corsResponse = await handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const limit = parseInt(getQueryParameter(event, 'limit') || '10');
    const offset = parseInt(getQueryParameter(event, 'offset') || '0');
    
    const paginatedOrders = mockOrders.slice(offset, offset + limit);
    
    return createSuccessResponse(paginatedOrders, 200, {
      count: paginatedOrders.length,
      hasMore: offset + limit < mockOrders.length,
      total: mockOrders.length
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return createErrorResponse('FETCH_ERROR', 'Failed to fetch orders', 500);
  }
};

export const createOrder: APIGatewayProxyHandler = async (event) => {
  const corsResponse = await handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const body = parseBody<CreateOrderRequest>(event);
    if (!body) {
      return createErrorResponse('INVALID_BODY', 'Request body is required', 400);
    }

    const validationError = validateRequired(body, ['items']);
    if (validationError) {
      return createErrorResponse('VALIDATION_ERROR', validationError, 400);
    }

    // Mock user ID - in real app, get from auth context
    const userId = 'user_1';
    const email = 'customer@example.com';

    // Convert simple items to full OrderItems with mock data
    const orderItems: OrderItem[] = body.items.map(item => ({
      id: uuidv4(),
      productId: item.productId,
      variantId: undefined,
      title: 'Sample Product', // In real app, fetch from products service
      description: 'Sample product description',
      quantity: item.quantity,
      unitPrice: 29.99, // Mock price
      totalPrice: 29.99 * item.quantity,
      metadata: {},
    }));

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxTotal = subtotal * 0.1; // 10% tax
    const shippingTotal = 10.00; // Flat shipping
    const total = subtotal + taxTotal + shippingTotal;

    const newOrder: Order = {
      id: uuidv4(),
      userId,
      email,
      status: OrderStatus.PENDING,
      currency: 'USD',
      items: orderItems,
      subtotal,
      taxTotal,
      shippingTotal,
      total,
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress,
      paymentStatus: PaymentStatus.PENDING,
      fulfillmentStatus: FulfillmentStatus.NOT_FULFILLED,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockOrders.push(newOrder);

    return createSuccessResponse(newOrder, 201);
  } catch (error) {
    console.error('Error creating order:', error);
    return createErrorResponse('CREATE_ERROR', 'Failed to create order', 500);
  }
};
