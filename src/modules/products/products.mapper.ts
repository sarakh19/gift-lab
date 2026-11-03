import type { ApiProduct, Product } from './products.types.ts';

// Converts the API's field names and shape into the app's Product model.
// Fields the API does not provide are left empty, never guessed.
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
