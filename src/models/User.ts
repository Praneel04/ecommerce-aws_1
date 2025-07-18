// Simplified User model for serverless architecture
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // hashed
  role: UserRole;
  avatarUrl?: string;
  isEmailVerified: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  ADMIN = 'admin'
}

// For DynamoDB
export interface UserDynamoDBItem extends Omit<User, 'password'> {
  PK: string; // USER#${id}
  SK: string; // USER#${id}
  GSI1PK: string; // EMAIL#${email}
  GSI1SK: string; // USER#${id}
  EntityType: 'User';
  passwordHash: string; // separate field for security
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
