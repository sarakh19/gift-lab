import { ApiError } from '../../shared/api/client.ts';
import {
  byId,
  closestFromEvent,
  escapeHTML,
  focusIfPossible,
  optionHTML,
} from '../../shared/dom.ts';
import { findById } from '../../shared/validation.ts';
import type { Motion } from '../../shared/ui/motion.ts';
import type { Pickers } from '../../shared/ui/select-picker.ts';
import { fetchProducts } from './products.api.ts';
import {
  FILTER_KEYS,
  filterProducts,
  formatPrice,
  isFilterKey,
  listCategories,
  OCCASIONS,
  parseFilters,
} from './products.logic.ts';
import type {
  FilterKey,
  Product,
  ProductFilters,
  ProductsState,
} from './products.types.ts';

interface ProductsUIOptions {
  pickers: Pickers;
  motion: Motion;
  onAddToCart: (product: Product) => void;
  onCatalogLoaded: (products: readonly Product[]) => void;
}

const FILTER_LABELS: Readonly<Record<FilterKey, string>> = {
  search: 'البحث',
  category: 'النوع',
  occasion: 'المناسبة',
  sort: 'الترتيب',
};

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
    : `<button class="add-button" disabled>غير متوفر</button>`;
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

export function initProductsUI({
  pickers,
  motion,
  onAddToCart,
  onCatalogLoaded,
}: ProductsUIOptions): { load: () => Promise<void> } {
  const filtersForm = byId('filters', HTMLFormElement);
  const searchInput = byId('search', HTMLInputElement);
  const categorySelect = byId('category', HTMLSelectElement);
  const occasionSelect = byId('occasion', HTMLSelectElement);
  const sortSelect = byId('sort', HTMLSelectElement);
  const filterControls: Record<
    FilterKey,
    HTMLInputElement | HTMLSelectElement
  > = {
    search: searchInput,
    category: categorySelect,
    occasion: occasionSelect,
    sort: sortSelect,
  };
  const occasionLinks = byId('occasion-links', HTMLElement);
  const activeFilters = byId('active-filters', HTMLElement);
  const resultsCount = byId('results-count', HTMLElement);
  const productGrid = byId('products', HTMLElement);
  const catalog = byId('catalog', HTMLElement);
  let state: ProductsState = { status: 'loading' };
  let renderedProducts = false;

  occasionSelect.insertAdjacentHTML('beforeend', optionHTML(OCCASIONS));
  filtersForm.querySelectorAll('select').forEach(pickers.enhance);
  occasionLinks.innerHTML = OCCASIONS.map(
    (occasion) =>
      `<button class="occasion-card" data-occasion="${occasion}" aria-pressed="false">${occasion}</button>`,
  ).join('');

  const readFilters = (): ProductFilters => {
    const data = new FormData(filtersForm);
    const text = (key: FilterKey) => {
      const value = data.get(key);
      return typeof value === 'string' ? value : '';
    };
    return parseFilters({
      search: text('search'),
      category: text('category'),
      occasion: text('occasion'),
      sort: text('sort'),
    });
  };
  const renderActiveFilters = (filters: ProductFilters) => {
    activeFilters.innerHTML = FILTER_KEYS.filter(
      (key) =>
        filters[key].trim() && !(key === 'sort' && filters[key] === 'featured'),
    )
      .map((key) => {
        const text =
          key === 'sort'
            ? (sortSelect.selectedOptions[0]?.textContent ?? '')
            : filters[key];
        return `<button type="button" class="filter-chip" data-clear-filter="${key}" aria-label="إزالة فلتر ${FILTER_LABELS[key]}: ${escapeHTML(text)}">${FILTER_LABELS[key]}: ${escapeHTML(text)} <span aria-hidden="true">×</span></button>`;
      })
      .join('');
  };
  // One render function for all four request states.
  const renderProducts = () => {
    const filters = readFilters();
    pickers.sync();
    searchInput.classList.toggle('is-active', Boolean(filters.search.trim()));
    renderActiveFilters(filters);
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
        const visible = filterProducts(state.products, filters);
        resultsCount.textContent = `${visible.length} منتج · الأسعار كما وردت من مصدر البيانات دون تحديد العملة`;
        productGrid.innerHTML = visible.length
          ? visible.map(productCardHTML).join('')
          : STATE_HTML.noMatches;
        if (renderedProducts)
          motion.play(productGrid, [{ opacity: 0.65 }, { opacity: 1 }], 140);
        renderedProducts = true;
      }
    }
    occasionLinks.querySelectorAll('[data-occasion]').forEach((button) => {
      if (button instanceof HTMLElement)
        button.setAttribute(
          'aria-pressed',
          String(button.dataset.occasion === filters.occasion),
        );
    });
  };
  const setState = (next: ProductsState) => {
    state = next;
    renderProducts();
  };
  // Category options come from the API data, not from a hard-coded list.
  const fillCategories = (products: readonly Product[]) => {
    const current = categorySelect.value;
    categorySelect.length = 1; // Keep only "كل الأنواع".
    categorySelect.insertAdjacentHTML(
      'beforeend',
      optionHTML(listCategories(products)),
    );
    categorySelect.value = current;
    if (categorySelect.selectedIndex < 0) categorySelect.selectedIndex = 0;
    pickers.refresh(categorySelect);
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
    fillCategories(products);
    setState(
      products.length ? { status: 'success', products } : { status: 'empty' },
    );
    onCatalogLoaded(products);
  };

  activeFilters.addEventListener('click', (event) => {
    const button = closestFromEvent(event, '[data-clear-filter]');
    const key = button?.dataset.clearFilter;
    if (!isFilterKey(key)) return;
    filterControls[key].value = key === 'sort' ? 'featured' : '';
    renderProducts();
    focusIfPossible(
      key === 'search'
        ? searchInput
        : document.querySelector(`[data-select="${key}"] .select-trigger`),
    );
  });
  filtersForm.addEventListener('submit', (event) => event.preventDefault());
  filtersForm.addEventListener('input', renderProducts);
  filtersForm.addEventListener('reset', () => {
    setTimeout(renderProducts, 0);
  });
  occasionLinks.addEventListener('click', (event) => {
    const button = closestFromEvent(event, '[data-occasion]');
    if (!button) return;
    occasionSelect.value = button.dataset.occasion ?? '';
    renderProducts();
    catalog.scrollIntoView({ behavior: motion.scrollBehavior() });
  });
  productGrid.addEventListener('click', (event) => {
    if (closestFromEvent(event, '[data-retry]')) {
      void load();
      return;
    }
    if (closestFromEvent(event, '[data-reset]')) {
      filtersForm.reset();
      return;
    }
    if (state.status !== 'success') return;
    const button = closestFromEvent(event, '[data-product]');
    const product = findById(state.products, Number(button?.dataset.product));
    if (product?.inStock) onAddToCart(product);
  });
  renderProducts();
  return { load };
}
