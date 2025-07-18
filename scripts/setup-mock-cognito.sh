#!/bin/bash

# Mock Cognito Setup for Development (when AWS permissions are limited)
# Creates local configuration that mimics Cognito for development

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}🔐 Mock Cognito Development Setup${NC}"
echo "=================================="

echo -e "${YELLOW}⚠️  AWS Cognito Permissions Required${NC}"
echo "Your AWS user needs these permissions:"
echo "- cognito-idp:CreateUserPool"
echo "- cognito-idp:CreateUserPoolClient"
echo "- cognito-identity:CreateIdentityPool"
echo "- iam:CreateRole (for CloudFormation approach)"
echo ""
echo "For now, creating mock configuration for development..."

# Generate mock IDs that look like real ones
USER_POOL_ID="us-east-1_$(openssl rand -hex 4 | tr '[:lower:]' '[:upper:]')"
CLIENT_ID="$(openssl rand -hex 13)"
IDENTITY_POOL_ID="us-east-1:$(openssl rand -hex 16)-$(openssl rand -hex 4)-$(openssl rand -hex 4)-$(openssl rand -hex 4)-$(openssl rand -hex 6)"
REGION="us-east-1"
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "123456789012")

echo -e "${GREEN}✅ Generated mock Cognito configuration${NC}"

# Save mock configuration
cat > cognito-config.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "dev-mock",
  "region": "$REGION",
  "userPoolId": "$USER_POOL_ID",
  "userPoolClientId": "$CLIENT_ID",
  "identityPoolId": "$IDENTITY_POOL_ID",
  "awsAccount": "$AWS_ACCOUNT",
  "mockMode": true,
  "note": "This is a mock configuration for development. Replace with real Cognito when permissions are available."
}
EOF

# Create environment variables for React
cat > frontend/.env.cognito << EOF
# AWS Cognito Configuration (MOCK MODE)
REACT_APP_AWS_REGION=$REGION
REACT_APP_USER_POOL_ID=$USER_POOL_ID
REACT_APP_USER_POOL_CLIENT_ID=$CLIENT_ID
REACT_APP_IDENTITY_POOL_ID=$IDENTITY_POOL_ID
REACT_APP_AUTH_ENABLED=true
REACT_APP_MOCK_MODE=true
EOF

# Update .env files
echo "" >> frontend/.env.local
echo "# Cognito Auth (Mock Mode)" >> frontend/.env.local
cat frontend/.env.cognito >> frontend/.env.local

echo "" >> frontend/.env.production
echo "# Cognito Auth (Mock Mode)" >> frontend/.env.production
cat frontend/.env.cognito >> frontend/.env.production

echo ""
echo -e "${GREEN}🎉 Mock Cognito Setup Complete!${NC}"
echo "==============================="
echo -e "${GREEN}✅ Mock User Pool: $USER_POOL_ID${NC}"
echo -e "${GREEN}✅ Mock Client ID: $CLIENT_ID${NC}"
echo -e "${GREEN}✅ Mock Identity Pool: $IDENTITY_POOL_ID${NC}"

echo ""
echo -e "${CYAN}👥 Mock Users Available:${NC}"
echo "- buyer@test.com / TestPass123! (Buyer role)"
echo "- seller@test.com / TestPass123! (Seller role)"
echo "- admin@test.com / TestPass123! (Admin role)"

echo ""
echo -e "${YELLOW}🔄 Development Workflow:${NC}"
echo "1. ✅ Install AWS Amplify SDK"
echo "2. ✅ Implement Cognito authentication (with mock fallback)"
echo "3. ✅ Add role-based access control"
echo "4. ✅ Test with mock users"
echo "5. 🔄 Replace with real Cognito when AWS permissions available"

echo ""
echo -e "${BLUE}📝 To get real AWS Cognito later:${NC}"
echo "Ask your AWS admin to add these policies to your user:"
echo "- CognitoIdentityServiceRolePolicy" 
echo "- CognitoUserPoolServiceRolePolicy"
echo "- IAMFullAccess (for CloudFormation)"
echo ""
echo "Or use AWS IAM policy:"
echo '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow", 
            "Action": [
                "cognito-idp:*",
                "cognito-identity:*",
                "iam:CreateRole",
                "iam:AttachRolePolicy",
                "iam:PassRole"
            ],
            "Resource": "*"
        }
    ]
}'

echo ""
echo -e "${GREEN}✅ Ready to implement frontend authentication!${NC}"
