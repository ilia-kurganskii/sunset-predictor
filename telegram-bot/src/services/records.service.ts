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
    messageId: string;
    file: string;
  }): Promise<{ recordId: string }> {
    let { file, messageId, placeId } = params;
    this.logger.debug(`Add record for place ${placeId} and with file ${file}`);
    const recordId = placeId + file;
    await this.awsService.putItemToRecordTable({
      recordId: recordId,
      videoKey: file,
      messageId: messageId,
    });
    return { recordId };
  }
}
