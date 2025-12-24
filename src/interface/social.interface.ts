export interface TelegramData {
  auth_date: number;
  id: number;
  first_name: string;
  hash: string;
  photo_url: string;
  username: string;
}

export interface ISocialAccount {
  points: number;
  address: string;
  email?: string;
  emailVerified: boolean;
  twitterAccount?: {
    userName: string;
    twitterId: string;
    name: string;
    permissions: {
      canFollowAccounts: boolean;
      canCreateTweets: boolean;
      canLikeTweets: boolean;
    };
  };
  telegramAccount?: {
    userName: string;
    telegramId: string;
  };
  discordAccount?: {
    userName: string;
    discordId: string;
    name: string;
  };
}

export interface ILeaderboardItem {
  address: string;
  currentPoints: number;
  tasksCompleted: number;
  twitter?: string;
  discord?: string;
  telegram?: string;
  order: number;
}

export interface IUnlock {
  id: number;
  companyId: number;
  seasonId: number;
  name: string;
  description: string;
  points: number;
  enabled: boolean;
}

export interface IAction {
  id: number;
  companyId: number;
  seasonId: number;
  source: string;
  name: string;
  description: string;
  points: number;
  enabled: boolean;
}

export interface IActionHistory {
  id: number;
  address: string;
  companyId: number;
  actionId: number;
  seasonId: number;
  source: string;
  points: number;
  referenceId?: string;
  createdAt: Date;
}

export interface ISocialSettings {
  isShowUltradePoints: boolean,
  discordEnabled?: boolean,
  telegramEnabled?: boolean,
  telegramBotName?: string,
  telegramBotId?: string,
  telegramGroupId?: string,
  telegramGroupName?: string,
  twitterEnabled?: boolean,
  twitterJobEnabled?: boolean,
  twitterAccountId?: string,
  twitterAccountName?: string,
  guideLink?: string
}

export interface ISocialSeason {
  id: number;
  companyId: number;
  startDate: Date;
  endDate?: Date;
  name: string;
  isSelected: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITelegramConnectResponse {
  address: string;
  telegramId: string;
  userName: string;
  createdAt: Date;
}

export interface ICompanyTweet {
  id: string;
  companyId: number;
  seasonId: number;
  type: string;
  text: string;
  enabled: boolean;
  isProcessed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAIStyle {
  id: number;
  title: string;
  content: string;
  enabled: boolean;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAIGeneratedComment {
  comment: string | null;
  requestsLeft: number;
}

export interface ISocialForClient {
  getSocialAccount(): Promise<ISocialAccount | undefined>;
  addSocialEmail(email: string, embeddedAppUrl: string): Promise<void>;
  verifySocialEmail(email: string, hash: string): Promise<void>;
  getLeaderboards(): Promise<ILeaderboardItem[]>;
  getUnlocks(): Promise<IUnlock[]>;
  getSocialSettings(): Promise<ISocialSettings>;
  getSeason(ultradeId?: number): Promise<ISocialSeason>;
  getPastSeasons(): Promise<ISocialSeason[]>;
  addTelegram(data: TelegramData): Promise<ITelegramConnectResponse>;
  disconnectTelegram(data: TelegramData): Promise<void>;
  getDiscordConnectionUrl(url: string): Promise<string>;
  disconnectDiscord(): Promise<void>;
  getTwitterConnectionUrl(appUrl: string, permissions?: string): Promise<string>;
  disconnectTwitter(): Promise<void>;
  getTweets(): Promise<ICompanyTweet[]>;
  actionWithTweet(data: { actions: Array<{ id: number; text?: string }>; tweetId?: string }): Promise<void>;
  getActions(): Promise<IAction[]>;
  getActionHistory(): Promise<IActionHistory[]>;
  getAIStyles(): Promise<IAIStyle[]>;
  getAIComment(styleId: number, tweetId: string): Promise<IAIGeneratedComment>;
}
  