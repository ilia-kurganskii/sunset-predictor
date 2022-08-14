import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  ConfigurationVariables,
  OpenWeatherConfig,
} from '../config/configuration.model';

@Injectable()
export class WeatherService {
  private readonly weatherConfig: OpenWeatherConfig;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<ConfigurationVariables>,
  ) {
    this.weatherConfig = configService.get<OpenWeatherConfig>('openWeather');
  }

  getCurrentWeather = async (params: {
    lat: string | number;
    lon: string | number;
  }): Promise<{
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
  }> => {
    const { lat, lon } = params;
    return await this.httpService.axiosRef
      .get(`https://api.openweathermap.org/data/3.0/onecall`, {
        params: {
          lat,
          lon,
          units: 'metric',
          appId: this.weatherConfig.token,
        },
      })
      .then((response) => response.data.current);
  };
}
