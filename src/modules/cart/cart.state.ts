// Cart state and its persistence in localStorage. No DOM rendering.
import { isPositiveInteger } from '../../shared/validation.ts';
import { isValidQuantity, MAX_QUANTITY, sanitizeCart } from './cart.logic.ts';
import type { Cart, CartStorage, CartStore } from './cart.types.ts';

export const STORAGE_KEY = 'giftlab.cart.v1';

export function createCartStore(storage: CartStorage): CartStore {
  let cart: Cart = [];
  let storageMessage = '';
  try {
    const saved = storage.getItem(STORAGE_KEY);
    // JSON.parse cannot know the shape of saved text, so treat it as unknown.
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    cart = sanitizeCart(parsed);
    if (JSON.stringify(parsed) !== JSON.stringify(cart))
      storageMessage = 'تم تجاهل بيانات سلة قديمة أو غير صالحة.';
  } catch {
    storageMessage =
      'تعذّر قراءة السلة المحفوظة. يمكنك استخدام السلة في هذه الجلسة.';
  }
  const persist = () => {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      storageMessage = 'تعذّر حفظ السلة؛ ستبقى متاحة في هذه الجلسة فقط.';
    }
  };
  return {
    snapshot: () => ({ cart: structuredClone(cart), storageMessage }),
    add(productId) {
      if (!isPositiveInteger(productId)) return false;
      const row = cart.find((item) => item.productId === productId);
      if (row?.quantity === MAX_QUANTITY) return false;
      if (row) row.quantity += 1;
      else cart.push({ productId, quantity: 1 });
      persist();
      return true;
    },
    change(productId, quantity) {
      if (!isValidQuantity(quantity)) return;
      cart = cart.map((row) =>
        row.productId === productId ? { ...row, quantity } : row,
      );
      persist();
    },
    remove(productId) {
      cart = cart.filter((row) => row.productId !== productId);
      persist();
    },
    retain(productIds) {
      const kept = cart.filter((row) => productIds.has(row.productId));
      if (kept.length === cart.length) return;
      cart = kept;
      storageMessage = 'أُزيلت من السلة منتجات لم تعد موجودة في الكتالوج.';
      persist();
    },
  };
}

// Access is lazy and guarded by the store, including blocked localStorage getters.
export const browserStorage: CartStorage = {
  getItem: (key) => globalThis.localStorage.getItem(key),
  setItem: (key, value) => globalThis.localStorage.setItem(key, value),
};
