#!/bin/bash

# Fix passwords for existing Cognito users

USER_POOL_ID="us-east-1_oEQt1dRJt"
REGION="us-east-1"

echo "🔑 Setting permanent passwords for users..."

# Fix buyer password
echo "Setting password for buyer-user..."
aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username "buyer-user" \
  --password "Password123!" \
  --permanent \
  --region $REGION

echo "✅ Password fixed for buyer@medusa.com"
echo "📧 Login: buyer@medusa.com / Password123!"
