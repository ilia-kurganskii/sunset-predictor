import { Injectable, Logger } from '@nestjs/common';
import { AWSService } from './aws.service';
import { WeatherService } from './weather.service';
import { GeoService } from './geo.service';

@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);

  constructor(
    private readonly awsService: AWSService,
    private readonly weatherService: WeatherService,
    private readonly geoService: GeoService,
  ) {}

  async addNewRecord(params: {
    placeId: string;
    lat: string;
    lon: string;
    messageId: string;
  }): Promise<{ recordId: string }> {
    const { messageId, placeId, lat, lon } = params;
    this.logger.debug(`Add record for place ${placeId}`);
    const recordId = `${placeId}_${messageId}`;

    const placeWeather = await this.weatherService.getCurrentWeather({
      lat,
      lon,
    });

    const sunsetCoordinates = this.geoService.getSunsetPosition({
      distanceKm: 160,
      lat: Number.parseFloat(lat),
      lon: Number.parseFloat(lon),
      sunset: placeWeather.sunset * 1000,
    });

    const sunsetWeather = await this.weatherService.getCurrentWeather({
      lat: sunsetCoordinates.lat,
      lon: sunsetCoordinates.lon,
    });

    await this.awsService.putItemToRecordTable({
      recordId: recordId,
      messageId: messageId,
      placeWeather,
      sunsetWeather,
    });
    return { recordId };
  }
}
