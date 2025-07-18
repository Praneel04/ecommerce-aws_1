// Base service class for common functionality
export abstract class BaseService {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  protected getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  protected validateRequired(data: any, fields: string[]): void {
    for (const field of fields) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }
  }

  protected sanitizeForDynamoDB(item: any): any {
    const sanitized = { ...item };
    
    // Remove undefined values (DynamoDB doesn't allow them)
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === undefined) {
        delete sanitized[key];
      }
      // Convert empty strings to null if needed
      if (sanitized[key] === '') {
        sanitized[key] = null;
      }
    });

    return sanitized;
  }

  protected createPaginationResponse<T>(
    items: T[], 
    lastEvaluatedKey?: any, 
    limit?: number
  ): { data: T[]; hasMore: boolean; lastEvaluatedKey?: string; count: number } {
    return {
      data: items,
      count: items.length,
      hasMore: !!lastEvaluatedKey,
      lastEvaluatedKey: lastEvaluatedKey ? JSON.stringify(lastEvaluatedKey) : undefined
    };
  }
}
