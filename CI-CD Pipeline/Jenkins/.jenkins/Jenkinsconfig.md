#!/bin/bash

#################################################

# Update package list

# Downloads the latest package information

#################################################
sudo apt update

#################################################

# Install Java 8 JDK

# Jenkins requires Java to run

#################################################
sudo apt install openjdk-8-jdk -y

#################################################

# Jenkins package repositories

# Official Jenkins package source:

# https://pkg.jenkins.io/

# Debian packages:

# https://pkg.jenkins.io/debian-stable/

#

# (You still need to add the Jenkins repository

# and key before installing Jenkins itself.)

#################################################

#################################################

# Start Jenkins service

# Launches Jenkins immediately

#################################################
sudo systemctl start jenkins

#################################################

# Enable Jenkins at boot

# Jenkins will automatically start after reboot

#################################################
sudo systemctl enable jenkins

#################################################

# Check Jenkins status

# Verify Jenkins is running correctly

#################################################
sudo systemctl status jenkins

#################################################

# Install Docker

#################################################

# Download Docker installation script

curl -fsSL https://get.docker.com -o get-docker.sh

# Run installation script

sudo sh get-docker.sh

#################################################

# Docker permissions

#################################################

# Allow current user to run Docker without sudo

sudo usermod -aG docker $USER

# Allow Jenkins user to run Docker commands

# This is required if Jenkins builds Docker images

sudo usermod -aG docker jenkins

# Reload group membership without logout/login

newgrp docker

#################################################

# Install AWS CLI

# Used to connect Jenkins/server to AWS services

# such as ECR, EC2, S3, etc.

#################################################
sudo apt install awscli -y

# Ensure Jenkins belongs to Docker group

sudo usermod -a -G docker jenkins

#################################################

# Configure AWS Credentials

#

# aws configure will ask for:

#

# AWS Access Key ID

# AWS Secret Access Key

# AWS Region (ex: eu-west-1)

# Output format (json)

#

# Credentials are stored locally and used

# by AWS CLI and Jenkins jobs.

#################################################
aws configure

#################################################

# Assign an Elastic IP on AWS

#

# Purpose:

# - Provides a permanent public IP address example 54.80.194.59 used on Jenkinsfile to can't change when the instance stops and starts

# - Prevents IP changes after EC2 restart only reboot and restart and add TCP with 0.0.0.0/0

# - Useful for Jenkins servers

#

# AWS Console:

# EC2 -> Elastic IPs -> Allocate Elastic IP

# -> Associate with your EC2 instance : click to associate this Elastic IP and research to find your instance

#################################################

#################################################

# Get Jenkins Initial Admin Password

#

# After opening:

# http://<EC2-PUBLIC-IP>:8080

#

# Jenkins asks for an unlock password. ui

# This command displays it.To ensure Jenkins a security set up by the administrator, a password has been written to the log and this file on the server

#################################################
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

# go to available plugins and choose ssh and install SSH Agent and after click install it you should choose restart Jenkins on Download progress and then u see something like Please wait while Jenkins is restarting

# after it to add credentials with ui

# you should go to manage Jenkins and you find credentials there and choose secret text not other but to SSH choose Kind SSH Username with private key you find via this https://www.youtube.com/watch?v=FsJ9QBZy1QQ step by step

# click to new item and add name and then choose Pipeline SCM: Server Control Mang and then choose Git and choose on Script Path name of your file with directory like here Jenkinsfile and add repository URL and Branch Specifier

# Once the GitHub Actions workflow completes, the Jenkins job is triggered. You can then open the Jenkins dashboard, check the Build History, and view the Console Output of the build to see the detailed execution logs and understand what happened during each stage of the pipeline.
