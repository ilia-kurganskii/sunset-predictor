import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppController } from './controllers/app.controller';
import { AppEvent, EventType } from './models/event.model';

let cachedHandler: AppController;

async function bootstrapServer(): Promise<AppController> {
  if (!cachedHandler) {
    const nestApp = await NestFactory.createApplicationContext(AppModule);
    cachedHandler = nestApp.get<AppController>(AppController);
  }
  return cachedHandler;
}

export const handler: Handler = async (
  input: AppEvent,
  context: Context,
  callback: Callback,
) => {
  const handler = await bootstrapServer();
  try {
    const event = extractEventFromInput(input);
    await handler.processEvent(event);
    callback(null, 'success');
  } catch (e: unknown) {
    console.log('Something went wrong', e);
    if (e instanceof Error) {
      callback(e, null);
    } else {
      callback('Something went wrong ' + e, null);
    }
  }
};

function extractEventFromInput(input: any): AppEvent {
  if (input.body) {
    const body = JSON.parse(input.body);
    if (body.type) {
      return body;
    } else if (body.poll) {
      return {
        type: EventType.PROCESS_POLL,
        poll: body.poll,
      };
    }
  } else if (input.type) {
    return input;
  }

  throw new Error(`Input is not supported ${input}`);
}
