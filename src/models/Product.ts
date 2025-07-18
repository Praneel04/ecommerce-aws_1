// Simplified Product model for serverless architecture
export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  inventory: number;
  sellerId: string;
  status: 'draft' | 'published' | 'archived';
  images?: string[];
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// For DynamoDB, we'll use a single table design
export interface ProductDynamoDBItem extends Product {
  PK: string; // PRODUCT#${id}
  SK: string; // PRODUCT#${id}
  GSI1PK: string; // SELLER#${sellerId}
  GSI1SK: string; // PRODUCT#${createdAt}
  EntityType: 'Product';
}

export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface ProductFilters {
  sellerId?: string;
  category?: string;
  status?: ProductStatus;
  priceMin?: number;
  priceMax?: number;
  search?: string;
}

export interface CreateProductRequest {
  title: string;
  description?: string;
  price: number;
  inventory: number;
  category?: string;
  tags?: string[];
  images?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  status?: ProductStatus;
}
