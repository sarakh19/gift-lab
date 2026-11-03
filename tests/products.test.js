import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ApiError, getJson } from '../src/shared/api/client.ts';
import {
  fetchProducts,
  mapApiProduct,
  parseProductsResponse,
} from '../src/modules/products/products.api.ts';
import {
  filterProducts,
  formatPrice,
  listCategories,
  parseFilters,
} from '../src/modules/products/products.logic.ts';

// A real response saved from https://shopboard-api.vercel.app/api/products.
const fixture = JSON.parse(
  await readFile(
    new URL('./fixtures/products-response.json', import.meta.url),
    'utf8',
  ),
);
const products = parseProductsResponse(fixture).items.map(mapApiProduct);

const withFetch = async (fakeFetch, run) => {
  const original = globalThis.fetch;
  globalThis.fetch = fakeFetch;
  try {
    await run();
  } finally {
    globalThis.fetch = original;
  }
};

test('mapper converts API fields to the internal Product model', () => {
  assert.deepEqual(mapApiProduct(fixture.items[0]), {
    id: 1,
    name: 'Leather Tote Bag',
    category: 'Bags',
    priceCents: 8900,
    inStock: true,
    occasions: [],
  });
  assert.equal(products.length, 12);
  assert.deepEqual(listCategories(products), ['Bags', 'Shoes', 'Accessories']);
});

test('runtime validation rejects malformed API data instead of guessing', () => {
  const invalid = [
    null,
    [],
    { total: 1 },
    { items: [{ ...fixture.items[0], price_cents: '89' }], total: 1 },
    { items: [{ ...fixture.items[0], title: '' }], total: 1 },
    { items: [fixture.items[0], fixture.items[0]], total: 2 },
  ];
  for (const data of invalid)
    assert.throws(
      () => parseProductsResponse(data),
      (error) => error instanceof ApiError && error.kind === 'validation',
    );
  assert.deepEqual(parseProductsResponse({ items: [], total: 0 }).items, []);
});

test('search, category, occasion and sorting work on API products without mutation', () => {
  const before = JSON.stringify(products);
  const bags = filterProducts(products, {
    search: 'BAG',
    category: 'Bags',
    sort: 'desc',
  });
  assert.deepEqual(
    bags.map((product) => product.name),
    [
      'Travel Duffel Bag',
      'Leather Tote Bag',
      'Canvas Backpack',
      'Mini Crossbody Bag',
    ],
  );
  assert.equal(filterProducts(products, { sort: 'asc' })[0].name, 'Wool Scarf');
  assert.equal(filterProducts(products, { occasion: 'رمضان' }).length, 0);
  assert.equal(JSON.stringify(products), before);
  assert.deepEqual(
    parseFilters({
      search: 'x',
      category: 'Shoes',
      occasion: 'bad',
      sort: '?',
    }),
    { search: 'x', category: 'Shoes', occasion: '', sort: 'featured' },
  );
  assert.equal(
    formatPrice(8900),
    new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 2,
    }).format(89),
  );
});

test('HTTP client: success, HTTP error, bad JSON and network failure', async () => {
  await withFetch(
    async () => new Response(JSON.stringify(fixture), { status: 200 }),
    async () => assert.equal((await fetchProducts()).length, 12),
  );
  await withFetch(
    async () => new Response('down', { status: 503 }),
    () =>
      assert.rejects(fetchProducts(), (error) => {
        return (
          error instanceof ApiError &&
          error.kind === 'http' &&
          error.status === 503
        );
      }),
  );
  await withFetch(
    async () => new Response('{oops', { status: 200 }),
    () =>
      assert.rejects(
        getJson('https://example.test', (data) => data),
        (error) => error instanceof ApiError && error.kind === 'parse',
      ),
  );
  await withFetch(
    async () => {
      throw new TypeError('Failed to fetch');
    },
    () =>
      assert.rejects(
        fetchProducts(),
        (error) => error instanceof ApiError && error.kind === 'network',
      ),
  );
});
