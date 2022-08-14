export interface Weather {
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

export interface RecordItem {
  pollId: string;

  // Weather
  placeWeather: Weather;
  sunsetWeather: Weather;
  poll?: {
    text: string;
    voterCount: number;
  }[];
}
