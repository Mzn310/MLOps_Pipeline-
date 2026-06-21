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
