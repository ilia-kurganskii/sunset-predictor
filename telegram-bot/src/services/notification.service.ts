import { Injectable, Logger } from '@nestjs/common';
import { Place } from '../models/place.model';
import { AWSService } from './aws.service';
import { getSunsetTime } from '../controllers/app.utils';
import { WeatherService } from './weather.service';
import { TelegramService } from './telegram.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly awsService: AWSService,
    private readonly weatherService: WeatherService,
    private readonly telegramService: TelegramService,
  ) {}

  async notifyAboutNewVideo(params: {
    file: string;
    placeName: string;
  }): Promise<{ messageId: string }> {
    let { file, placeName } = params;
    const url = await this.awsService.getSignedUrlForFile(file);

    await this.telegramService.sendVideo({
      caption: `Sunset in ${placeName}`,
      videoUrl: url,
    });
    const { messageId } = await this.telegramService.sendPoll({
      question: `Rate the sunset in ${placeName}^`,
      options: [
        'rate5: 5',
        'rate4: 5',
        'rate3: 3',
        'rate2: 2',
        'rate1: 1',
        'factor1: Colored clouds',
        'factor2: Clean horizons',
        'factor3: TBD',
        'factor4: TBD',
        'factor5: TBD',
        'factor6: TBD',
      ],
      allows_multiple_answers: true,
    });

    return { messageId };
  }
}
