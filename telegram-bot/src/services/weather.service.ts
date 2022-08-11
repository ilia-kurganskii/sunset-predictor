import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  ConfigurationVariables,
  OpenWeatherConfig,
  TelegramConfig,
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
    lat: string;
    lon: string;
  }): Promise<{
    sunrise: number;
    sunset: number;
  }> => {
    let { lat, lon } = params;
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

function extractErrorMessage(e: any) {
  if (e.response?.data) {
    return JSON.stringify(e.response.data);
  }
  return e.message;
}
