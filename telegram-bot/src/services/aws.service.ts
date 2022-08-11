import { Injectable } from '@nestjs/common';
import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { EventBridge } from '@aws-sdk/client-eventbridge';
import { ECS } from '@aws-sdk/client-ecs';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { ConfigService } from '@nestjs/config';
import {
  AWSConfig,
  ConfigurationVariables,
} from '../config/configuration.model';
import { Place } from '../models/place.model';

@Injectable()
export class AWSService {
  private readonly awsConfig: AWSConfig;

  private readonly s3Client: S3;
  private readonly dynamoDbClient: DynamoDBDocument;
  private readonly ecsClient: ECS;
  private readonly eventBridgeClient: EventBridge;

  constructor(
    private readonly configService: ConfigService<ConfigurationVariables>,
  ) {
    this.awsConfig = configService.get<AWSConfig>('aws');

    this.s3Client = new S3({ region: this.awsConfig.region });
    this.dynamoDbClient = DynamoDBDocument.from(
      new DynamoDB({ region: this.awsConfig.region }),
    );
    this.ecsClient = new ECS({ region: this.awsConfig.region });
    this.eventBridgeClient = new EventBridge({
      region: this.awsConfig.region,
    });
  }

  async getSignedUrlForFile(file: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.awsConfig.region,
      Key: file,
    });
    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async putItemToRecordTable<T>(item: T) {
    return this.dynamoDbClient.put({
      TableName: this.awsConfig.dynamoDbRecordsName,
      Item: item,
    });
  }

  async putItemToPlaceTable(item: Omit<Place, 'id'>): Promise<Place> {
    const id = `${item.lat}${item.lon}`;
    const result = await this.dynamoDbClient.put({
      TableName: this.awsConfig.dynamoDbPlaceName,
      Item: {
        id,
        ...item,
      },
    });
    return result.Attributes as Place;
  }

  async createRecorderRule(params: {
    placeId: string;
    minUtc: number;
    hourUtc: number;
  }): Promise<{ ruleName: string }> {
    let { hourUtc, minUtc, placeId } = params;
    const ruleName = placeId;
    await this.eventBridgeClient.putRule({
      Name: placeId,
      Description: `Rule to record sunset for placeId: ${placeId}`,
      RoleArn: this.awsConfig.eventBridgeRuleRoleArn,
      ScheduleExpression: `cron(${minUtc} ${hourUtc} * * ? *)`,
      State: 'ENABLED',
    });

    return {
      ruleName,
    };
  }

  async createTaskDefinition(params: {
    placeId: string;
    streamUrl: string;
  }): Promise<{ taskDefinitionArn: string }> {
    let { placeId, streamUrl } = params;
    const result = await this.ecsClient.registerTaskDefinition({
      family: 'recorder',
      containerDefinitions: [
        {
          image: `${this.awsConfig.repositoryRecorderUrl}:latest`,
          essential: true,
          memory: 300,
          name: `${placeId}-sunset-recorder`,
          cpu: 500,
          logConfiguration: {
            logDriver: 'awslogs',
            options: {
              'awslogs-group': 'sunset-recorder-container',
              'awslogs-region': this.awsConfig.region,
              'awslogs-create-group': 'true',
              'awslogs-stream-prefix': `sunset-recorder-${placeId}`,
            },
          },
          environment: [
            { name: 'DURATION', value: '20' },
            { name: 'TIMELAPSE_FACTOR', value: '0.016' },
            { name: 'PLACE_ID', value: placeId },
            { name: 'STREAM_URL', value: streamUrl },
            { name: 'AWS_BUCKET', value: this.awsConfig.ecsTaskRecordsRoleArn },
            {
              name: 'AWS_LAMBDA_NAME',
              value: this.awsConfig.lambdaTelegramBotFunctionName,
            },
            { name: 'AWS_DEFAULT_REGION', value: this.awsConfig.region },
          ],
        },
      ],
    });
    return { taskDefinitionArn: result.taskDefinition.taskDefinitionArn };
  }

  async setRuleTarget(params: {
    placeId: string;
    taskDefinitionArn: string;
    ruleName: string;
  }) {
    let { placeId, taskDefinitionArn, ruleName } = params;
    await this.eventBridgeClient.putTargets({
      Rule: ruleName,
      Targets: [
        {
          Id: placeId,
          Arn: this.awsConfig.clusterArn,
          RoleArn: this.awsConfig.eventBridgeRuleRoleArn,
          EcsParameters: {
            TaskDefinitionArn: taskDefinitionArn,
          },
        },
      ],
    });
  }
}
