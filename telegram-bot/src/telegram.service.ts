import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class TelegramService {
  constructor(private readonly httpService: HttpService) {}

  sendVideo = async (params: {
    caption: string;
    videoUrl: string;
  }): Promise<void> => {
    console.log(params.videoUrl);
    await this.sendRequest('sendVideo', {
      caption: params.caption,
      video: params.videoUrl,
      chat_id: process.env.TELEGRAM_CHAT_ID,
    });
  };

  sendPoll = async (params: {
    question: string;
    options: string[];
    protect_content?: string;
    allows_multiple_answers?: boolean;
  }): Promise<{ messageId: string }> => {
    const response = await this.sendRequest('sendPoll', {
      ...params,
      options: JSON.stringify(params.options),
      chat_id: process.env.TELEGRAM_CHAT_ID,
    });
    return response.data;
  };

  private sendRequest = async (
    methodName: string,
    params: Record<string, any>,
  ) => {
    try {
      return await this.httpService.axiosRef.post(
        `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/${methodName}`,
        {},
        {
          params,
        },
      );
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
