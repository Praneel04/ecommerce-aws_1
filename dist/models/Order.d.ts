export interface Order {
    id: string;
    userId: string;
    email: string;
    status: OrderStatus;
    currency: string;
    subtotal: number;
    taxTotal: number;
    shippingTotal: number;
    total: number;
    items: OrderItem[];
    shippingAddress?: Address;
    billingAddress?: Address;
    paymentId?: string;
    paymentStatus: PaymentStatus;
    fulfillmentStatus: FulfillmentStatus;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
    canceledAt?: string;
}
export interface OrderItem {
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
export interface Address {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
}
export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PROCESSING = "processing",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELED = "canceled",
    REFUNDED = "refunded"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    AUTHORIZED = "authorized",
    CAPTURED = "captured",
    FAILED = "failed",
    REFUNDED = "refunded",
    PARTIALLY_REFUNDED = "partially_refunded"
}
export declare enum FulfillmentStatus {
    NOT_FULFILLED = "not_fulfilled",
    FULFILLED = "fulfilled",
    PARTIALLY_FULFILLED = "partially_fulfilled",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELED = "canceled"
}
export interface OrderDynamoDBItem extends Order {
    PK: string;
    SK: string;
    GSI1PK: string;
    GSI1SK: string;
    GSI2PK: string;
    GSI2SK: string;
    EntityType: 'Order';
}
export interface CreateOrderRequest {
    items: Array<{
        productId: string;
        quantity: number;
    }>;
    shippingAddress?: Address;
    billingAddress?: Address;
    paymentMethodId?: string;
}
export interface UpdateOrderRequest {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    fulfillmentStatus?: FulfillmentStatus;
    shippingAddress?: Address;
    billingAddress?: Address;
    metadata?: Record<string, any>;
}
