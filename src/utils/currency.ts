/**
 * Algerian Dinar currency formatting and calculation utilities
 */

export function formatDZD(amount: number): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(Math.round(amount)) + ' د.ج';
}

export function formatForeignCurrency(amount: number, currency: 'EUR' | 'USD'): string {
  const symbol = currency === 'EUR' ? '€' : '$';
  return `${amount.toFixed(2)} ${symbol}`;
}

export interface PricingCalculationResult {
  originalPrice: number;
  originalCurrency: 'EUR' | 'USD';
  exchangeRate: number;
  subtotalDZD: number;
  serviceFeeDZD: number;
  internationalShippingDZD: number;
  totalDZD: number;
  profitMarginPercent: number;
}

export function calculateOrderPricing(
  originalPrice: number,
  originalCurrency: 'EUR' | 'USD',
  exchangeRate: number,
  marginPercent: number = 12,
  minFeeDZD: number = 500,
  shippingDZD: number = 0
): PricingCalculationResult {
  const subtotalDZD = Math.round(originalPrice * exchangeRate);
  const calculatedFee = Math.round(subtotalDZD * (marginPercent / 100));
  const serviceFeeDZD = Math.max(calculatedFee, minFeeDZD);
  const totalDZD = subtotalDZD + serviceFeeDZD + shippingDZD;

  return {
    originalPrice,
    originalCurrency,
    exchangeRate,
    subtotalDZD,
    serviceFeeDZD,
    internationalShippingDZD: shippingDZD,
    totalDZD,
    profitMarginPercent: marginPercent,
  };
}
