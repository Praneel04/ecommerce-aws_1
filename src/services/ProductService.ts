import { BaseService } from './BaseService';
import { 
  Product, 
  CreateProductRequest, 
  UpdateProductRequest, 
  ProductFilters,
  ProductStatus,
  ProductDynamoDBItem 
} from '../models';

export class ProductService extends BaseService {
  constructor() {
    super('medusa-products');
  }

  async createProduct(sellerId: string, productData: CreateProductRequest): Promise<Product> {
    this.validateRequired(productData, ['title', 'price', 'inventory']);

    const now = this.getCurrentTimestamp();
    const product: Product = {
      id: this.generateId('prod'),
      sellerId,
      status: ProductStatus.DRAFT,
      createdAt: now,
      updatedAt: now,
      ...productData
    };

    // TODO: Save to DynamoDB
    // This will be implemented in Step 5
    console.log('Creating product:', product);

    return product;
  }

  async getProduct(id: string): Promise<Product | null> {
    // TODO: Get from DynamoDB
    // This will be implemented in Step 5
    console.log('Getting product:', id);
    return null;
  }

  async updateProduct(id: string, sellerId: string, updates: UpdateProductRequest): Promise<Product | null> {
    // TODO: Update in DynamoDB with seller verification
    // This will be implemented in Step 5
    console.log('Updating product:', id, updates);
    return null;
  }

  async deleteProduct(id: string, sellerId: string): Promise<boolean> {
    // TODO: Delete from DynamoDB with seller verification
    // This will be implemented in Step 5
    console.log('Deleting product:', id);
    return true;
  }

  async listProducts(filters: ProductFilters = {}): Promise<{
    products: Product[];
    hasMore: boolean;
    lastEvaluatedKey?: string;
  }> {
    // TODO: Query DynamoDB with filters
    // This will be implemented in Step 5
    console.log('Listing products with filters:', filters);
    return {
      products: [],
      hasMore: false
    };
  }

  async getProductsBySeller(sellerId: string, limit = 20, lastEvaluatedKey?: string): Promise<{
    products: Product[];
    hasMore: boolean;
    lastEvaluatedKey?: string;
  }> {
    // TODO: Query DynamoDB GSI1 (seller index)
    // This will be implemented in Step 5
    console.log('Getting products for seller:', sellerId);
    return {
      products: [],
      hasMore: false
    };
  }

  async updateInventory(productId: string, quantity: number): Promise<boolean> {
    // TODO: Atomic inventory update in DynamoDB
    // This will be implemented in Step 5
    console.log('Updating inventory:', productId, quantity);
    return true;
  }

  async checkInventory(productId: string, requestedQuantity: number): Promise<boolean> {
    // TODO: Check current inventory in DynamoDB
    // This will be implemented in Step 5
    console.log('Checking inventory:', productId, requestedQuantity);
    return true;
  }

  private buildDynamoDBItem(product: Product): ProductDynamoDBItem {
    return {
      ...product,
      PK: `PRODUCT#${product.id}`,
      SK: `PRODUCT#${product.id}`,
      GSI1PK: `SELLER#${product.sellerId}`,
      GSI1SK: `PRODUCT#${product.createdAt}`,
      EntityType: 'Product'
    };
  }
}
