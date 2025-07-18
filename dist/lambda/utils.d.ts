import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { APIResponse } from '../models';
export interface LambdaResponse extends APIGatewayProxyResult {
}
export declare const createResponse: (statusCode: number, data: APIResponse<any>, headers?: Record<string, string>) => LambdaResponse;
export declare const createSuccessResponse: <T>(data: T, statusCode?: number, pagination?: any) => LambdaResponse;
export declare const createErrorResponse: (code: string, message: string, statusCode?: number, details?: any) => LambdaResponse;
export declare const parseBody: <T>(event: APIGatewayProxyEvent) => T | null;
export declare const getPathParameter: (event: APIGatewayProxyEvent, key: string) => string | null;
export declare const getQueryParameter: (event: APIGatewayProxyEvent, key: string) => string | null;
export declare const validateRequired: (data: any, fields: string[]) => string | null;
export declare const handleCors: (event: APIGatewayProxyEvent) => Promise<LambdaResponse | null>;
