import { Injectable, Logger } from '@nestjs/common';
import { Place } from '../models/place.model';
import { AWSService } from './aws.service';
import { getSunsetTime } from '../controllers/app.utils';
import { WeatherService } from './weather.service';

@Injectable()
export class PlaceService {
  private readonly logger = new Logger(PlaceService.name);

  constructor(
    private readonly awsService: AWSService,
    private readonly weatherService: WeatherService,
  ) {}

  async createPlace(place: Place) {
    this.logger.debug(`Create place ${JSON.stringify(place)}`);
    const item = await this.awsService.putItemToPlaceTable(place);

    const { taskDefinitionArn } = await this.awsService.createTaskDefinition({
      placeId: item.id,
      streamUrl: item.streamUrl,
    });

    const weather = await this.weatherService.getCurrentWeather({
      lat: item.lat,
      lon: item.lon,
    });

    const { ruleName } = await this.updateScheduleTimeForPlaceRule(
      item.id,
      weather.sunset,
    );

    await this.awsService.setRuleTarget({
      placeId: item.id,
      ruleName,
      taskDefinitionArn,
    });
  }

  async refreshTimeForPlace(placeId: string) {
    this.logger.debug(`Refresh time for place "${placeId}"`);

    const place = await this.getPlaceById(placeId);
    const weather = await this.weatherService.getCurrentWeather({
      lat: place.lat,
      lon: place.lon,
    });
    await this.updateScheduleTimeForPlaceRule(place.id, weather.sunset);
  }

  async getPlaceById(placeId: string): Promise<Place> {
    this.logger.debug(`Get place by id "${placeId}"`);
    return this.awsService.getPlaceById(placeId);
  }

  private async updateScheduleTimeForPlaceRule(
    placeId: string,
    sunsetTimestamp: number,
  ) {
    const sunsetUtcDate = getSunsetTime(sunsetTimestamp);

    const { ruleName } = await this.awsService.setRecorderRule({
      placeId: placeId,
      hourUtc: sunsetUtcDate.hours,
      minUtc: sunsetUtcDate.minutes,
    });

    return { ruleName };
  }
}
