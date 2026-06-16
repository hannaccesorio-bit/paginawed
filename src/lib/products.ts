import { formatPrice as formatPriceUtil } from '@/lib/utils';

export { formatPriceUtil as formatPrice };

export function formatPriceCOP(value: number): string {
  return formatPriceUtil(value);
}
