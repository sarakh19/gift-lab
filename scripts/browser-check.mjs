import { spawn } from 'node:child_process';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import assert from 'node:assert/strict';

const output = resolve('test-results');
const profile = resolve(output, 'chrome-profile');
assert.equal(dirname(profile), output);
await mkdir(output, { recursive: true });
const browser = spawn(
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-component-update',
    '--disk-cache-size=1',
    '--media-cache-size=1',
    '--remote-debugging-port=9223',
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { windowsHide: true, stdio: 'ignore' },
);
const keepAlive = setInterval(() => {}, 1000);
let socket;
let serial = 0;
const pending = new Map();
const errors = [];
const results = [];
// Products API interception (Chrome Fetch domain): 'pass' | 'slow' | 'http500' | 'empty'.
let apiMode = 'pass';
const API_DELAY_MS = 2500;
const corsHeaders = [
  { name: 'Access-Control-Allow-Origin', value: '*' },
  { name: 'Content-Type', value: 'application/json' },
];
let onRequestPaused = () => {};
const pause = (time) => new Promise((done) => setTimeout(done, time));
try {
  let pages;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      pages = await (await fetch('http://127.0.0.1:9223/json')).json();
      if (pages.some((page) => page.type === 'page')) break;
    } catch {
      /* wait for owned browser */
    }
    await pause(200);
  }
  assert.ok(pages, 'Chrome endpoint started');
  socket = new WebSocket(
    pages.find((page) => page.type === 'page').webSocketDebuggerUrl,
  );
  await new Promise((done, reject) => {
    socket.addEventListener('open', done, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const handlers = pending.get(message.id);
      if (!handlers) return;
      pending.delete(message.id);
      if (message.error) handlers.reject(Error(JSON.stringify(message.error)));
      else handlers.resolve(message.result);
    } else if (message.method === 'Fetch.requestPaused')
      onRequestPaused(message.params);
    else if (message.method === 'Runtime.exceptionThrown')
      errors.push(message.params.exceptionDetails.text);
  });
  const cdp = (method, params = {}) =>
    new Promise((done, reject) => {
      const id = ++serial;
      const timer = setTimeout(
        () => reject(Error(`CDP timeout: ${method}`)),
        15000,
      );
      pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer);
          done(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
      socket.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) => {
    const response = await cdp('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (response.exceptionDetails)
      throw Error(JSON.stringify(response.exceptionDetails));
    return response.result.value;
  };
  const waitFor = async (expression) => {
    for (let attempt = 0; attempt < 80; attempt++) {
      if (await evaluate(expression)) return;
      await pause(100);
    }
    throw Error(`Timed out: ${expression}`);
  };
  const press = async (key, code, virtualKey) => {
    await cdp('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key,
      code,
      windowsVirtualKeyCode: virtualKey,
    });
    await cdp('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key,
      code,
      windowsVirtualKeyCode: virtualKey,
    });
  };
  const reload = async () => {
    await evaluate('document.documentElement.dataset.oldDocument="yes"');
    await cdp('Page.reload');
    await waitFor(
      '!document.documentElement.dataset.oldDocument && document.querySelectorAll(".product-card").length === 12',
    );
  };
  await cdp('Runtime.enable');
  await cdp('Page.enable');
  await cdp('Page.navigate', {
    url: process.env.GIFTLAB_QA_URL || 'http://127.0.0.1:5173',
  });
  await waitFor('document.querySelectorAll(".product-card").length === 12');
  await evaluate(
    'Array.from(document.images).forEach(image => { image.loading="eager"; })',
  );
  await waitFor(
    'Array.from(document.images).every(image => {image.loading="eager";return image.complete && image.naturalWidth > 0;})',
  );
  assert.equal(await evaluate('document.querySelectorAll("h1").length'), 1);
  assert.equal(await evaluate('document.documentElement.dir'), 'rtl');
  assert.equal(
    await evaluate(
      'Array.from(document.querySelectorAll("input,select")).every(control=>control.labels.length>0)',
    ),
    true,
  );
  results.push(
    '12 API products, single h1, RTL, all local images loaded, all inputs labeled',
  );
  await evaluate('document.fonts.ready');
  assert.equal(
    await evaluate('document.fonts.check("400 16px Alexandria")'),
    true,
  );
  assert.equal(
    await evaluate('document.fonts.check("500 24px Alexandria")'),
    true,
  );
  assert.equal(
    await evaluate(
      'Math.abs(document.querySelector(".hero").getBoundingClientRect().width - document.documentElement.clientWidth) < 1',
    ),
    true,
  );
  assert.equal(
    await evaluate('getComputedStyle(document.body).backgroundColor'),
    'rgb(235, 218, 221)',
  );
  assert.equal(
    await evaluate(
      'getComputedStyle(document.querySelector(".product-art")).backgroundColor',
    ),
    'rgb(250, 248, 244)',
  );
  assert.equal(
    await evaluate('getComputedStyle(document.querySelector(".button")).color'),
    'rgb(255, 255, 255)',
  );
  assert.equal(
    await evaluate(
      'getComputedStyle(document.querySelector(".button")).backgroundColor',
    ),
    'rgb(152, 82, 102)',
  );
  const imagePaths = await evaluate(
    'Array.from(document.images, image => image.getAttribute("src"))',
  );
  // Brand photography only: the products API provides no product images.
  assert.equal(new Set(imagePaths).size, 8);
  assert.equal(
    imagePaths.every((path) => path.startsWith('/images/store/')),
    true,
  );
  for (const width of [360, 768, 1280]) {
    await cdp('Emulation.setDeviceMetricsOverride', {
      width,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await pause(250);
    assert.equal(
      await evaluate(
        'Math.abs(document.querySelector(".hero").getBoundingClientRect().width-document.documentElement.clientWidth)<1',
      ),
      true,
    );
    assert.equal(
      await evaluate(
        'getComputedStyle(document.querySelector(".hero-copy")).textAlign',
      ),
      'start',
    );
    assert.equal(
      await evaluate('document.documentElement.scrollWidth<=innerWidth'),
      true,
      `Overflow at ${width}`,
    );
    assert.equal(
      await evaluate(
        'Math.abs(document.querySelector(".hero-art img").getBoundingClientRect().width-document.documentElement.clientWidth)<1 && getComputedStyle(document.querySelector(".hero-art img")).objectFit==="cover"',
      ),
      true,
      'Banner photograph fills viewport width',
    );
    assert.equal(
      await evaluate(
        '[...document.querySelectorAll(".occasion-card")].every(el=>Math.abs(el.getBoundingClientRect().width-el.getBoundingClientRect().height)<1 && getComputedStyle(el).borderRadius==="50%")',
      ),
      true,
      'Occasion buttons are circles',
    );
    const image = await cdp('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });
    await writeFile(
      resolve(output, `width-${width}.png`),
      Buffer.from(image.data, 'base64'),
    );
    const columns = await evaluate(
      'getComputedStyle(document.querySelector("#products")).gridTemplateColumns.split(" ").length',
    );
    assert.equal(columns, width === 360 ? 2 : width === 768 ? 3 : 4);
    await evaluate(
      'document.querySelector("#catalog").scrollIntoView({behavior:"instant"})',
    );
    await pause(250);
    assert.equal(
      await evaluate(
        'Math.abs(document.querySelector(".header-shell").getBoundingClientRect().top)<1 && document.querySelector(".site-header .brand").getBoundingClientRect().bottom>0',
      ),
      true,
      'Store header stays visible while scrolling',
    );
    const catalogImage = await cdp('Page.captureScreenshot', { format: 'png' });
    await writeFile(
      resolve(output, `catalog-${width}.png`),
      Buffer.from(catalogImage.data, 'base64'),
    );
    await evaluate(
      'document.querySelector("#customization").scrollIntoView({behavior:"instant"})',
    );
    await pause(250);
    const customizationImage = await cdp('Page.captureScreenshot', {
      format: 'png',
    });
    await writeFile(
      resolve(output, `customization-${width}.png`),
      Buffer.from(customizationImage.data, 'base64'),
    );
    await evaluate(
      'document.querySelector(".site-footer").scrollIntoView({behavior:"instant"})',
    );
    await pause(150);
    assert.equal(
      await evaluate(
        'document.querySelectorAll(".site-footer nav a").length===4 && [...document.querySelectorAll(".site-footer nav a")].every(a=>document.querySelector(a.getAttribute("href")))',
      ),
      true,
      'Footer links reach existing sections',
    );
    const footerImage = await cdp('Page.captureScreenshot', { format: 'png' });
    await writeFile(
      resolve(output, `footer-${width}.png`),
      Buffer.from(footerImage.data, 'base64'),
    );
    await evaluate('scrollTo({top:0,behavior:"instant"})');
    results.push(
      `No horizontal overflow: ${width}px; ${columns} product columns`,
    );
  }

  await evaluate(
    'document.querySelector("#catalog").scrollIntoView({behavior:"instant"});document.querySelector("[data-select=category] .select-trigger").focus()',
  );
  await press('ArrowDown', 'ArrowDown', 40);
  assert.equal(
    await evaluate(
      'document.querySelector("[data-select=category] .select-trigger").getAttribute("aria-expanded")',
    ),
    'true',
  );
  await press('ArrowDown', 'ArrowDown', 40);
  await press('Enter', 'Enter', 13);
  assert.equal(
    await evaluate('document.querySelector("#category").value'),
    'Bags',
  );
  assert.equal(
    await evaluate('document.querySelectorAll(".filter-chip").length'),
    1,
  );
  assert.equal(
    await evaluate('document.activeElement.className'),
    'select-trigger',
  );
  await press('ArrowDown', 'ArrowDown', 40);
  await pause(180);
  const menuImage = await cdp('Page.captureScreenshot', { format: 'png' });
  await writeFile(
    resolve(output, 'filter-menu.png'),
    Buffer.from(menuImage.data, 'base64'),
  );
  assert.equal(
    await evaluate('getComputedStyle(document.activeElement).outlineColor'),
    'rgb(152, 82, 102)',
  );
  await press('Escape', 'Escape', 27);
  assert.equal(
    await evaluate(
      'document.querySelector("[data-select=category] .select-trigger").getAttribute("aria-expanded")',
    ),
    'false',
  );
  await press('ArrowDown', 'ArrowDown', 40);
  await press('Tab', 'Tab', 9);
  assert.equal(
    await evaluate(
      'document.querySelector("[data-select=category] .select-trigger").getAttribute("aria-expanded")',
    ),
    'false',
  );
  await evaluate(
    'document.querySelector("[data-clear-filter=category]").click()',
  );
  assert.equal(await evaluate('document.querySelector("#category").value'), '');
  assert.equal(
    await evaluate('document.querySelectorAll(".product-card").length'),
    12,
  );
  await evaluate('document.querySelector("#search").focus()');
  assert.equal(
    await evaluate(
      'getComputedStyle(document.querySelector("#search")).caretColor',
    ),
    'rgb(152, 82, 102)',
  );
  assert.equal(
    await evaluate(
      'getComputedStyle(document.querySelector("#search")).outlineColor',
    ),
    'rgb(152, 82, 102)',
  );
  results.push(
    'Custom filter keyboard arrows/Enter/Escape/Tab, selected chips and removal, dusty-rose focus and caret',
  );
  await evaluate(
    `document.querySelector('#search').value='bag';document.querySelector('#category').value='Bags';document.querySelector('#sort').value='desc';document.querySelector('#search').dispatchEvent(new Event('input',{bubbles:true}));`,
  );
  assert.deepEqual(
    await evaluate(
      'Array.from(document.querySelectorAll(".product-card h3"),item=>item.textContent)',
    ),
    [
      'Travel Duffel Bag',
      'Leather Tote Bag',
      'Canvas Backpack',
      'Mini Crossbody Bag',
    ],
  );
  await evaluate(
    `document.querySelector('#occasion').value='رمضان';document.querySelector('#search').dispatchEvent(new Event('input',{bubbles:true}));`,
  );
  assert.equal(
    await evaluate('document.querySelectorAll(".product-card").length'),
    0,
  );
  await evaluate(
    `document.querySelector('#search').value='لا يوجد';document.querySelector('#search').dispatchEvent(new Event('input',{bubbles:true}));`,
  );
  assert.equal(
    await evaluate('document.querySelectorAll(".product-card").length'),
    0,
  );
  await evaluate('document.querySelector("[data-reset]").click()');
  await waitFor('document.querySelectorAll(".product-card").length===12');
  results.push('Combined filters and sorting, empty results and reset');
  await evaluate('localStorage.clear()');
  await reload();
  const add = async (id) =>
    evaluate(`document.querySelector('[data-product="${id}"]').click()`);
  await add(1);
  await add(1);
  await add(2);
  assert.equal(
    await evaluate('document.querySelector("#cart-count").textContent'),
    '3',
  );
  assert.equal(
    await evaluate('document.querySelectorAll(".cart-row").length'),
    2,
  );
  await reload();
  assert.equal(
    await evaluate('document.querySelector("#cart-count").textContent'),
    '3',
  );
  await evaluate(
    'document.querySelector("#cart-open").click();document.querySelector("[data-action=increase]").click()',
  );
  assert.equal(
    await evaluate('document.querySelector("#cart-count").textContent'),
    '4',
  );
  await evaluate('document.querySelector("[data-action=decrease]").click()');
  assert.equal(
    await evaluate('document.querySelector("#cart-count").textContent'),
    '3',
  );
  await evaluate(
    'document.querySelector("#quantity-0").value="4";document.querySelector("#quantity-0").dispatchEvent(new Event("change",{bubbles:true}))',
  );
  assert.equal(
    await evaluate('document.querySelector("#cart-count").textContent'),
    '5',
  );
  await evaluate('document.querySelector("[data-action=remove]").click()');
  assert.equal(
    await evaluate('document.querySelector("#cart-count").textContent'),
    '1',
  );
  assert.equal(
    await evaluate('document.querySelector("#cart-total").textContent'),
    await evaluate(
      'new Intl.NumberFormat("ar-SA",{minimumFractionDigits:2,maximumFractionDigits:2}).format(49)',
    ),
  );
  // Instructor feedback: "−" at quantity 1 must remove the product.
  assert.equal(
    await evaluate('document.querySelector("[data-action=decrease]").disabled'),
    false,
  );
  await evaluate('document.querySelector("[data-action=decrease]").click()');
  assert.equal(
    await evaluate('document.querySelectorAll(".cart-row").length'),
    0,
  );
  assert.equal(
    await evaluate('document.querySelector("#cart-clear").hidden'),
    true,
  );
  await add(1);
  await add(2);
  assert.equal(
    await evaluate('document.querySelector("#cart-clear").hidden'),
    false,
  );
  await pause(300);
  const cartImage = await cdp('Page.captureScreenshot', { format: 'png' });
  await writeFile(
    resolve(output, 'cart-dialog.png'),
    Buffer.from(cartImage.data, 'base64'),
  );
  await evaluate('document.querySelector("#cart-clear").click()');
  assert.equal(
    await evaluate('document.querySelector("#cart-count").textContent'),
    '0',
  );
  assert.equal(
    await evaluate(
      'JSON.parse(localStorage.getItem("giftlab.cart.v1")).length',
    ),
    0,
  );
  results.push(
    'Cart merge by product, persistence, quantity controls, removal, decrease-to-remove, clear cart and total',
  );
  await cdp('Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
  });
  await cdp('Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: 'Escape',
    code: 'Escape',
    windowsVirtualKeyCode: 27,
  });
  await waitFor('!document.querySelector("#cart-dialog").open');
  await waitFor('document.activeElement.id === "cart-open"');
  await evaluate('document.querySelector("#account-open").click()');
  assert.equal(
    await evaluate('document.querySelector("#account-form").checkValidity()'),
    false,
  );
  await evaluate(
    'document.querySelector("#full-name").value="تجربة";document.querySelector("#email").value="bad";document.querySelector("#password").value="sample-only"',
  );
  assert.equal(
    await evaluate('document.querySelector("#email").validity.typeMismatch'),
    true,
  );
  await evaluate(
    'document.querySelector("#email").value="demo@example.com";document.querySelector("#account-form").requestSubmit()',
  );
  assert.equal(await evaluate('document.querySelector("#password").value'), '');
  assert.equal(
    await evaluate('JSON.stringify(localStorage).includes("sample-only")'),
    false,
  );
  assert.equal(
    await evaluate(
      'document.querySelector("#account-status").textContent.includes("البيانات مكتملة وصيغتها صحيحة")',
    ),
    true,
  );
  results.push(
    'Native required/email validation; password cleared and not stored; demo message; Escape restores focus',
  );
  await evaluate(
    'document.querySelector("#account-dialog").close();localStorage.setItem("giftlab.cart.v1","{broken")',
  );
  await reload();
  assert.equal(
    await evaluate('document.querySelector("#cart-count").textContent'),
    '0',
  );
  results.push('Corrupt localStorage recovers; no uncaught JavaScript errors');
  assert.equal(
    await evaluate(
      '[...document.querySelectorAll(".add-button:disabled")].every(button=>button.textContent==="غير متوفر") && document.querySelectorAll(".add-button:disabled").length===2',
    ),
    true,
  );
  await cdp('Network.enable');
  await cdp('Network.setBlockedURLs', {
    urls: ['*shopboard-api.vercel.app*'],
  });
  await evaluate('document.documentElement.dataset.oldDocument="yes"');
  await cdp('Page.reload');
  await waitFor(
    '!document.documentElement.dataset.oldDocument && document.querySelector("[data-retry]")',
  );
  assert.equal(
    await evaluate('document.querySelectorAll(".product-card").length'),
    0,
  );
  const errorImage = await cdp('Page.captureScreenshot', { format: 'png' });
  await writeFile(
    resolve(output, 'products-error.png'),
    Buffer.from(errorImage.data, 'base64'),
  );
  await cdp('Network.setBlockedURLs', { urls: [] });
  await evaluate('document.querySelector("[data-retry]").click()');
  await waitFor('document.querySelectorAll(".product-card").length === 12');
  results.push(
    'Out-of-stock items disabled; blocked API shows error state; retry loads the catalog',
  );
  const fulfill = (requestId, responseCode, body) =>
    cdp('Fetch.fulfillRequest', {
      requestId,
      responseCode,
      responseHeaders: corsHeaders,
      body: Buffer.from(body).toString('base64'),
    });
  onRequestPaused = async ({ requestId }) => {
    if (apiMode === 'http500')
      return fulfill(requestId, 500, '{"error":"server"}');
    if (apiMode === 'empty')
      return fulfill(requestId, 200, '{"items":[],"total":0}');
    if (apiMode === 'slow') await pause(API_DELAY_MS);
    return cdp('Fetch.continueRequest', { requestId });
  };
  await cdp('Fetch.enable', {
    patterns: [{ urlPattern: '*shopboard-api.vercel.app/api/products*' }],
  });
  const reloadPage = async () => {
    await evaluate('document.documentElement.dataset.oldDocument="yes"');
    await cdp('Page.reload');
    await waitFor('!document.documentElement.dataset.oldDocument');
  };
  // Slow network: skeleton cards and aria-busy while waiting, then the catalog.
  apiMode = 'slow';
  await reloadPage();
  await waitFor('document.querySelectorAll(".skeleton-card").length === 8');
  assert.equal(
    await evaluate(
      'document.querySelector("#products").getAttribute("aria-busy")',
    ),
    'true',
  );
  const skeletonImage = await cdp('Page.captureScreenshot', { format: 'png' });
  await writeFile(
    resolve(output, 'products-loading.png'),
    Buffer.from(skeletonImage.data, 'base64'),
  );
  await waitFor(
    'document.querySelectorAll(".product-card:not(.skeleton-card)").length === 12',
  );
  assert.equal(
    await evaluate(
      'document.querySelector("#products").getAttribute("aria-busy")',
    ),
    'false',
  );
  // HTTP 500: error state with a working "try again" button.
  apiMode = 'http500';
  await reloadPage();
  await waitFor('document.querySelector("[data-retry]")');
  assert.equal(
    await evaluate(
      'document.querySelector("#products [role=alert] p").textContent',
    ),
    'الخادم لم يُرجع المنتجات بنجاح.',
  );
  // Retry that fails again keeps keyboard focus on the new retry button.
  await evaluate('document.querySelector("[data-retry]").click()');
  await waitFor(
    'document.activeElement && document.activeElement.matches("[data-retry]")',
  );
  apiMode = 'pass';
  await evaluate('document.querySelector("[data-retry]").click()');
  await waitFor('document.querySelectorAll(".product-card").length === 12');
  // Empty API response: its own message, distinct from "no matches" (no reset button).
  apiMode = 'empty';
  await reloadPage();
  await waitFor('document.querySelector("#products .empty h3")');
  assert.equal(
    await evaluate('document.querySelector("#products .empty h3").textContent'),
    'لا توجد منتجات حاليًا',
  );
  assert.equal(
    await evaluate('Boolean(document.querySelector("[data-reset]"))'),
    false,
  );
  const emptyImage = await cdp('Page.captureScreenshot', { format: 'png' });
  await writeFile(
    resolve(output, 'products-empty.png'),
    Buffer.from(emptyImage.data, 'base64'),
  );
  apiMode = 'pass';
  await cdp('Fetch.disable');
  await reloadPage();
  await waitFor('document.querySelectorAll(".product-card").length === 12');
  results.push(
    'Slow API shows 8 skeleton cards (aria-busy); HTTP 500 error, failed retry keeps focus, retry recovers; empty API differs from no matches',
  );
  // Toasts: success toasts stack, then disappear; hitting the limit shows an error toast.
  await evaluate('localStorage.clear()');
  await reloadPage();
  await waitFor('document.querySelectorAll(".product-card").length === 12');
  await evaluate(
    `document.querySelector('[data-product="1"]').click();document.querySelector('[data-product="2"]').click()`,
  );
  assert.equal(
    await evaluate(
      'document.querySelectorAll("#toast-region .toast--success").length',
    ),
    2,
  );
  assert.equal(
    await evaluate(
      'document.querySelector("#toast-region").getAttribute("aria-live")',
    ),
    'polite',
  );
  await pause(300); // let the 200ms entrance animation finish
  const toastImage = await cdp('Page.captureScreenshot', { format: 'png' });
  await writeFile(
    resolve(output, 'toasts.png'),
    Buffer.from(toastImage.data, 'base64'),
  );
  await waitFor(
    'document.querySelectorAll("#toast-region .toast").length === 0',
  );
  await evaluate(
    'localStorage.setItem("giftlab.cart.v1", JSON.stringify([{productId:1,quantity:99}]))',
  );
  await reloadPage();
  await waitFor('document.querySelectorAll(".product-card").length === 12');
  await evaluate(`document.querySelector('[data-product="1"]').click()`);
  assert.equal(
    await evaluate(
      'document.querySelectorAll("#toast-region .toast--error").length',
    ),
    1,
  );
  assert.equal(
    await evaluate('document.querySelector("#cart-count").textContent'),
    '99',
  );
  await evaluate('localStorage.clear()');
  results.push(
    'Toasts: success toasts stack and auto-dismiss; failed add shows an error toast',
  );
  await cdp('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  await reload();
  await evaluate('document.fonts.ready');
  assert.equal(
    await evaluate('document.querySelectorAll(".product-card").length'),
    12,
  );
  await evaluate(
    'document.querySelector("[data-select=category] .select-trigger").click()',
  );
  assert.equal(
    await evaluate(
      'getComputedStyle(document.querySelector("[data-select=category] .select-menu")).animationName',
    ),
    'none',
  );
  await press('Escape', 'Escape', 27);
  await evaluate('document.querySelector("#account-open").click()');
  assert.equal(
    await evaluate(
      'getComputedStyle(document.querySelector("#account-dialog")).animationName',
    ),
    'none',
  );
  await evaluate(
    'document.querySelector("#account-dialog").close();document.querySelector("#search").value="هدية";document.querySelector("#search").dispatchEvent(new Event("input",{bubbles:true}));',
  );
  assert.equal(
    await evaluate(
      'document.querySelector("#products").getAnimations().length',
    ),
    0,
  );
  assert.equal(
    await evaluate(
      'getComputedStyle(document.querySelector("#products")).opacity',
    ),
    '1',
  );
  results.push(
    'Reduced motion: menus/dialogs/results have no animation; content remains visible and functional',
  );
  assert.deepEqual(errors, []);
  await writeFile(
    resolve(output, 'browser-check.json'),
    JSON.stringify({ results, errors }, null, 2),
  );
  console.log(results.join('\n'));
} finally {
  clearInterval(keepAlive);
  socket?.close();
  browser.kill();
  await pause(800);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
