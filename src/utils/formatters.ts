/**
 * Formats a number into localized currency string (e.g. ฿1,250.00 or $1,250.00)
 */
export function formatCurrency(amount: number, currency: string = 'THB'): string {
  const symbolMap: Record<string, string> = {
    THB: '฿',
    USD: '$',
    EUR: '€',
    JPY: '¥',
    GBP: '£',
  };

  const symbol = symbolMap[currency] || currency;
  const formattedNumber = new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  return amount < 0 ? `-${symbol}${formattedNumber}` : `${symbol}${formattedNumber}`;
}

/**
 * Formats date into human readable Thai / International date
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return d.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a ratio as percentage (e.g. 0.35 -> 35.0%)
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
