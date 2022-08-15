import { Injectable, Logger } from '@nestjs/common';
import { Place } from '../models/place.model';
import { AWSService } from './aws.service';
import { WeatherService } from './weather';
import {
  AppConfig,
  ConfigurationVariables,
} from '../config/configuration.model';
import { ConfigService } from '@nestjs/config';
import { GeoService } from './geo.service';

@Injectable()
export class PlaceService {
  private readonly logger = new Logger(PlaceService.name);
  private readonly appConfig: AppConfig;

  constructor(
    private readonly awsService: AWSService,
    private readonly weatherService: WeatherService,
    private readonly geoService: GeoService,
    private readonly configService: ConfigService<ConfigurationVariables>,
  ) {
    this.appConfig = configService.get<AppConfig>('app');
  }

  async createPlace(place: Place) {
    this.logger.debug(`Create place ${JSON.stringify(place)}`);
    const item = await this.awsService.putItemToPlaceTable(place);

    const { taskDefinitionArn } = await this.awsService.createTaskDefinition({
      placeId: item.id,
      streamUrl: item.streamUrl,
      duration: item.duration,
      timelapseFactor: this.appConfig.timelapseFactor,
    });

    const weather = await this.weatherService.getCurrentWeather({
      lat: item.lat,
      lon: item.lon,
    });

    const { ruleName } = await this.updateScheduleTimeForPlaceRule({
      placeId: item.id,
      sunsetTimestamp: weather.sunset,
      startOffset: place.startOffset,
    });

    await this.awsService.setRuleTarget({
      placeId: item.id,
      ruleName,
      taskDefinitionArn,
    });
  }

  async deletePlace(placeId: string) {
    this.logger.debug(`Delete place by id ${placeId}`);

    await this.awsService.removeScheduleRule({ placeId });

    await this.awsService.removeTaskDefinition({
      placeId: placeId,
    });

    await this.awsService.deleteItemFromPlaceTable({ placeId });

    this.logger.debug(`Delete place by id ${placeId} success`);
  }

  async refreshTimeForPlace(placeId: string) {
    this.logger.debug(`Refresh time for place "${placeId}"`);

    const place = await this.getPlaceById(placeId);
    const weather = await this.weatherService.getCurrentWeather({
      lat: place.lat,
      lon: place.lon,
    });
    await this.updateScheduleTimeForPlaceRule({
      placeId: placeId,
      startOffset: place.startOffset,
      sunsetTimestamp: weather.sunset,
    });
  }

  async getPlaceById(placeId: string): Promise<Place> {
    this.logger.debug(`Get place by id "${placeId}"`);
    return this.awsService.getPlaceById(placeId);
  }

  async getAllPlaces(): Promise<Place[]> {
    this.logger.debug(`Get all places`);
    return this.awsService.getAllPlaces();
  }

  private async updateScheduleTimeForPlaceRule(params: {
    placeId: string;
    startOffset: number;
    sunsetTimestamp: number;
  }) {
    const { placeId, sunsetTimestamp, startOffset = 0 } = params;
    const sunsetUtcDate = new Date(sunsetTimestamp - startOffset * 60 * 1000);

    const { ruleName } = await this.awsService.setRecorderRule({
      placeId: placeId,
      hourUtc: sunsetUtcDate.getUTCHours(),
      minUtc: sunsetUtcDate.getUTCMinutes(),
    });

    return { ruleName };
  }
}
