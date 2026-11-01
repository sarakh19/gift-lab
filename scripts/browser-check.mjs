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
    } else if (message.method === 'Runtime.exceptionThrown')
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
    '12 products, single h1, RTL, all local images loaded, all inputs labeled',
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
  assert.equal(new Set(imagePaths).size, 20);
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
    'مباخر',
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
    `document.querySelector('#search').value='مبخرة';document.querySelector('#category').value='مباخر';document.querySelector('#occasion').value='رمضان';document.querySelector('#sort').value='desc';document.querySelector('#search').dispatchEvent(new Event('input',{bubbles:true}));`,
  );
  assert.deepEqual(
    await evaluate(
      'Array.from(document.querySelectorAll(".product-card h3"),item=>item.textContent)',
    ),
    ['مبخرة دفء', 'مبخرة لُطف'],
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
  const add = async (color = 'رملي') =>
    evaluate(
      `document.querySelector('[data-product="p1"]').click();document.querySelector('#custom-0').value=${JSON.stringify(color)};document.querySelector('#custom-form').requestSubmit();`,
    );
  await add();
  await add();
  await add('عاجي');
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
    await evaluate('new Intl.NumberFormat("ar-SA").format(85)+" ر.س"'),
  );
  results.push(
    'Cart variant merge/separation, persistence, quantity controls, removal and total',
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
  await evaluate(
    `document.querySelector('[data-product=p1]').click();document.querySelector('[data-select=custom-0] .select-trigger').click()`,
  );
  await press('Escape', 'Escape', 27);
  assert.equal(
    await evaluate('document.querySelector("#custom-dialog").open'),
    true,
  );
  assert.equal(
    await evaluate(
      'document.querySelector("[data-select=custom-0] .select-trigger").getAttribute("aria-expanded")',
    ),
    'false',
  );
  await evaluate(
    'document.querySelector("[data-select=custom-0] .select-trigger").click()',
  );
  await press('End', 'End', 35);
  await press(' ', 'Space', 32);
  assert.equal(
    await evaluate('document.querySelector("#custom-0").value'),
    'عاجي',
  );
  await evaluate('document.querySelector("#custom-form").requestSubmit()');
  assert.equal(
    await evaluate('document.querySelector("#cart-count").textContent'),
    '1',
  );
  results.push(
    'Customization picker: Escape closes popup only, End/Space select options, form submits to cart',
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
