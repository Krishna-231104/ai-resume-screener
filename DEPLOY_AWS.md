# AWS Deployment Guide

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Docker** installed locally
4. **RDS** instance (MongoDB Atlas or AWS DocumentDB)

## Step-by-Step Setup

### 1. Create RDS Database (MongoDB Atlas or DocumentDB)

**Option A: MongoDB Atlas (Recommended)**
```bash
# Go to https://www.mongodb.com/cloud/atlas
# Create free cluster
# Get connection string: mongodb+srv://user:pass@cluster.mongodb.net/ai-resume-screener
```

**Option B: AWS DocumentDB**
```bash
# Create DocumentDB cluster in AWS Console
# Note the endpoint URL
```

### 2. Set Up AWS Secrets Manager

```bash
# Store sensitive data in AWS Secrets Manager
aws secretsmanager create-secret --name ai-resume/jwt-secret --secret-string "your_jwt_secret"
aws secretsmanager create-secret --name ai-resume/groq-key --secret-string "your_groq_api_key"
aws secretsmanager create-secret --name ai-resume/email-user --secret-string "your_email"
aws secretsmanager create-secret --name ai-resume/email-pass --secret-string "your_password"
```

### 3. Create IAM Roles

**ECS Task Execution Role:**
```bash
aws iam create-role --role-name ecsTaskExecutionRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ecs-tasks.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

aws iam attach-role-policy --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

**ECS Task Role:**
```bash
aws iam create-role --role-name ecsTaskRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "ecs-tasks.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

# Attach policy for Secrets Manager access
aws iam put-role-policy --role-name ecsTaskRole --policy-name SecretsAccess \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": "arn:aws:secretsmanager:*:*:secret:ai-resume/*"
    }]
  }'
```

### 4. Create ECR Repositories

```bash
aws ecr create-repository --repository-name ai-resume-server
aws ecr create-repository --repository-name ai-resume-client
```

### 5. Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name ai-resume-cluster
```

### 6. Create CloudWatch Log Groups

```bash
aws logs create-log-group --log-group-name /ecs/ai-resume-server
aws logs create-log-group --log-group-name /ecs/ai-resume-client
```

### 7. Set Up GitHub Secrets

Go to GitHub Repo → Settings → Secrets and add:
```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_ACCOUNT_ID=your_account_id
```

### 8. Create VPC & ALB (Application Load Balancer)

```bash
# Create VPC with public/private subnets
# Create ALB with target groups for ports 5000 (server) and 5173 (client)
# Configure health checks and listener rules
```

### 9. Deploy using Script

```bash
# Make script executable
chmod +x aws/deploy.sh

# Run deployment
./aws/deploy.sh
```

Or use **GitHub Actions** - push to main branch and workflow runs automatically!

## Monitoring & Logs

```bash
# View server logs
aws logs tail /ecs/ai-resume-server --follow

# View client logs
aws logs tail /ecs/ai-resume-client --follow

# Check ECS service status
aws ecs describe-services --cluster ai-resume-cluster --services ai-resume-service

# View task details
aws ecs list-tasks --cluster ai-resume-cluster
aws ecs describe-tasks --cluster ai-resume-cluster --tasks <task-arn>
```

## Cost Optimization

1. **Fargate Spot** - Save up to 70% on compute
2. **RDS Multi-AZ** - Only for production
3. **CloudFront CDN** - Cache static assets
4. **S3 for file uploads** - Instead of local storage

## Scaling

```bash
# Auto-scaling configuration
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/ai-resume-cluster/ai-resume-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10
```

## Domain & HTTPS

1. Buy domain (Route 53)
2. Create ACM certificate for HTTPS
3. Point ALB to domain
4. Update environment variables with production URLs

## Troubleshooting

**Containers not starting:**
```bash
aws ecs describe-task-definition --task-definition ai-resume-screener
```

**Permission denied errors:**
- Check IAM roles have correct permissions

**Database connection errors:**
- Verify MongoDB connection string
- Check security groups allow traffic
- Test connection locally first

**Out of memory:**
- Increase task memory in ECS task definition
- Current: 1024 MB (change in ecs-task-definition.json)
