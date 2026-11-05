// Stacking, auto-dismissing toast notifications.
// The region element is in the page from the start with aria-live="polite", so
// screen readers announce every toast added to it.

export type ToastKind = 'success' | 'error';

export interface Toaster {
  success: (message: string) => void;
  error: (message: string) => void;
}

// Errors stay longer so they can be read; the oldest toast leaves when the stack is full.
const TOAST_DURATION_MS: Readonly<Record<ToastKind, number>> = {
  success: 3500,
  error: 6000,
};
const MAX_VISIBLE_TOASTS = 3;
// Fallback removal if no transitionend fires (e.g. reduced motion disables transitions).
const LEAVE_FALLBACK_MS = 400;

export function createToaster(region: HTMLElement): Toaster {
  const dismiss = (toast: HTMLElement) => {
    if (toast.classList.contains('is-leaving')) return;
    toast.classList.add('is-leaving');
    const remove = () => toast.remove();
    toast.addEventListener('transitionend', remove, { once: true });
    window.setTimeout(remove, LEAVE_FALLBACK_MS);
  };

  const show = (kind: ToastKind, message: string) => {
    const toast = document.createElement('div');
    toast.className = `toast toast--${kind}`;
    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = kind === 'success' ? '✓' : '!';
    const text = document.createElement('p');
    // textContent (not innerHTML) so messages can never inject markup.
    text.textContent = message;
    toast.append(icon, text);
    region.append(toast);

    const active = Array.from(region.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && !child.classList.contains('is-leaving'),
    );
    active.slice(0, -MAX_VISIBLE_TOASTS).forEach(dismiss);
    window.setTimeout(() => dismiss(toast), TOAST_DURATION_MS[kind]);
  };

  return {
    success: (message) => show('success', message),
    error: (message) => show('error', message),
  };
}
