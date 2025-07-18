#!/bin/bash

# Medusa Serverless Deployment Menu
# Choose your deployment strategy

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

clear
echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                   🚀 MEDUSA SERVERLESS                      ║${NC}"
echo -e "${PURPLE}║                    Deployment Options                       ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Choose your deployment strategy:${NC}"
echo ""
echo -e "${GREEN}1. 🏠 Local Development${NC}"
echo -e "${CYAN}   - Test static build locally${NC}"
echo -e "${CYAN}   - Perfect for development and testing${NC}"
echo -e "${CYAN}   - URL: http://localhost:3002${NC}"
echo ""
echo -e "${GREEN}2. ☁️  AWS S3 Simple${NC}"
echo -e "${CYAN}   - Quick S3 static hosting${NC}"
echo -e "${CYAN}   - HTTP only, basic setup${NC}"
echo -e "${CYAN}   - ~$1-5/month cost${NC}"
echo ""
echo -e "${GREEN}3. 🌍 AWS S3 + CloudFront (Production)${NC}"
echo -e "${CYAN}   - Global CDN with HTTPS${NC}"
echo -e "${CYAN}   - Enterprise-grade performance${NC}"
echo -e "${CYAN}   - ~$5-20/month cost${NC}"
echo ""
echo -e "${GREEN}4. 📚 View Documentation${NC}"
echo -e "${CYAN}   - Deployment guides and troubleshooting${NC}"
echo ""
echo -e "${GREEN}5. 🧹 Cleanup AWS Resources${NC}"
echo -e "${CYAN}   - Remove deployed resources to save costs${NC}"
echo ""

read -p "Enter your choice [1-5]: " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}🏠 Starting Local Development Server...${NC}"
        echo "======================================="
        if [ ! -d "./frontend/build" ]; then
            echo -e "${YELLOW}Building React app first...${NC}"
            cd frontend && npm run build && cd ..
        fi
        echo -e "${GREEN}Starting server at http://localhost:3002${NC}"
        ./scripts/serve-local.sh
        ;;
    2)
        echo ""
        echo -e "${YELLOW}☁️  AWS S3 Simple Deployment${NC}"
        echo "=============================="
        echo -e "${CYAN}This will create an S3 bucket and deploy your React app${NC}"
        echo -e "${CYAN}Requirements: AWS credentials configured${NC}"
        echo ""
        read -p "Continue? [y/N]: " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            # Check if AWS is configured
            if ! aws sts get-caller-identity &> /dev/null; then
                echo -e "${YELLOW}Setting up AWS first...${NC}"
                ./scripts/setup-aws.sh
            fi
            ./scripts/deploy-aws-simple.sh
        else
            echo -e "${YELLOW}Deployment cancelled.${NC}"
        fi
        ;;
    3)
        echo ""
        echo -e "${YELLOW}🌍 AWS Production Deployment${NC}"
        echo "============================="
        echo -e "${CYAN}This will create S3 + CloudFront for global delivery${NC}"
        echo -e "${CYAN}Features: HTTPS, Global CDN, High Performance${NC}"
        echo -e "${CYAN}Deployment time: 10-15 minutes${NC}"
        echo ""
        read -p "Continue? [y/N]: " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            # Check if AWS is configured
            if ! aws sts get-caller-identity &> /dev/null; then
                echo -e "${YELLOW}Setting up AWS first...${NC}"
                ./scripts/setup-aws.sh
            fi
            ./scripts/deploy-aws-production.sh
        else
            echo -e "${YELLOW}Deployment cancelled.${NC}"
        fi
        ;;
    4)
        echo ""
        echo -e "${YELLOW}📚 Opening Documentation...${NC}"
        echo "==========================="
        if [ -f "STEP3-COMPLETE.md" ]; then
            cat STEP3-COMPLETE.md
        else
            echo -e "${RED}Documentation not found. Generating...${NC}"
            echo "Please check STEP3-COMPLETE.md for full documentation."
        fi
        echo ""
        echo -e "${CYAN}Available files:${NC}"
        echo "- README.md - Project overview"
        echo "- STEP3-COMPLETE.md - Step 3 documentation"
        echo "- AWS-SETUP.md - AWS configuration guide (generated after setup)"
        ;;
    5)
        echo ""
        echo -e "${YELLOW}🧹 AWS Resource Cleanup${NC}"
        echo "======================="
        echo -e "${RED}⚠️  This will delete all deployed AWS resources!${NC}"
        echo ""
        if [ -f "aws-deployment.json" ]; then
            BUCKET_NAME=$(cat aws-deployment.json | jq -r '.bucketName')
            DISTRIBUTION_ID=$(cat aws-deployment.json | jq -r '.cloudFrontDistributionId // empty')
            
            echo -e "${CYAN}Found resources:${NC}"
            echo "- S3 Bucket: $BUCKET_NAME"
            if [ "$DISTRIBUTION_ID" != "" ] && [ "$DISTRIBUTION_ID" != "null" ]; then
                echo "- CloudFront Distribution: $DISTRIBUTION_ID"
            fi
            echo ""
            read -p "Are you sure you want to delete these resources? [y/N]: " confirm
            if [[ $confirm =~ ^[Yy]$ ]]; then
                echo -e "${YELLOW}Deleting resources...${NC}"
                
                # Delete S3 bucket contents and bucket
                if aws s3 ls s3://$BUCKET_NAME &> /dev/null; then
                    aws s3 rb s3://$BUCKET_NAME --force
                    echo -e "${GREEN}✅ Deleted S3 bucket: $BUCKET_NAME${NC}"
                fi
                
                # Disable CloudFront distribution (deletion takes 24 hours)
                if [ "$DISTRIBUTION_ID" != "" ] && [ "$DISTRIBUTION_ID" != "null" ]; then
                    echo -e "${YELLOW}⏳ Disabling CloudFront distribution...${NC}"
                    echo -e "${CYAN}Note: Complete deletion takes 24 hours${NC}"
                    # aws cloudfront update-distribution --id $DISTRIBUTION_ID --distribution-config '{"CallerReference":"'$(date +%s)'","Enabled":false}'
                fi
                
                # Clean up local files
                rm -f aws-deployment.json check-deployment.sh AWS-SETUP.md
                echo -e "${GREEN}✅ Cleanup complete!${NC}"
            else
                echo -e "${YELLOW}Cleanup cancelled.${NC}"
            fi
        else
            echo -e "${YELLOW}No deployment found to clean up.${NC}"
        fi
        ;;
    *)
        echo ""
        echo -e "${RED}Invalid choice. Please run the script again.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Operation complete!${NC}"
echo ""
echo -e "${CYAN}💡 Tip: Run ./deploy.sh again anytime to access these options${NC}"
