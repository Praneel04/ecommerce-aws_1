# AWS Deployment Quick Reference

## Your Configuration
- AWS Account: 612031147518
- User/Role: praneel  
- Region: us-east-1
- Setup Date: Fri Jul 18 16:12:28 PDT 2025

## Deploy Commands
```bash
# Deploy React app to S3
./scripts/deploy-aws-simple.sh

# Deploy with CloudFront (advanced)
./scripts/deploy-frontend.sh
```

## Useful AWS Commands
```bash
# List your S3 buckets
aws s3 ls

# Check AWS identity
aws sts get-caller-identity

# List deployed sites
cat aws-deployment.json
```

## Cost Considerations
- S3 storage: ~./scripts/setup-aws.sh.023/GB/month
- S3 requests: ~./scripts/setup-aws.sh.0004/1000 requests
- Data transfer: Free for first 100GB/month
- CloudFront: ~./scripts/setup-aws.sh.085/GB (first 10TB/month)

## Cleanup
```bash
# Delete S3 bucket and contents
aws s3 rb s3://your-bucket-name --force
```
