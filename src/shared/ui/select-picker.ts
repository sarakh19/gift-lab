import { closestFromEvent, escapeHTML, requireElement } from '../dom.ts';

interface Picker {
  root: HTMLDivElement;
  list: HTMLDivElement;
  trigger: HTMLButtonElement;
  select: HTMLSelectElement;
  renderOptions: () => void;
  sync: () => void;
}

export interface Pickers {
  enhance(select: HTMLSelectElement): void;
  // Rebuilds the popup after the native <select> options change (e.g. API categories).
  refresh(select: HTMLSelectElement): void;
  close(restoreFocus?: boolean): void;
  sync(): void;
}

// Native selects remain the form-data source and fallback; enhanced popups avoid OS colors.
export function createPickers(): Pickers {
  const pickers = new Set<Picker>();
  let opened: Picker | undefined;
  const close = (restoreFocus = false) => {
    if (!opened) return;
    const picker = opened;
    picker.list.hidden = true;
    picker.trigger.setAttribute('aria-expanded', 'false');
    opened = undefined;
    if (restoreFocus) picker.trigger.focus();
  };
  const enhance = (select: HTMLSelectElement) => {
    for (const picker of pickers)
      if (!picker.select.isConnected) pickers.delete(picker);
    const label = select.labels[0];
    if (!label) return; // Without a label the native select stays visible.
    label.id ||= select.id + '-label';
    const root = document.createElement('div');
    root.className = 'select-control';
    root.dataset.select = select.id;
    root.innerHTML = `<button type="button" class="select-trigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="${select.id}-list" aria-labelledby="${label.id} ${select.id}-value"><span id="${select.id}-value"></span><span class="select-chevron" aria-hidden="true">⌄</span></button><div id="${select.id}-list" class="select-menu" role="listbox" aria-labelledby="${label.id}" hidden></div>`;
    const trigger = requireElement(root, '.select-trigger', HTMLButtonElement);
    const list = requireElement(root, '.select-menu', HTMLDivElement);
    const valueText = requireElement(
      root,
      `[id="${select.id}-value"]`,
      HTMLSpanElement,
    );
    let buttons: HTMLButtonElement[] = [];
    const sync = () => {
      valueText.textContent = select.selectedOptions[0]?.textContent || '';
      root.classList.toggle(
        'is-active',
        select.value !== select.options.item(0)?.value,
      );
      buttons.forEach((button, index) =>
        button.setAttribute(
          'aria-selected',
          String(index === select.selectedIndex),
        ),
      );
    };
    const renderOptions = () => {
      list.innerHTML = Array.from(select.options)
        .map(
          (option, index) =>
            `<button type="button" role="option" tabindex="-1" data-option="${index}" aria-selected="false">${escapeHTML(option.textContent ?? '')}</button>`,
        )
        .join('');
      buttons = Array.from(list.querySelectorAll('button'));
      sync();
    };
    const picker: Picker = { root, list, trigger, select, renderOptions, sync };
    const focusOption = (index: number) => {
      buttons.forEach((button, position) => {
        button.tabIndex = position === index ? 0 : -1;
      });
      buttons[index]?.focus();
    };
    const open = () => {
      close();
      opened = picker;
      list.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      focusOption(Math.max(0, select.selectedIndex));
    };
    trigger.addEventListener('click', () =>
      opened === picker ? close(true) : open(),
    );
    list.addEventListener('click', (event) => {
      const button = closestFromEvent(event, '[data-option]');
      if (!button) return;
      select.selectedIndex = Number(button.dataset.option);
      sync();
      close(true);
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    root.addEventListener('keydown', (event) => {
      if (
        event.target instanceof Node &&
        list.contains(event.target) &&
        ['Enter', ' '].includes(event.key)
      ) {
        event.preventDefault();
        closestFromEvent(event, '[data-option]')?.click();
        return;
      }
      if (event.key === 'Escape' && opened === picker) {
        event.preventDefault();
        event.stopPropagation();
        close(true);
        return;
      }
      if (event.key === 'Tab') {
        close();
        return;
      }
      const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
      if (!keys.includes(event.key)) {
        if (opened === picker && event.key.length === 1 && event.key !== ' ') {
          const match = buttons.findIndex((button) =>
            (button.textContent ?? '').startsWith(event.key),
          );
          if (match >= 0) {
            event.preventDefault();
            focusOption(match);
          }
        }
        return;
      }
      event.preventDefault();
      if (opened !== picker) {
        open();
        return;
      }
      const index = buttons.findIndex(
        (button) => button === document.activeElement,
      );
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? buttons.length - 1
            : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) %
              buttons.length;
      focusOption(next);
    });
    label.addEventListener('click', (event) => {
      event.preventDefault();
      trigger.focus();
    });
    select.insertAdjacentElement('afterend', root);
    select.hidden = true;
    select.addEventListener('input', sync);
    renderOptions();
    pickers.add(picker);
  };
  document.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (opened && !(target instanceof Node && opened.root.contains(target)))
      close();
  });
  return {
    enhance,
    refresh: (select) => {
      for (const picker of pickers)
        if (picker.select === select) picker.renderOptions();
    },
    close,
    sync: () => {
      for (const picker of pickers) {
        if (picker.select.isConnected) picker.sync();
        else pickers.delete(picker);
      }
    },
  };
}
