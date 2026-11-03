// Safe DOM helpers shared by every UI module.

const HTML_ENTITIES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

// Always escape text before putting it into innerHTML, especially API data.
export const escapeHTML = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] ?? char);

export const optionHTML = (values: readonly string[]): string =>
  values
    .map(
      (value) =>
        `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`,
    )
    .join('');

// Checks both that the element exists and that it is the expected kind (e.g. a <form>).
export function requireElement<T extends Element>(
  root: ParentNode,
  selector: string,
  type: new () => T,
): T {
  const element = root.querySelector(selector);
  if (!(element instanceof type))
    throw new Error(`Gift Lab: expected ${type.name} at "${selector}"`);
  return element;
}

export function byId<T extends HTMLElement>(id: string, type: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof type))
    throw new Error(`Gift Lab: expected ${type.name} with id "${id}"`);
  return element;
}

// Event targets can be any EventTarget (or null); narrow to an element before using DOM APIs.
export function closestFromEvent(
  event: Event,
  selector: string,
): HTMLElement | null {
  const target = event.target;
  if (!(target instanceof Element)) return null;
  const match = target.closest(selector);
  return match instanceof HTMLElement ? match : null;
}

export const focusIfPossible = (element: Element | null): void => {
  if (element instanceof HTMLElement) element.focus();
};
