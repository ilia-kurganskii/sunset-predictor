export interface ConfigurationVariables {
  aws: AWSConfig;
  telegram: TelegramConfig;
  openWeather: OpenWeatherConfig;
}

export interface AWSConfig {
  region: string;
  bucketRecordsName: string;
  dynamoDbRecordsName: string;
  dynamoDbPlaceName: string;
  clusterArn: string;
  repositoryRecorderUrl: string;
  lambdaTelegramBotFunctionName: string;
  ecsExecutionRoleArn: string;
  ecsTaskRoleArn: string;
  eventBridgeRuleRoleArn: string;
  securityGroupArn: string;
  subnetArn: string;
}

export interface TelegramConfig {
  chatId: string;
  token: string;
}

export interface OpenWeatherConfig {
  token: string;
}
