import type { LineDiscount } from './taxCalculationService';

export class DiscountCalculationService {
  static calculateDiscountAmount(net_price: number, percentage: number): number {
    return net_price * (percentage / 100);
  }

  static calculateTotalDiscountAmount(net_price: number, discounts: LineDiscount[]): number {
    return discounts.reduce(
      (sum, discount) => sum + this.calculateDiscountAmount(net_price, discount.percentage || 0),
      0
    );
  }

  static calculateSubtotal(net_price: number, discounts: LineDiscount[]): number {
    return net_price - this.calculateTotalDiscountAmount(net_price, discounts);
  }
}
