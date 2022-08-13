import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppController } from './controllers/app.controller';
import { AppEvent } from './models/event.model';

let cachedHandler: AppController;

async function bootstrapServer(): Promise<AppController> {
  if (!cachedHandler) {
    const nestApp = await NestFactory.create(AppModule, new FastifyAdapter());
    await nestApp.init();
    cachedHandler = nestApp.get<AppController>(AppController);
  }
  return cachedHandler;
}

export const handler: Handler = async (
  event: AppEvent,
  context: Context,
  callback: Callback,
) => {
  const handler = await bootstrapServer();
  return handler.processEvent(event, context, callback);
};
