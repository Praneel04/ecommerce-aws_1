import { Address } from './Order';
export interface Cart {
    id: string;
    userId?: string;
    sessionId?: string;
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
    expiresAt: string;
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
export interface CartDynamoDBItem extends Cart {
    PK: string;
    SK: string;
    GSI1PK: string;
    GSI1SK: string;
    EntityType: 'Cart';
    TTL?: number;
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
