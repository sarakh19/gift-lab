import test from 'node:test';
import assert from 'node:assert/strict';
import { cartTotals, sanitizeCart } from '../src/modules/cart/cart.logic.ts';
import {
  createCartStore,
  STORAGE_KEY,
} from '../src/modules/cart/cart.state.ts';

const products = [
  {
    id: 1,
    name: 'A',
    category: 'Bags',
    priceCents: 8900,
    inStock: true,
    occasions: [],
  },
  {
    id: 2,
    name: 'B',
    category: 'Bags',
    priceCents: 4900,
    inStock: true,
    occasions: [],
  },
];
const memory = () => {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
};

test('adding merges by product, totals use catalog prices, and the cart survives a refresh', () => {
  const storage = memory();
  const store = createCartStore(storage);
  assert.equal(store.add(1), true);
  store.add(1);
  store.add(2);
  assert.equal(store.snapshot().cart.length, 2);
  assert.deepEqual(cartTotals(store.snapshot().cart, products), {
    count: 3,
    amountCents: 22700,
  });
  const restored = createCartStore(storage);
  assert.deepEqual(restored.snapshot().cart, store.snapshot().cart);
  restored.change(1, 4);
  assert.equal(cartTotals(restored.snapshot().cart, products).count, 5);
  restored.remove(1);
  assert.equal(restored.snapshot().cart.length, 1);
  assert.equal(restored.add(0), false);
});

test('corrupt, old-format, hostile and inaccessible storage is safe', () => {
  const storage = memory();
  storage.setItem(STORAGE_KEY, '{bad');
  assert.deepEqual(createCartStore(storage).snapshot().cart, []);
  assert.deepEqual(
    sanitizeCart([
      null,
      { productId: 1, quantity: -3 },
      { productId: 'p1', options: {}, quantity: 1 },
      { productId: 1.5, quantity: 1 },
    ]),
    [],
  );
  storage.setItem(
    STORAGE_KEY,
    JSON.stringify([{ productId: 1, quantity: 1, password: 'never keep' }]),
  );
  createCartStore(storage).add(1);
  assert.equal(storage.getItem(STORAGE_KEY).includes('password'), false);
  const blocked = createCartStore({
    getItem() {
      throw Error('blocked');
    },
    setItem() {
      throw Error('quota');
    },
  });
  assert.equal(blocked.add(1), true);
  assert.match(blocked.snapshot().storageMessage, /تعذّر حفظ/);
});

test('quantity limits and catalog retention', () => {
  const store = createCartStore(memory());
  store.add(1);
  for (const value of [0, -1, 1.5, 100, NaN]) store.change(1, value);
  assert.equal(store.snapshot().cart[0].quantity, 1);
  store.change(1, 99);
  assert.equal(store.add(1), false);
  store.add(7);
  store.retain(new Set([1, 2]));
  assert.deepEqual(store.snapshot().cart, [{ productId: 1, quantity: 99 }]);
  assert.match(store.snapshot().storageMessage, /لم تعد موجودة/);
});

test('decreasing at quantity 1 removes the product, and clear empties the cart', () => {
  const storage = memory();
  const store = createCartStore(storage);
  store.add(1);
  store.add(1);
  store.add(2);
  store.decrease(1);
  assert.deepEqual(store.snapshot().cart, [
    { productId: 1, quantity: 1 },
    { productId: 2, quantity: 1 },
  ]);
  store.decrease(1);
  assert.deepEqual(store.snapshot().cart, [{ productId: 2, quantity: 1 }]);
  store.decrease(99);
  assert.equal(store.snapshot().cart.length, 1);
  store.clear();
  assert.deepEqual(store.snapshot().cart, []);
  assert.deepEqual(createCartStore(storage).snapshot().cart, []);
});
