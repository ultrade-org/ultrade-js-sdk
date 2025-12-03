/**
 * Trading-related method arguments
 */

import { CreateSpotOrderArgs, CancelOrderArgs } from '@interface';

export interface ICreateSpotOrderArgs extends CreateSpotOrderArgs {}

export interface ICancelOrderArgs extends CancelOrderArgs {}

export interface ICancelMultipleOrdersArgs {
  orderIds?: number[];
  pairId?: number;
}
