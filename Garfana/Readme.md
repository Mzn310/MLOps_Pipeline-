Step 1 — Install Docker on EC2
SSH into your EC2 instance and run:

# Optional: update & upgrade

sudo apt-get update -y
sudo apt-get upgrade

# Required: install Docker

curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add ubuntu user to docker group (no sudo needed for docker commands)

sudo usermod -aG docker ubuntu
newgrp docker

2. Then go on google and search run Grafana Docker image
   and then you find
   docker run -d -p 3000:3000 --name=grafana grafana/grafana-enterprise
   and run it on ec2 server

3. and then add tcp port 3000

4. and then go to ip and port 3000 you find login of grafana

5. first of all login with admin username and admin password

6. choose add your first data source

7. search prometheus docker install you find
   docker run -d -p 9090:9090 --name prometheus prom/prometheus and run it on ec2 server

8. and then add tcp port 9090

9. and go to http://13.60.53.125:9090/metrics : you found informations like the CPU uses, RAM uses

10. and then return to step 6 and then add url of http://13.60.53.125:9090 and save and then go to dashboard

11. and then choose metrics like gcr.gc.duration and run

📊 ML Model Monitoring with Prometheus + Grafana (on AWS EC2)

This project demonstrates how to monitor a Machine Learning model (or API) using Prometheus and Grafana deployed on an AWS EC2 instance using Docker.

🧠 Architecture
ML Model / API (Flask or FastAPI)
↓ /metrics endpoint
Prometheus (metrics collector)
↓
Grafana (visualization dashboards)

Optional:

EC2 system metrics → Node Exporter → Prometheus → Grafana
🚀 Step 1 — Launch EC2 & Install Docker

SSH into your EC2 instance:

sudo apt-get update -y
sudo apt-get upgrade -y

Install Docker:

curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

Enable Docker without sudo:

sudo usermod -aG docker ubuntu
newgrp docker
📦 Step 2 — Run Prometheus (Monitoring Engine)

Create configuration file:

nano prometheus.yml

Paste:

global:
scrape_interval: 5s

scrape_configs:

- job_name: "prometheus"
  static_configs:
  - targets: ["localhost:9090"]

Run Prometheus:

docker run -d \
 -p 9090:9090 \
 -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
 --name prometheus \
 prom/prometheus
📊 Step 3 — Run Grafana (Visualization)
docker run -d -p 3000:3000 --name grafana grafana/grafana

Access:

http://<EC2_PUBLIC_IP>:3000

Login:

Username: admin
Password: admin
🔌 Step 4 — Connect Grafana to Prometheus

In Grafana:

Go to Settings → Data Sources
Click Add data source
Select Prometheus
URL:
http://localhost:9090
Click Save & Test
🤖 Step 5 — Add ML Model Metrics (VERY IMPORTANT)

Install Prometheus client in your ML app:

pip install prometheus_client
Example Flask ML API with metrics
from flask import Flask
from prometheus_client import Counter, Histogram, generate_latest

app = Flask(**name**)

REQUEST_COUNT = Counter("model_requests_total", "Total requests")
LATENCY = Histogram("model_latency_seconds", "Request latency")

@app.route("/predict")
@LATENCY.time()
def predict():
REQUEST_COUNT.inc()
return {"prediction": "ok"}

@app.route("/metrics")
def metrics():
return generate_latest()
📡 Step 6 — Tell Prometheus to scrape your model

Update prometheus.yml:

scrape_configs:

- job_name: "prometheus"
  static_configs:
  - targets: ["localhost:9090"]

- job_name: "ml_model"
  static_configs:
  - targets: ["<EC2_PUBLIC_IP>:5000"]

Restart Prometheus:

docker restart prometheus
📊 Step 7 — Create Grafana Dashboard

In Grafana, use these queries:

Request count
model_requests_total
Latency
model_latency_seconds
🖥️ Optional Step — EC2 System Metrics

Run Node Exporter:

docker run -d -p 9100:9100 --name node-exporter prom/node-exporter

Add to Prometheus:

- job_name: "node"
  static_configs: - targets: ["localhost:9100"]
  🔐 AWS Security Groups (IMPORTANT)

Open these ports:

Service Port
Grafana 3000
Prometheus 9090
ML API 5000
Node Exporter 9100
🎯 Final Result

You now have:

📊 Grafana dashboards
📡 Prometheus metrics collector
🤖 ML model monitoring
☁️ Running on AWS EC2 with Docker
🚀 Next Improvements (Recommended)
Add CI/CD (Jenkins / GitHub Actions)
Add model drift detection
Add logging (ELK stack)
Add alerts (Grafana Alert Manager)
Deploy with Docker Compose
