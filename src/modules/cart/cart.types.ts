// Only ids and quantities are stored; names and prices always come from the catalog.
export interface CartItem {
  productId: number;
  quantity: number;
}

export type Cart = CartItem[];

export interface CartTotals {
  count: number;
  amountCents: number;
}

// The application state owned by the cart store.
export interface CartState {
  cart: Cart;
  storageMessage: string;
}

// The subset of the Web Storage API the store needs; tests pass an in-memory copy.
export type CartStorage = Pick<Storage, 'getItem' | 'setItem'>;

export interface CartStore {
  snapshot(): CartState;
  add(productId: number): boolean;
  change(productId: number, quantity: number): void;
  remove(productId: number): void;
  // Drops saved rows whose product is no longer in the loaded catalog.
  retain(productIds: ReadonlySet<number>): void;
}
