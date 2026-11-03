import type { Category, Occasion } from '../products/products.types.ts';

export type SortOrder = 'featured' | 'asc' | 'desc';

// The filter state read from the catalog form. '' means "no filter".
export interface ProductFilters {
  search: string;
  category: Category; // '' = all categories
  occasion: Occasion | '';
  sort: SortOrder;
}

export type FilterKey = keyof ProductFilters;
