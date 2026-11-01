export const categories = ['مباخر', 'عطور', 'توزيعات', 'بوكسات هدايا'];
export const occasions = [
  'زفاف',
  'مولود',
  'تخرج',
  'رمضان',
  'العيد',
  'يوم المعلم',
  'اليوم الوطني',
  'يوم التأسيس',
];

// All values are replaceable demonstration data, not approved business terms.
export const products = [
  {
    id: 'p1',
    image: {
      src: '/images/store/incense-peach.jpg',
      alt: 'مبخرة بيضاء بغطاء ذهبي وتنسيق قماش خوخي وورد مجفف',
    },
    name: 'مبخرة لُطف',
    category: 'مباخر',
    occasions: ['زفاف', 'رمضان'],
    price: 85,
    art: 'incense',
    tone: 'sand',
    description: 'تفصيل هادئ لركن الهدية.',
    options: { اللون: ['رملي', 'عاجي'], التغليف: ['قماش', 'صندوق'] },
  },
  {
    id: 'p2',
    image: {
      src: '/images/store/glass-gift-cash.jpg',
      alt: 'صندوق زجاجي بإطار داكن وتنسيق ورد ولفائف نقدية',
    },
    name: 'بوكس لحظة فرح',
    category: 'بوكسات هدايا',
    occasions: ['تخرج', 'العيد'],
    price: 160,
    art: 'gift',
    tone: 'rose',
    description: 'فكرة لتنسيق هدية تحتفي باللحظة.',
    options: { الشريط: ['وردي', 'عاجي'], البطاقة: ['تهنئة', 'بكل محبة'] },
  },
  {
    id: 'p3',
    image: {
      src: '/images/store/perfume-crystal-rose.jpg',
      alt: 'قارورة عطر زجاجية بغطاء كريستالي مع علبة وردية وزهور عنابية',
    },
    name: 'عطر أثر',
    category: 'عطور',
    occasions: ['زفاف', 'العيد'],
    price: 120,
    art: 'perfume',
    tone: 'olive',
    description: 'هدية عطر أنيقة.',
    options: { التغليف: ['عاجي', 'رملي'] },
  },
  {
    id: 'p4',
    image: {
      src: '/images/store/welcome-favor-crown.jpg',
      alt: 'توزيعة ضيافة عاجية مع قارورة عطر وورد بنفسجي وتاج ذهبي',
    },
    name: 'توزيعة بداية حلوة',
    category: 'توزيعات',
    occasions: ['مولود'],
    price: 18,
    art: 'gift',
    tone: 'blue',
    description: 'لمسة للاحتفاء بالبدايات.',
    options: {
      اللون: ['سماوي', 'وردي', 'عاجي'],
      البطاقة: ['أهلًا بالصغير', 'أهلًا بالصغيرة'],
    },
  },
  {
    id: 'p5',
    image: {
      src: '/images/store/incense-burgundy.jpg',
      alt: 'مبخرة بيضاء وقارورة بغطاء خشبي بتنسيق قماش عنابي',
    },
    name: 'مبخرة دفء',
    category: 'مباخر',
    occasions: ['رمضان', 'يوم التأسيس'],
    price: 95,
    art: 'incense',
    tone: 'olive',
    description: 'فكرة هدية تجمع البساطة والدفء.',
    options: { اللون: ['زيتي', 'عاجي'] },
  },
  {
    id: 'p6',
    image: {
      src: '/images/store/gift-case-olive.jpg',
      alt: 'علبة هدية بغطاء خشبي وتنسيق قماش زيتي وربطة وورد مجفف',
    },
    name: 'بوكس فخر',
    category: 'بوكسات هدايا',
    occasions: ['تخرج', 'اليوم الوطني'],
    price: 190,
    art: 'gift',
    tone: 'sand',
    description: 'تنسيق مقترح للحظات الإنجاز.',
    options: {
      الشريط: ['زيتي', 'ذهبي'],
      البطاقة: ['فخورون بك', 'مبروك التخرج'],
    },
  },
  {
    id: 'p7',
    image: {
      src: '/images/store/fragrance-box-ivory.jpg',
      alt: 'علبة عطر منزلي بيضاء مزينة بوردة قماشية عاجية وزهور زرقاء',
    },
    name: 'عطر نسمة',
    category: 'عطور',
    occasions: ['يوم المعلم', 'العيد'],
    price: 110,
    art: 'perfume',
    tone: 'rose',
    description: 'اختيار للتعبير عن الامتنان.',
    options: { التغليف: ['وردي', 'عاجي'] },
  },
  {
    id: 'p8',
    image: {
      src: '/images/store/favor-ivory-rose.jpg',
      alt: 'توزيعة مغلفة بقماش أبيض وربطة وزهور وردية مجففة',
    },
    name: 'توزيعة ليلة فرح',
    category: 'توزيعات',
    occasions: ['زفاف'],
    price: 22,
    art: 'gift',
    tone: 'sand',
    description: 'تفصيل مقترح لضيوف لحظة مميزة.',
    options: {
      الشريط: ['عاجي', 'وردي'],
      البطاقة: ['دامت الأفراح', 'شكرًا لحضوركم'],
    },
  },
  {
    id: 'p9',
    image: {
      src: '/images/store/perfume-dome-wood.jpg',
      alt: 'قارورة عطر داخل قبة زجاجية بقاعدة خشبية وربطة بيضاء',
    },
    name: 'بوكس أهلًا صغيرنا',
    category: 'بوكسات هدايا',
    occasions: ['مولود'],
    price: 145,
    art: 'gift',
    tone: 'blue',
    description: 'هدية للبدايات الجميلة.',
    options: { اللون: ['سماوي', 'وردي'], التغليف: ['قماش', 'صندوق'] },
  },
  {
    id: 'p10',
    image: {
      src: '/images/store/glass-favor-stand.jpg',
      alt: 'حامل أبيض متدرج مع توزيعات زجاجية وربطات وردية وباقة زهور',
    },
    name: 'توزيعة امتنان',
    category: 'توزيعات',
    occasions: ['يوم المعلم'],
    price: 15,
    art: 'gift',
    tone: 'rose',
    description: 'لفتة صغيرة بمعنى كبير.',
    options: { البطاقة: ['شكرًا معلمي', 'شكرًا معلمتي'] },
  },
  {
    id: 'p11',
    image: {
      src: '/images/store/incense-blue-wrap.jpg',
      alt: 'مبخرة بيضاء وذهبية بتنسيق قماش سماوي وورد مجفف',
    },
    name: 'مبخرة دار',
    category: 'مباخر',
    occasions: ['اليوم الوطني', 'يوم التأسيس'],
    price: 105,
    art: 'incense',
    tone: 'sand',
    description: 'تصور لهدية تستلهم دفء الدار.',
    options: { اللون: ['رملي', 'زيتي'], التغليف: ['قماش', 'صندوق'] },
  },
  {
    id: 'p12',
    image: {
      src: '/images/store/incense-tray-rose.jpg',
      alt: 'صينية مباخر بيضاء بتنسيق وردي وتغليف شفاف وأشرطة عاجية',
    },
    name: 'بوكس هلال',
    category: 'بوكسات هدايا',
    occasions: ['رمضان', 'العيد'],
    price: 175,
    art: 'gift',
    tone: 'olive',
    description: 'تنسيق موسمي للمشاركة.',
    options: { الشريط: ['زيتي', 'عاجي'], البطاقة: ['رمضان كريم', 'عيد مبارك'] },
  },
];

// Images supplied by the user; original PNG files remain unchanged.
export const homeImages = {
  hero: {
    src: '/images/store/gift-tray-lavender.jpg',
    alt: 'تنسيق هدايا بأقمشة بنفسجية وعاجية وزهور داخل صينية بيضاء',
  },
  customization: {
    src: '/images/store/incense-peach-collection.jpg',
    alt: 'مجموعة مباخر بيضاء وذهبية بأقمشة خوخية وورد مجفف',
  },
};

export const arrangementImages = [
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
