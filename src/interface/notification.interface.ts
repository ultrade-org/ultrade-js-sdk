import { NotificationStatusEnum } from "@ultrade/shared/browser/enums";

export interface UpdateUserNotificationDto {
  id?: number;
  globalNotificationId?: number;
  status: NotificationStatusEnum;
}

