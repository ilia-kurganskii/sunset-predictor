import { Controller } from '@nestjs/common';
import { TelegramService } from '../services/telegram.service';
import { Callback, Context } from 'aws-lambda';
import { AWSService } from '../services/aws.service';
import {
  AddPlaceEvent,
  AppEvent,
  EventType,
  VideoRecordedEvent,
} from '../models/event.model';
import { WeatherService } from '../services/weather.service';

@Controller()
export class AppController {
  constructor(
    public readonly telegramService: TelegramService,
    public readonly awsService: AWSService,
    public readonly weatherService: WeatherService,
  ) {}

  processEvent = async (
    event: AppEvent,
    context: Context,
    callback: Callback,
  ) => {
    try {
      switch (event.type) {
        case EventType.VIDEO_RECORDED:
          await this.onVideoRecoded(event);
          break;

        case EventType.ADD_PLACE:
          await this.onAddPlace(event);
      }
      callback(null, 'success');
    } catch (e) {
      console.error(e);
      callback(e, null);
    }
  };

  private onVideoRecoded = async (event: VideoRecordedEvent): Promise<void> => {
    let { file, place_id, type } = event;
    const url = await this.awsService.getSignedUrlForFile(file);
    await this.awsService.putItemToRecordTable({
      id: place_id,
      recordedFileKey: file,
    });
    await this.telegramService.sendVideo({
      caption: 'Sunset',
      videoUrl: url,
    });
    await this.telegramService.sendPoll({
      question: 'Rate the sunset^',
      options: ['5', '4', '3', '2', '1', 'Colored clouds', 'Clean horizons'],
      allows_multiple_answers: true,
    });
  };

  private onAddPlace = async (event: AddPlaceEvent): Promise<void> => {
    let { name, lat, lon, stream_url } = event;
    const item = await this.awsService.putItemToPlaceTable({
      name,
      lat,
      lon,
      streamUrl: stream_url,
    });

    const { taskDefinitionArn } = await this.awsService.createTaskDefinition({
      placeId: item.id,
      streamUrl: stream_url,
    });

    const weather = await this.weatherService.getCurrentWeather({
      lat,
      lon,
    });

    const sunsetUtcDate = new Date(weather.sunset);

    const { ruleName } = await this.awsService.createRecorderRule({
      placeId: item.id,
      hourUtc: sunsetUtcDate.getUTCHours(),
      minUtc: sunsetUtcDate.getUTCMinutes(),
    });

    await this.awsService.setRuleTarget({
      placeId: item.id,
      ruleName,
      taskDefinitionArn,
    });
  };
}
