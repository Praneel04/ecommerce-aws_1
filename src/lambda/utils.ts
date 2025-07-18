import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { APIResponse } from '../models';

export interface LambdaResponse extends APIGatewayProxyResult {}

export const createResponse = (
  statusCode: number,
  data: APIResponse<any>,
  headers: Record<string, string> = {}
): LambdaResponse => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      ...headers,
    },
    body: JSON.stringify(data),
  };
};

export const createSuccessResponse = <T>(
  data: T,
  statusCode: number = 200,
  pagination?: any
): LambdaResponse => {
  const response: APIResponse<T> = {
    success: true,
    data,
    ...(pagination && { pagination }),
  };
  return createResponse(statusCode, response);
};

export const createErrorResponse = (
  code: string,
  message: string,
  statusCode: number = 400,
  details?: any
): LambdaResponse => {
  const response: APIResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
  return createResponse(statusCode, response);
};

export const parseBody = <T>(event: APIGatewayProxyEvent): T | null => {
  try {
    return event.body ? JSON.parse(event.body) : null;
  } catch (error) {
    return null;
  }
};

export const getPathParameter = (
  event: APIGatewayProxyEvent,
  key: string
): string | null => {
  return event.pathParameters?.[key] || null;
};

export const getQueryParameter = (
  event: APIGatewayProxyEvent,
  key: string
): string | null => {
  return event.queryStringParameters?.[key] || null;
};

export const validateRequired = (data: any, fields: string[]): string | null => {
  for (const field of fields) {
    if (!data || data[field] === undefined || data[field] === null || data[field] === '') {
      return `Missing required field: ${field}`;
    }
  }
  return null;
};

export const handleCors = async (event: APIGatewayProxyEvent): Promise<LambdaResponse | null> => {
  if (event.httpMethod === 'OPTIONS') {
    return createSuccessResponse('CORS preflight');
  }
  return null; // Continue with normal processing
};
