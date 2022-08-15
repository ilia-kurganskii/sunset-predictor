import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  ConfigurationVariables,
  OpenWeatherConfig,
} from '../../config/configuration.model';
import { Weather } from '../../models/record.model';
import { OpenWeatherAPIWeatherResponseModel } from './weather.model';
import { WeatherDTO } from './weather.dto';
import { OPEN_WEATHER_API_HOST } from './weather.const';

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
  }): Promise<Weather> => {
    const { lat, lon } = params;
    return await this.httpService.axiosRef
      .get<OpenWeatherAPIWeatherResponseModel>(
        `${OPEN_WEATHER_API_HOST}/data/3.0/onecall`,
        {
          params: {
            lat,
            lon,
            units: 'metric',
            appId: this.weatherConfig.token,
          },
        },
      )
      .then((response) => response.data.current)
      .then((weather) => WeatherDTO.serviceToApp(weather));
  };
}
