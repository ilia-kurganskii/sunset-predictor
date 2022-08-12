import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Callback, Context, Handler } from 'aws-lambda';
import { AppController } from './controllers/app.controller';
import { AppEvent, EventType } from './models/event.model';

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

handler(
  {
    id: 'hague-zeilvereniging',
    type: 'add_place',
    name: 'Zeilvereniging Noordwijk',
    lat: '52.2438376',
    lon: '4.4241582',
    stream_url: 'http://webcam.zvnoordwijk.nl:82/mjpg/video.mjpg',
  },
  null,
  () => undefined,
);
