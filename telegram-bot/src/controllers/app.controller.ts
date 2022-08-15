import { Controller, Logger } from '@nestjs/common';
import { AWSService } from '../services/aws.service';
import {
  AddPlaceEvent,
  AppEvent,
  DeletePlaceEvent,
  EventType,
  InitEvent,
  ProcessPollEvent,
  RegeneratePlacesEvent,
  UpdateAllScheduleEvent,
  VideoRecordedEvent,
} from '../models/event.model';
import { PlaceService } from '../services/place.service';
import { NotificationService } from '../services/notification.service';
import { RecordsService } from '../services/records.service';
import { TelegramService } from '../services/telegram';

@Controller()
export class AppController {
  private logger = new Logger(AppController.name, { timestamp: false });

  constructor(
    public readonly notificationService: NotificationService,
    public readonly awsService: AWSService,
    public readonly recordsService: RecordsService,
    public readonly placeService: PlaceService,
    public readonly telegramService: TelegramService,
  ) {}

  processEvent = async (event: AppEvent) => {
    this.logger.log(`Process event ${JSON.stringify(event)}`);
    switch (event.type) {
      case EventType.VIDEO_RECORDED:
        await this.onVideoRecoded(event);
        break;

      case EventType.ADD_PLACE:
        await this.onAddPlace(event);
        break;

      case EventType.UPDATE_ALL_SCHEDULE:
        await this.onRefreshAllSchedule(event);
        break;

      case EventType.REGENERATE_PLACES:
        await this.onRegeneratePlaces(event);
        break;

      case EventType.DELETE_PLACE:
        await this.onDeletePlace(event);
        break;

      case EventType.PROCESS_POLL:
        await this.onProcessPoll(event);
        break;

      case EventType.INIT:
        await this.onInit(event);
        break;

      default:
        throw new Error(
          `Event handler not found for for ${JSON.stringify(event)}`,
        );
    }
  };

  private onVideoRecoded = async (event: VideoRecordedEvent): Promise<void> => {
    const { file, place_id } = event;
    const place = await this.placeService.getPlaceById(place_id);
    const { pollId } = await this.notificationService.notifyAboutNewVideo({
      placeName: place.name,
      file: file,
    });
    await this.recordsService.addNewRecord({
      placeId: place_id,
      pollId,
      lat: place.lat,
      lon: place.lon,
    });
    await this.placeService.refreshTimeForPlace(place_id);
    // It's already uploaded to telegram
    await this.awsService.removeVideo(file);
  };

  private onAddPlace = async (event: AddPlaceEvent): Promise<void> => {
    const { name, id, lat, lon, start_offset, duration, stream_url } = event;

    await this.placeService.createPlace({
      id,
      name,
      lat,
      lon,
      startOffset: start_offset,
      duration,
      streamUrl: stream_url,
    });
  };

  private onRefreshAllSchedule = async (
    _: UpdateAllScheduleEvent,
  ): Promise<void> => {
    const places = await this.placeService.getAllPlaces();
    await Promise.all(
      places.map((place) => {
        this.placeService.refreshTimeForPlace(place.id);
      }),
    );
  };

  private onRegeneratePlaces = async (
    _: RegeneratePlacesEvent,
  ): Promise<void> => {
    const places = await this.placeService.getAllPlaces();
    await Promise.all(
      places.map((place) => {
        this.placeService.createPlace(place);
      }),
    );
  };

  private onProcessPoll = async (event: ProcessPollEvent): Promise<void> => {
    await this.recordsService.processPoll(event.poll);
  };

  private onInit = async (event: InitEvent): Promise<void> => {
    await this.telegramService.registerWebhook({
      url: event.webhook_url,
    });
  };

  private onDeletePlace = async (event: DeletePlaceEvent) => {
    await this.placeService.deletePlace(event.place_id);
  };
}
