// Pure product functions: no DOM, no fetch, no localStorage.
import type { Category, LoadState, Product } from './products.types.ts';

const CENTS_PER_UNIT = 100;

// The API gives price_cents without a currency, so no currency symbol is added.
const priceFormat = new Intl.NumberFormat('ar-SA', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export const formatPrice = (cents: number): string =>
  priceFormat.format(cents / CENTS_PER_UNIT);

// Unique categories in the order they first appear in the catalog.
export const listCategories = (products: readonly Product[]): Category[] => [
  ...new Set(products.map((product) => product.category)),
];

// The state after a successful request: an empty API catalog is its own state.
export const loadedState = (products: readonly Product[]): LoadState =>
  products.length ? { status: 'success', products } : { status: 'empty' };
