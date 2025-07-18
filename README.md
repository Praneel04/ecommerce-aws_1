# 🚀 Medusa Serverless MVP

A complete serverless ecommerce platform built with AWS Lambda, Cognito, S3, and React.

## 🎯 Project Overview

This project transforms the Medusa.js ecommerce framework into a serverless architecture using AWS services. We've implemented a complete 4-step migration from traditional deployment to full AWS serverless infrastructure.

## ✅ Completed Steps

### Step 1: Core Migration ✅
- Stripped down Medusa to essential ecommerce functions
- Converted Express.js routes to Lambda-compatible handlers
- Modularized business logic for serverless deployment

### Step 2: AWS Lambda Functions ✅
- Created Lambda handlers for products, orders, customers
- Implemented API Gateway integration
- Set up proper error handling and responses

### Step 3: Static Frontend Deployment ✅
- React frontend deployed to S3 with CloudFront CDN
- Production-ready build pipeline
- **Live Site**: http://medusa-serverless-frontend-1752880615.s3-website-us-east-1.amazonaws.com

### Step 4: AWS Cognito Authentication ✅
- Complete user authentication system with JWT tokens
- Role-based access control (Buyer/Seller/Admin)
- Real-time user registration and login

## 🧪 Test the Live Demo

### Authentication Credentials
- **👤 Buyer**: `buyer@medusa.com` / `Password123!`
- **🏪 Seller**: `seller@medusa.com` / `Password123!`
- **👑 Admin**: `admin@medusa.com` / `Password123!`

### Features to Test
- ✅ User registration and login
- ✅ Role-based interface
- ✅ Product browsing
- ✅ Shopping cart functionality
- ✅ Secure session management

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React SPA     │    │   AWS Cognito    │    │  Lambda APIs    │
│   (S3/CloudFront)│───▶│  Authentication  │───▶│  (API Gateway)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                          │
                                                          ▼
                                               ┌─────────────────┐
                                               │   DynamoDB      │
                                               │   (Next Phase)  │
                                               └─────────────────┘
```

## 📁 Project Structure

```
medusa-serverless/
├── frontend/                 # React TypeScript app
│   ├── src/
│   │   ├── components/      # Authentication components
│   │   ├── hooks/           # useAuth context
│   │   └── aws-config.ts    # Cognito configuration
│   └── build/               # Production build
├── backend/                 # Lambda functions
│   ├── src/
│   │   ├── handlers/        # API route handlers
│   │   └── models/          # Data models
│   └── package.json
├── infrastructure/          # AWS CloudFormation
│   ├── cognito-auth.yaml    # User pools & identity
│   └── s3-cloudfront.yaml   # Frontend hosting
└── scripts/                 # Deployment automation
    ├── deploy-aws-simple.sh
    ├── deploy-cognito-simple.sh
    └── create-test-users.sh
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- AWS CLI configured
- AWS account with appropriate permissions

### 1. Clone and Install
```bash
git clone <repository-url>
cd medusa-serverless
cd frontend && npm install
cd ../backend && npm install
```

### 2. Deploy Infrastructure
```bash
# Deploy Cognito authentication
./scripts/deploy-cognito-simple.sh

# Deploy frontend to S3
./scripts/deploy-aws-simple.sh

# Create test users
./scripts/create-test-users.sh
```

### 3. Local Development
```bash
# Frontend development
cd frontend && npm start

# Backend testing
cd backend && npm test
```

## 🔐 AWS Services Used

- **AWS Cognito**: User authentication and authorization
- **AWS Lambda**: Serverless API functions
- **API Gateway**: REST API management
- **S3**: Static website hosting
- **CloudFront**: Global CDN
- **IAM**: Security and permissions

## 🔧 Configuration

### Environment Variables
- `REACT_APP_AWS_REGION`: AWS region (us-east-1)
- `REACT_APP_USER_POOL_ID`: Cognito User Pool ID
- `REACT_APP_USER_POOL_CLIENT_ID`: Cognito App Client ID
- `REACT_APP_IDENTITY_POOL_ID`: Cognito Identity Pool ID

### AWS Resources
- **User Pool**: `us-east-1_oEQt1dRJt`
- **Client ID**: `9rkbb6n8nsoabddr2cq14km6t`
- **S3 Bucket**: `medusa-serverless-frontend-1752880615`

## 🛣️ Roadmap

### Phase 2: Data Layer (Coming Next)
- [ ] DynamoDB integration
- [ ] Product catalog management
- [ ] Order processing workflow

### Phase 3: Advanced Features
- [ ] Seller dashboard
- [ ] Inventory management
- [ ] Payment processing
- [ ] Email notifications

### Phase 4: Production Ready
- [ ] Monitoring and logging
- [ ] Performance optimization
- [ ] Security hardening
- [ ] CI/CD pipeline

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on top of [Medusa.js](https://medusajs.com)
- Inspired by modern serverless architectures
- Community feedback and contributions

---

**🌟 Star this repo if you found it helpful!**

Made with ❤️ and ☁️ serverless technology
