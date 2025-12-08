import { AffDashboardVisibilitySettingEnum, POINTS_SETTING } from "@enum";
import { ThemeObj } from "@ultrade/shared/browser/types";
import { SettingsInit } from "./account.interface";

export interface CustomMenuItem {
  label: string, 
  url: string,
}

export interface ISettingsState {
  appTitle: string,
  domain: string,
  enabled: string,
  kycTradeRequirementEnabled?: boolean,
  obdex: boolean,
  pointSystem: POINTS_SETTING,
  customMenuItems: CustomMenuItem[],
  affiliateDashboardThreshold: string,
  affiliateDefaultFeeShare: string,
  affiliateDashboardVisibility: AffDashboardVisibilitySettingEnum, 
  feeShare: number,
  ammFee: number,
  makerFee: number,
  minFee: number,
  takerFee: number,
  geoblock: string[],
  pinnedPairs: number[],
  currentCountry: string,
  theme1: ThemeObj,
  theme2: ThemeObj,
  theme3: ThemeObj,
  currentTheme?: string,
  isUltrade: boolean,
  companyId: number,
  target: string,
  newTab: boolean,
  reportButtons: boolean,
  chartType: string,
  chartInt: string[],
  unprocessedSettings?: SettingsInit;
}