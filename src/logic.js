export const MAX_QUANTITY = 99; // Demo UI limit, not stock or minimum-order policy.
export const normalize = (value) =>
  String(value)
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .trim()
    .toLowerCase();

export function filterProducts(products, filters) {
  const term = normalize(filters.search || '');
  const result = products.filter(
    (product) =>
      normalize(
        `${product.name} ${product.description} ${product.category}`,
      ).includes(term) &&
      (!filters.category || product.category === filters.category) &&
      (!filters.occasion || product.occasions.includes(filters.occasion)),
  );
  if (filters.sort === 'asc') result.sort((a, b) => a.price - b.price);
  if (filters.sort === 'desc') result.sort((a, b) => b.price - a.price);
  return result;
}

export function validOptions(product, options) {
  return (
    options &&
    typeof options === 'object' &&
    !Array.isArray(options) &&
    Object.keys(options).length === Object.keys(product.options).length &&
    Object.entries(product.options).every(([key, values]) =>
      values.includes(options[key]),
    )
  );
}

export function itemKey(productId, options) {
  return JSON.stringify([
    productId,
    Object.entries(options).sort(([a], [b]) => a.localeCompare(b)),
  ]);
}

export function sanitizeCart(value, products) {
  if (!Array.isArray(value)) return [];
  const merged = new Map();
  for (const row of value) {
    if (!row || typeof row !== 'object') continue;
    const product = products.find((item) => item.id === row.productId);
    if (
      !product ||
      !validOptions(product, row.options) ||
      !Number.isInteger(row.quantity) ||
      row.quantity < 1 ||
      row.quantity > MAX_QUANTITY
    )
      continue;
    const key = itemKey(product.id, row.options);
    const quantity = Math.min(
      MAX_QUANTITY,
      (merged.get(key)?.quantity || 0) + row.quantity,
    );
    merged.set(key, {
      key,
      productId: product.id,
      options: { ...row.options },
      quantity,
    });
  }
  return [...merged.values()];
}

export function cartTotals(cart, products) {
  return cart.reduce(
    (total, row) => {
      const product = products.find((item) => item.id === row.productId);
      if (product) {
        total.count += row.quantity;
        total.amount += product.price * row.quantity;
      }
      return total;
    },
    { count: 0, amount: 0 },
  );
}
