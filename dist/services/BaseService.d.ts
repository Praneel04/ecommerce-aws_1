export declare abstract class BaseService {
    protected tableName: string;
    constructor(tableName: string);
    protected generateId(prefix: string): string;
    protected getCurrentTimestamp(): string;
    protected validateRequired(data: any, fields: string[]): void;
    protected sanitizeForDynamoDB(item: any): any;
    protected createPaginationResponse<T>(items: T[], lastEvaluatedKey?: any, limit?: number): {
        data: T[];
        hasMore: boolean;
        lastEvaluatedKey?: string;
        count: number;
    };
}
