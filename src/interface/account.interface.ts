import { AffDashboardVisibilitySettingEnum, POINTS_SETTING, SettingIds } from "@enum";

export interface UserNotification {
  id: number;
  globalNotificationId: number;
  priority: any;
  status: any;
  type: any;
  message: string;
  createdAt: Date;
}

export interface SettingsInit {
  [SettingIds.LOGO]: string;
  [SettingIds.TARGET]?: string;
  [SettingIds.NEW_TAB]?: string;
  [SettingIds.REPORT_BUTTONS]?: string;
  [SettingIds.CUSTOM_MENU_ITEMS]?: string;
  [SettingIds.THEMES]: string;
  [SettingIds.AMM_FEE]?: string;
  [SettingIds.APP_TITLE]: string;
  [SettingIds.DIRECT_SETTLE]?: string;
  [SettingIds.KYC]?: string;
  [SettingIds.DOMAIN]: string;
  [SettingIds.ENABLED]: string;
  [SettingIds.FEE_SHARE]: string;
  [SettingIds.GEOBLOCK]?: string;
  [SettingIds.MAKER_FEE]?: string;
  [SettingIds.MIN_FEE]?: string;
  [SettingIds.TAKER_FEE]?: string;
  [SettingIds.PINNED_PAIRS]?: string;
  [SettingIds.AMM]: string;
  [SettingIds.OBDEX]: string;
  [SettingIds.POINTS]?: POINTS_SETTING;
  [SettingIds.AFFILIATE_DASHBOARD_THRESHOLD]: string;
  [SettingIds.AFFILIATE_DEFAULT_FEE_SHARE]: string;
  [SettingIds.AFFILIATE_DASHBOARD_VISIBILITY]?: AffDashboardVisibilitySettingEnum;
  [SettingIds.TELEGRAM_ENABLED]?: string;
  [SettingIds.TELEGRAM_GROUP_NAME]?: string;
  [SettingIds.TELEGRAM_BOT_NAME]?: string;
  [SettingIds.DISCORD_ENABLED]?: string;
  [SettingIds.TWITTER_ENABLED]?: string;
  [SettingIds.TWITTER_JOB_ENABLED]?: string;
  [SettingIds.TWITTER_HASHTAGS]?: string;
  [SettingIds.TWITTER_ACCOUNT_NAME]?: string;
  [SettingIds.APPEARANCE_CHART_TYPE]?: string;
  [SettingIds.APPEARANCE_CHART_INT]?: string;
  currentCountry?: string;
  partnerId: number;
  isUltrade: boolean;
  companyId: number;
}

import {
  ILoginData,
  ITradingKeyData,
} from "@ultrade/shared/browser/interfaces";
import { TradingKeyView } from "@ultrade/shared/browser/interfaces";

export interface ILoginResponse {
  token: string;
}

export interface IRevokeTradingKeyResponse {
  signature: string;
}

export interface IAccountForClient {
  getSettings(): Promise<SettingsInit>;
  login(data: ILoginData): Promise<string>;
  addTradingKey(data: ITradingKeyData): Promise<TradingKeyView>;
  revokeTradingKey(data: ITradingKeyData): Promise<IRevokeTradingKeyResponse>;
}