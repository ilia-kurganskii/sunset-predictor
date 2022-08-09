import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {TelegramService} from './telegram.service';
import {AWSService} from "./aws.service";
import {HttpModule} from "@nestjs/axios";

@Module({
    imports: [HttpModule],
    controllers: [AppController],
    providers: [TelegramService, AWSService],
})
export class AppModule {
}
