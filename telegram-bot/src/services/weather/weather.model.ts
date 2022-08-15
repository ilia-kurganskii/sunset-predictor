export interface OpenWeatherAPIWeatherModel {
  sunrise: number;
  sunset: number;
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

export interface OpenWeatherAPIWeatherResponseModel {
  current: OpenWeatherAPIWeatherModel;
}
