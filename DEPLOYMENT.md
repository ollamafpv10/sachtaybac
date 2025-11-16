# Sách Tây Bắc - Kubernetes Deployment

## Quick Start

### 1. Build Docker Image
```bash
# Build the Docker image
docker build -t sachtaybac:latest .

# Tag for registry (replace with your registry)
docker tag sachtaybac:latest your-registry/sachtaybac:latest

# Push to registry
docker push your-registry/sachtaybac:latest
```

### 2. Deploy to Kubernetes
```bash
# Apply all Kubernetes resources
kubectl apply -f k8s-deployment.yaml

# Apply ingress (optional, for external access)
kubectl apply -f k8s-ingress.yaml

# Check deployment status
kubectl get pods -n sachtaybac
kubectl get services -n sachtaybac
```

### 3. Access the Application
```bash
# Port forward for local testing
kubectl port-forward -n sachtaybac service/sachtaybac-service 8080:80

# Access at: http://localhost:8080
```

## Configuration

### Environment Variables
- `PORT`: Server port (default: ":3000")

### Storage
- Data is stored in `/app/data/data.json`
- Uses PersistentVolumeClaim for data persistence
- 1GB storage allocated by default

### Security
- Runs as non-root user (UID: 1000)
- Resource limits configured
- Health checks enabled

## Scaling
```bash
# Scale up replicas
kubectl scale deployment sachtaybac-app --replicas=5 -n sachtaybac

# Auto-scaling (HPA)
kubectl autoscale deployment sachtaybac-app --cpu-percent=70 --min=2 --max=10 -n sachtaybac
```

## Monitoring
```bash
# View logs
kubectl logs -f deployment/sachtaybac-app -n sachtaybac

# Get pod details
kubectl describe pod -l app=sachtaybac -n sachtaybac

# Check resource usage
kubectl top pods -n sachtaybac
```

## Troubleshooting
```bash
# Check pod status
kubectl get pods -n sachtaybac -o wide

# Debug pod issues
kubectl describe pod <pod-name> -n sachtaybac

# Execute into container
kubectl exec -it <pod-name> -n sachtaybac -- /bin/sh
```