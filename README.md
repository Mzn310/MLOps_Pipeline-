##  MLflow Tracking Setup

Choose between a free hosted option via **DagsHub** or a self-hosted setup on **AWS (EC2 + S3)**.

---

##  Option 1 — DagsHub Remote Tracking

DagsHub provides a free hosted MLflow tracking server. Set the environment variables below, then run your script — all runs, metrics, and artifacts will be logged remotely.

### Run in a single command

```bash
MLFLOW_TRACKING_URI=https://dagshub.com/entbappy/MLflow-Basic-Demo.mlflow \
MLFLOW_TRACKING_USERNAME=entbappy \
MLFLOW_TRACKING_PASSWORD=6824692c47a369aa6f9eac5b10041d5c8edbcef0 \
python script.py
```

### Or export variables separately (recommended for reuse)

```bash
export MLFLOW_TRACKING_URI=https://dagshub.com/entbappy/MLflow-Basic-Demo.mlflow

export MLFLOW_TRACKING_USERNAME=entbappy

export MLFLOW_TRACKING_PASSWORD=6824692c47a369aa6f9eac5b10041d5c8edbcef0

# Then run your script
python script.py
```

### Environment variable reference

| Variable | Description |
|---|---|
| `MLFLOW_TRACKING_URI` | The remote MLflow server URL hosted on DagsHub |
| `MLFLOW_TRACKING_USERNAME` | Your DagsHub username |
| `MLFLOW_TRACKING_PASSWORD` | Your DagsHub access token |

>  **Security note:** Never hardcode your tracking password in source code. Use environment variables or a `.env` file and make sure to add `.env` to your `.gitignore`.

---

##  Option 2 — MLflow on AWS (EC2 + S3)

This setup deploys a self-hosted MLflow tracking server on an EC2 instance with artifact storage on S3. Requires an AWS account.

### Step 1 — AWS Infrastructure Setup

1. **Log in** to the [AWS Management Console](https://console.aws.amazon.com/)
2. **Create an IAM user** with `AdministratorAccess` policy and download the access keys
3. **Configure the AWS CLI** locally by running:
   ```bash
   aws configure
   ```
   Provide your Access Key ID, Secret Access Key, and preferred region.
4. **Create an S3 bucket** (e.g. `mlflow-tracking-buc25`) — this will store all MLflow artifacts
5. **Launch an EC2 instance** (Ubuntu recommended) and open port **5000** in the Security Group inbound rules

---

### Step 2 — EC2 Server Setup

SSH into your EC2 instance and run the following commands:

```bash
# Update packages and install dependencies
sudo apt update
sudo apt install python3-pip pipenv virtualenv -y

# Create project directory and install the MLflow stack
mkdir mlflow && cd mlflow
pipenv install mlflow awscli boto3
pipenv shell

# Configure AWS credentials on the EC2 instance
aws configure

# Start the MLflow tracking server
# Replace the S3 bucket name if you used a different one
mlflow server \
  -h 0.0.0.0 \
  --default-artifact-root s3://mlflow-tracking-buc25 \
  --allowed-hosts *
```

>  The server runs on port **5000**. Open your instance's **Public IPv4 DNS** at `http://<your-ec2-dns>:5000` in a browser to verify the server is running.

---

### Step 3 — Connect from Your Local Machine

Point your local MLflow client to the EC2 tracking server:

```bash
# Replace with your actual EC2 Public IPv4 DNS
export MLFLOW_TRACKING_URI=http://ec2-54-147-36-34.compute-1.amazonaws.com:5000/

# Run your training script — logs go to the EC2 server
python script.py
```

---

##  Architecture Overview

```
Local Machine
    │
    │  (logs runs, metrics, params)
    ▼
MLflow Tracking Server  ──────────────►  S3 Bucket
  (EC2 Ubuntu)                           (Artifacts)
    │
    │  (UI accessible via browser)
    ▼
http://<ec2-dns>:5000
```

---

##  Security Best Practices

- Store credentials in environment variables, never in source code
- Add `.env` files to `.gitignore`
- Restrict EC2 Security Group port 5000 to trusted IP ranges in production
- Rotate your DagsHub access token periodically
- Use IAM roles on EC2 instead of `aws configure` when possible
