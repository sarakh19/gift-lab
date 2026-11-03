import { ApiError, getJson } from '../../shared/api/client.ts';
import { isPositiveInteger, isRecord } from '../../shared/validation.ts';
import type {
  ApiProduct,
  ApiProductsResponse,
  Product,
} from './products.types.ts';

export const PRODUCTS_URL = 'https://shopboard-api.vercel.app/api/products';

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';

// Runtime check: TypeScript types disappear in the browser, so verify every field.
export function isApiProduct(value: unknown): value is ApiProduct {
  return (
    isRecord(value) &&
    isPositiveInteger(value.id) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.category_name) &&
    isNonNegativeInteger(value.price_cents) &&
    typeof value.in_stock === 'boolean'
  );
}

// Rejects the whole response if anything is malformed, instead of guessing.
export function parseProductsResponse(data: unknown): ApiProductsResponse {
  if (!isRecord(data) || !Array.isArray(data.items))
    throw new ApiError('validation', 'Products response has no items array');
  if (!isNonNegativeInteger(data.total))
    throw new ApiError('validation', 'Products response has an invalid total');
  const rawItems: readonly unknown[] = data.items;
  const items: ApiProduct[] = [];
  const seenIds = new Set<number>();
  rawItems.forEach((item, index) => {
    if (!isApiProduct(item))
      throw new ApiError('validation', `Invalid product at index ${index}`);
    if (seenIds.has(item.id))
      throw new ApiError('validation', `Duplicate product id ${item.id}`);
    seenIds.add(item.id);
    items.push(item);
  });
  return { items, total: data.total };
}

// Mapper: converts the API's field names and shape into the app's Product model.
export function mapApiProduct(apiProduct: ApiProduct): Product {
  return {
    id: apiProduct.id,
    name: apiProduct.title.trim(),
    category: apiProduct.category_name.trim(),
    priceCents: apiProduct.price_cents,
    inStock: apiProduct.in_stock,
    occasions: [],
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await getJson(PRODUCTS_URL, parseProductsResponse);
  return response.items.map(mapApiProduct);
}
