import { categories, occasions, products, homeImages } from './data.js';
import { cartTotals, filterProducts, MAX_QUANTITY } from './logic.js';

const money = (value) => `${new Intl.NumberFormat('ar-SA').format(value)} ر.س`;
const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ],
  );
const optionHTML = (values) =>
  values
    .map(
      (value) =>
        `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`,
    )
    .join('');
const art = (product) =>
  `<div class="product-art"><img src="${escapeHTML(product.image.src)}" alt="${escapeHTML(product.image.alt)} — صورة مؤقتة" loading="lazy" decoding="async" width="800" height="880" /></div>`;

export function initUI(store) {
  const get = (id) => document.getElementById(id);
  const filtersForm = get('filters');
  for (const [key, id] of [
    ['hero', 'hero-image'],
    ['customization', 'customization-image'],
  ]) {
    get(id).src = homeImages[key].src;
    get(id).alt = homeImages[key].alt + ' — صورة فوتوغرافية مؤقتة';
  }
  let selectedProduct;
  let toastTimer;
  const announce = (message) => {
    get('announcement').textContent = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      get('announcement').textContent = '';
    }, 4000);
  };
  get('category').insertAdjacentHTML('beforeend', optionHTML(categories));
  get('occasion').insertAdjacentHTML('beforeend', optionHTML(occasions));
  get('occasion-links').innerHTML = occasions
    .map(
      (occasion) =>
        `<button class="occasion-card" data-occasion="${occasion}" aria-pressed="false">${occasion}</button>`,
    )
    .join('');

  const renderProducts = () => {
    const filters = Object.fromEntries(new FormData(filtersForm));
    const visible = filterProducts(products, filters);
    get('results-count').textContent =
      `${visible.length} هدية · جميع الأسعار تجريبية بالريال السعودي`;
    get('products').innerHTML = visible.length
      ? visible
          .map(
            (product) =>
              `<article class="product-card">${art(product)}<div class="product-content"><p class="product-category">${product.category} · ${product.occasions.join('، ')}</p><h3>${product.name}</h3><p>${product.description}</p><div class="product-bottom"><div><strong>${money(product.price)}</strong><small>سعر تجريبي</small></div><button class="add-button" data-product="${product.id}" aria-label="تخصيص ${product.name} وإضافته">خصّص وأضف <span aria-hidden="true">+</span></button></div></div></article>`,
          )
          .join('')
      : '<div class="empty"><h3>ما لقينا هدية بهالاختيارات</h3><p>جرّبي كلمة ثانية أو امسحي الفلاتر وشوفي كل الهدايا.</p><button class="quiet" data-reset>عرض كل الهدايا</button></div>';
    get('occasion-links')
      .querySelectorAll('[data-occasion]')
      .forEach((button) =>
        button.setAttribute(
          'aria-pressed',
          String(button.dataset.occasion === filters.occasion),
        ),
      );
  };
  const renderCart = () => {
    const { cart, storageMessage } = store.snapshot();
    const total = cartTotals(cart, products);
    get('cart-count').textContent = total.count;
    get('cart-total').textContent = money(total.amount);
    get('storage-status').textContent = storageMessage;
    get('cart-items').innerHTML = cart.length
      ? cart
          .map((row, index) => {
            const product = products.find((item) => item.id === row.productId);
            return `<article class="cart-row" data-index="${index}"><h3>${product.name}</h3><p>${Object.entries(
              row.options,
            )
              .map(([key, value]) => `${escapeHTML(key)}: ${escapeHTML(value)}`)
              .join(
                ' · ',
              )}</p><div class="quantity"><button class="quiet" data-action="decrease" aria-label="تقليل كمية ${product.name}" ${row.quantity === 1 ? 'disabled' : ''}>−</button><label for="quantity-${index}">الكمية</label><input id="quantity-${index}" data-action="quantity" type="number" min="1" max="${MAX_QUANTITY}" step="1" value="${row.quantity}" required /><button class="quiet" data-action="increase" aria-label="زيادة كمية ${product.name}" ${row.quantity === MAX_QUANTITY ? 'disabled' : ''}>+</button><button class="quiet remove" data-action="remove">حذف</button><strong>${money(product.price * row.quantity)}</strong></div></article>`;
          })
          .join('')
      : '<p class="empty">سلتك تنتظر هدية تفرّح غاليك. اختاري اللي يناسب مناسبتك.</p>';
  };
  filtersForm.addEventListener('submit', (event) => event.preventDefault());
  filtersForm.addEventListener('input', renderProducts);
  filtersForm.addEventListener('reset', () => {
    setTimeout(renderProducts, 0);
  });
  get('occasion-links').addEventListener('click', (event) => {
    const button = event.target.closest('[data-occasion]');
    if (!button) return;
    get('occasion').value = button.dataset.occasion;
    renderProducts();
    get('catalog').scrollIntoView({ behavior: 'smooth' });
  });
  get('products').addEventListener('click', (event) => {
    if (event.target.closest('[data-reset]')) {
      filtersForm.reset();
      return;
    }
    const button = event.target.closest('[data-product]');
    if (!button) return;
    selectedProduct = products.find(
      (product) => product.id === button.dataset.product,
    );
    get('custom-title').textContent = `خصّص ${selectedProduct.name}`;
    get('custom-fields').innerHTML =
      `<p>${selectedProduct.description}</p><p><strong>${money(selectedProduct.price)}</strong> · سعر تجريبي</p>${Object.entries(
        selectedProduct.options,
      )
        .map(
          ([key, values], index) =>
            `<label for="custom-${index}">${key}</label><select id="custom-${index}" name="${key}" required>${optionHTML(values)}</select>`,
        )
        .join('')}`;
    get('custom-dialog').showModal();
  });
  get('custom-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const success = store.add(
      selectedProduct.id,
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    renderCart();
    get('custom-dialog').close();
    announce(
      success
        ? 'تمّت الإضافة، هديتك صارت في السلة التجريبية'
        : 'وصلت للحد التقني التجريبي: 99 قطعة لكل تخصيص.',
    );
  });
  // A single delegated listener serves all current and future cart rows.
  get('cart-items').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const row =
      store.snapshot().cart[
        Number(button.closest('[data-index]').dataset.index)
      ];
    const action = button.dataset.action;
    if (action === 'remove') store.remove(row.key);
    else store.change(row.key, row.quantity + (action === 'increase' ? 1 : -1));
    renderCart();
    // Re-rendering replaces buttons: restore keyboard focus to the nearby row.
    const nextButton = get('cart-items').querySelector(
      `[data-index="${Math.min(Number(button.closest('[data-index]').dataset.index), store.snapshot().cart.length - 1)}"] button:not(:disabled)`,
    );
    (nextButton || get('cart-dialog').querySelector('[data-close]')).focus();
  });
  get('cart-items').addEventListener('change', (event) => {
    if (!event.target.matches('[data-action="quantity"]')) return;
    if (!event.target.checkValidity()) {
      event.target.reportValidity();
      return;
    }
    const index = Number(event.target.closest('[data-index]').dataset.index);
    store.change(store.snapshot().cart[index].key, Number(event.target.value));
    renderCart();
    get(`quantity-${index}`).focus();
  });
  get('cart-open').addEventListener('click', () =>
    get('cart-dialog').showModal(),
  );
  get('account-open').addEventListener('click', () =>
    get('account-dialog').showModal(),
  );
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target.closest('[data-close]')) dialog.close();
    });
  });
  get('cart-dialog').addEventListener('close', () => get('cart-open').focus());
  get('account-dialog').addEventListener('close', () => {
    get('account-open').focus();
    get('account-form').reset();
    get('account-status').textContent = '';
  });
  get('account-form').addEventListener('submit', (event) => {
    event.preventDefault();
    event.currentTarget.reset();
    get('account-status').textContent =
      'اجتاز النموذج التحقق الأصلي للمتصفح. لم يُنشأ حساب، ولم تُرسل أو تُحفظ أي بيانات.';
  });
  renderProducts();
  renderCart();
}
