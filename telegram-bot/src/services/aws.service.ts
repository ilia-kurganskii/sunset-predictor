import { Injectable, Logger } from '@nestjs/common';
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
import { RecordItem } from '../models/record.model';

@Injectable()
export class AWSService {
  private readonly awsConfig: AWSConfig;

  private readonly logger = new Logger(AWSService.name);

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
    this.logger.debug(`Get signed url for file ${file}`);
    const command = new GetObjectCommand({
      Bucket: this.awsConfig.bucketRecordsName,
      Key: file,
    });
    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async putItemToRecordTable(item: RecordItem) {
    this.logger.debug(`Put item to record table recordId: ${item.recordId}`);

    return this.dynamoDbClient.put({
      TableName: this.awsConfig.dynamoDbRecordsName,
      Item: item,
    });
  }

  async putItemToPlaceTable(item: Place): Promise<Place> {
    this.logger.debug(`Add item to place table with id ${item.id}`);
    await this.dynamoDbClient.put({
      TableName: this.awsConfig.dynamoDbPlaceName,
      Item: item,
    });
    return item;
  }

  async getPlaceById(id: string): Promise<Place> {
    this.logger.debug(`Get place by id "${id}"`);
    const result = await this.dynamoDbClient.get({
      TableName: this.awsConfig.dynamoDbPlaceName,
      Key: {
        id,
      },
    });
    return result.Item as Place;
  }

  async getAllPlaces(): Promise<Place[]> {
    this.logger.debug(`Get all places"`);
    const result = await this.dynamoDbClient.scan({
      TableName: this.awsConfig.dynamoDbPlaceName,
    });
    return result.Items as Place[];
  }

  async setRecorderRule(params: {
    placeId: string;
    minUtc: number;
    hourUtc: number;
  }): Promise<{ ruleName: string }> {
    let { hourUtc, minUtc, placeId } = params;
    const ruleName = placeId;
    const cronTime = `cron(${minUtc} ${hourUtc} * * ? *)`;
    this.logger.debug(`Set recorder rule (${cronTime}) with name ${ruleName}`);
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
    this.logger.debug('Create task definition');
    const result = await this.ecsClient.registerTaskDefinition({
      family: `${placeId}_sunset-recorder`,
      requiresCompatibilities: ['FARGATE'],
      networkMode: 'awsvpc',
      cpu: '256',
      memory: '512',
      executionRoleArn: this.awsConfig.ecsTaskRecordsRoleArn,
      containerDefinitions: [
        {
          image: `${this.awsConfig.repositoryRecorderUrl}:latest`,
          essential: true,
          name: `${placeId}_sunset-recorder`,

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
            { name: 'AWS_BUCKET', value: this.awsConfig.bucketRecordsName },
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
    this.logger.debug(`Set rule(${ruleName}) targets: ${taskDefinitionArn} `);
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
