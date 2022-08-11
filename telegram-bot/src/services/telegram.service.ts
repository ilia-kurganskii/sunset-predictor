import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import {
  ConfigurationVariables,
  TelegramConfig,
} from '../config/configuration.model';

@Injectable()
export class TelegramService {
  private readonly telegramConfig: TelegramConfig;

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
    console.log(params.videoUrl);
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
  }): Promise<{ messageId: string }> => {
    const data = await this.sendRequest<{ result: { message_id } }>(
      'sendPoll',
      {
        ...params,
        options: JSON.stringify(params.options),
        chat_id: this.telegramConfig.chatId,
      },
    );
    return {
      messageId: data.result.message_id,
    };
  };

  sendRequest = async <T>(
    methodName: string,
    params: Record<string, any>,
  ): Promise<T> => {
    try {
      return await this.httpService.axiosRef
        .post<T>(
          `https://api.telegram.org/bot${this.telegramConfig.token}/${methodName}`,
          {},
          {
            params,
          },
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
