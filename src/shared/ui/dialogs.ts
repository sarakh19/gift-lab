import { closestFromEvent } from '../dom.ts';

// Shared behavior for every native <dialog>: [data-close] buttons close it,
// and `onClose` runs whenever any dialog closes.
export function initDialogs(onClose: () => void): void {
  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('close', onClose);
    dialog.addEventListener('click', (event) => {
      if (closestFromEvent(event, '[data-close]')) dialog.close();
    });
  });
}
