import './styles.css';
import { initAccountUI } from './modules/account/account.ui.ts';
import { browserStorage, createCartStore } from './modules/cart/cart.state.ts';
import { initCartUI } from './modules/cart/cart.ui.ts';
import { initFiltersUI } from './modules/filters/filters.ui.ts';
import { renderHomeImages } from './modules/home/home.ui.ts';
import { createNotifier } from './modules/notifications/notifications.ui.ts';
import { listCategories } from './modules/products/products.logic.ts';
import { initProductsUI } from './modules/products/products.ui.ts';
import { byId } from './shared/dom.ts';
import { initDialogs } from './shared/ui/dialogs.ts';
import { createMotion } from './shared/ui/motion.ts';
import { createPickers } from './shared/ui/select-picker.ts';

// Startup only: create shared services, then connect the feature modules.
const pickers = createPickers();
const motion = createMotion();
initDialogs(() => pickers.close());
renderHomeImages();
initAccountUI();
const cart = initCartUI({
  store: createCartStore(browserStorage),
  motion,
  notify: createNotifier(byId('announcement', HTMLElement)),
});
const filters = initFiltersUI({ pickers, motion });
const products = initProductsUI({
  motion,
  getFilters: filters.read,
  resetFilters: filters.reset,
  onAddToCart: cart.addProduct,
  onCatalogLoaded: (catalog) => {
    filters.setCategories(listCategories(catalog));
    cart.setProducts(catalog);
  },
});
filters.onChange(products.render);
void products.load();
motion.observe();
