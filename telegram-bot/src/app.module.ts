import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { TelegramService } from './services/telegram';
import { AWSService } from './services/aws.service';
import { HttpModule } from '@nestjs/axios';
import config from './config/configuration';
import { ConfigModule } from '@nestjs/config';
import { WeatherService } from './services/weather';
import { NotificationService } from './services/notification.service';
import { PlaceService } from './services/place.service';
import { RecordsService } from './services/records.service';
import { GeoService } from './services/geo.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: '.env',
    }),
    HttpModule,
  ],
  controllers: [AppController],
  providers: [
    TelegramService,
    NotificationService,
    PlaceService,
    RecordsService,
    AWSService,
    WeatherService,
    GeoService,
  ],
})
export class AppModule {}
