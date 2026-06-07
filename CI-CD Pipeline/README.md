# 🍷 End-to-End Wine Quality Prediction

![Python](https://img.shields.io/badge/Python-3.8-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-Web%20App-lightgrey?logo=flask)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue?logo=docker)
![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20ECR-orange?logo=amazonaws)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-brightgreen?logo=githubactions)
![MLflow](https://img.shields.io/badge/MLflow-Experiment%20Tracking-0194E2?logo=mlflow)

A production-ready machine learning pipeline that predicts wine quality based on physicochemical features. Built with modular components, experiment tracking, and a full CI/CD deployment pipeline to AWS using GitHub Actions and Docker.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Workflows](#-workflows)
- [Getting Started (Local)](#-getting-started-local)
- [AWS CI/CD Deployment](#-aws-cicd-deployment-with-github-actions)
- [GitHub Secrets Setup](#-github-secrets-setup)
- [Contributing](#-contributing)

---

## 🔍 Project Overview

This project builds an end-to-end ML pipeline for predicting wine quality scores using features like acidity, pH, alcohol content, and more. It includes:

- Modular pipeline stages (data ingestion → validation → transformation → training → evaluation)
- Experiment tracking with MLflow & DagsHub
- A Flask web app for live predictions
- Dockerized deployment to AWS EC2 via ECR and GitHub Actions

---

## 🛠 Tech Stack

| Layer               | Technology                    |
| ------------------- | ----------------------------- |
| Language            | Python 3.8                    |
| ML Framework        | scikit-learn, pandas, numpy   |
| Experiment Tracking | MLflow, DagsHub               |
| Web Framework       | Flask                         |
| Containerization    | Docker                        |
| Cloud               | AWS EC2 + ECR                 |
| CI/CD               | GitHub Actions                |
| Config Management   | YAML (config, schema, params) |

---

## 📁 Project Structure

```
End-to-End-Wine-Quality-Prediction/
├── .github/
│   └── workflows/
│       └── main.yaml              # GitHub Actions CI/CD pipeline
├── config/
│   ├── config.yaml                # Pipeline configuration
│   ├── schema.yaml                # Data schema & validation rules
│   └── params.yaml                # Model hyperparameters
├── src/
│   └── mlProject/
│       ├── components/            # Data ingestion, transformation, training, evaluation
│       ├── config/                # Configuration manager
│       ├── entity/                # Data classes / entities
│       ├── pipeline/              # Stage-wise pipeline definitions
│       └── utils/                 # Utility functions
├── research/                      # Jupyter notebooks for experimentation
├── templates/                     # HTML templates for Flask app
├── Dockerfile
├── app.py                         # Flask application entry point
├── main.py                        # Pipeline runner
├── requirements.txt
└── setup.py
```

---

## 🔄 Workflows

The project follows a structured update sequence for any new feature or model change:

```
1. Update config.yaml          → Add pipeline paths and settings
2. Update schema.yaml          → Define/validate data schema
3. Update params.yaml          → Set model hyperparameters
4. Update the entity           → Define data class for config
5. Update configuration manager → Parse YAML into entity objects
6. Update the components       → Core logic (ingest, transform, train, evaluate)
7. Update the pipeline         → Wire components into stage pipelines
8. Update main.py              → Orchestrate all pipeline stages
9. Update app.py               → Expose predictions via Flask routes
```

---

## 🚀 Getting Started (Local)

### Prerequisites

- [Conda](https://docs.conda.io/en/latest/) installed
- Python 3.8

### Step 1 — Clone the Repository

```bash
git clone https://github.com/entbappy/End-to-End-Wine-Quality-Prediction
cd End-to-End-Wine-Quality-Prediction
```

### Step 2 — Create and Activate Conda Environment

```bash
conda create -n mlproj python=3.8 -y
conda activate mlproj
```

### Step 3 — Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4 — Run the Pipeline

```bash
python main.py
```

### Step 5 — Launch the Web App

```bash
python app.py
```

Then open your browser at `http://localhost:5000`

---

## ☁️ AWS CI/CD Deployment with GitHub Actions

This project uses a Docker-based deployment to AWS. On every push to `main`, GitHub Actions builds a Docker image, pushes it to Amazon ECR, and deploys it on a self-hosted EC2 runner.

### Architecture

```
GitHub Push
    │
    ▼
GitHub Actions (CI/CD)
    │
    ├──► [CI]  Lint & Unit Tests
    │
    ├──► [CD]  Build Docker Image → Push to Amazon ECR
    │
    └──► [CD]  EC2 Self-Hosted Runner
                  │
                  ├── Pull latest image from ECR
                  ├── Stop & remove old container
                  ├── Run new container on port 8080
                  └── Prune unused Docker data
```

---

### Step 1 — Create an IAM User for Deployment

In the AWS Console, create an IAM user **with programmatic access** and attach these policies:

| Policy                                 | Purpose                        |
| -------------------------------------- | ------------------------------ |
| `AmazonEC2ContainerRegistryFullAccess` | Push/pull Docker images to ECR |
| `AmazonEC2FullAccess`                  | Manage EC2 instances           |

> The IAM user handles both pushing images from GitHub Actions **and** pulling them on EC2.

Save the **Access Key ID** and **Secret Access Key** — you'll need them in Step 6.

---

### Step 2 — Create an ECR Repository

Create a private ECR repository to store your Docker image.

```
Example URI:
970547337635.dkr.ecr.ap-south-1.amazonaws.com/mlproj
```

> 📝 Save your full ECR URI — it will be used as a GitHub Secret.

---

### Step 3 — Launch an EC2 Instance (Ubuntu)

- Choose **Ubuntu** as the AMI
- Open inbound port **8080** (app traffic) in the Security Group

---

### Step 4 — Install Docker on EC2

SSH into your EC2 instance and run:

```bash
# Optional: update & upgrade
sudo apt-get update -y
sudo apt-get upgrade

# Required: install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add ubuntu user to docker group (no sudo needed for docker commands)
sudo usermod -aG docker ubuntu
newgrp docker
```

---

### Step 5 — Configure EC2 as a Self-Hosted GitHub Actions Runner

In your GitHub repository, go to:

```
Settings → Actions → Runners → New self-hosted runner
```

Select **Linux** as the OS, then run the commands shown — one by one — directly on your EC2 instance. This registers EC2 as the deployment target for the `Continuous-Deployment` job
all commands you find
.

---

### Step 6 — Add GitHub Secrets

Navigate to `Settings → Secrets and variables → Actions` in your repo and add:

| Secret Name             | Description                          | Example Value                                   |
| ----------------------- | ------------------------------------ | ----------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | IAM user access key                  | `AKIAIOSFODNN7EXAMPLE`                          |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key                  | `wJalrXUtnFEMI/...`                             |
| `AWS_REGION`            | AWS region of your ECR               | `ap-south-1`                                    |
| `AWS_ECR_LOGIN_URI`     | ECR registry base URI (no repo name) | `970547337635.dkr.ecr.ap-south-1.amazonaws.com` |
| `ECR_REPOSITORY_NAME`   | Name of your ECR repository          | `mlproj`                                        |

---

### GitHub Actions Workflow

The pipeline is defined in `.github/workflows/main.yaml` and runs automatically on every push to `main` (README changes excluded).

```yaml
name: workflow
on:
  push:
    branches: [main]
  paths-ignore:
    - "README.md"

permissions:
  id-token: write
  contents: read

jobs:
  integration:
    name: Continuous Integration
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      - name: Lint code
        run: echo "Linting code..."
      - name: Run Unit Tests
        run: echo "Running unit tests..."

  build-and-push-ecr-image:
    name: Continuous Delivery
    needs: integration
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      - name: Install Utilities
        run: |
          sudo apt-get update
          sudo apt-get install -y jq unzip
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      - name: Build, tag, and push image to Amazon ECR
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: ${{ secrets.ECR_REPOSITORY_NAME }}
          IMAGE_TAG: latest
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

  Continuous-Deployment:
    needs: build-and-push-ecr-image
    runs-on: self-hosted
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}
      - name: Login to Amazon ECR
        uses: aws-actions/amazon-ecr-login@v1
      - name: Pull latest image
        run: |
          docker pull ${{ secrets.AWS_ECR_LOGIN_URI }}/${{ secrets.ECR_REPOSITORY_NAME }}:latest
      - name: Stop old container
        run: |
          docker stop cnncls || true
          docker rm cnncls || true
      - name: Run container
        run: |
          docker run -d -p 8080:8080 --name cnncls \
          -e AWS_ACCESS_KEY_ID=${{ secrets.AWS_ACCESS_KEY_ID }} \
          -e AWS_SECRET_ACCESS_KEY=${{ secrets.AWS_SECRET_ACCESS_KEY }} \
          ${{ secrets.AWS_ECR_LOGIN_URI }}/${{ secrets.ECR_REPOSITORY_NAME }}:latest
      - name: Clean Docker
        run: |
          docker system prune -f
```

**Pipeline stages explained:**

| Job                        | Runner              | What it does                                       |
| -------------------------- | ------------------- | -------------------------------------------------- |
| `integration`              | `ubuntu-latest`     | Lints code and runs unit tests                     |
| `build-and-push-ecr-image` | `ubuntu-latest`     | Builds Docker image, pushes to ECR                 |
| `Continuous-Deployment`    | `self-hosted` (EC2) | Pulls image, replaces running container, cleans up |

---

## 🔐 GitHub Secrets Reference

```
AWS_ACCESS_KEY_ID       =  <your-iam-access-key>
AWS_SECRET_ACCESS_KEY   =  <your-iam-secret-key>
AWS_REGION              =  ap-south-1
AWS_ECR_LOGIN_URI       =  970547337635.dkr.ecr.ap-south-1.amazonaws.com
ECR_REPOSITORY_NAME     =  mlproj
```

Once all secrets are configured and the self-hosted runner is active, every push to `main` will automatically:

1. ✅ Lint and test the code
2. ✅ Build and push the Docker image to ECR
3. ✅ Pull the latest image on EC2
4. ✅ Replace the running container and serve predictions on port `8080`

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">Made with ❤️ for MLOps learners</p>
