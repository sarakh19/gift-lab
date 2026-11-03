// Pure cart functions: no DOM, no localStorage.
import {
  findById,
  isPositiveInteger,
  isRecord,
} from '../../shared/validation.ts';
import type { Product } from '../products/products.types.ts';
import type { Cart, CartItem, CartTotals } from './cart.types.ts';

export const MAX_QUANTITY = 99; // Demo UI limit, not stock or minimum-order policy.

export const isValidQuantity = (value: unknown): value is number =>
  isPositiveInteger(value) && value <= MAX_QUANTITY;

// Stored data is untrusted: keep only well-formed rows and merge duplicates.
export function sanitizeCart(value: unknown): Cart {
  if (!Array.isArray(value)) return [];
  const rows: readonly unknown[] = value;
  const merged = new Map<number, CartItem>();
  for (const row of rows) {
    if (!isRecord(row)) continue;
    const { productId, quantity } = row;
    if (!isPositiveInteger(productId) || !isValidQuantity(quantity)) continue;
    const total = Math.min(
      MAX_QUANTITY,
      (merged.get(productId)?.quantity ?? 0) + quantity,
    );
    merged.set(productId, { productId, quantity: total });
  }
  return [...merged.values()];
}

export function cartTotals(
  cart: readonly CartItem[],
  products: readonly Product[],
): CartTotals {
  return cart.reduce<CartTotals>(
    (total, row) => {
      const product = findById(products, row.productId);
      if (product) {
        total.count += row.quantity;
        total.amountCents += product.priceCents * row.quantity;
      }
      return total;
    },
    { count: 0, amountCents: 0 },
  );
}
