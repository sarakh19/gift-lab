// --- External contract: exactly what https://shopboard-api.vercel.app/api/products returns.

export interface ApiProduct {
  id: number;
  title: string;
  category_name: string;
  price_cents: number;
  in_stock: boolean;
}

export interface ApiProductsResponse {
  items: ApiProduct[];
  total: number;
}

// --- Internal model used by the rest of the app (produced by the mapper).

export type Occasion =
  | 'زفاف'
  | 'مولود'
  | 'تخرج'
  | 'رمضان'
  | 'العيد'
  | 'يوم المعلم'
  | 'اليوم الوطني'
  | 'يوم التأسيس';

// Categories are defined by the API (e.g. "Bags"), so this is open text, not a fixed union.
export type Category = string;

export interface Product {
  id: number;
  name: string;
  category: Category;
  priceCents: number;
  inStock: boolean;
  // The API sends no occasions, so this is empty for API products (never guessed).
  occasions: readonly Occasion[];
}

// Request state for the catalog. `status` tells TypeScript which fields exist.
export type ProductsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'success'; products: readonly Product[] };
