import { Controller } from '@nestjs/common';
import { Callback, Context } from 'aws-lambda';
import { AWSService } from '../services/aws.service';
import {
  AddPlaceEvent,
  AppEvent,
  DeletePlace,
  EventType,
  RegeneratePlaces,
  UpdateAllSchedule,
  VideoRecordedEvent,
} from '../models/event.model';
import { PlaceService } from '../services/place.service';
import { NotificationService } from '../services/notification.service';
import { RecordsService } from '../services/records.service';
import { GeoService } from '../services/geo.service';

@Controller()
export class AppController {
  constructor(
    public readonly notificationService: NotificationService,
    public readonly awsService: AWSService,
    public readonly recordsService: RecordsService,
    public readonly geoService: GeoService,
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

        case EventType.DELETE_PLACE:
          await this.onDeletePlace(event);
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
      messageId: messageId,
      lat: place.lat,
      lon: place.lon,
    });
    await this.placeService.refreshTimeForPlace(place_id);
    // It's already uploaded to telegram
    await this.awsService.removeVideo(file);
  };

  private onAddPlace = async (event: AddPlaceEvent): Promise<void> => {
    let { name, id, lat, lon, start_offset, duration, stream_url } = event;

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

  private onDeletePlace = async (event: DeletePlace) => {
    await this.placeService.deletePlace(event.place_id);
  };
}
