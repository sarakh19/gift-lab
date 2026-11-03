// Pure filter functions: no DOM, no fetch, no localStorage.
import type { Occasion, Product } from '../products/products.types.ts';
import type { FilterKey, ProductFilters, SortOrder } from './filters.types.ts';

// Gift Lab occasion labels shown in the occasions section and filter.
export const OCCASIONS: readonly Occasion[] = [
  'زفاف',
  'مولود',
  'تخرج',
  'رمضان',
  'العيد',
  'يوم المعلم',
  'اليوم الوطني',
  'يوم التأسيس',
];
const SORT_ORDERS: readonly SortOrder[] = ['featured', 'asc', 'desc'];
export const FILTER_KEYS: readonly FilterKey[] = [
  'search',
  'category',
  'occasion',
  'sort',
];

// Makes Arabic search forgiving: ignores diacritics/tatweel and unifies alef forms.
export const normalize = (value: string): string =>
  value
    .normalize('NFKC')
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .trim()
    .toLowerCase();

export const isOccasion = (value: unknown): value is Occasion =>
  OCCASIONS.some((occasion) => occasion === value);

export const isSortOrder = (value: unknown): value is SortOrder =>
  SORT_ORDERS.some((order) => order === value);

export const isFilterKey = (value: unknown): value is FilterKey =>
  FILTER_KEYS.some((key) => key === value);

// Turns raw form text into typed filters; unknown values fall back to "no filter".
export function parseFilters(
  values: Readonly<Record<FilterKey, string>>,
): ProductFilters {
  return {
    search: values.search,
    category: values.category,
    occasion: isOccasion(values.occasion) ? values.occasion : '',
    sort: isSortOrder(values.sort) ? values.sort : 'featured',
  };
}

// filter() returns a new array, so sorting never mutates the source catalog.
export function filterProducts(
  products: readonly Product[],
  filters: Partial<ProductFilters>,
): Product[] {
  const term = normalize(filters.search || '');
  const result = products.filter(
    (product) =>
      normalize(`${product.name} ${product.category}`).includes(term) &&
      (!filters.category || product.category === filters.category) &&
      (!filters.occasion || product.occasions.includes(filters.occasion)),
  );
  if (filters.sort === 'asc')
    result.sort((a, b) => a.priceCents - b.priceCents);
  if (filters.sort === 'desc')
    result.sort((a, b) => b.priceCents - a.priceCents);
  return result;
}
