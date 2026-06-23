#!/bin/bash

# AWS Deployment Script
# Prerequisites: AWS CLI, Docker, jq installed

set -e

# Configuration
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"  # Change to your region
ECR_REGISTRY="${AWS_ACCOUNT}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_NAME_SERVER="ai-resume-server"
IMAGE_NAME_CLIENT="ai-resume-client"
IMAGE_TAG="latest"

echo "🚀 Starting AWS Deployment..."
echo "Account: $AWS_ACCOUNT"
echo "Region: $AWS_REGION"

# Step 1: Create ECR repositories (if not exist)
echo "\n📦 Setting up ECR repositories..."
for repo in $IMAGE_NAME_SERVER $IMAGE_NAME_CLIENT; do
  if ! aws ecr describe-repositories --repository-names $repo --region $AWS_REGION 2>/dev/null; then
    aws ecr create-repository --repository-name $repo --region $AWS_REGION
    echo "✅ Created ECR repo: $repo"
  fi
done

# Step 2: Login to ECR
echo "\n🔐 Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Step 3: Build & push server
echo "\n🔨 Building and pushing server image..."
docker build -t ${ECR_REGISTRY}/${IMAGE_NAME_SERVER}:${IMAGE_TAG} ./server
docker push ${ECR_REGISTRY}/${IMAGE_NAME_SERVER}:${IMAGE_TAG}
echo "✅ Server image pushed"

# Step 4: Build & push client
echo "\n🔨 Building and pushing client image..."
docker build -t ${ECR_REGISTRY}/${IMAGE_NAME_CLIENT}:${IMAGE_TAG} ./client
docker push ${ECR_REGISTRY}/${IMAGE_NAME_CLIENT}:${IMAGE_TAG}
echo "✅ Client image pushed"

# Step 5: Create/Update ECS task definition
echo "\n⚙️  Updating ECS task definition..."
sed -e "s|{AWS_ACCOUNT}|${AWS_ACCOUNT}|g" \
    -e "s|{REGION}|${AWS_REGION}|g" \
    aws/ecs-task-definition.json > /tmp/task-definition.json

aws ecs register-task-definition --cli-input-json file:///tmp/task-definition.json --region $AWS_REGION > /dev/null
echo "✅ Task definition registered"

# Step 6: Update ECS service
echo "\n🔄 Updating ECS service..."
aws ecs update-service \
  --cluster ai-resume-cluster \
  --service ai-resume-service \
  --force-new-deployment \
  --region $AWS_REGION > /dev/null
echo "✅ ECS service updated"

echo "\n✨ Deployment complete!"
echo "View logs: aws logs tail /ecs/ai-resume-server --follow"
