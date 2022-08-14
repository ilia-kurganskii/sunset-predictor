import { Injectable, Logger } from '@nestjs/common';
import { AWSService } from './aws.service';
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
    const { file, placeName } = params;
    this.logger.debug(`Notify about new video for place ${placeName}`);
    const url = await this.awsService.getSignedUrlForFile(file);

    await this.telegramService.sendVideo({
      caption: `Sunset in ${placeName}`,
      videoUrl: url,
    });
    const { messageId } = await this.telegramService.sendPoll({
      question: `Rate the sunset in ${placeName}^`,
      options: [
        'factor1: Colored clouds',
        'factor2: Clean horizons',
        'factor3: Colored horizons',
        'factor4: Colored sky',
      ],
      allows_multiple_answers: true,
    });

    return { messageId };
  }
}
