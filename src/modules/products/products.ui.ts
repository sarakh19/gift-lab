import { ApiError } from '../../shared/api/client.ts';
import { byId, closestFromEvent, escapeHTML } from '../../shared/dom.ts';
import { findById } from '../../shared/validation.ts';
import type { Motion } from '../../shared/ui/motion.ts';
import { filterProducts } from '../filters/filters.logic.ts';
import type { ProductFilters } from '../filters/filters.types.ts';
import { fetchProducts } from './products.api.ts';
import { formatPrice } from './products.logic.ts';
import type { Product, ProductsState } from './products.types.ts';

interface ProductsUIOptions {
  motion: Motion;
  getFilters: () => ProductFilters;
  resetFilters: () => void;
  onAddToCart: (product: Product) => void;
  onCatalogLoaded: (products: readonly Product[]) => void;
}

export interface ProductsUI {
  load(): Promise<void>;
  render(): void;
}

const ERROR_MESSAGES: Readonly<Record<ApiError['kind'], string>> = {
  network: 'تعذّر الاتصال بالخادم. تأكدي من الإنترنت ثم حاولي مرة ثانية.',
  timeout: 'استغرق تحميل المنتجات وقتًا أطول من المتوقع.',
  http: 'الخادم لم يُرجع المنتجات بنجاح.',
  parse: 'وصل رد غير مفهوم من الخادم.',
  validation: 'بيانات المنتجات الواردة غير مكتملة أو غير صالحة.',
};

const describeError = (error: unknown): string =>
  error instanceof ApiError
    ? ERROR_MESSAGES[error.kind]
    : 'حدث خطأ غير متوقع أثناء تحميل المنتجات.';

const productCardHTML = (product: Product): string => {
  const name = escapeHTML(product.name);
  const action = product.inStock
    ? `<button class="add-button" data-product="${product.id}" aria-label="أضف للسلة: ${name}">أضف للسلة <span aria-hidden="true">+</span></button>`
    : `<button class="add-button" disabled aria-label="غير متوفر: ${name}">غير متوفر</button>`;
  return `<article class="product-card"><div class="product-art product-art--placeholder"><p>لا توجد صورة من مصدر البيانات</p></div><div class="product-content"><p class="product-category" dir="auto">${escapeHTML(product.category)}</p><h3 dir="auto">${name}</h3><p>${product.inStock ? 'متوفر' : 'غير متوفر حاليًا'}</p><div class="product-bottom"><div><strong>${formatPrice(product.priceCents)}</strong></div>${action}</div></div></article>`;
};

const STATE_HTML = {
  loading:
    '<div class="empty"><h3>جارٍ تحميل المنتجات…</h3><p>لحظات ونعرض لك المنتجات.</p></div>',
  empty:
    '<div class="empty"><h3>لا توجد منتجات حاليًا</h3><p>مصدر البيانات لم يُرجع أي منتج.</p></div>',
  noMatches:
    '<div class="empty"><h3>ما لقينا هدية بهالاختيارات</h3><p>جرّبي كلمة ثانية أو امسحي الفلاتر وشوفي كل الهدايا.</p><button class="quiet" data-reset>عرض كل الهدايا</button></div>',
  error: (message: string) =>
    `<div class="empty"><h3>تعذّر تحميل المنتجات</h3><p>${escapeHTML(message)}</p><button class="quiet" data-retry>إعادة المحاولة</button></div>`,
};

const FADE_IN_MS = 140;

export function initProductsUI({
  motion,
  getFilters,
  resetFilters,
  onAddToCart,
  onCatalogLoaded,
}: ProductsUIOptions): ProductsUI {
  const resultsCount = byId('results-count', HTMLElement);
  const productGrid = byId('products', HTMLElement);
  let state: ProductsState = { status: 'loading' };
  let renderedProducts = false;

  // One render function for all four request states.
  const render = () => {
    productGrid.setAttribute('aria-busy', String(state.status === 'loading'));
    switch (state.status) {
      case 'loading':
        resultsCount.textContent = 'جارٍ تحميل المنتجات…';
        productGrid.innerHTML = STATE_HTML.loading;
        break;
      case 'error':
        resultsCount.textContent = 'تعذّر تحميل المنتجات.';
        productGrid.innerHTML = STATE_HTML.error(state.message);
        break;
      case 'empty':
        resultsCount.textContent = '0 منتج';
        productGrid.innerHTML = STATE_HTML.empty;
        break;
      case 'success': {
        const visible = filterProducts(state.products, getFilters());
        resultsCount.textContent = `${visible.length} منتج · الأسعار كما وردت من مصدر البيانات دون تحديد العملة`;
        productGrid.innerHTML = visible.length
          ? visible.map(productCardHTML).join('')
          : STATE_HTML.noMatches;
        if (renderedProducts)
          motion.play(
            productGrid,
            [{ opacity: 0.65 }, { opacity: 1 }],
            FADE_IN_MS,
          );
        renderedProducts = true;
      }
    }
  };
  const setState = (next: ProductsState) => {
    state = next;
    render();
  };
  // Never rejects: every failure becomes the visible error state with a retry button.
  const load = async () => {
    setState({ status: 'loading' });
    let products: Product[];
    try {
      products = await fetchProducts();
    } catch (error) {
      console.error(error);
      setState({ status: 'error', message: describeError(error) });
      return;
    }
    onCatalogLoaded(products);
    setState(
      products.length ? { status: 'success', products } : { status: 'empty' },
    );
  };

  productGrid.addEventListener('click', (event) => {
    if (closestFromEvent(event, '[data-retry]')) {
      void load();
      return;
    }
    if (closestFromEvent(event, '[data-reset]')) {
      resetFilters();
      return;
    }
    if (state.status !== 'success') return;
    const button = closestFromEvent(event, '[data-product]');
    const product = findById(state.products, Number(button?.dataset.product));
    if (product?.inStock) onAddToCart(product);
  });
  render();
  return { load, render };
}
