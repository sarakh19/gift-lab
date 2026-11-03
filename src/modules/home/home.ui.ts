import { byId, escapeHTML } from '../../shared/dom.ts';
import { arrangementImages, homeImages } from './home.data.ts';
import type { HomeImageKey } from './home.data.ts';

const HOME_IMAGE_TARGETS: readonly [HomeImageKey, string][] = [
  ['hero', 'hero-image'],
  ['customization', 'customization-image'],
];

export function renderHomeImages(): void {
  for (const [key, id] of HOME_IMAGE_TARGETS) {
    const image = byId(id, HTMLImageElement);
    image.src = homeImages[key].src;
    image.alt = homeImages[key].alt;
  }
  byId('arrangement-gallery', HTMLElement).innerHTML = arrangementImages
    .map(
      (image) =>
        `<figure><img src="${escapeHTML(image.src)}" alt="${escapeHTML(image.alt)}" width="1254" height="1254" loading="lazy" decoding="async" /><figcaption>${escapeHTML(image.caption)}</figcaption></figure>`,
    )
    .join('');
}
