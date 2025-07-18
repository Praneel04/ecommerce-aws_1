#!/bin/bash

# AWS Setup and Configuration Script
# Helps users configure AWS credentials and deploy to S3

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}🔧 AWS Setup for Medusa Serverless${NC}"
echo "====================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first:${NC}"
    echo "macOS: curl 'https://awscli.amazonaws.com/AWSCLIV2.pkg' -o 'AWSCLIV2.pkg' && sudo installer -pkg AWSCLIV2.pkg -target /"
    echo "Linux: curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip' && unzip awscliv2.zip && sudo ./aws/install"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI found: $(aws --version)${NC}"

# Check if credentials exist
if aws sts get-caller-identity &> /dev/null; then
    echo -e "${GREEN}✅ AWS credentials already configured${NC}"
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    AWS_USER=$(aws sts get-caller-identity --query Arn --output text | cut -d'/' -f2)
    echo -e "${CYAN}   Account: $AWS_ACCOUNT${NC}"
    echo -e "${CYAN}   User/Role: $AWS_USER${NC}"
    
    echo ""
    read -p "Do you want to reconfigure AWS credentials? [y/N]: " reconfigure
    if [[ ! $reconfigure =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Skipping AWS configuration...${NC}"
        echo ""
        echo -e "${GREEN}🚀 Ready to deploy! Run:${NC}"
        echo -e "${CYAN}./scripts/deploy-aws-simple.sh${NC}"
        exit 0
    fi
fi

echo ""
echo -e "${YELLOW}🔑 AWS Credentials Setup${NC}"
echo "========================"
echo ""
echo -e "${CYAN}You'll need AWS credentials with the following permissions:${NC}"
echo "- s3:CreateBucket"
echo "- s3:PutObject"
echo "- s3:PutObjectAcl"
echo "- s3:GetObject"
echo "- s3:PutBucketWebsite"
echo "- s3:PutBucketPolicy"
echo "- s3:DeletePublicAccessBlock"
echo ""
echo -e "${YELLOW}📝 How to get AWS credentials:${NC}"
echo "1. Go to AWS Console → IAM → Users"
echo "2. Create a new user or select existing user"
echo "3. Attach policy: 'AmazonS3FullAccess' (or create custom policy)"
echo "4. Create access key in Security credentials tab"
echo ""

read -p "Press Enter when you have your AWS Access Key ID and Secret..."

# Configure AWS
echo ""
echo -e "${YELLOW}🔧 Configuring AWS CLI...${NC}"
aws configure

# Verify configuration
echo ""
echo -e "${YELLOW}🔍 Verifying AWS configuration...${NC}"
if aws sts get-caller-identity &> /dev/null; then
    echo -e "${GREEN}✅ AWS credentials configured successfully!${NC}"
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    AWS_USER=$(aws sts get-caller-identity --query Arn --output text | cut -d'/' -f2)
    AWS_REGION=$(aws configure get region)
    echo -e "${CYAN}   Account: $AWS_ACCOUNT${NC}"
    echo -e "${CYAN}   User/Role: $AWS_USER${NC}"
    echo -e "${CYAN}   Region: $AWS_REGION${NC}"
else
    echo -e "${RED}❌ AWS configuration failed. Please check your credentials.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=================="
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo -e "${CYAN}1. Deploy to AWS S3: ./scripts/deploy-aws-simple.sh${NC}"
echo -e "${CYAN}2. View your live site at the provided URL${NC}"
echo -e "${CYAN}3. Optionally add CloudFront for HTTPS and global CDN${NC}"

# Create a quick reference file
cat > AWS-SETUP.md << EOF
# AWS Deployment Quick Reference

## Your Configuration
- AWS Account: $AWS_ACCOUNT
- User/Role: $AWS_USER  
- Region: $AWS_REGION
- Setup Date: $(date)

## Deploy Commands
\`\`\`bash
# Deploy React app to S3
./scripts/deploy-aws-simple.sh

# Deploy with CloudFront (advanced)
./scripts/deploy-frontend.sh
\`\`\`

## Useful AWS Commands
\`\`\`bash
# List your S3 buckets
aws s3 ls

# Check AWS identity
aws sts get-caller-identity

# List deployed sites
cat aws-deployment.json
\`\`\`

## Cost Considerations
- S3 storage: ~$0.023/GB/month
- S3 requests: ~$0.0004/1000 requests
- Data transfer: Free for first 100GB/month
- CloudFront: ~$0.085/GB (first 10TB/month)

## Cleanup
\`\`\`bash
# Delete S3 bucket and contents
aws s3 rb s3://your-bucket-name --force
\`\`\`
EOF

echo -e "${GREEN}✅ Reference guide saved to AWS-SETUP.md${NC}"
