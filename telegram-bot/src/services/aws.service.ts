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
  private readonly dynamoDbDocumentClient: DynamoDBDocument;
  private readonly ecsClient: ECS;
  private readonly eventBridgeClient: EventBridge;

  constructor(
    private readonly configService: ConfigService<ConfigurationVariables>,
  ) {
    this.awsConfig = configService.get<AWSConfig>('aws');

    this.s3Client = new S3({ region: this.awsConfig.region });

    this.ecsClient = new ECS({ region: this.awsConfig.region });
    this.eventBridgeClient = new EventBridge({
      region: this.awsConfig.region,
    });

    const dynamoDbClient = new DynamoDB({ region: this.awsConfig.region });
    this.dynamoDbDocumentClient = DynamoDBDocument.from(dynamoDbClient);
  }

  async getSignedUrlForFile(file: string): Promise<string> {
    this.logger.debug(`Get signed url for file ${file}`);

    const command = new GetObjectCommand({
      Bucket: this.awsConfig.bucketRecordsName,
      Key: file,
    });
    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async removeVideo(file: string): Promise<void> {
    this.logger.debug(`Remove video for file ${file}`);

    await this.s3Client.deleteObject({
      Bucket: this.awsConfig.bucketRecordsName,
      Key: file,
    });
  }

  async putItemToRecordTable(item: RecordItem) {
    this.logger.debug(`Put item to record table pollId: ${item.pollId}`);

    return this.dynamoDbDocumentClient.put({
      TableName: this.awsConfig.dynamoDbRecordsName,
      Item: item,
    });
  }

  async putItemToPlaceTable(item: Place): Promise<Place> {
    this.logger.debug(`Add item to place table with id ${item.id}`);

    await this.dynamoDbDocumentClient.put({
      TableName: this.awsConfig.dynamoDbPlaceName,
      Item: item,
    });
    return item;
  }

  async deleteItemFromPlaceTable(params: { placeId: string }): Promise<void> {
    this.logger.debug(`Remove item from place table with id ${params.placeId}`);

    await this.dynamoDbDocumentClient.delete({
      TableName: this.awsConfig.dynamoDbPlaceName,
      Key: {
        id: params.placeId,
      },
    });
  }

  async getPlaceById(id: string): Promise<Place> {
    this.logger.debug(`Get place by id "${id}"`);

    const result = await this.dynamoDbDocumentClient.get({
      TableName: this.awsConfig.dynamoDbPlaceName,
      Key: {
        id,
      },
    });
    return result.Item as Place;
  }

  async getRecordByMessageId(pollId: string): Promise<RecordItem | undefined> {
    this.logger.debug(`Get record by pollId "${pollId}"`);

    const result = await this.dynamoDbDocumentClient.get({
      TableName: this.awsConfig.dynamoDbRecordsName,
      Key: {
        pollId,
      },
    });
    return result?.Item as RecordItem;
  }

  async getAllPlaces(): Promise<Place[]> {
    this.logger.debug(`Get all places"`);

    const result = await this.dynamoDbDocumentClient.scan({
      TableName: this.awsConfig.dynamoDbPlaceName,
    });
    return result.Items as Place[];
  }

  async setRecorderRule(params: {
    placeId: string;
    minUtc: number;
    hourUtc: number;
  }): Promise<{ ruleName: string }> {
    const { hourUtc, minUtc, placeId } = params;
    const cronTime = `cron(${minUtc} ${hourUtc} * * ? *)`;
    const ruleName = getScheduleRuleName({ placeId });

    this.logger.debug(`Set recorder rule (${cronTime}) with name ${ruleName}`);

    await this.eventBridgeClient.putRule({
      Name: ruleName,
      Description: `Rule to record sunset for placeId: ${placeId}`,
      RoleArn: this.awsConfig.eventBridgeRuleRoleArn,
      ScheduleExpression: cronTime,
      State: 'ENABLED',
    });

    return {
      ruleName,
    };
  }

  async removeScheduleRule(params: { placeId: string }): Promise<void> {
    const ruleName = getScheduleRuleName({ placeId: params.placeId });
    this.logger.debug(`Remove rule with name ${ruleName}`);

    await this.removeTargetsForRule({ ruleName });
    await this.eventBridgeClient.deleteRule({
      Name: ruleName,
    });
  }

  private async removeTargetsForRule(params: {
    ruleName: string;
  }): Promise<void> {
    const { ruleName } = params;
    this.logger.debug(`Remove targets for rule ${ruleName}`);

    const { Targets } = await this.eventBridgeClient.listTargetsByRule({
      Rule: ruleName,
    });

    const targetIds = Targets.map((item) => item.Id);
    await this.eventBridgeClient.removeTargets({
      Rule: ruleName,
      Ids: targetIds,
    });
  }

  async removeTaskDefinition(params: { placeId: string }): Promise<void> {
    const { placeId } = params;
    this.logger.debug(`Remove task definition ${placeId}`);

    const { taskDefinitionArns } = await this.ecsClient.listTaskDefinitions({
      familyPrefix: getTaskDefinitionFamily({ placeId }),
    });
    for (const taskDefinition of taskDefinitionArns) {
      await this.ecsClient.deregisterTaskDefinition({
        taskDefinition: taskDefinition,
      });
    }
  }

  async createTaskDefinition(params: {
    placeId: string;
    streamUrl: string;
    duration: number;
    timelapseFactor: string;
  }): Promise<{ taskDefinitionArn: string }> {
    const { placeId, streamUrl, duration, timelapseFactor } = params;
    this.logger.debug(`Create task definition for place ${placeId}`);

    const result = await this.ecsClient.registerTaskDefinition({
      family: getTaskDefinitionFamily({ placeId }),
      requiresCompatibilities: ['FARGATE'],
      networkMode: 'awsvpc',
      cpu: '256',
      memory: '512',
      executionRoleArn: this.awsConfig.ecsExecutionRoleArn,
      taskRoleArn: this.awsConfig.ecsTaskRoleArn,
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
            { name: 'DURATION', value: `${duration}` },
            { name: 'TIMELAPSE_FACTOR', value: `${timelapseFactor}` },
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
    const { placeId, taskDefinitionArn, ruleName } = params;
    this.logger.debug(`Set rule(${ruleName}) targets: ${taskDefinitionArn}`);

    await this.eventBridgeClient.putTargets({
      Rule: ruleName,
      Targets: [
        {
          Id: placeId,
          Arn: this.awsConfig.clusterArn,
          RoleArn: this.awsConfig.eventBridgeRuleRoleArn,
          EcsParameters: {
            LaunchType: 'FARGATE',
            TaskDefinitionArn: taskDefinitionArn,
            PlatformVersion: '1.4.0',
            NetworkConfiguration: {
              awsvpcConfiguration: {
                AssignPublicIp: 'ENABLED',
                Subnets: [this.awsConfig.subnetArn],
                SecurityGroups: [this.awsConfig.securityGroupArn],
              },
            },
          },
        },
      ],
    });
  }
}

function getTaskDefinitionFamily(params: { placeId: string }) {
  return `${params.placeId}_sunset-recorder`;
}

function getScheduleRuleName(params: { placeId: string }) {
  return `${params.placeId}`;
}
