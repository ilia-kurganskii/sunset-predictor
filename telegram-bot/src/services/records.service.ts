import { Injectable, Logger } from '@nestjs/common';
import { AWSService } from './aws.service';
import { WeatherService } from './weather.service';
import { GeoService } from './geo.service';
import { Poll } from '../models/poll';

@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);

  constructor(
    private readonly awsService: AWSService,
    private readonly weatherService: WeatherService,
    private readonly geoService: GeoService,
  ) {}

  async addNewRecord(params: {
    placeId: string;
    lat: string;
    lon: string;
    pollId: string;
  }): Promise<{ pollId: string }> {
    const { pollId, placeId, lat, lon } = params;
    this.logger.debug(`Add record for place ${placeId} with pollId ${pollId}`);

    const placeWeather = await this.weatherService.getCurrentWeather({
      lat,
      lon,
    });

    const sunsetCoordinates = this.geoService.getSunsetPosition({
      distanceKm: 160,
      lat: Number.parseFloat(lat),
      lon: Number.parseFloat(lon),
      sunset: placeWeather.sunset * 1000,
    });

    const sunsetWeather = await this.weatherService.getCurrentWeather({
      lat: sunsetCoordinates.lat,
      lon: sunsetCoordinates.lon,
    });

    await this.awsService.putItemToRecordTable({
      pollId,
      placeWeather,
      sunsetWeather,
    });
    return { pollId };
  }

  processPoll = async (poll: Poll) => {
    const recordItem = await this.awsService.getRecordByMessageId(poll.id);
    if (recordItem) {
      await this.awsService.putItemToRecordTable({
        ...recordItem,
        poll: poll.options.map((item) => ({
          text: item.text,
          voterCount: item.voter_count,
        })),
      });
    } else {
      this.logger.warn(`Record item for pollId ${poll.id} not found`);
    }
  };
}
