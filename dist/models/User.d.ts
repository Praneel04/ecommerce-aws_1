export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    avatarUrl?: string;
    isEmailVerified: boolean;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
}
export declare enum UserRole {
    BUYER = "buyer",
    SELLER = "seller",
    ADMIN = "admin"
}
export interface UserDynamoDBItem extends Omit<User, 'password'> {
    PK: string;
    SK: string;
    GSI1PK: string;
    GSI1SK: string;
    EntityType: 'User';
    passwordHash: string;
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
