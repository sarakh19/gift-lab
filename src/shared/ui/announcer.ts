const ANNOUNCEMENT_DURATION_MS = 4000;

export type Announce = (message: string) => void;

// Shows a short toast in a live region; screen readers read it automatically.
export function createAnnouncer(region: HTMLElement): Announce {
  let timer: number | undefined;
  return (message) => {
    region.textContent = message;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      region.textContent = '';
    }, ANNOUNCEMENT_DURATION_MS);
  };
}
