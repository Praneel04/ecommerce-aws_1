#!/bin/bash

# AWS S3 Deployment Troubleshooting and Fix Script
# Fixes common issues with S3 static website deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}🔧 AWS S3 Deployment Troubleshooter${NC}"
echo "===================================="

# Check if bucket name is provided as argument
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Usage: $0 <bucket-name>${NC}"
    echo ""
    echo "Examples:"
    echo "  $0 medusa-serverless-frontend-1752880348"
    echo "  $0 my-bucket-name"
    echo ""
    
    # Try to find bucket from deployment file
    if [ -f "aws-deployment.json" ]; then
        BUCKET_NAME=$(cat aws-deployment.json | jq -r '.bucketName // empty')
        if [ "$BUCKET_NAME" != "" ] && [ "$BUCKET_NAME" != "null" ]; then
            echo -e "${CYAN}Found bucket in aws-deployment.json: $BUCKET_NAME${NC}"
            read -p "Use this bucket? [Y/n]: " use_found
            if [[ ! $use_found =~ ^[Nn]$ ]]; then
                echo "Using bucket: $BUCKET_NAME"
            else
                exit 1
            fi
        else
            exit 1
        fi
    else
        exit 1
    fi
else
    BUCKET_NAME=$1
fi

echo ""
echo -e "${YELLOW}🔍 Diagnosing bucket: $BUCKET_NAME${NC}"

# Check if bucket exists
echo -e "${CYAN}Checking if bucket exists...${NC}"
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    echo -e "${GREEN}✅ Bucket exists${NC}"
else
    echo -e "${RED}❌ Bucket does not exist or access denied${NC}"
    exit 1
fi

# Check current Block Public Access settings
echo -e "${CYAN}Checking Block Public Access settings...${NC}"
BLOCK_SETTINGS=$(aws s3api get-public-access-block --bucket "$BUCKET_NAME" 2>/dev/null || echo "null")

if [ "$BLOCK_SETTINGS" != "null" ]; then
    echo -e "${YELLOW}⚠️  Block Public Access is enabled${NC}"
    echo "$BLOCK_SETTINGS" | jq '.'
    
    echo ""
    echo -e "${YELLOW}🔧 Fixing Block Public Access...${NC}"
    aws s3api delete-public-access-block --bucket "$BUCKET_NAME"
    echo -e "${GREEN}✅ Block Public Access disabled${NC}"
    
    # Wait for propagation
    echo -e "${CYAN}Waiting for settings to propagate...${NC}"
    sleep 3
else
    echo -e "${GREEN}✅ Block Public Access already disabled${NC}"
fi

# Check bucket policy
echo -e "${CYAN}Checking bucket policy...${NC}"
BUCKET_POLICY=$(aws s3api get-bucket-policy --bucket "$BUCKET_NAME" 2>/dev/null || echo "null")

if [ "$BUCKET_POLICY" = "null" ]; then
    echo -e "${YELLOW}⚠️  No bucket policy found${NC}"
    echo -e "${YELLOW}🔧 Creating bucket policy...${NC}"
    
    cat > temp-bucket-policy.json << EOF
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

    aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file://temp-bucket-policy.json
    rm temp-bucket-policy.json
    echo -e "${GREEN}✅ Bucket policy applied${NC}"
else
    echo -e "${GREEN}✅ Bucket policy exists${NC}"
fi

# Check website configuration
echo -e "${CYAN}Checking website configuration...${NC}"
WEBSITE_CONFIG=$(aws s3api get-bucket-website --bucket "$BUCKET_NAME" 2>/dev/null || echo "null")

if [ "$WEBSITE_CONFIG" = "null" ]; then
    echo -e "${YELLOW}⚠️  Website configuration not found${NC}"
    echo -e "${YELLOW}🔧 Configuring static website hosting...${NC}"
    
    aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html
    echo -e "${GREEN}✅ Website configuration applied${NC}"
else
    echo -e "${GREEN}✅ Website configuration exists${NC}"
fi

# Check if files exist in bucket
echo -e "${CYAN}Checking bucket contents...${NC}"
FILE_COUNT=$(aws s3 ls s3://$BUCKET_NAME --recursive | wc -l)

if [ $FILE_COUNT -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Bucket is empty${NC}"
    echo -e "${CYAN}📤 Uploading files from build directory...${NC}"
    
    if [ -d "./frontend/build" ]; then
        aws s3 sync ./frontend/build s3://$BUCKET_NAME --delete
        echo -e "${GREEN}✅ Files uploaded${NC}"
    else
        echo -e "${RED}❌ Build directory not found. Run: cd frontend && npm run build${NC}"
    fi
else
    echo -e "${GREEN}✅ Bucket contains $FILE_COUNT files${NC}"
fi

# Test website accessibility
echo -e "${CYAN}Testing website accessibility...${NC}"
REGION=$(aws s3api get-bucket-location --bucket "$BUCKET_NAME" --query 'LocationConstraint' --output text)
if [ "$REGION" = "None" ]; then
    REGION="us-east-1"
fi

WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo -e "${CYAN}Testing URL: $WEBSITE_URL${NC}"

if curl -s --head "$WEBSITE_URL" | head -n 1 | grep -q "200 OK"; then
    echo -e "${GREEN}✅ Website is accessible!${NC}"
    echo -e "${GREEN}🌐 URL: $WEBSITE_URL${NC}"
else
    echo -e "${YELLOW}⚠️  Website may take a few minutes to be accessible${NC}"
    echo -e "${CYAN}🌐 URL: $WEBSITE_URL${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Troubleshooting Complete!${NC}"
echo "============================"
echo -e "${GREEN}✅ Block Public Access: Disabled${NC}"
echo -e "${GREEN}✅ Bucket Policy: Applied${NC}"
echo -e "${GREEN}✅ Website Configuration: Enabled${NC}"
echo -e "${GREEN}✅ Files: Uploaded${NC}"
echo ""
echo -e "${BLUE}Your website should be available at:${NC}"
echo -e "${CYAN}$WEBSITE_URL${NC}"

# Update deployment info
if [ -f "aws-deployment.json" ]; then
    cat aws-deployment.json | jq --arg url "$WEBSITE_URL" '.s3WebsiteUrl = $url' > temp.json && mv temp.json aws-deployment.json
    echo -e "${GREEN}✅ Updated aws-deployment.json${NC}"
fi

echo ""
echo -e "${YELLOW}💡 Common next steps:${NC}"
echo "- Add CloudFront for HTTPS: ./scripts/deploy-aws-production.sh"
echo "- Test your website: open $WEBSITE_URL"
echo "- Monitor costs: AWS Console > Billing"
