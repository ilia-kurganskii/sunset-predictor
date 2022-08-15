import { OpenWeatherAPIWeatherModel } from './weather.model';
import { Weather } from '../../models/record.model';

function serviceToAppTimestamp(timestamp: number): number {
  return timestamp * 1000;
}

function serviceToApp(weather: OpenWeatherAPIWeatherModel): Weather {
  return {
    ...weather,
    sunset: serviceToAppTimestamp(weather.sunset),
    sunrise: serviceToAppTimestamp(weather.sunrise),
  };
}

export const WeatherDTO = {
  serviceToApp,
};
