import { Theme } from "@ultrade/shared/browser/interfaces";

export interface IThemeSettings {
  currentTheme: string,
  value?: Theme,
  logo?: string
}


export interface IGetSettingsArgs {
  themeSettings: IThemeSettings;
}