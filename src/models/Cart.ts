// Simplified Cart model for serverless architecture
import { Address } from './Order';

export interface Cart {
  id: string;
  userId?: string; // null for guest carts
  sessionId?: string; // for guest carts
  items: CartItem[];
  subtotal: number;
  taxTotal: number;
  shippingTotal: number;
  total: number;
  currency: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  expiresAt: string; // TTL for guest carts
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  metadata?: Record<string, any>;
}

// For DynamoDB
export interface CartDynamoDBItem extends Cart {
  PK: string; // CART#${id}
  SK: string; // CART#${id}
  GSI1PK: string; // USER#${userId} or SESSION#${sessionId}
  GSI1SK: string; // CART#${updatedAt}
  EntityType: 'Cart';
  TTL?: number; // DynamoDB TTL for auto-cleanup
}

export interface AddItemToCartRequest {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface UpdateCartRequest {
  shippingAddress?: Address;
  billingAddress?: Address;
  metadata?: Record<string, any>;
}
