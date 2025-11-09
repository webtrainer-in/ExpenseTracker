export const CURRENCY_OPTIONS = [
  { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US" },
  { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE" },
  { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", locale: "zh-CN" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", locale: "en-CA" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", locale: "en-AU" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", locale: "de-CH" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", locale: "en-SG" },
];

export function formatCurrency(amount: number, currencyCode: string = "USD"): string {
  const currency = CURRENCY_OPTIONS.find(c => c.code === currencyCode);
  
  if (!currency) {
    return `$${amount.toFixed(2)}`;
  }

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
    }).format(amount);
  } catch (error) {
    return `${currency.symbol}${amount.toFixed(2)}`;
  }
}

export function getCurrencySymbol(currencyCode: string = "USD"): string {
  const currency = CURRENCY_OPTIONS.find(c => c.code === currencyCode);
  return currency?.symbol || "$";
}
