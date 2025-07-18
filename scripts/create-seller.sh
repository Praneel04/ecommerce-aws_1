#!/bin/bash

# Create seller user specifically

USER_POOL_ID="us-east-1_oEQt1dRJt"
REGION="us-east-1"

echo "🏪 Creating seller user..."

# Create seller user
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username "seller-user" \
  --user-attributes \
    Name=email,Value="seller@medusa.com" \
    Name=given_name,Value="Jane" \
    Name=family_name,Value="Seller" \
    Name=custom:role,Value="seller" \
    Name=email_verified,Value="true" \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS \
  --region $REGION

echo "🔑 Setting permanent password for seller..."
aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username "seller-user" \
  --password "Password123!" \
  --permanent \
  --region $REGION

echo "✅ Seller user created: seller@medusa.com / Password123!"
