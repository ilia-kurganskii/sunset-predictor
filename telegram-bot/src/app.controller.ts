import { Controller } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { Context, Callback } from 'aws-lambda';
import { AWSService } from './aws.service';

@Controller()
export class AppController {
  constructor(
    public readonly telegramService: TelegramService,
    public readonly awsService: AWSService,
  ) {}

  processEvent = async (
    event: { type: string; id: string; file: string },
    context: Context,
    callback: Callback,
  ) => {
    console.log('EVENT', event);
    let { type, id, file } = event;
    switch (type) {
      case 'video_recorded': {
        await this.sendNewPollToChat({ id, file });
        break;
      }
    }
    callback(null, 'success');
  };

  private sendNewPollToChat = async (params: {
    id: string;
    file: string;
  }): Promise<void> => {
    const url = await this.awsService.getSignedUrlForFile(params.file);
    await this.telegramService.sendVideo({
      caption: 'Sunset',
      videoUrl: url,
    });
    await this.telegramService.sendPoll({
      question: 'Rate the sunset^',
      options: ['5', '4', '3', '2', '1'],
      allows_multiple_answers: true,
    });
  };
}
