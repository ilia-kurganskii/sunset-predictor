import { Injectable, Logger } from '@nestjs/common';
import { Place } from '../models/place.model';
import { AWSService } from './aws.service';
import { getSunsetTime } from '../controllers/app.utils';
import { WeatherService } from './weather.service';
import { TelegramService } from './telegram.service';

@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);

  constructor(
    private readonly awsService: AWSService,
    private readonly weatherService: WeatherService,
  ) {}

  async addNewRecord(params: {
    placeId: string;
    lat: string;
    lon: string;
    messageId: string;
  }): Promise<{ recordId: string }> {
    let { messageId, placeId, lat, lon } = params;
    this.logger.debug(`Add record for place ${placeId}`);
    const recordId = `${placeId}_${messageId}`;

    const weather = await this.weatherService.getCurrentWeather({
      lat,
      lon,
    });

    await this.awsService.putItemToRecordTable({
      recordId: recordId,
      messageId: messageId,
      ...weather,
    });
    return { recordId };
  }
}
