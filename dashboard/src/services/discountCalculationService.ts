export class DiscountCalculationService {
  static calculateDiscountAmount(netPrice: number, discount: any): number {
    if (discount.isAmount) {
      return discount.amount || 0;
    }
    return netPrice * (discount.percentage || 0) / 100;
  }

  static calculateTotalDiscountAmount(netPrice: number, discounts: any[]): number {
    return discounts.reduce((sum: number, discount: any) => 
      sum + this.calculateDiscountAmount(netPrice, discount), 0
    );
  }

  static calculateSubtotal(netPrice: number, discounts: any[]): number {
    return netPrice - this.calculateTotalDiscountAmount(netPrice, discounts);
  }
}
