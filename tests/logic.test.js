import test from 'node:test';
import assert from 'node:assert/strict';
import { products } from '../src/data.js';
import {
  filterProducts,
  itemKey,
  sanitizeCart,
  cartTotals,
} from '../src/logic.js';
import { createStore, STORAGE_KEY } from '../src/state.js';
const options = { اللون: 'رملي', التغليف: 'قماش' };
const memory = () => {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
};

test('catalog has 12 unique products; combined filters and sorting preserve source', () => {
  assert.equal(products.length, 12);
  assert.equal(new Set(products.map((p) => p.id)).size, 12);
  const before = JSON.stringify(products);
  const result = filterProducts(products, {
    search: 'مِبْخَرَة',
    category: 'مباخر',
    occasion: 'رمضان',
    sort: 'desc',
  });
  assert.deepEqual(
    result.map((p) => p.price),
    [95, 85],
  );
  assert.equal(JSON.stringify(products), before);
  assert.equal(filterProducts(products, { search: 'غير موجود' }).length, 0);
});
test('customizations merge by canonical options and remain distinct across refresh', () => {
  const storage = memory();
  const store = createStore(storage);
  assert.equal(store.add('p1', options), true);
  store.add('p1', { التغليف: 'قماش', اللون: 'رملي' });
  store.add('p1', { ...options, اللون: 'عاجي' });
  assert.equal(store.snapshot().cart.length, 2);
  assert.deepEqual(cartTotals(store.snapshot().cart, products), {
    count: 3,
    amount: 255,
  });
  const restored = createStore(storage);
  assert.deepEqual(restored.snapshot().cart, store.snapshot().cart);
  restored.change(itemKey('p1', options), 4);
  assert.equal(cartTotals(restored.snapshot().cart, products).count, 5);
  restored.remove(itemKey('p1', options));
  assert.equal(restored.snapshot().cart.length, 1);
  assert.equal(restored.add('p1', { اللون: 'invalid' }), false);
});
test('corrupt, hostile, and inaccessible storage is safe', () => {
  const storage = memory();
  storage.setItem(STORAGE_KEY, '{bad');
  assert.deepEqual(createStore(storage).snapshot().cart, []);
  assert.deepEqual(
    sanitizeCart(
      [
        null,
        { productId: 'p1', options, quantity: -3 },
        { productId: 'missing', options, quantity: 2 },
        {
          productId: 'p1',
          options: { ...options, password: 'x' },
          quantity: 1,
        },
      ],
      products,
    ),
    [],
  );
  storage.setItem(
    STORAGE_KEY,
    JSON.stringify([
      { productId: 'p1', options, quantity: 1, password: 'never keep' },
    ]),
  );
  const store = createStore(storage);
  store.add('p1', options);
  assert.equal(storage.getItem(STORAGE_KEY).includes('password'), false);
  const blocked = createStore({
    getItem() {
      throw Error('blocked');
    },
    setItem() {
      throw Error('quota');
    },
  });
  assert.equal(blocked.add('p1', options), true);
  assert.match(blocked.snapshot().storageMessage, /تعذّر حفظ/);
});
test('quantity limits, invalid quantities and untrusted totals cannot affect prices', () => {
  const store = createStore(memory());
  store.add('p1', options);
  const key = itemKey('p1', options);
  for (const value of [0, -1, 1.5, 100, NaN]) store.change(key, value);
  assert.equal(store.snapshot().cart[0].quantity, 1);
  store.change(key, 99);
  assert.equal(store.add('p1', options), false);
  assert.deepEqual(cartTotals(store.snapshot().cart, products), {
    count: 99,
    amount: 8415,
  });
});
