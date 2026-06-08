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

# - Prevents IP changes after EC2 restart

# - Useful for Jenkins servers

#

# AWS Console:

# EC2 -> Elastic IPs -> Allocate Elastic IP

# -> Associate with your EC2 instance

#################################################

#################################################

# Get Jenkins Initial Admin Password

#

# After opening:

# http://<EC2-PUBLIC-IP>:8080

#

# Jenkins asks for an unlock password.

# This command displays it.

#################################################
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
