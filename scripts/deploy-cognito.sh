#!/bin/bash

# Deploy AWS Cognito User Pool for Authentication
# Creates user pool with buyer/seller roles

set -e

# Configuration
STACK_NAME="medusa-serverless-auth"
ENVIRONMENT="dev"
APP_NAME="medusa-serverless"
REGION="us-east-1"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}🔐 AWS Cognito Authentication Deployment${NC}"
echo "=========================================="

# Check AWS credentials
echo -e "${YELLOW}🔍 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Run ./scripts/setup-aws.sh first${NC}"
    exit 1
fi

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS Account: $AWS_ACCOUNT${NC}"

# Deploy CloudFormation stack
echo -e "${YELLOW}📦 Deploying Cognito CloudFormation stack...${NC}"
aws cloudformation deploy \
    --template-file infrastructure/cognito-auth.yaml \
    --stack-name $STACK_NAME \
    --parameter-overrides \
        Environment=$ENVIRONMENT \
        AppName=$APP_NAME \
    --capabilities CAPABILITY_NAMED_IAM \
    --region $REGION

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CloudFormation stack deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy CloudFormation stack${NC}"
    exit 1
fi

# Get stack outputs
echo -e "${YELLOW}🔍 Getting Cognito configuration...${NC}"
USER_POOL_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
    --output text)

USER_POOL_CLIENT_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
    --output text)

IDENTITY_POOL_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`IdentityPoolId`].OutputValue' \
    --output text)

if [ -z "$USER_POOL_ID" ] || [ -z "$USER_POOL_CLIENT_ID" ]; then
    echo -e "${RED}❌ Failed to get stack outputs${NC}"
    exit 1
fi

echo -e "${GREEN}✅ User Pool ID: $USER_POOL_ID${NC}"
echo -e "${GREEN}✅ User Pool Client ID: $USER_POOL_CLIENT_ID${NC}"
echo -e "${GREEN}✅ Identity Pool ID: $IDENTITY_POOL_ID${NC}"

# Save configuration for frontend
echo -e "${YELLOW}💾 Saving Cognito configuration...${NC}"
cat > cognito-config.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$ENVIRONMENT",
  "region": "$REGION",
  "userPoolId": "$USER_POOL_ID",
  "userPoolClientId": "$USER_POOL_CLIENT_ID",
  "identityPoolId": "$IDENTITY_POOL_ID",
  "awsAccount": "$AWS_ACCOUNT",
  "stackName": "$STACK_NAME"
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
echo -e "${GREEN}🎉 Cognito Deployment Complete!${NC}"
echo "==============================="
echo -e "${GREEN}✅ User Pool: $USER_POOL_ID${NC}"
echo -e "${GREEN}✅ Client ID: $USER_POOL_CLIENT_ID${NC}"
echo -e "${GREEN}✅ Identity Pool: $IDENTITY_POOL_ID${NC}"
echo -e "${GREEN}✅ Region: $REGION${NC}"

echo ""
echo -e "${BLUE}🔧 What was created:${NC}"
echo "- AWS Cognito User Pool with email authentication"
echo "- Custom attributes: role, seller_company, seller_verified"
echo "- Pre-signup Lambda trigger for role assignment"
echo "- Identity Pool for AWS credentials"
echo "- IAM roles for authenticated/unauthenticated users"

echo ""
echo -e "${CYAN}📝 User Roles:${NC}"
echo "- buyer: Browse products, manage cart, place orders"
echo "- seller: Manage products, view sales, seller dashboard"
echo "- admin: Full system access and user management"

echo ""
echo -e "${YELLOW}🔄 Next Steps:${NC}"
echo "1. Install AWS Amplify in React: npm install aws-amplify"
echo "2. Replace mock authentication with Cognito"
echo "3. Add JWT validation to Lambda functions"
echo "4. Test user registration and login"

echo ""
echo -e "${GREEN}✅ Configuration saved to:${NC}"
echo "- cognito-config.json (deployment info)"
echo "- frontend/.env.cognito (React environment variables)"

# Create test user script
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

# Create seller user  
aws cognito-idp admin-create-user \\
    --user-pool-id \$USER_POOL_ID \\
    --username "seller@test.com" \\
    --user-attributes Name=email,Value=seller@test.com Name=given_name,Value=Test Name=family_name,Value=Seller Name=custom:role,Value=seller Name=custom:seller_company,Value="Test Store" \\
    --temporary-password "TempPass123!" \\
    --message-action SUPPRESS

echo "Test users created with temporary password: TempPass123!"
echo "Users will need to change password on first login."
EOF

chmod +x scripts/create-test-users.sh

echo -e "${CYAN}💡 Bonus: Created test user script at scripts/create-test-users.sh${NC}"
