import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { TelegramService } from '../services/telegram.service';
import { AWSService } from '../services/aws.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [TelegramService, AWSService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });
});
