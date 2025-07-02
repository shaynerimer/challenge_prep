# Cluster Setup

These instructions guide you through setting up a local Kubernetes cluster with Dapr, distributed tracing (Zipkin), and logging (ELK Stack) for development and testing.

## Table of Contents

- [Step 1: Create Kind Cluster](#step-1-create-kind-cluster)
- [Step 2: Initialize Dapr](#step-2-initialize-dapr)
- [Step 3: Configure Distributed Tracing with Zipkin](#step-3-configure-distributed-tracing-with-zipkin)
- [Step 4: Configure Logging with ELK Stack](#step-4-configure-logging-with-elk-stack)
    - [4.1 Create Monitoring Namespace](#41-create-monitoring-namespace)
    - [4.2 Add Elastic Helm Repository](#42-add-elastic-helm-repository)
    - [4.3 Install Elasticsearch](#43-install-elasticsearch)
    - [4.4 Install Kibana](#44-install-kibana)
    - [4.5 Deploy Fluentd Configuration](#45-deploy-fluentd-configuration)
- [Step 5: Port Forwarding for Localhost Access](#step-5-port-forwarding-for-localhost-access)
- [Access URLs](#access-urls)
- [Cleanup](#cleanup)



## Step 1: Create Kind Cluster

Create a local Kubernetes cluster using kind:

```bash
kind create cluster --config ./deploy/kind-cluster-config.yaml
```

## Step 2: Initialize Dapr

Initialize Dapr on your Kubernetes cluster:

```bash
dapr init -k --log-as-json
```

**Verify dapr-system Pods are Running:**
```bash
# Wait for Dapr components to be ready (2-3 minutes)
kubectl get pods -n dapr-system

# Verify Dapr is ready
dapr status -k
```

Wait until all Dapr pods are in `Running` state and `dapr status -k` shows all components as `True`.

## Step 3: Configure Distributed Tracing with Zipkin

Deploy Zipkin for distributed tracing:

```bash
# Create Zipkin deployment
kubectl create deployment zipkin --image openzipkin/zipkin

# Expose Zipkin service
kubectl expose deployment zipkin --type ClusterIP --port 9411

# Apply Dapr tracing configuration
kubectl apply -f ./deploy/tracing.yaml
```

**Verify Zipkin Pod is Running:**
```bash
# Wait for Zipkin to be ready (1-2 minutes)
kubectl get pods -l app=zipkin
```

Wait until the Zipkin pod shows `Running` status and `READY 1/1`.

## Step 4: Configure Logging with ELK Stack

### 4.1 Create Monitoring Namespace

```bash
kubectl create namespace dapr-monitoring
```

### 4.2 Add Elastic Helm Repository

```bash
helm repo add elastic https://helm.elastic.co
helm repo update
```

### 4.3 Install Elasticsearch

```bash
helm install elasticsearch elastic/elasticsearch --version 7.17.3 -n dapr-monitoring --set persistence.enabled=false,replicas=1
```

### 4.4 Install Kibana

```bash
helm install kibana elastic/kibana --version 7.17.3 -n dapr-monitoring
```

### 4.5 Deploy Fluentd Configuration

```bash
# Apply Fluentd configuration
kubectl apply -f ./deploy/fluentd-config-map.yaml
kubectl apply -f ./deploy/fluentd-dapr-with-rbac.yaml
```

**Verify Monitoring Stack is Running:**
```bash
# Wait for Elasticsearch and Kibana to both be ready (3-5 minutes)
kubectl get pods -n dapr-monitoring 
```

Wait until you see logs indicating Elasticsearch and Kibana have started successfully and the pods are `Running`.

## Step 5: Port Forwarding for Localhost Access

### Zipkin Access: 
Suppress output by sending to `/dev/null` and background the job with `&`
```bash
# Zipkin
kubectl port-forward svc/zipkin 9411:9411 > /dev/null 2>&1 &

# Kibana
kubectl port-forward svc/kibana-kibana 5601 -n dapr-monitoring > /dev/null 2>&1 &
```

Verify background jobs are running using  
```bash
jobs
```

Kill these jobs at any time to terminate port forwarding.  
_Note: Although Zipkin and Kibana are still running, you will not be able to access the web interfaces without port forwarding_
```bash
kill %<Job-Id>
```

## Access URLs

Once setup is complete, you can access:

- **Zipkin UI**: http://localhost:9411
- **Kibana UI**: http://localhost:5601

And you can deploy dapr enabled applications using:
```bash
kubectl apply -f ./deploy/<app-config>.yaml
```


## Cleanup

To clean up the entire setup:
```bash
kind delete cluster
```

This will remove the entire kind cluster and all deployed components.