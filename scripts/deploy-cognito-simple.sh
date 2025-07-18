#!/bin/bash

# Simple AWS Cognito Setup using CLI (no CloudFormation)
# Creates user pool with buyer/seller roles

set -e

# Configuration
USER_POOL_NAME="medusa-serverless-users"
CLIENT_NAME="medusa-serverless-web"
REGION="us-east-1"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}🔐 AWS Cognito Simple Setup${NC}"
echo "============================"

# Check AWS credentials
echo -e "${YELLOW}🔍 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Run ./scripts/setup-aws.sh first${NC}"
    exit 1
fi

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS Account: $AWS_ACCOUNT${NC}"

# Create User Pool
echo -e "${YELLOW}👥 Creating Cognito User Pool...${NC}"
USER_POOL_OUTPUT=$(aws cognito-idp create-user-pool \
    --pool-name "$USER_POOL_NAME" \
    --policies '{
        "PasswordPolicy": {
            "MinimumLength": 8,
            "RequireUppercase": true,
            "RequireLowercase": true,
            "RequireNumbers": true,
            "RequireSymbols": false
        }
    }' \
    --auto-verified-attributes email \
    --alias-attributes email \
    --email-verification-message "Welcome to Medusa Serverless! Please verify your email: {####}" \
    --email-verification-subject "Verify your Medusa Serverless account" \
    --schema '[
        {
            "Name": "email",
            "AttributeDataType": "String",
            "Required": true,
            "Mutable": true
        },
        {
            "Name": "given_name", 
            "AttributeDataType": "String",
            "Required": true,
            "Mutable": true
        },
        {
            "Name": "family_name",
            "AttributeDataType": "String", 
            "Required": true,
            "Mutable": true
        },
        {
            "Name": "role",
            "AttributeDataType": "String",
            "Required": false,
            "Mutable": true,
            "DeveloperOnlyAttribute": false
        },
        {
            "Name": "seller_company",
            "AttributeDataType": "String",
            "Required": false, 
            "Mutable": true,
            "DeveloperOnlyAttribute": false
        }
    ]')

USER_POOL_ID=$(echo $USER_POOL_OUTPUT | jq -r '.UserPool.Id')

if [ -z "$USER_POOL_ID" ] || [ "$USER_POOL_ID" = "null" ]; then
    echo -e "${RED}❌ Failed to create User Pool${NC}"
    exit 1
fi

echo -e "${GREEN}✅ User Pool created: $USER_POOL_ID${NC}"

# Create User Pool Client
echo -e "${YELLOW}📱 Creating User Pool Client...${NC}"
CLIENT_OUTPUT=$(aws cognito-idp create-user-pool-client \
    --user-pool-id "$USER_POOL_ID" \
    --client-name "$CLIENT_NAME" \
    --no-generate-secret \
    --explicit-auth-flows ALLOW_USER_SRP_AUTH ALLOW_REFRESH_TOKEN_AUTH ALLOW_USER_PASSWORD_AUTH \
    --read-attributes email given_name family_name custom:role custom:seller_company \
    --write-attributes email given_name family_name custom:role custom:seller_company \
    --access-token-validity 24 \
    --id-token-validity 24 \
    --refresh-token-validity 30)

USER_POOL_CLIENT_ID=$(echo $CLIENT_OUTPUT | jq -r '.UserPoolClient.ClientId')

if [ -z "$USER_POOL_CLIENT_ID" ] || [ "$USER_POOL_CLIENT_ID" = "null" ]; then
    echo -e "${RED}❌ Failed to create User Pool Client${NC}"
    exit 1
fi

echo -e "${GREEN}✅ User Pool Client created: $USER_POOL_CLIENT_ID${NC}"

# Create Identity Pool
echo -e "${YELLOW}🆔 Creating Identity Pool...${NC}"
IDENTITY_POOL_OUTPUT=$(aws cognito-identity create-identity-pool \
    --identity-pool-name "medusa_serverless_identity" \
    --no-allow-unauthenticated-identities \
    --cognito-identity-providers ProviderName=cognito-idp.$REGION.amazonaws.com/$USER_POOL_ID,ClientId=$USER_POOL_CLIENT_ID)

IDENTITY_POOL_ID=$(echo $IDENTITY_POOL_OUTPUT | jq -r '.IdentityPoolId')

if [ -z "$IDENTITY_POOL_ID" ] || [ "$IDENTITY_POOL_ID" = "null" ]; then
    echo -e "${RED}❌ Failed to create Identity Pool${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Identity Pool created: $IDENTITY_POOL_ID${NC}"

