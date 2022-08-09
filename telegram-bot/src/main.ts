import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppController } from './app.controller';

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
  event: any,
  context: Context,
  callback: Callback,
) => {
  const handler = await bootstrapServer();
  return handler.processEvent(event, context, callback);
};

handler(
  {
    type: 'video_recorded',
    file: '2022-08-08/file_original.mp4',
  },
  null,
  () => {},
);
