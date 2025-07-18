// Core data models for Medusa Serverless
export * from './Product';
export * from './User';
export * from './Order';
export { Cart, CartItem, CartDynamoDBItem, AddItemToCartRequest, UpdateCartItemRequest, UpdateCartRequest } from './Cart';

// Common types and utilities
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  lastEvaluatedKey?: string; // For DynamoDB pagination
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  hasMore: boolean;
  lastEvaluatedKey?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    count: number;
    hasMore: boolean;
    lastEvaluatedKey?: string;
  };
}

// DynamoDB table design patterns
export interface DynamoDBBaseItem {
  PK: string;
  SK: string;
  EntityType: string;
  GSI1PK?: string;
  GSI1SK?: string;
  GSI2PK?: string;
  GSI2SK?: string;
  TTL?: number;
}
