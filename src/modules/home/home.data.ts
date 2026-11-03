// Gift Lab brand photography for the page sections (not part of the product catalog).

export interface ImageAsset {
  src: string;
  alt: string;
}

export interface CaptionedImage extends ImageAsset {
  caption: string;
}

export type HomeImageKey = 'hero' | 'customization';

// Images supplied by the user; original PNG files remain unchanged.
export const homeImages: Readonly<Record<HomeImageKey, ImageAsset>> = {
  hero: {
    src: '/images/store/gift-tray-lavender.jpg',
    alt: 'تنسيق هدايا بأقمشة بنفسجية وعاجية وزهور داخل صينية بيضاء',
  },
  customization: {
    src: '/images/store/incense-peach-collection.jpg',
    alt: 'مجموعة مباخر بيضاء وذهبية بأقمشة خوخية وورد مجفف',
  },
};

export const arrangementImages: readonly CaptionedImage[] = [
  {
    src: '/images/store/favor-tower-neutral.jpg',
    alt: 'حامل توزيعات متدرج بأقمشة بيج وتغليف عاجي',
    caption: 'توزيعات بتنسيق متدرج',
  },
  {
    src: '/images/store/oud-pocket-blue.jpg',
    alt: 'جيب هدايا عاجي مع عطر وعود وورد أزرق',
    caption: 'العطر والعود بلمسة خاصة',
  },
  {
    src: '/images/store/occasion-trays-blue.jpg',
    alt: 'صواني توزيعات زرقاء وعاجية مع تنسيق يحمل اسم خالد',
    caption: 'لمسة باسمك',
  },
  {
    src: '/images/store/favors-lavender-assortment.jpg',
    alt: 'توزيعات متنوعة بربطات بنفسجية وورد عاجي ووردي',
    caption: 'ألوان متناغمة',
  },
  {
    src: '/images/store/perfume-tray-ivory.jpg',
    alt: 'صينية قوارير عطور مزينة بورد أبيض وتغليف شفاف',
    caption: 'تغليف يكمّل الهدية',
  },
  {
    src: '/images/store/gift-envelope-peach.jpg',
    alt: 'ظرف هدية خوخي مع ربطة عاجية وزهور مجففة',
    caption: 'تفاصيل من القلب',
  },
];
