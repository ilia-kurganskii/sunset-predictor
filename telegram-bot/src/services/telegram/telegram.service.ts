import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  ConfigurationVariables,
  TelegramConfig,
} from '../../config/configuration.model';
import { TELEGRAM_HOST } from './telegram.conts';

@Injectable()
export class TelegramService {
  private readonly telegramConfig: TelegramConfig;

  private readonly logger = new Logger(TelegramService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<ConfigurationVariables>,
  ) {
    this.telegramConfig = configService.get<TelegramConfig>('telegram');
  }

  sendVideo = async (params: {
    caption: string;
    videoUrl: string;
  }): Promise<void> => {
    this.logger.debug('Send video to chat');

    await this.sendRequest('sendVideo', {
      caption: params.caption,
      video: params.videoUrl,
      chat_id: this.telegramConfig.chatId,
    });
  };

  sendPoll = async (params: {
    question: string;
    options: string[];
    protect_content?: string;
    allows_multiple_answers?: boolean;
  }): Promise<{ pollId: string }> => {
    this.logger.debug('Send poll to chat');

    const data = await this.sendRequest<{ result: { poll: { id } } }>(
      'sendPoll',
      {
        ...params,
        options: JSON.stringify(params.options),
        chat_id: this.telegramConfig.chatId,
      },
    );
    return {
      pollId: data.result.poll.id,
    };
  };

  registerWebhook = async (params: { url: string }) => {
    const { url } = params;
    this.logger.log(`Register webhook url: ${url}`);

    await this.sendRequest('setWebhook', {
      url,
      allowed_updates: ['poll'],
    });
  };

  private sendRequest = async <T>(
    methodName: string,
    params: Record<string, any>,
  ): Promise<T> => {
    try {
      return await this.httpService.axiosRef
        .post<T>(
          `${TELEGRAM_HOST}/bot${this.telegramConfig.token}/${methodName}`,
          params,
        )
        .then((response) => response.data);
    } catch (e) {
      throw new Error(`API Error: ${extractErrorMessage(e)}`);
    }
  };
}

function extractErrorMessage(e: any) {
  if (e.response?.data) {
    return JSON.stringify(e.response.data);
  }
  return e.message;
}
