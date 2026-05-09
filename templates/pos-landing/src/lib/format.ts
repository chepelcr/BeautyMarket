export function fmtCRC(n: number): string {
  return '₡' + Math.round(n).toLocaleString('es-CR');
}

export function fmtUSD(n: number, rate = 600): string {
  return '$' + Math.round(n / rate).toLocaleString('en-US');
}

export function fmtPrice(n: number, currency: 'CRC' | 'USD', rate = 600): string {
  return currency === 'USD' ? fmtUSD(n, rate) : fmtCRC(n);
}
