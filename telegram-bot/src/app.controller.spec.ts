import {Test, TestingModule} from '@nestjs/testing';
import {AppController} from './app.controller';
import {TelegramService} from './telegram.service';
import {AWSService} from './aws.service';

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
