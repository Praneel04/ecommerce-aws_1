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
export interface ProductDynamoDBItem extends Product {
    PK: string;
    SK: string;
    GSI1PK: string;
    GSI1SK: string;
    EntityType: 'Product';
}
export declare enum ProductStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived"
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
