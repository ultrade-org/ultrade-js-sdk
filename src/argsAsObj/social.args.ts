/**
 * Social-related method arguments
 */

import { TelegramData } from '@interface';

export interface IAddSocialEmailArgs {
  email: string;
  embeddedAppUrl: string;
}

export interface IVerifySocialEmailArgs {
  email: string;
  hash: string;
}

export interface IGetSeasonArgs {
  ultradeId?: number;
}

export interface IAddTelegramArgs {
  data: TelegramData;
}

export interface IDisconnectTelegramArgs {
  data: TelegramData;
}

export interface IGetDiscordConnectionUrlArgs {
  url: string;
}

export interface IGetTwitterConnectionUrlArgs {
  appUrl: string;
  permissions?: string;
}

export interface IActionWithTweetArgs {
  actions: Array<{ id: number; text?: string }>;
  tweetId?: string;
}

export interface IGetAICommentArgs {
  styleId: number;
  tweetId: string;
}
