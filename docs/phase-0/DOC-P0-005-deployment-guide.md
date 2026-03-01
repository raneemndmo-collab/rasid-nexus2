# DOC-P0-005: Deployment Guide — Phase 0

## Prerequisites

- Docker 24+ and Docker Compose v2
- Node.js 22 LTS
- pnpm 10+
- kubectl configured for target cluster
- PostgreSQL 16 client tools

## Step 1: Clone and Install

```bash
git clone https://github.com/raneemndmo-collab/rasid-nexus2.git
cd rasid-nexus2
git checkout release/phase-0
pnpm install
```

## Step 2: Start Infrastructure

```bash
cd infrastructure/docker
docker compose up -d
```

This starts:
- PostgreSQL 16 (port 5432) with 10 databases
- Redis 7 (port 6379)
- NATS JetStream 2.10 (port 4222)
- Prometheus (port 9090)
- Grafana (port 3001)

## Step 3: Verify Infrastructure

```bash
# PostgreSQL
psql -h localhost -U rasid_admin -c "SELECT datname FROM pg_database WHERE datname LIKE '%_db'"

# Redis
redis-cli -a redis_pass ping

# NATS
curl http://localhost:8222/healthz
```

## Step 4: Configure Environment

```bash
cp .env.example .env
# Edit .env with production values
```

## Step 5: Run Application

```bash
# Development
pnpm run start:dev

# Production
pnpm run build
pnpm run start:prod
```

## Step 6: Verify Application

```bash
# Health check
curl http://localhost:3000/health

# Readiness check
curl http://localhost:3000/health/ready

# Swagger docs
open http://localhost:3000/api/docs
```

## Step 7: Kubernetes Deployment

```bash
# Create namespace
kubectl apply -f infrastructure/kubernetes/base/namespace.yaml

# Build and push image
docker build -t rasid-platform:phase-0 .

# Deploy
kubectl apply -f infrastructure/kubernetes/base/deployment-template.yaml
```

## Step 8: Post-Deployment Verification

```bash
# Check pods
kubectl get pods -n rasid-platform

# Check services
kubectl get svc -n rasid-platform

# Port forward for testing
kubectl port-forward svc/rasid-api 3000:3000 -n rasid-platform
```

## Rollback Procedure

```bash
# Kubernetes rollback
kubectl rollout undo deployment/rasid-api -n rasid-platform

# Docker rollback
docker compose down
docker compose up -d --force-recreate
```
