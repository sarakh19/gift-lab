import { products } from './data.js';
import { itemKey, MAX_QUANTITY, sanitizeCart, validOptions } from './logic.js';

export const STORAGE_KEY = 'giftlab.cart.v1';

export function createStore(storage) {
  let cart = [];
  let storageMessage = '';
  try {
    const saved = storage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    cart = sanitizeCart(parsed, products);
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
    add(productId, options) {
      const product = products.find((item) => item.id === productId);
      if (!product || !validOptions(product, options)) return false;
      const key = itemKey(productId, options);
      const row = cart.find((item) => item.key === key);
      if (row?.quantity === MAX_QUANTITY) return false;
      if (row) row.quantity += 1;
      else cart.push({ key, productId, options: { ...options }, quantity: 1 });
      persist();
      return true;
    },
    change(key, quantity) {
      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > MAX_QUANTITY
      )
        return;
      cart = cart.map((row) => (row.key === key ? { ...row, quantity } : row));
      persist();
    },
    remove(key) {
      cart = cart.filter((row) => row.key !== key);
      persist();
    },
  };
}

// Access is lazy and guarded by the store, including blocked localStorage getters.
export const browserStorage = {
  getItem: (key) => globalThis.localStorage.getItem(key),
  setItem: (key, value) => globalThis.localStorage.setItem(key, value),
};
