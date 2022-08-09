#!/bin/bash
sudo mkdir -p /etc/ecs && sudo touch /etc/ecs/ecs.config
echo "ECS_CLUSTER=sunset" >> /etc/ecs/ecs.config
