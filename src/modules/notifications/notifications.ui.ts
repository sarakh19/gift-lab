const NOTIFICATION_DURATION_MS = 4000;

export type Notify = (message: string) => void;

// Shows a short toast in a live region (role="status"); screen readers read it automatically.
export function createNotifier(region: HTMLElement): Notify {
  let timer: number | undefined;
  return (message) => {
    region.textContent = message;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      region.textContent = '';
    }, NOTIFICATION_DURATION_MS);
  };
}