# Save configuration
echo -e "${YELLOW}💾 Saving Cognito configuration...${NC}"
cat > cognito-config.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "dev",
  "region": "$REGION",
  "userPoolId": "$USER_POOL_ID",
  "userPoolClientId": "$USER_POOL_CLIENT_ID", 
  "identityPoolId": "$IDENTITY_POOL_ID",
  "awsAccount": "$AWS_ACCOUNT",
  "userPoolName": "$USER_POOL_NAME"
}
EOF

# Create environment variables for React
cat > frontend/.env.cognito << EOF
# AWS Cognito Configuration
REACT_APP_AWS_REGION=$REGION
REACT_APP_USER_POOL_ID=$USER_POOL_ID
REACT_APP_USER_POOL_CLIENT_ID=$USER_POOL_CLIENT_ID
REACT_APP_IDENTITY_POOL_ID=$IDENTITY_POOL_ID
REACT_APP_AUTH_ENABLED=true
EOF

# Update existing .env files
echo "" >> frontend/.env.local
echo "# Cognito Auth" >> frontend/.env.local
cat frontend/.env.cognito >> frontend/.env.local

echo "" >> frontend/.env.production
echo "# Cognito Auth" >> frontend/.env.production
cat frontend/.env.cognito >> frontend/.env.production

echo ""
echo -e "${GREEN}🎉 Cognito Setup Complete!${NC}"
echo "=========================="
echo -e "${GREEN}✅ User Pool: $USER_POOL_ID${NC}"
echo -e "${GREEN}✅ Client ID: $USER_POOL_CLIENT_ID${NC}"
echo -e "${GREEN}✅ Identity Pool: $IDENTITY_POOL_ID${NC}"
echo -e "${GREEN}✅ Region: $REGION${NC}"

echo ""
echo -e "${BLUE}🔧 What was created:${NC}"
echo "- AWS Cognito User Pool with email authentication"
echo "- Custom attributes: role, seller_company"
echo "- User Pool Client for web application"
echo "- Identity Pool for AWS credentials"

echo ""
echo -e "${CYAN}📝 User Roles:${NC}"
echo "- buyer: Browse products, manage cart, place orders"
echo "- seller: Manage products, view sales, seller dashboard"
echo "- admin: Full system access and user management"

echo ""
echo -e "${YELLOW}🔄 Next Steps:${NC}"
echo "1. Install AWS Amplify: npm install aws-amplify"
echo "2. Replace mock authentication with Cognito"
echo "3. Add JWT validation to Lambda functions"
echo "4. Test user registration and login"

echo ""
echo -e "${GREEN}✅ Configuration saved to:${NC}"
echo "- cognito-config.json (deployment info)"
echo "- frontend/.env.cognito (React environment variables)"

# Create test user creation script
cat > scripts/create-test-users.sh << EOF
#!/bin/bash
# Create test users for development

set -e

USER_POOL_ID="$USER_POOL_ID"

echo "Creating test users..."

# Create buyer user
aws cognito-idp admin-create-user \\
    --user-pool-id \$USER_POOL_ID \\
    --username "buyer@test.com" \\
    --user-attributes Name=email,Value=buyer@test.com Name=given_name,Value=Test Name=family_name,Value=Buyer Name=custom:role,Value=buyer \\
    --temporary-password "TempPass123!" \\
    --message-action SUPPRESS

# Set permanent password for buyer
aws cognito-idp admin-set-user-password \\
    --user-pool-id \$USER_POOL_ID \\
    --username "buyer@test.com" \\
    --password "TestPass123!" \\
    --permanent

# Create seller user  
aws cognito-idp admin-create-user \\
    --user-pool-id \$USER_POOL_ID \\
    --username "seller@test.com" \\
    --user-attributes Name=email,Value=seller@test.com Name=given_name,Value=Test Name=family_name,Value=Seller Name=custom:role,Value=seller Name=custom:seller_company,Value="Test Store" \\
    --temporary-password "TempPass123!" \\
    --message-action SUPPRESS

# Set permanent password for seller
aws cognito-idp admin-set-user-password \\
    --user-pool-id \$USER_POOL_ID \\
    --username "seller@test.com" \\
    --password "TestPass123!" \\
    --permanent

echo "✅ Test users created:"
echo "👤 Buyer: buyer@test.com / TestPass123!"
echo "🏪 Seller: seller@test.com / TestPass123!"
EOF

chmod +x scripts/create-test-users.sh

echo -e "${CYAN}💡 Bonus: Created test user script at scripts/create-test-users.sh${NC}"
