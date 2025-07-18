#!/bin/bash

# AWS Cognito Test Users Creation Script
# This script creates demo users in our Cognito User Pool

echo "🔧 Creating test users in AWS Cognito..."

# AWS Configuration
USER_POOL_ID="us-east-1_oEQt1dRJt"
REGION="us-east-1"

# Test Users
echo "📝 Creating buyer user..."
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username "buyer-user" \
  --user-attributes \
    Name=email,Value="buyer@medusa.com" \
    Name=given_name,Value="John" \
    Name=family_name,Value="Buyer" \
    Name=custom:role,Value="buyer" \
    Name=email_verified,Value="true" \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS \
  --region $REGION 2>/dev/null || echo "Buyer user already exists"

echo "🔑 Setting permanent password for buyer..."
aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username "buyer-user" \
  --password "Password123!" \
  --permanent \
  --region $REGION

echo "📝 Creating seller user..."
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username "seller-user" \
  --user-attributes \
    Name=email,Value="seller@medusa.com" \
    Name=given_name,Value="Jane" \
    Name=family_name,Value="Seller" \
    Name=custom:role,Value="seller" \
    Name=custom:company,Value="Best Products Inc" \
    Name=custom:verified,Value="true" \
    Name=email_verified,Value="true" \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS \
  --region $REGION 2>/dev/null || echo "Seller user already exists"

echo "🔑 Setting permanent password for seller..."
aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username "seller-user" \
  --password "Password123!" \
  --permanent \
  --region $REGION 2>/dev/null || echo "Setting seller password failed"

echo "📝 Creating admin user..."
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username "admin-user" \
  --user-attributes \
    Name=email,Value="admin@medusa.com" \
    Name=given_name,Value="Admin" \
    Name=family_name,Value="User" \
    Name=custom:role,Value="admin" \
    Name=email_verified,Value="true" \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS \
  --region $REGION 2>/dev/null || echo "Admin user already exists"

echo "🔑 Setting permanent password for admin..."
aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username "admin-user" \
  --password "Password123!" \
  --permanent \
  --region $REGION 2>/dev/null || echo "Setting admin password failed"

echo ""
echo "✅ Test users created successfully!"
echo ""
echo "📧 Login Credentials:"
echo "  � Buyer:  buyer@medusa.com  / Password123!"
echo "  🏪 Seller: seller@medusa.com / Password123!"
echo "  👑 Admin:  admin@medusa.com  / Password123!"
echo ""
echo "🌐 Test these at: http://medusa-serverless-frontend-1752880615.s3-website-us-east-1.amazonaws.com"
