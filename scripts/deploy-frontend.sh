#!/bin/bash

# Medusa Serverless Frontend Deployment Script
# Deploys React build to S3 and invalidates CloudFront cache

set -e

# Configuration
STACK_NAME="medusa-serverless-frontend"
ENVIRONMENT="dev"
REGION="us-east-1"
BUILD_DIR="./frontend/build"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Medusa Serverless Frontend Deployment${NC}"
echo "=================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if build directory exists
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build directory not found. Please run 'npm run build' first.${NC}"
    exit 1
fi

# Check AWS credentials
echo -e "${YELLOW}🔍 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Please run 'aws configure'.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS credentials configured${NC}"

# Deploy CloudFormation stack
echo -e "${YELLOW}📦 Deploying CloudFormation stack...${NC}"
aws cloudformation deploy \
    --template-file infrastructure/s3-cloudfront.yaml \
    --stack-name $STACK_NAME \
    --parameter-overrides Environment=$ENVIRONMENT \
    --region $REGION \
    --capabilities CAPABILITY_IAM

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CloudFormation stack deployed successfully${NC}"
else
    echo -e "${RED}❌ Failed to deploy CloudFormation stack${NC}"
    exit 1
fi

# Get S3 bucket name and CloudFront distribution ID
echo -e "${YELLOW}🔍 Getting stack outputs...${NC}"
S3_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
    --output text)

CLOUDFRONT_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
    --output text)

WEBSITE_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' \
    --output text)

if [ -z "$S3_BUCKET" ] || [ -z "$CLOUDFRONT_ID" ]; then
    echo -e "${RED}❌ Failed to get stack outputs${NC}"
    exit 1
fi

echo -e "${GREEN}✅ S3 Bucket: $S3_BUCKET${NC}"
echo -e "${GREEN}✅ CloudFront Distribution: $CLOUDFRONT_ID${NC}"

# Sync build files to S3
echo -e "${YELLOW}📤 Uploading files to S3...${NC}"
aws s3 sync $BUILD_DIR s3://$S3_BUCKET \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "*.html" \
    --exclude "service-worker.js" \
    --exclude "manifest.json"

# Upload HTML files with no-cache headers
aws s3 sync $BUILD_DIR s3://$S3_BUCKET \
    --delete \
    --cache-control "public, max-age=0, must-revalidate" \
    --include "*.html" \
    --include "service-worker.js" \
    --include "manifest.json"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Files uploaded to S3 successfully${NC}"
else
    echo -e "${RED}❌ Failed to upload files to S3${NC}"
    exit 1
fi

# Invalidate CloudFront cache
echo -e "${YELLOW}🔄 Invalidating CloudFront cache...${NC}"
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_ID \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CloudFront invalidation created: $INVALIDATION_ID${NC}"
else
    echo -e "${RED}❌ Failed to create CloudFront invalidation${NC}"
fi

# Display deployment summary
echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=========================="
echo -e "${GREEN}Website URL: $WEBSITE_URL${NC}"
echo -e "${GREEN}S3 Bucket: $S3_BUCKET${NC}"
echo -e "${GREEN}CloudFront Distribution: $CLOUDFRONT_ID${NC}"
echo ""
echo -e "${YELLOW}📝 Note: CloudFront propagation may take 5-15 minutes${NC}"
echo -e "${YELLOW}📝 You can check invalidation status with:${NC}"
echo "aws cloudfront get-invalidation --distribution-id $CLOUDFRONT_ID --id $INVALIDATION_ID"

# Save deployment info
cat > deployment-info.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "environment": "$ENVIRONMENT",
  "region": "$REGION",
  "s3Bucket": "$S3_BUCKET",
  "cloudFrontDistribution": "$CLOUDFRONT_ID",
  "websiteUrl": "$WEBSITE_URL",
  "invalidationId": "$INVALIDATION_ID"
}
EOF

echo -e "${GREEN}✅ Deployment info saved to deployment-info.json${NC}"
