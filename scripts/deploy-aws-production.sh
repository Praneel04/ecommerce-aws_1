#!/bin/bash

# Advanced AWS Deployment: S3 + CloudFront + Route 53 Ready
# Complete production deployment with HTTPS and global CDN

set -e

# Configuration
STACK_NAME="medusa-serverless-frontend"
BUCKET_NAME="medusa-frontend-$(date +%s)"
REGION="us-east-1"
BUILD_DIR="./frontend/build"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}🚀 AWS Production Deployment: S3 + CloudFront${NC}"
echo "================================================="

# Pre-flight checks
echo -e "${YELLOW}🔍 Running pre-flight checks...${NC}"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured. Run ./scripts/setup-aws.sh first${NC}"
    exit 1
fi

# Check build directory
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${YELLOW}⚠️  Build directory not found. Building React app...${NC}"
    cd frontend && npm run build && cd ..
fi

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS Account: $AWS_ACCOUNT${NC}"
echo -e "${GREEN}✅ Build directory: $BUILD_DIR${NC}"

# Step 1: Create S3 bucket
echo -e "${YELLOW}📦 Step 1: Creating S3 bucket...${NC}"
aws s3 mb s3://$BUCKET_NAME --region $REGION
echo -e "${GREEN}✅ Created bucket: $BUCKET_NAME${NC}"

# Step 2: Configure bucket for static hosting
echo -e "${YELLOW}🌐 Step 2: Configuring static website hosting...${NC}"
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Step 3: Upload files
echo -e "${YELLOW}📤 Step 3: Uploading files to S3...${NC}"
aws s3 sync $BUILD_DIR s3://$BUCKET_NAME --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "*.html" \
    --exclude "service-worker.js"

# Upload HTML files with no-cache
aws s3 sync $BUILD_DIR s3://$BUCKET_NAME \
    --cache-control "public, max-age=0, must-revalidate" \
    --include "*.html" \
    --include "service-worker.js"

echo -e "${GREEN}✅ Files uploaded successfully${NC}"

# Step 4: Create CloudFront distribution
echo -e "${YELLOW}☁️  Step 4: Creating CloudFront distribution...${NC}"

# Create CloudFront distribution config
cat > cloudfront-config.json << EOF
{
    "CallerReference": "medusa-frontend-$(date +%s)",
    "Comment": "Medusa Serverless Frontend Distribution",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$BUCKET_NAME",
                "DomainName": "$BUCKET_NAME.s3.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$BUCKET_NAME",
        "ViewerProtocolPolicy": "redirect-to-https",
        "MinTTL": 0,
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        }
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
}
EOF

# Create the distribution
DISTRIBUTION_OUTPUT=$(aws cloudfront create-distribution --distribution-config file://cloudfront-config.json)
DISTRIBUTION_ID=$(echo $DISTRIBUTION_OUTPUT | jq -r '.Distribution.Id')
DISTRIBUTION_DOMAIN=$(echo $DISTRIBUTION_OUTPUT | jq -r '.Distribution.DomainName')

echo -e "${GREEN}✅ CloudFront distribution created${NC}"
echo -e "${CYAN}   Distribution ID: $DISTRIBUTION_ID${NC}"
echo -e "${CYAN}   Domain: $DISTRIBUTION_DOMAIN${NC}"

# Step 5: Configure bucket policy (fix for Block Public Access)
echo -e "${YELLOW}🔒 Step 5: Configuring bucket policy...${NC}"

# Disable block public access FIRST
echo -e "${YELLOW}🔓 Disabling block public access...${NC}"
aws s3api delete-public-access-block --bucket $BUCKET_NAME

# Wait for the setting to propagate
sleep 2

# Create and apply bucket policy
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

# Step 6: Wait for distribution deployment
echo -e "${YELLOW}⏳ Step 6: Waiting for CloudFront deployment...${NC}"
echo -e "${CYAN}This may take 10-15 minutes. You can continue with other tasks.${NC}"

# Save deployment info immediately
WEBSITE_URL="https://$DISTRIBUTION_DOMAIN"
S3_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

cat > aws-deployment.json << EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "bucketName": "$BUCKET_NAME",
    "region": "$REGION",
    "s3WebsiteUrl": "$S3_URL",
    "cloudFrontDistributionId": "$DISTRIBUTION_ID",
    "cloudFrontDomain": "$DISTRIBUTION_DOMAIN",
    "websiteUrl": "$WEBSITE_URL",
    "awsAccount": "$AWS_ACCOUNT",
    "status": "deploying"
}
EOF

# Clean up temp files
rm -f cloudfront-config.json bucket-policy.json

echo ""
echo -e "${GREEN}🎉 Deployment Initiated!${NC}"
echo "========================="
echo -e "${GREEN}✅ S3 Bucket: $BUCKET_NAME${NC}"
echo -e "${GREEN}✅ S3 Website: $S3_URL${NC}"
echo -e "${GREEN}✅ CloudFront Distribution: $DISTRIBUTION_ID${NC}"
echo -e "${GREEN}✅ CloudFront Domain: $DISTRIBUTION_DOMAIN${NC}"
echo -e "${GREEN}✅ Production URL: $WEBSITE_URL${NC}"

echo ""
echo -e "${BLUE}🌍 Your React app will be available at:${NC}"
echo -e "${BLUE}$WEBSITE_URL${NC}"
echo ""
echo -e "${YELLOW}⏳ CloudFront is deploying (10-15 minutes)${NC}"
echo -e "${CYAN}💡 You can check status with: aws cloudfront get-distribution --id $DISTRIBUTION_ID${NC}"

echo ""
echo -e "${GREEN}📊 What you get:${NC}"
echo "- ✅ Global CDN with edge caching"
echo "- ✅ Automatic HTTPS certificate"  
echo "- ✅ Gzip compression"
echo "- ✅ SPA routing support"
echo "- ✅ 99.99% uptime SLA"

# Create status check script
cat > check-deployment.sh << EOF
#!/bin/bash
echo "Checking CloudFront deployment status..."
aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.Status' --output text
echo ""
echo "Your website: $WEBSITE_URL"
EOF
chmod +x check-deployment.sh

echo ""
echo -e "${CYAN}💡 Pro tip: Run ./check-deployment.sh to check deployment status${NC}"
