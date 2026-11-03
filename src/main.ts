import './styles.css';
import { initAccountUI } from './modules/account/account.ui.ts';
import { browserStorage, createCartStore } from './modules/cart/cart.state.ts';
import { initCartUI } from './modules/cart/cart.ui.ts';
import { renderHomeImages } from './modules/home/home.ui.ts';
import { initProductsUI } from './modules/products/products.ui.ts';
import { byId } from './shared/dom.ts';
import { createAnnouncer } from './shared/ui/announcer.ts';
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
  announce: createAnnouncer(byId('announcement', HTMLElement)),
});
const products = initProductsUI({
  pickers,
  motion,
  onAddToCart: cart.addProduct,
  onCatalogLoaded: cart.setProducts,
});
void products.load();
motion.observe();
