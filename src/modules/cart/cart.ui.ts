import {
  byId,
  closestFromEvent,
  escapeHTML,
  focusIfPossible,
} from '../../shared/dom.ts';
import { findById } from '../../shared/validation.ts';
import type { Motion } from '../../shared/ui/motion.ts';
import type { Toaster } from '../../shared/ui/toast.ts';
import { formatPrice } from '../products/products.logic.ts';
import type { Product } from '../products/products.types.ts';
import { cartTotals, MAX_QUANTITY } from './cart.logic.ts';
import type { CartItem, CartStore } from './cart.types.ts';

interface CartUIOptions {
  store: CartStore;
  motion: Motion;
  toaster: Toaster;
}

export interface CartUI {
  addProduct: (product: Product) => void;
  setProducts: (products: readonly Product[]) => void;
}

const EMPTY_CART_HTML =
  '<p class="empty">سلتك تنتظر هدية تفرّح غاليك. اختاري اللي يناسب مناسبتك.</p>';
const WAITING_FOR_CATALOG_HTML =
  '<p class="empty">تظهر تفاصيل السلة بعد تحميل المنتجات.</p>';

const cartRowHTML = (row: CartItem, index: number, product: Product) => {
  const name = escapeHTML(product.name);
  return `<article class="cart-row" data-index="${index}"><h3 dir="auto">${name}</h3><p dir="auto">${escapeHTML(product.category)}</p><div class="quantity"><button class="quiet" data-action="decrease" aria-label="تقليل كمية ${name}" ${row.quantity === 1 ? 'disabled' : ''}>−</button><label for="quantity-${index}">الكمية</label><input id="quantity-${index}" data-action="quantity" type="number" min="1" max="${MAX_QUANTITY}" step="1" value="${row.quantity}" required /><button class="quiet" data-action="increase" aria-label="زيادة كمية ${name}" ${row.quantity === MAX_QUANTITY ? 'disabled' : ''}>+</button><button class="quiet remove" data-action="remove">حذف</button><strong>${formatPrice(product.priceCents * row.quantity)}</strong></div></article>`;
};

export function initCartUI({ store, motion, toaster }: CartUIOptions): CartUI {
  const cartCount = byId('cart-count', HTMLElement);
  const cartTotal = byId('cart-total', HTMLElement);
  const storageStatus = byId('storage-status', HTMLElement);
  const cartItems = byId('cart-items', HTMLElement);
  const cartOpen = byId('cart-open', HTMLButtonElement);
  const cartDialog = byId('cart-dialog', HTMLDialogElement);
  let products: readonly Product[] = [];
  let catalogLoaded = false;

  const renderCart = () => {
    const { cart, storageMessage } = store.snapshot();
    const total = cartTotals(cart, products);
    cartCount.textContent = String(total.count);
    cartTotal.textContent = formatPrice(total.amountCents);
    storageStatus.textContent = storageMessage;
    if (!cart.length) {
      cartItems.innerHTML = EMPTY_CART_HTML;
      return;
    }
    if (!catalogLoaded) {
      cartItems.innerHTML = WAITING_FOR_CATALOG_HTML;
      return;
    }
    cartItems.innerHTML = cart
      .map((row, index) => {
        const product = findById(products, row.productId);
        return product ? cartRowHTML(row, index, product) : '';
      })
      .join('');
  };
  // Reads the cart row index stored on the nearest [data-index] ancestor.
  const rowIndexOf = (element: Element): number | undefined => {
    const row = element.closest('[data-index]');
    return row instanceof HTMLElement ? Number(row.dataset.index) : undefined;
  };

  // A single delegated listener serves all current and future cart rows.
  cartItems.addEventListener('click', (event) => {
    const button = closestFromEvent(event, 'button[data-action]');
    if (!button) return;
    const index = rowIndexOf(button);
    const row = index === undefined ? undefined : store.snapshot().cart[index];
    if (index === undefined || !row) return;
    const action = button.dataset.action;
    if (action === 'remove') store.remove(row.productId);
    else
      store.change(
        row.productId,
        row.quantity + (action === 'increase' ? 1 : -1),
      );
    renderCart();
    // Re-rendering replaces buttons: restore keyboard focus to the nearby row.
    const nextButton = cartItems.querySelector(
      `[data-index="${Math.min(index, store.snapshot().cart.length - 1)}"] button:not(:disabled)`,
    );
    focusIfPossible(nextButton ?? cartDialog.querySelector('[data-close]'));
  });
  cartItems.addEventListener('change', (event) => {
    const input = event.target;
    if (
      !(input instanceof HTMLInputElement) ||
      !input.matches('[data-action="quantity"]')
    )
      return;
    if (!input.checkValidity()) {
      input.reportValidity();
      return;
    }
    const index = rowIndexOf(input);
    const row = index === undefined ? undefined : store.snapshot().cart[index];
    if (!row) return;
    store.change(row.productId, Number(input.value));
    renderCart();
    focusIfPossible(document.getElementById(`quantity-${index}`));
  });
  cartOpen.addEventListener('click', () => cartDialog.showModal());
  cartDialog.addEventListener('close', () => cartOpen.focus());
  renderCart();

  return {
    addProduct(product) {
      const previousMessage = store.snapshot().storageMessage;
      const success = store.add(product.id);
      renderCart();
      if (!success) {
        toaster.error(
          `تعذّرت الإضافة: الحد الأقصى ${MAX_QUANTITY} قطعة لكل منتج.`,
        );
        return;
      }
      motion.play(
        cartCount,
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.18)' },
          { transform: 'scale(1)' },
        ],
        200,
      );
      toaster.success(`تمّت إضافة ${product.name} إلى السلة`);
      // Added in memory, but saving to localStorage failed (blocked or full).
      const { storageMessage } = store.snapshot();
      if (storageMessage && storageMessage !== previousMessage)
        toaster.error(storageMessage);
    },
    setProducts(nextProducts) {
      products = nextProducts;
      catalogLoaded = true;
      store.retain(new Set(nextProducts.map((product) => product.id)));
      renderCart();
    },
  };
}
