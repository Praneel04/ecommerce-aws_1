#!/bin/bash

# Simple AWS S3 Static Website Deployment
# This script creates an S3 bucket and deploys the React build

set -e

# Configuration
BUCKET_NAME="medusa-serverless-frontend-$(date +%s)"
REGION="us-east-1"
BUILD_DIR="./frontend/build"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 AWS S3 Static Website Deployment${NC}"
echo "======================================"

# Check AWS credentials
echo -e "${YELLOW}🔍 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured.${NC}"
    echo -e "${YELLOW}Please run: aws configure${NC}"
    echo "You'll need:"
    echo "- AWS Access Key ID"
    echo "- AWS Secret Access Key"
    echo "- Default region (us-east-1)"
    echo "- Default output format (json)"
    exit 1
fi

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS Account: $AWS_ACCOUNT${NC}"

# Check if build exists
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${YELLOW}⚠️  Build directory not found. Building React app...${NC}"
    cd frontend && npm run build && cd ..
fi

# Create S3 bucket
echo -e "${YELLOW}📦 Creating S3 bucket: $BUCKET_NAME${NC}"
aws s3 mb s3://$BUCKET_NAME --region $REGION

# Configure bucket for static website hosting
echo -e "${YELLOW}🌐 Configuring static website hosting...${NC}"
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Disable block public access FIRST (this is the key fix!)
echo -e "${YELLOW}🔓 Disabling block public access...${NC}"
aws s3api delete-public-access-block --bucket $BUCKET_NAME

# Wait a moment for the setting to propagate
sleep 2

# Create and apply bucket policy for public read access
echo -e "${YELLOW}📋 Applying bucket policy...${NC}"
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json

# Upload files to S3
echo -e "${YELLOW}📤 Uploading files to S3...${NC}"
aws s3 sync $BUILD_DIR s3://$BUCKET_NAME --delete

# Get website URL
WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

# Clean up
rm -f bucket-policy.json

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=========================="
echo -e "${GREEN}✅ S3 Bucket: $BUCKET_NAME${NC}"
echo -e "${GREEN}✅ Website URL: $WEBSITE_URL${NC}"
echo -e "${GREEN}✅ Region: $REGION${NC}"

# Save deployment info
cat > aws-deployment.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "bucketName": "$BUCKET_NAME",
  "region": "$REGION",
  "websiteUrl": "$WEBSITE_URL",
  "awsAccount": "$AWS_ACCOUNT"
}
EOF

echo -e "${GREEN}✅ Deployment info saved to aws-deployment.json${NC}"
echo ""
echo -e "${BLUE}🌍 Your React app is now live at:${NC}"
echo -e "${BLUE}$WEBSITE_URL${NC}"

# Optional: Add CloudFront later
echo ""
echo -e "${YELLOW}💡 Next steps (optional):${NC}"
echo "- Add CloudFront distribution for HTTPS and global CDN"
echo "- Configure custom domain with Route 53"
echo "- Set up CI/CD pipeline for automatic deployments"
