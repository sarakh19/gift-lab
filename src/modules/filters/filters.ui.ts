import {
  byId,
  closestFromEvent,
  escapeHTML,
  focusIfPossible,
  optionHTML,
} from '../../shared/dom.ts';
import type { Motion } from '../../shared/ui/motion.ts';
import type { Pickers } from '../../shared/ui/select-picker.ts';
import type { Category } from '../products/products.types.ts';
import {
  FILTER_KEYS,
  isFilterKey,
  OCCASIONS,
  parseFilters,
} from './filters.logic.ts';
import type { FilterKey, ProductFilters } from './filters.types.ts';

interface FiltersUIOptions {
  pickers: Pickers;
  motion: Motion;
}

export interface FiltersUI {
  read(): ProductFilters;
  reset(): void;
  // Category options come from the loaded catalog, not from a hard-coded list.
  setCategories(categories: readonly Category[]): void;
  onChange(listener: () => void): void;
}

const FILTER_LABELS: Readonly<Record<FilterKey, string>> = {
  search: 'البحث',
  category: 'النوع',
  occasion: 'المناسبة',
  sort: 'الترتيب',
};

export function initFiltersUI({
  pickers,
  motion,
}: FiltersUIOptions): FiltersUI {
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
  const catalog = byId('catalog', HTMLElement);
  const listeners = new Set<() => void>();

  occasionSelect.insertAdjacentHTML('beforeend', optionHTML(OCCASIONS));
  filtersForm.querySelectorAll('select').forEach(pickers.enhance);
  occasionLinks.innerHTML = OCCASIONS.map(
    (occasion) =>
      `<button class="occasion-card" data-occasion="${occasion}" aria-pressed="false">${occasion}</button>`,
  ).join('');

  const read = (): ProductFilters => {
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
  // Updates the filter UI itself, then tells listeners (the catalog) to re-render.
  const update = () => {
    const filters = read();
    pickers.sync();
    searchInput.classList.toggle('is-active', Boolean(filters.search.trim()));
    renderActiveFilters(filters);
    occasionLinks.querySelectorAll('[data-occasion]').forEach((button) => {
      if (button instanceof HTMLElement)
        button.setAttribute(
          'aria-pressed',
          String(button.dataset.occasion === filters.occasion),
        );
    });
    listeners.forEach((listener) => listener());
  };

  activeFilters.addEventListener('click', (event) => {
    const button = closestFromEvent(event, '[data-clear-filter]');
    const key = button?.dataset.clearFilter;
    if (!isFilterKey(key)) return;
    filterControls[key].value = key === 'sort' ? 'featured' : '';
    update();
    focusIfPossible(
      key === 'search'
        ? searchInput
        : document.querySelector(`[data-select="${key}"] .select-trigger`),
    );
  });
  filtersForm.addEventListener('submit', (event) => event.preventDefault());
  filtersForm.addEventListener('input', update);
  // Form values only change after the reset event finishes.
  filtersForm.addEventListener('reset', () => {
    setTimeout(update, 0);
  });
  occasionLinks.addEventListener('click', (event) => {
    const button = closestFromEvent(event, '[data-occasion]');
    if (!button) return;
    occasionSelect.value = button.dataset.occasion ?? '';
    update();
    catalog.scrollIntoView({ behavior: motion.scrollBehavior() });
  });
  update();

  return {
    read,
    reset: () => filtersForm.reset(),
    setCategories(categories) {
      const current = categorySelect.value;
      categorySelect.length = 1; // Keep only "كل الأنواع".
      categorySelect.insertAdjacentHTML('beforeend', optionHTML(categories));
      categorySelect.value = current;
      if (categorySelect.selectedIndex < 0) categorySelect.selectedIndex = 0;
      pickers.refresh(categorySelect);
    },
    onChange(listener) {
      listeners.add(listener);
    },
  };
}
