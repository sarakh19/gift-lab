# Image and Font Sources

## Photographs

All photographs are Gift Lab's own store photos, which Sara supplied. They are stored in `public/images/store/`. No stock, AI-generated or externally hosted images are used.

[store-images.json](store-images.json) records each file's original PNG name, path, dimensions, file size and where it is used (`usedIn`).

### Used by the app (8)

| Use                     | File                                                                                                                                                               | Size      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| Hero banner             | `gift-tray-lavender.jpg`                                                                                                                                           | 1254×1254 |
| Customization section   | `incense-peach-collection.jpg`                                                                                                                                     | 1254×1254 |
| Arrangement gallery (6) | `favor-tower-neutral.jpg`, `oud-pocket-blue.jpg`, `occasion-trays-blue.jpg`, `favors-lavender-assortment.jpg`, `perfume-tray-ivory.jpg`, `gift-envelope-peach.jpg` | 800×800   |

These photos are referenced from `src/modules/home/home.data.ts`.

### Currently unused (12)

The 12 product photos used by the earlier local demo catalog, such as `incense-peach.jpg` and `perfume-crystal-rose.jpg`. The catalog now comes from the products API, which provides no images, so they are not displayed. They are kept pending Sara's decision.

### Processing

- The original PNG files stay unchanged outside the repository.
- The first web versions were JPEG quality 92 at the original 1254×1254, reducing the total from about 44.0 MB to 5.7 MB.
- On 3 November 2026 the 8 used photos were re-encoded as progressive JPEG quality 85. The 6 gallery tiles were resized to 800×800, since they render at most about 400 CSS px. Those 8 files went from about 2.3 MB to 1.1 MB.
- No filters were applied that recolor fabrics or alter product details.

### History

Earlier iterations used temporary Pexels and Unsplash stock photos and four SVG illustrations. These were removed from the repository on 3 November 2026 and remain in Git history.

The shop's TikTok account (https://www.tiktok.com/@glab_sa) could not be read automatically, so no media was taken from it.

## Changing an image

1. Put the approved image in `public/images/store/` with a clear English file name.
2. Update `src` and `alt` in `src/modules/home/home.data.ts`. The `alt` text must describe what is actually visible.
3. Run the site and `node scripts/browser-check.mjs`. The QA script expects 8 distinct local image paths, so update that count if images are added.

## Font

- **Alexandria**, weights 400, 500 and 600, self-hosted in `public/fonts/` and loaded through `@font-face` in `src/styles.css`. No external font requests are made.
- License: `public/fonts/OFL-Alexandria.txt` (SIL Open Font License 1.1). Source: https://raw.githubusercontent.com/google/fonts/main/ofl/alexandria/OFL.txt
- Earlier fonts (Readex Pro, IBM Plex Sans Arabic and Noto Naskh Arabic) were removed on 3 November 2026 because they were no longer used.
