# Sunset Predictor

Pet project to learn ML

## Idea

Predict sunset by weather data

## Realization

### Collect dataset

Input:
- Lat, Lng
- Weather data in place
- Weather data from 160km on sunset direction

Output:
- Is sunset is colored (red)
- Is the horizon clean (without clouds)
- Is horizon colored


### Tech stack

- AWS
    - ECS (Fargate) (To save streams > 30min)
    - Lambda (Serverless server)
    - EventBridge (To schedule recorder)
    - ECR (For docker images)
    - DynamoDB (To collect dataset)
- Terraform
- FFmpeg to download stream
- NestJS

## Features

### GitHub actions

- Build NestJS app
- Build Docker image
- Apply terraform configuration

## Road Map

- Collect data set from several places
- Create ML model to predict factors of a sunset
