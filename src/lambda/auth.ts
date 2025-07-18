import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  handleCors, 
  parseBody,
  validateRequired 
} from './utils';
import { User, CreateUserRequest, UserRole } from '../models';
import { v4 as uuidv4 } from 'uuid';

// Mock data - will be replaced with DynamoDB in Step 5
const mockUsers: User[] = [
  {
    id: 'user_1',
    email: 'admin@medusa.com',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    password: 'hashed_password_123', // In real app, this would be properly hashed
    isEmailVerified: true,
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

interface LoginRequest {
  email: string;
  password: string;
}

export const login: APIGatewayProxyHandler = async (event) => {
  const corsResponse = await handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const body = parseBody<LoginRequest>(event);
    if (!body) {
      return createErrorResponse('INVALID_BODY', 'Request body is required', 400);
    }

    const validationError = validateRequired(body, ['email', 'password']);
    if (validationError) {
      return createErrorResponse('VALIDATION_ERROR', validationError, 400);
    }

    // Simple mock authentication - in real app, verify password hash
    const user = mockUsers.find(u => u.email === body.email && u.isEmailVerified);
    if (!user || body.password !== 'password123') {
      return createErrorResponse('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    // Mock JWT token - in real app, generate proper JWT
    const token = `mock_jwt_token_${user.id}_${Date.now()}`;

    return createSuccessResponse({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
      expiresIn: '24h'
    });
  } catch (error) {
    console.error('Error during login:', error);
    return createErrorResponse('LOGIN_ERROR', 'Login failed', 500);
  }
};

export const register: APIGatewayProxyHandler = async (event) => {
  const corsResponse = await handleCors(event);
  if (corsResponse) return corsResponse;

  try {
    const body = parseBody<CreateUserRequest>(event);
    if (!body) {
      return createErrorResponse('INVALID_BODY', 'Request body is required', 400);
    }

    const validationError = validateRequired(body, ['email', 'firstName', 'lastName']);
    if (validationError) {
      return createErrorResponse('VALIDATION_ERROR', validationError, 400);
    }

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === body.email);
    if (existingUser) {
      return createErrorResponse('USER_EXISTS', 'User with this email already exists', 409);
    }

    const newUser: User = {
      id: uuidv4(),
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role || UserRole.BUYER,
      password: 'hashed_password_' + Date.now(), // Mock hash
      isEmailVerified: false,
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    // Return user without password
    const { password, ...userResponse } = newUser;

    return createSuccessResponse(userResponse, 201);
  } catch (error) {
    console.error('Error during registration:', error);
    return createErrorResponse('REGISTRATION_ERROR', 'Registration failed', 500);
  }
};
