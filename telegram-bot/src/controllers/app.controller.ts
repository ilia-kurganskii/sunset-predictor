import { Controller } from '@nestjs/common';
import { Callback, Context } from 'aws-lambda';
import { AWSService } from '../services/aws.service';
import {
  AddPlaceEvent,
  AppEvent,
  EventType, RegeneratePlaces,
  UpdateAllSchedule,
  VideoRecordedEvent
} from "../models/event.model";
import { PlaceService } from '../services/place.service';
import { NotificationService } from '../services/notification.service';
import { RecordsService } from '../services/records.service';

@Controller()
export class AppController {
  constructor(
    public readonly notificationService: NotificationService,
    public readonly awsService: AWSService,
    public readonly recordsService: RecordsService,
    public readonly placeService: PlaceService,
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
          break;

        case EventType.UPDATE_ALL_SCHEDULE:
          await this.onRefreshAllSchedule(event);
          break;

          case EventType.REGENERATE_PLACES:
          await this.onRegeneratePlaces(event);
          break;
      }
      callback(null, 'success');
    } catch (e) {
      console.error(e);
      callback(e, null);
    }
  };

  private onVideoRecoded = async (event: VideoRecordedEvent): Promise<void> => {
    let { file, place_id } = event;
    const place = await this.placeService.getPlaceById(place_id);
    const { messageId } = await this.notificationService.notifyAboutNewVideo({
      placeName: place.name,
      file: file,
    });
    await this.recordsService.addNewRecord({
      placeId: place_id,
      file,
      messageId,
    });
    await this.placeService.refreshTimeForPlace(place_id);
  };

  private onAddPlace = async (event: AddPlaceEvent): Promise<void> => {
    let { name, id, lat, lon, stream_url } = event;

    await this.placeService.createPlace({
      id,
      name,
      lat,
      lon,
      streamUrl: stream_url,
    });
  };

  private onRefreshAllSchedule = async (
    event: UpdateAllSchedule,
  ): Promise<void> => {
    const places = await this.placeService.getAllPlaces();
    await Promise.all(
      places.map((place) => {
        this.placeService.refreshTimeForPlace(place.id);
      }),
    );
  };

  private onRegeneratePlaces = async (
    event: RegeneratePlaces,
  ): Promise<void> => {
    const places = await this.placeService.getAllPlaces();
    await Promise.all(
      places.map((place) => {
        this.placeService.createPlace(place);
      }),
    );
  };
}
