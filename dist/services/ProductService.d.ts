import { BaseService } from './BaseService';
import { Product, CreateProductRequest, UpdateProductRequest, ProductFilters } from '../models';
export declare class ProductService extends BaseService {
    constructor();
    createProduct(sellerId: string, productData: CreateProductRequest): Promise<Product>;
    getProduct(id: string): Promise<Product | null>;
    updateProduct(id: string, sellerId: string, updates: UpdateProductRequest): Promise<Product | null>;
    deleteProduct(id: string, sellerId: string): Promise<boolean>;
    listProducts(filters?: ProductFilters): Promise<{
        products: Product[];
        hasMore: boolean;
        lastEvaluatedKey?: string;
    }>;
    getProductsBySeller(sellerId: string, limit?: number, lastEvaluatedKey?: string): Promise<{
        products: Product[];
        hasMore: boolean;
        lastEvaluatedKey?: string;
    }>;
    updateInventory(productId: string, quantity: number): Promise<boolean>;
    checkInventory(productId: string, requestedQuantity: number): Promise<boolean>;
    private buildDynamoDBItem;
}
