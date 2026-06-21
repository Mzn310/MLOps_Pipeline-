# Kubernetes Deployment Guide (GKE / EKS / AKS)

This guide explains a full end-to-end workflow to:

- Build a Dockerized application 🐳
- Push it to a container registry ☁️
- Deploy it on Kubernetes ⚙️
- Expose it to the internet 🌍

Works with:

- Google Kubernetes Engine (GKE)
- Amazon Elastic Kubernetes Service (EKS)
- Azure Kubernetes Service (AKS)

---

# 1. Prerequisites

Install the following tools:

- Docker 🐳
- kubectl ⚙️
- Cloud CLI:
  - gcloud (Google Cloud)
  - aws + eksctl (AWS)
  - az (Azure)

---

# 2. Build Docker Image

```bash
# Build your application image
docker build -t my-app:v1 .

# Verify images
docker images
```

☁️ 3. Push Image to Registry
🔵 Google Cloud (GCR / Artifact Registry)
docker tag my-app:v1 gcr.io/PROJECT_ID/my-app:v1
docker push gcr.io/PROJECT_ID/my-app:v1
🟠 AWS (ECR)
docker push <account>.dkr.ecr.region.amazonaws.com/my-app:v1
🔷 Azure (ACR)
docker push myregistry.azurecr.io/my-app:v1

📝 What happens:
👉 Kubernetes will pull this image to run your app.

🌐 4. Create Kubernetes Cluster
🔵 GKE (Google Cloud)
gcloud container clusters create my-cluster
🟠 EKS (AWS)
eksctl create cluster --name my-cluster
🔷 AKS (Azure)
az aks create --name my-cluster

📝 What happens:
👉 A managed Kubernetes cluster is created in the cloud.

.

🔗 5. Connect kubectl to Cluster
GKE
gcloud container clusters get-credentials my-cluster
EKS
aws eks update-kubeconfig --name my-cluster
AKS
az aks get-credentials --name my-cluster

📝 What happens:
👉 Your terminal is now connected to the cloud cluster.

📄 6. Kubernetes Deployment File
deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
name: my-app
spec:
replicas: 3
selector:
matchLabels:
app: my-app
template:
metadata:
labels:
app: my-app
spec:
containers: - name: my-app
image: my-image:v1
ports: - containerPort: 8080

📝 What happens:
👉 Defines how many copies (Pods) of your app should run.

🚀 7. Deploy Application
kubectl apply -f deployment.yaml
kubectl get pods

📝 What happens:
👉 Kubernetes starts your application containers.

🌍 8. Expose Application (Public Access)
kubectl expose deployment my-app \
 --type=LoadBalancer \
 --port=80 \
 --target-port=8080

kubectl get services

📝 What happens:
👉 Your app gets a public IP address.

📊 9. Debugging Commands
kubectl get pods
kubectl logs <pod-name>
kubectl describe pod <pod-name>

📝 What happens:
👉 Used to monitor and debug your application.

🔁 FULL FLOW
Code
↓
Dockerfile
↓
Docker Image
↓
Container Registry
↓
Kubernetes Cluster (GKE / EKS / AKS)
↓
Pods Running
↓
LoadBalancer (Public Access)
🧠 KEY TAKEAWAYS







git clone https://github.com/pycaret/pycaret-deployment-google.git

export PROJECT_ID=focal-baton-276315

docker build -t gcr.io/${PROJECT_ID}/insurance-app:v1 .

docker images

gcloud auth configure-docker gcr.io

docker push gcr.io/${PROJECT_ID}/insurance-app:v1

gcloud config set compute/zone us-central1

gcloud container clusters create insurance-cluster --num-nodes=1

kubectl create deployment insurance-app --image=gcr.io/${PROJECT_ID}/insurance-app:v1 

kubectl expose deployment insurance-app --type=LoadBalancer --port 80 --target-port 8080
✔ Kubernetes runs Docker images (not Dockerfiles)
✔ YAML defines infrastructure (Pods, Services, Deployments)
✔ Cloud providers manage Kubernetes control plane
✔ kubectl is the main control tool
