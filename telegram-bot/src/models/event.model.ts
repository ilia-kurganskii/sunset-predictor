export enum EventType {
  VIDEO_RECORDED = 'video_recorded',
  ADD_PLACE = 'add_place',
  UPDATE_ALL_SCHEDULE = 'update_all_schedule',
  REGENERATE_PLACES = 'regenerate_places',
  DELETE_PLACE = 'delete_place',
}

export interface VideoRecordedEvent {
  type: EventType.VIDEO_RECORDED;
  place_id: string;
  file: string;
}

export interface AddPlaceEvent {
  type: EventType.ADD_PLACE;
  id: string;
  name: string;
  lat: string;
  lon: string;
  start_offset: number;
  duration: number;
  stream_url: string;
}

export interface UpdateAllSchedule {
  type: EventType.UPDATE_ALL_SCHEDULE;
}

export interface RegeneratePlaces {
  type: EventType.REGENERATE_PLACES;
}

export interface DeletePlace {
  type: EventType.DELETE_PLACE;
  place_id: string;
}

export type AppEvent =
  | VideoRecordedEvent
  | AddPlaceEvent
  | UpdateAllSchedule
  | DeletePlace
  | RegeneratePlaces;
