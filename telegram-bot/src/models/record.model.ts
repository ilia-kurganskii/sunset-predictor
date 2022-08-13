export interface RecordItem {
  recordId: string;
  messageId: string;

  // Weather
  temp: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust: number;
}
