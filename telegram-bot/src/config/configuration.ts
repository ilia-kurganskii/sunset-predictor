import { ConfigurationVariables } from './configuration.model';
import * as dotenv from 'dotenv'; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

dotenv.config();

const configuration: ConfigurationVariables = {
  app: {
    timelapseFactor: process.env.APP_TIMELAPSE_FACTOR,
  },
  aws: {
    region: process.env.AWS_REGION,
    bucketRecordsName: process.env.AWS_BUCKET_RECORDS,
    clusterArn: process.env.AWS_CLUSTER_ARN,
    dynamoDbPlaceName: process.env.AWS_DYNAMO_DB_PLACE_TABLE_NAME,
    dynamoDbRecordsName: process.env.AWS_DYNAMO_DB_RECORDS_TABLE_NAME,
    repositoryRecorderUrl: process.env.AWS_REPOSITORY_RECORDER_URL,
    lambdaTelegramBotFunctionName:
      process.env.AWS_LAMBDA_TELEGRAM_BOT_FUNC_NAME,
    ecsExecutionRoleArn: process.env.AWS_ECS_EXECUTION_ROLE_ARN,
    ecsTaskRoleArn: process.env.AWS_ECS_TASK_ROLE_ARN,
    eventBridgeRuleRoleArn: process.env.AWS_EVENT_EXECUTION_ROLE_ARN,
    securityGroupArn: process.env.AWS_SECURITY_GROUP_ARN,
    subnetArn: process.env.AWS_SUBNET_ARN,
  },
  telegram: {
    token: process.env.TELEGRAM_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },
  openWeather: {
    token: process.env.OPEN_WEATHER_TOKEN,
  },
};

export default (): ConfigurationVariables => configuration;
