/**
 * Trading-related method arguments
 */

import { CreateOrderArgs, CancelOrderArgs } from '@interface';

export interface ICreateOrderArgs extends CreateOrderArgs {}

export interface ICancelOrderArgs extends CancelOrderArgs {}

export interface ICancelMultipleOrdersArgs {
  orderIds?: number[];
  pairId?: number;
}
