import { MaintenanceMode } from "@ultrade/shared/browser/enums";

import { UserNotification } from "./account.interface";
import { UpdateUserNotificationDto } from "./notification.interface";

export interface ISystemVersion {
  version: string | null;
}

export interface ISystemMaintenance {
  mode: MaintenanceMode;
}

export interface IUnreadNotificationsCount {
  count: number;
}

export interface ISystemForClient {
  getVersion(): Promise<ISystemVersion>;
  getMaintenance(): Promise<ISystemMaintenance>;
  getNotifications(): Promise<UserNotification[]>;
  getNotificationsUnreadCount(): Promise<IUnreadNotificationsCount>;
  readNotifications(notifications: UpdateUserNotificationDto[]): Promise<UpdateUserNotificationDto[]>;
  ping(): Promise<number>;
}