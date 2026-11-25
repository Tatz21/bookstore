import bcrypt from "bcryptjs";

export interface DemoUser {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  passwordHash: string | null;
  image: string | null;
  role: "CUSTOMER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
}

export interface DemoBook {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorBio: string | null;
  isbn10: string | null;
  isbn13: string | null;
  description: string;
  price: number;
  discountPrice: number | null;
  stockQuantity: number;
  weightGrams: number;
  coverImageUrl: string;
  galleryUrls: string;
  format: "PAPERBACK" | "HARDCOVER" | "EBOOK";
  language: string;
  pages: number | null;
  publisher: string | null;
  publishedDate: string | null;
  categoryId: string;
  isFeatured: boolean;
  isActive: boolean;
  ratingAvg: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoReview {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface DemoWishlistItem {
  id: string;
  userId: string;
  bookId: string;
  createdAt: Date;
}

export interface DemoCartItem {
  id: string;
  userId: string;
  bookId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoAddress {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface DemoCoupon {
  id: string;
  code: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
}

export interface DemoOrder {
  id: string;
  orderNumber: string;
  userId: string | null;
  guestEmail: string | null;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  couponCode: string | null;
  status: "PENDING" | "PAID" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentProvider: string;
  paymentIntentId: string | null;
  paymentId: string | null;
  shippingAddress: string;
  trackingNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoOrderItem {
  id: string;
  orderId: string;
  bookId: string;
  quantity: number;
  priceAtPurchase: number;
}

interface DemoState {
  users: DemoUser[];
  categories: DemoCategory[];
  books: DemoBook[];
  reviews: DemoReview[];
  wishlistItems: DemoWishlistItem[];
  cartItems: DemoCartItem[];
  addresses: DemoAddress[];
  coupons: DemoCoupon[];
  orders: DemoOrder[];
  orderItems: DemoOrderItem[];
}

function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function createInitialState(): DemoState {
  const now = new Date("2026-11-24T10:00:00Z");
  const adminHash = bcrypt.hashSync("admin1234", 8);
  const readerHash = bcrypt.hashSync("reader1234", 8);

  const users: DemoUser[] = [
    {
      id: "demo-admin-1",
      name: "Aarav Mehta (Store Owner)",
      email: "admin@folioandspine.com",
      emailVerified: null,
      passwordHash: adminHash,
      image: null,
      role: "ADMIN",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-reader-1",
      name: "Priya Nair",
      email: "reader@folioandspine.com",
      emailVerified: null,
      passwordHash: readerHash,
      image: null,
      role: "CUSTOMER",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const categories: DemoCategory[] = [
    {
      id: "cat-fiction",
      name: "Literary Fiction",
      slug: "literary-fiction",
      description: "Award-winning contemporary and classic novels.",
      createdAt: now,
    },
    {
      id: "cat-tech",
      name: "Technology & Design",
      slug: "technology-design",
      description: "Software engineering, architecture, and craft.",
      createdAt: now,
    },
    {
      id: "cat-science",
      name: "Science & Cosmos",
      slug: "science-cosmos",
      description: "Physics, biology, and the natural world.",
      createdAt: now,
    },
    {
      id: "cat-business",
      name: "Business & Strategy",
      slug: "business-strategy",
      description: "Entrepreneurship, economics, and leadership.",
      createdAt: now,
    },
    {
      id: "cat-history",
      name: "History & Biography",
      slug: "history-biography",
      description: "Lives, empires, and pivotal human stories.",
      createdAt: now,
    },
    {
      id: "cat-philosophy",
      name: "Philosophy & Craft",
      slug: "philosophy-craft",
      description: "Essays, mindfulness, and deep thinking.",
      createdAt: now,
    },
  ];

  const books: DemoBook[] = [
    {
      id: "book-ddia",
      title: "Designing Data-Intensive Applications",
      slug: "designing-data-intensive-applications",
      author: "Martin Kleppmann",
      authorBio:
        "Martin Kleppmann is a researcher in distributed systems at the University of Cambridge and author of several influential papers on local-first software.",
      isbn10: "1449373321",
      isbn13: "9781449373320",
      description:
        "Data is at the center of many challenges in system design today. Difficult issues need to be figured out, such as scalability, consistency, reliability, efficiency, and maintainability. In this practical and comprehensive guide, Martin Kleppmann helps you navigate this diverse landscape by examining the pros and cons of various technologies for processing and storing data.",
      price: 1850,
      discountPrice: 1499,
      stockQuantity: 24,
      weightGrams: 820,
      coverImageUrl: "https://covers.openlibrary.org/b/isbn/9781449373320-L.jpg",
      galleryUrls: "[]",
      format: "PAPERBACK",
      language: "English",
      pages: 616,
      publisher: "O'Reilly Media",
      publishedDate: "2017-04-18",
      categoryId: "cat-tech",
      isFeatured: true,
      isActive: true,
      ratingAvg: 4.9,
      reviewCount: 1,
      createdAt: new Date("2026-11-24T12:00:00Z"),
      updatedAt: now,
    },
    {
      id: "book-pragmatic",
      title: "The Pragmatic Programmer",
      slug: "the-pragmatic-programmer-20th-anniversary",
      author: "David Thomas & Andrew Hunt",
      authorBio:
        "David Thomas and Andrew Hunt are pioneers of the Agile Manifesto and veteran software craftspeople.",
      isbn10: "0135957052",
      isbn13: "9780135957059",
      description:
        "The Pragmatic Programmer illustrates the best approaches and major pitfalls of many different aspects of software development. Whether you are a new coder, an experienced programmer, or a manager responsible for software projects, these lessons deliver immediate improvements in productivity, accuracy, and job satisfaction.",
      price: 1499,
      discountPrice: 1199,
      stockQuantity: 18,
      weightGrams: 640,
      coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg",
      galleryUrls: "[]",
      format: "HARDCOVER",
      language: "English",
      pages: 352,
      publisher: "Addison-Wesley Professional",
      publishedDate: "2019-09-13",
      categoryId: "cat-tech",
      isFeatured: true,
      isActive: true,
      ratingAvg: 4.8,
      reviewCount: 1,
      createdAt: new Date("2026-11-24T11:00:00Z"),
      updatedAt: now,
    },
    {
      id: "book-dune",
      title: "Dune",
      slug: "dune-frank-herbert",
      author: "Frank Herbert",
      authorBio:
        "Frank Herbert was an American science-fiction author best known for the 1965 novel Dune and its five sequels.",
      isbn10: "0441172717",
      isbn13: "9780441172719",
      description:
        "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange, a drug capable of extending life and enhancing consciousness.",
      price: 699,
      discountPrice: 549,
      stockQuantity: 3,
      weightGrams: 460,
      coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg",
      galleryUrls: "[]",
      format: "PAPERBACK",
      language: "English",
      pages: 896,
      publisher: "Ace Books",
      publishedDate: "1990-09-01",
      categoryId: "cat-fiction",
      isFeatured: true,
      isActive: true,
      ratingAvg: 4.9,
      reviewCount: 1,
      createdAt: new Date("2026-11-24T10:00:00Z"),
      updatedAt: now,
    },
    {
      id: "book-hail-mary",
      title: "Project Hail Mary",
      slug: "project-hail-mary",
      author: "Andy Weir",
      authorBio:
        "Andy Weir built a career as a software engineer before his debut novel The Martian became a global phenomenon.",
      isbn10: "0593135202",
      isbn13: "9780593135204",
      description:
        "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish. Except that right now, he doesn't know that. He can't even remember his own name, let alone the nature of his assignment.",
      price: 899,
      discountPrice: 699,
      stockQuantity: 15,
      weightGrams: 540,
      coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg",
      galleryUrls: "[]",
      format: "HARDCOVER",
      language: "English",
      pages: 496,
      publisher: "Ballantine Books",
      publishedDate: "2021-05-04",
      categoryId: "cat-fiction",
      isFeatured: true,
      isActive: true,
      ratingAvg: 4.8,
      reviewCount: 1,
      createdAt: new Date("2026-11-24T09:00:00Z"),
      updatedAt: now,
    },
    {
      id: "book-sapiens",
      title: "Sapiens: A Brief History of Humankind",
      slug: "sapiens-a-brief-history-of-humankind",
      author: "Yuval Noah Harari",
      authorBio:
        "Yuval Noah Harari is a historian, philosopher, and lecturer in the Department of History at the Hebrew University of Jerusalem.",
      isbn10: "0062316095",
      isbn13: "9780062316097",
      description:
        "From a renowned historian comes a groundbreaking narrative of humanity's creation and evolution—a #1 international bestseller—that explores the ways in which biology and history have defined us and enhanced our understanding of what it means to be 'human.'",
      price: 799,
      discountPrice: 599,
      stockQuantity: 32,
      weightGrams: 480,
      coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
      galleryUrls: "[]",
      format: "PAPERBACK",
      language: "English",
      pages: 464,
      publisher: "Harper",
      publishedDate: "2015-02-10",
      categoryId: "cat-history",
      isFeatured: true,
      isActive: true,
      ratingAvg: 4.7,
      reviewCount: 1,
      createdAt: new Date("2026-11-24T08:00:00Z"),
      updatedAt: now,
    },
    {
      id: "book-design-things",
      title: "The Design of Everyday Things",
      slug: "the-design-of-everyday-things",
      author: "Don Norman",
      authorBio:
        "Don Norman is Director of The Design Lab at University of California, San Diego and cofounder of the Nielsen Norman Group.",
      isbn10: "0465050654",
      isbn13: "9780465050659",
      description:
        "Design doesn't really matter until something goes wrong. Even the smartest among us can feel inept as we fail to figure out which light switch or oven burner to turn on. Don Norman's classic text shows how good, usable design is possible.",
      price: 750,
      discountPrice: null,
      stockQuantity: 2,
      weightGrams: 390,
      coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780465050659-L.jpg",
      galleryUrls: "[]",
      format: "PAPERBACK",
      language: "English",
      pages: 368,
      publisher: "Basic Books",
      publishedDate: "2013-11-05",
      categoryId: "cat-tech",
      isFeatured: false,
      isActive: true,
      ratingAvg: 4.8,
      reviewCount: 1,
      createdAt: new Date("2026-11-24T07:00:00Z"),
      updatedAt: now,
    },
    {
      id: "book-atomic-habits",
      title: "Atomic Habits",
      slug: "atomic-habits",
      author: "James Clear",
      authorBio:
        "James Clear is a writer and speaker focused on habits, decision making, and continuous improvement.",
      isbn10: "0735211299",
      isbn13: "9780735211292",
      description:
        "No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear reveals practical strategies that teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
      price: 799,
      discountPrice: 549,
      stockQuantity: 45,
      weightGrams: 410,
      coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
      galleryUrls: "[]",
      format: "HARDCOVER",
      language: "English",
      pages: 320,
      publisher: "Avery",
      publishedDate: "2018-10-16",
      categoryId: "cat-philosophy",
      isFeatured: true,
      isActive: true,
      ratingAvg: 4.8,
      reviewCount: 0,
      createdAt: new Date("2026-11-24T06:00:00Z"),
      updatedAt: now,
    },
    {
      id: "book-cosmos",
      title: "Cosmos",
      slug: "cosmos-carl-sagan",
      author: "Carl Sagan",
      authorBio:
        "Carl Sagan was an astronomer, planetary scientist, cosmologist, and Pulitzer Prize-winning author.",
      isbn10: "0345539435",
      isbn13: "9780345539434",
      description:
        "Cosmos is one of the bestselling science books of all time. In clear-eyed prose, Sagan reveals a jewel-like blue world inhabited by a life form that is just beginning to discover its own identity and to venture into the vast ocean of space.",
      price: 650,
      discountPrice: 499,
      stockQuantity: 11,
      weightGrams: 420,
      coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780345539434-L.jpg",
      galleryUrls: "[]",
      format: "PAPERBACK",
      language: "English",
      pages: 432,
      publisher: "Ballantine Books",
      publishedDate: "2013-12-10",
      categoryId: "cat-science",
      isFeatured: false,
      isActive: true,
      ratingAvg: 4.9,
      reviewCount: 0,
      createdAt: new Date("2026-11-24T05:00:00Z"),
      updatedAt: now,
    },
    {
      id: "book-zero-to-one",
      title: "Zero to One",
      slug: "zero-to-one",
      author: "Peter Thiel & Blake Masters",
      authorBio:
        "Peter Thiel is an entrepreneur and investor who co-founded PayPal and Palantir.",
      isbn10: "0804139296",
      isbn13: "9780804139298",
      description:
        "The next Bill Gates will not build an operating system. The next Larry Page or Sergey Brin won't make a search engine. Tomorrow's champions will not win by competing ruthlessly in today's marketplace—they will escape competition altogether.",
      price: 599,
      discountPrice: 449,
      stockQuantity: 4,
      weightGrams: 310,
      coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg",
      galleryUrls: "[]",
      format: "HARDCOVER",
      language: "English",
      pages: 224,
      publisher: "Crown Business",
      publishedDate: "2014-09-16",
      categoryId: "cat-business",
      isFeatured: false,
      isActive: true,
      ratingAvg: 4.6,
      reviewCount: 0,
      createdAt: new Date("2026-11-24T04:00:00Z"),
      updatedAt: now,
    },
    {
      id: "book-thinking-fast",
      title: "Thinking, Fast and Slow",
      slug: "thinking-fast-and-slow",
      author: "Daniel Kahneman",
      authorBio:
        "Daniel Kahneman was a Nobel Prize-winning psychologist and behavioral economist.",
      isbn10: "0374533555",
      isbn13: "9780374533557",
      description:
        "In this international bestseller, Daniel Kahneman takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think: System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical.",
      price: 699,
      discountPrice: 529,
      stockQuantity: 19,
      weightGrams: 510,
      coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg",
      galleryUrls: "[]",
      format: "PAPERBACK",
      language: "English",
      pages: 499,
      publisher: "Farrar, Straus and Giroux",
      publishedDate: "2013-04-02",
      categoryId: "cat-philosophy",
      isFeatured: false,
      isActive: true,
      ratingAvg: 4.7,
      reviewCount: 0,
      createdAt: new Date("2026-11-24T03:00:00Z"),
      updatedAt: now,
    },
    {
      id: "book-clean-arch",
      title: "Clean Architecture (Digital Edition)",
      slug: "clean-architecture-ebook",
      author: "Robert C. Martin",
      authorBio:
        "Robert C. Martin (Uncle Bob) has been a software professional since 1970 and an international software consultant.",
      isbn10: "0134494164",
      isbn13: "9780134494166",
      description:
        "Building upon the success of bestsellers Clean Code and The Clean Coder, legendary software craftsman Robert C. Martin reveals the universal rules of software architecture that dramatically improve developer productivity throughout the life of any software system.",
      price: 999,
      discountPrice: 749,
      stockQuantity: 999,
      weightGrams: 0,
      coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780134494166-L.jpg",
      galleryUrls: "[]",
      format: "EBOOK",
      language: "English",
      pages: 432,
      publisher: "Prentice Hall",
      publishedDate: "2017-09-20",
      categoryId: "cat-tech",
      isFeatured: false,
      isActive: true,
      ratingAvg: 4.8,
      reviewCount: 0,
      createdAt: new Date("2026-11-24T02:00:00Z"),
      updatedAt: now,
    },
    {
      id: "book-psych-money",
      title: "The Psychology of Money",
      slug: "the-psychology-of-money",
      author: "Morgan Housel",
      authorBio:
        "Morgan Housel is a partner at The Collaborative Fund and a former columnist at The Motley Fool and The Wall Street Journal.",
      isbn10: "0857197681",
      isbn13: "9780857197689",
      description:
        "Doing well with money isn't necessarily about what you know. It's about how you behave. And behavior is hard to teach, even to really smart people. Morgan Housel shares 19 short stories exploring the strange ways people think about money.",
      price: 499,
      discountPrice: 349,
      stockQuantity: 27,
      weightGrams: 290,
      coverImageUrl: "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg",
      galleryUrls: "[]",
      format: "PAPERBACK",
      language: "English",
      pages: 256,
      publisher: "Harriman House",
      publishedDate: "2020-09-08",
      categoryId: "cat-business",
      isFeatured: true,
      isActive: true,
      ratingAvg: 4.9,
      reviewCount: 0,
      createdAt: new Date("2026-11-24T01:00:00Z"),
      updatedAt: now,
    },
  ];

  const reviews: DemoReview[] = books.slice(0, 6).map((b, i) => ({
    id: `demo-rev-${i + 1}`,
    bookId: b.id,
    userId: "demo-reader-1",
    rating: 5,
    comment:
      "Beautiful edition, crisp print quality, and arrived carefully packaged. Essential reading!",
    createdAt: now,
  }));

  const addresses: DemoAddress[] = [
    {
      id: "seed-address-1",
      userId: "demo-reader-1",
      fullName: "Priya Nair",
      phone: "+91 9876543210",
      line1: "42 Indiranagar 100 Feet Road",
      line2: "Apt 4B, Maple Court",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      country: "India",
      isDefault: true,
      createdAt: now,
    },
  ];

  const coupons: DemoCoupon[] = [
    {
      id: "coupon-read10",
      code: "READ10",
      discountType: "PERCENT",
      discountValue: 10,
      minOrderAmount: 500,
      maxUses: null,
      usedCount: 1,
      expiresAt: null,
      isActive: true,
      createdAt: now,
    },
    {
      id: "coupon-welcome",
      code: "WELCOME150",
      discountType: "FIXED",
      discountValue: 150,
      minOrderAmount: 800,
      maxUses: null,
      usedCount: 0,
      expiresAt: null,
      isActive: true,
      createdAt: now,
    },
  ];

  const orders: DemoOrder[] = [
    {
      id: "demo-order-1",
      orderNumber: "FS-261124-DEMO1",
      userId: "demo-reader-1",
      guestEmail: null,
      subtotal: 2048,
      discountAmount: 204.8,
      shippingAmount: 0,
      totalAmount: 1843.2,
      couponCode: "READ10",
      status: "SHIPPED",
      paymentProvider: "mock",
      paymentIntentId: "mock_pi_seed_001",
      paymentId: "mock_pay_seed_001",
      shippingAddress: JSON.stringify({
        fullName: "Priya Nair",
        phone: "+91 9876543210",
        line1: "42 Indiranagar 100 Feet Road",
        line2: "Apt 4B, Maple Court",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560038",
        country: "India",
      }),
      trackingNumber: "BD-99281746IN",
      createdAt: now,
      updatedAt: now,
    },
  ];

  const orderItems: DemoOrderItem[] = [
    {
      id: "demo-oi-1",
      orderId: "demo-order-1",
      bookId: "book-ddia",
      quantity: 1,
      priceAtPurchase: 1499,
    },
    {
      id: "demo-oi-2",
      orderId: "demo-order-1",
      bookId: "book-dune",
      quantity: 1,
      priceAtPurchase: 549,
    },
  ];

  return {
    users,
    categories,
    books,
    reviews,
    wishlistItems: [],
    cartItems: [],
    addresses,
    coupons,
    orders,
    orderItems,
  };
}

const globalForDemo = globalThis as unknown as {
  __demoState?: DemoState;
};

function getState(): DemoState {
  if (!globalForDemo.__demoState) {
    globalForDemo.__demoState = createInitialState();
  }
  return globalForDemo.__demoState;
}

export function resetDemoStore() {
  globalForDemo.__demoState = createInitialState();
}

export function shouldUseDemoStore(): boolean {
  if (process.env.USE_DEMO_STORE === "true") return true;
  const url = process.env.DATABASE_URL || "";
  if (!url) return true;
  if (process.env.VERCEL && url.startsWith("file:")) return true;
  return false;
}

type WhereObj = Record<string, unknown>;

function matchStringFilter(actual: string | null | undefined, cond: unknown): boolean {
  if (cond === undefined) return true;
  if (typeof cond === "string") return actual === cond;
  if (cond && typeof cond === "object") {
    const c = cond as Record<string, unknown>;
    if (typeof c.equals === "string") return actual === c.equals;
    if (typeof c.contains === "string") {
      return (actual || "").toLowerCase().includes(c.contains.toLowerCase());
    }
    if (typeof c.not === "string") return actual !== c.not;
  }
  return true;
}

function matchNumberFilter(actual: number, cond: unknown): boolean {
  if (cond === undefined) return true;
  if (typeof cond === "number") return actual === cond;
  if (cond && typeof cond === "object") {
    const c = cond as Record<string, number>;
    if (c.gte !== undefined && actual < c.gte) return false;
    if (c.lte !== undefined && actual > c.lte) return false;
    if (c.lt !== undefined && actual >= c.lt) return false;
    if (c.gt !== undefined && actual <= c.gt) return false;
  }
  return true;
}

function matchBook(book: DemoBook, where: WhereObj | undefined, state: DemoState): boolean {
  if (!where) return true;
  if (where.isActive !== undefined && book.isActive !== where.isActive) return false;
  if (where.isFeatured !== undefined && book.isFeatured !== where.isFeatured) return false;
  if (where.id !== undefined) {
    if (typeof where.id === "string" && book.id !== where.id) return false;
    if (where.id && typeof where.id === "object" && Array.isArray((where.id as { in?: string[] }).in)) {
      if (!(where.id as { in: string[] }).in.includes(book.id)) return false;
    }
  }
  if (where.slug !== undefined && book.slug !== where.slug) return false;
  if (where.categoryId !== undefined && book.categoryId !== where.categoryId) return false;
  if (where.category && typeof where.category === "object") {
    const catSlug = (where.category as { slug?: string }).slug;
    if (catSlug) {
      const cat = state.categories.find((c) => c.id === book.categoryId);
      if (!cat || cat.slug !== catSlug) return false;
    }
  }
  if (!matchStringFilter(book.format, where.format)) return false;
  if (!matchStringFilter(book.language, where.language)) return false;
  if (!matchNumberFilter(book.stockQuantity, where.stockQuantity)) return false;
  if (!matchNumberFilter(book.ratingAvg, where.ratingAvg)) return false;
  if (!matchNumberFilter(book.price, where.price)) return false;

  if (Array.isArray(where.OR)) {
    const anyMatch = where.OR.some((clause) => matchBook(book, clause as WhereObj, state));
    if (!anyMatch) return false;
  }
  if (where.title !== undefined && !matchStringFilter(book.title, where.title)) return false;
  if (where.author !== undefined && !matchStringFilter(book.author, where.author)) return false;
  if (where.isbn10 !== undefined && !matchStringFilter(book.isbn10, where.isbn10)) return false;
  if (where.isbn13 !== undefined && !matchStringFilter(book.isbn13, where.isbn13)) return false;
  if (where.publisher !== undefined && !matchStringFilter(book.publisher, where.publisher)) return false;

  return true;
}

function pickSelect<T extends object>(row: T, select?: Record<string, unknown>): T {
  if (!select) return { ...row };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(select)) {
    if (v) out[k] = (row as Record<string, unknown>)[k];
  }
  return out as T;
}

function hydrateBook(book: DemoBook, include: WhereObj | undefined, state: DemoState) {
  const result: Record<string, unknown> = { ...book };
  if (!include) return result;
  if (include.category) {
    const cat = state.categories.find((c) => c.id === book.categoryId) || null;
    if (cat && typeof include.category === "object" && (include.category as WhereObj).select) {
      result.category = pickSelect(cat, (include.category as WhereObj).select as Record<string, unknown>);
    } else {
      result.category = cat;
    }
  }
  if (include.reviews) {
    const revs = state.reviews
      .filter((r) => r.bookId === book.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((r) => ({
        ...r,
        user: (() => {
          const u = state.users.find((usr) => usr.id === r.userId);
          return u
            ? { id: u.id, name: u.name, image: u.image }
            : { id: r.userId, name: "Verified Reader", image: null };
        })(),
      }));
    result.reviews = revs;
  }
  if (include._count) {
    const orderCount = state.orderItems.filter((oi) => oi.bookId === book.id).length;
    result._count = { orderItems: orderCount };
  }
  return result;
}

function sortBooks(books: DemoBook[], orderBy: unknown, state: DemoState): DemoBook[] {
  const list = [...books];
  const specs = Array.isArray(orderBy) ? orderBy : orderBy ? [orderBy] : [];
  if (specs.length === 0) return list;

  const orderCount = (bookId: string) =>
    state.orderItems.filter((oi) => oi.bookId === bookId).length;

  list.sort((a, b) => {
    for (const spec of specs) {
      if (!spec || typeof spec !== "object") continue;
      const s = spec as Record<string, unknown>;
      if (s.createdAt) {
        const diff = a.createdAt.getTime() - b.createdAt.getTime();
        if (diff !== 0) return s.createdAt === "desc" ? -diff : diff;
      }
      if (s.price) {
        const diff = a.price - b.price;
        if (diff !== 0) return s.price === "desc" ? -diff : diff;
      }
      if (s.ratingAvg) {
        const diff = a.ratingAvg - b.ratingAvg;
        if (diff !== 0) return s.ratingAvg === "desc" ? -diff : diff;
      }
      if (s.stockQuantity) {
        const diff = a.stockQuantity - b.stockQuantity;
        if (diff !== 0) return s.stockQuantity === "desc" ? -diff : diff;
      }
      if (s.orderItems && typeof s.orderItems === "object") {
        const dir = (s.orderItems as { _count?: string })._count;
        const diff = orderCount(a.id) - orderCount(b.id);
        if (diff !== 0) return dir === "desc" ? -diff : diff;
      }
    }
    return 0;
  });
  return list;
}

function hydrateOrder(order: DemoOrder, include: WhereObj | undefined, state: DemoState) {
  const result: Record<string, unknown> = { ...order };
  if (!include) return result;
  if (include.user) {
    const u = order.userId ? state.users.find((usr) => usr.id === order.userId) : null;
    result.user = u
      ? typeof include.user === "object" && (include.user as WhereObj).select
        ? pickSelect(u, (include.user as WhereObj).select as Record<string, unknown>)
        : u
      : null;
  }
  if (include.items) {
    const itemsInclude =
      typeof include.items === "object"
        ? ((include.items as WhereObj).include as WhereObj | undefined)
        : undefined;
    result.items = state.orderItems
      .filter((oi) => oi.orderId === order.id)
      .map((oi) => {
        const row: Record<string, unknown> = { ...oi };
        if (itemsInclude?.book) {
          const b = state.books.find((bk) => bk.id === oi.bookId) || null;
          if (b && typeof itemsInclude.book === "object" && (itemsInclude.book as WhereObj).select) {
            row.book = pickSelect(b, (itemsInclude.book as WhereObj).select as Record<string, unknown>);
          } else {
            row.book = b;
          }
        }
        return row;
      });
  }
  return result;
}

export function createDemoPrismaClient() {
  const state = getState();

  const models = {
    user: {
      async findUnique(args: { where: { id?: string; email?: string }; select?: Record<string, unknown> }) {
        const found = state.users.find((u) =>
          args.where.id ? u.id === args.where.id : u.email === args.where.email
        );
        return found ? pickSelect(found, args.select) : null;
      },
      async create(args: {
        data: { name?: string | null; email: string; passwordHash?: string | null; role?: "CUSTOMER" | "ADMIN" };
        select?: Record<string, unknown>;
      }) {
        const now = new Date();
        const user: DemoUser = {
          id: createId("user"),
          name: args.data.name ?? null,
          email: args.data.email,
          emailVerified: null,
          passwordHash: args.data.passwordHash ?? null,
          image: null,
          role: args.data.role || "CUSTOMER",
          createdAt: now,
          updatedAt: now,
        };
        state.users.push(user);
        return pickSelect(user, args.select);
      },
    },

    category: {
      async findMany(args?: { orderBy?: { name?: "asc" | "desc" }; include?: WhereObj }) {
        const list = [...state.categories];
        if (args?.orderBy?.name) {
          list.sort((a, b) =>
            args.orderBy!.name === "desc"
              ? b.name.localeCompare(a.name)
              : a.name.localeCompare(b.name)
          );
        }
        return list.map((c) => {
          if (args?.include?._count) {
            const count = state.books.filter(
              (b) => b.categoryId === c.id && b.isActive
            ).length;
            return { ...c, _count: { books: count } };
          }
          return { ...c };
        });
      },
      async upsert(args: {
        where: { slug: string };
        update: Partial<DemoCategory>;
        create: { name: string; slug: string; description?: string };
      }) {
        const existing = state.categories.find((c) => c.slug === args.where.slug);
        if (existing) {
          Object.assign(existing, args.update);
          return { ...existing };
        }
        const created: DemoCategory = {
          id: createId("cat"),
          name: args.create.name,
          slug: args.create.slug,
          description: args.create.description || null,
          createdAt: new Date(),
        };
        state.categories.push(created);
        return { ...created };
      },
    },

    book: {
      async findMany(args?: {
        where?: WhereObj;
        orderBy?: unknown;
        skip?: number;
        take?: number;
        include?: WhereObj;
        distinct?: string[];
        select?: Record<string, unknown>;
      }) {
        let filtered = state.books.filter((b) => matchBook(b, args?.where, state));
        filtered = sortBooks(filtered, args?.orderBy, state);
        if (args?.distinct?.includes("language")) {
          const seen = new Set<string>();
          filtered = filtered.filter((b) => {
            if (seen.has(b.language)) return false;
            seen.add(b.language);
            return true;
          });
        }
        const skip = args?.skip || 0;
        const sliced =
          args?.take !== undefined
            ? filtered.slice(skip, skip + args.take)
            : filtered.slice(skip);

        return sliced.map((b) => {
          if (args?.select) return pickSelect(b, args.select);
          return hydrateBook(b, args?.include, state);
        });
      },
      async count(args?: { where?: WhereObj }) {
        return state.books.filter((b) => matchBook(b, args?.where, state)).length;
      },
      async findUnique(args: {
        where: { id?: string; slug?: string };
        include?: WhereObj;
        select?: Record<string, unknown>;
      }) {
        const found = state.books.find((b) =>
          args.where.id ? b.id === args.where.id : b.slug === args.where.slug
        );
        if (!found) return null;
        if (args.select) return pickSelect(found, args.select);
        return hydrateBook(found, args.include, state);
      },
      async create(args: { data: Partial<DemoBook> & { title: string; slug: string; author: string; description: string; price: number; coverImageUrl: string; categoryId: string }; include?: WhereObj }) {
        const now = new Date();
        const book: DemoBook = {
          id: createId("book"),
          title: args.data.title,
          slug: args.data.slug,
          author: args.data.author,
          authorBio: args.data.authorBio ?? null,
          isbn10: args.data.isbn10 ?? null,
          isbn13: args.data.isbn13 ?? null,
          description: args.data.description,
          price: args.data.price,
          discountPrice: args.data.discountPrice ?? null,
          stockQuantity: args.data.stockQuantity ?? 0,
          weightGrams: args.data.weightGrams ?? 350,
          coverImageUrl: args.data.coverImageUrl,
          galleryUrls: args.data.galleryUrls ?? "[]",
          format: args.data.format ?? "PAPERBACK",
          language: args.data.language ?? "English",
          pages: args.data.pages ?? null,
          publisher: args.data.publisher ?? null,
          publishedDate: args.data.publishedDate ?? null,
          categoryId: args.data.categoryId,
          isFeatured: args.data.isFeatured ?? false,
          isActive: args.data.isActive ?? true,
          ratingAvg: 0,
          reviewCount: 0,
          createdAt: now,
          updatedAt: now,
        };
        state.books.unshift(book);
        return hydrateBook(book, args.include, state);
      },
      async update(args: { where: { id: string }; data: Partial<DemoBook>; include?: WhereObj }) {
        const found = state.books.find((b) => b.id === args.where.id);
        if (!found) throw new Error("Book not found");
        Object.assign(found, args.data, { updatedAt: new Date() });
        return hydrateBook(found, args.include, state);
      },
      async updateMany(args: {
        where: { id: string; stockQuantity?: { gte: number } };
        data: { stockQuantity: { decrement: number } };
      }) {
        const found = state.books.find((b) => b.id === args.where.id);
        if (!found) return { count: 0 };
        if (
          args.where.stockQuantity?.gte !== undefined &&
          found.stockQuantity < args.where.stockQuantity.gte
        ) {
          return { count: 0 };
        }
        found.stockQuantity -= args.data.stockQuantity.decrement;
        found.updatedAt = new Date();
        return { count: 1 };
      },
      async delete(args: { where: { id: string } }) {
        const idx = state.books.findIndex((b) => b.id === args.where.id);
        if (idx === -1) throw new Error("Book not found");
        const [removed] = state.books.splice(idx, 1);
        return removed;
      },
    },

    review: {
      async upsert(args: {
        where: { bookId_userId: { bookId: string; userId: string } };
        update: { rating: number; comment: string };
        create: { bookId: string; userId: string; rating: number; comment: string };
        include?: WhereObj;
      }) {
        const existing = state.reviews.find(
          (r) =>
            r.bookId === args.where.bookId_userId.bookId &&
            r.userId === args.where.bookId_userId.userId
        );
        let saved: DemoReview;
        if (existing) {
          existing.rating = args.update.rating;
          existing.comment = args.update.comment;
          saved = existing;
        } else {
          saved = {
            id: createId("rev"),
            ...args.create,
            createdAt: new Date(),
          };
          state.reviews.unshift(saved);
        }
        const u = state.users.find((usr) => usr.id === saved.userId);
        return {
          ...saved,
          user: u
            ? { id: u.id, name: u.name, image: u.image }
            : { id: saved.userId, name: "Verified Reader", image: null },
        };
      },
      async aggregate(args: { where: { bookId: string } }) {
        const matches = state.reviews.filter((r) => r.bookId === args.where.bookId);
        const count = matches.length;
        const avg =
          count === 0
            ? null
            : matches.reduce((sum, r) => sum + r.rating, 0) / count;
        return { _avg: { rating: avg }, _count: { rating: count } };
      },
    },

    wishlistItem: {
      async findMany(args: { where: { userId: string }; include?: WhereObj }) {
        return state.wishlistItems
          .filter((w) => w.userId === args.where.userId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .map((w) => {
            const book = state.books.find((b) => b.id === w.bookId)!;
            return {
              ...w,
              book: hydrateBook(book, { category: { select: { name: true, slug: true } } }, state),
            };
          });
      },
      async findUnique(args: { where: { userId_bookId: { userId: string; bookId: string } } }) {
        return (
          state.wishlistItems.find(
            (w) =>
              w.userId === args.where.userId_bookId.userId &&
              w.bookId === args.where.userId_bookId.bookId
          ) || null
        );
      },
      async create(args: { data: { userId: string; bookId: string } }) {
        const item: DemoWishlistItem = {
          id: createId("wish"),
          userId: args.data.userId,
          bookId: args.data.bookId,
          createdAt: new Date(),
        };
        state.wishlistItems.push(item);
        return item;
      },
      async delete(args: { where: { id: string } }) {
        const idx = state.wishlistItems.findIndex((w) => w.id === args.where.id);
        if (idx >= 0) state.wishlistItems.splice(idx, 1);
      },
    },

    cartItem: {
      async findMany(args: { where: { userId: string } }) {
        return state.cartItems
          .filter((c) => c.userId === args.where.userId)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          .map((c) => {
            const book = state.books.find((b) => b.id === c.bookId)!;
            return {
              ...c,
              book: hydrateBook(book, { category: { select: { name: true, slug: true } } }, state),
            };
          });
      },
      async findUnique(args: { where: { userId_bookId: { userId: string; bookId: string } } }) {
        return (
          state.cartItems.find(
            (c) =>
              c.userId === args.where.userId_bookId.userId &&
              c.bookId === args.where.userId_bookId.bookId
          ) || null
        );
      },
      async upsert(args: {
        where: { userId_bookId: { userId: string; bookId: string } };
        update: { quantity: number };
        create: { userId: string; bookId: string; quantity: number };
      }) {
        const existing = state.cartItems.find(
          (c) =>
            c.userId === args.where.userId_bookId.userId &&
            c.bookId === args.where.userId_bookId.bookId
        );
        if (existing) {
          existing.quantity = args.update.quantity;
          existing.updatedAt = new Date();
          return existing;
        }
        const now = new Date();
        const created: DemoCartItem = {
          id: createId("cart"),
          ...args.create,
          createdAt: now,
          updatedAt: now,
        };
        state.cartItems.push(created);
        return created;
      },
      async deleteMany(args: { where: { userId: string; bookId?: string } }) {
        state.cartItems = state.cartItems.filter((c) => {
          if (c.userId !== args.where.userId) return true;
          if (args.where.bookId && c.bookId !== args.where.bookId) return true;
          return false;
        });
      },
    },

    address: {
      async findMany(args: { where: { userId: string } }) {
        return state.addresses
          .filter((a) => a.userId === args.where.userId)
          .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
      },
      async updateMany(args: { where: { userId: string }; data: { isDefault: boolean } }) {
        for (const addr of state.addresses) {
          if (addr.userId === args.where.userId) {
            addr.isDefault = args.data.isDefault;
          }
        }
      },
      async create(args: {
        data: Omit<DemoAddress, "id" | "createdAt">;
      }) {
        const addr: DemoAddress = {
          id: createId("addr"),
          ...args.data,
          createdAt: new Date(),
        };
        state.addresses.unshift(addr);
        return addr;
      },
      async deleteMany(args: { where: { id: string; userId: string } }) {
        state.addresses = state.addresses.filter(
          (a) => !(a.id === args.where.id && a.userId === args.where.userId)
        );
      },
    },

    coupon: {
      async findMany() {
        return [...state.coupons];
      },
      async findUnique(args: { where: { code: string } }) {
        return state.coupons.find((c) => c.code === args.where.code) || null;
      },
      async create(args: {
        data: {
          code: string;
          discountType: "PERCENT" | "FIXED";
          discountValue: number;
          minOrderAmount: number;
          maxUses: number | null;
        };
      }) {
        const coupon: DemoCoupon = {
          id: createId("cpn"),
          ...args.data,
          usedCount: 0,
          expiresAt: null,
          isActive: true,
          createdAt: new Date(),
        };
        state.coupons.unshift(coupon);
        return coupon;
      },
      async updateMany(args: {
        where: { code: string };
        data: { usedCount: { increment: number } };
      }) {
        for (const c of state.coupons) {
          if (c.code === args.where.code) {
            c.usedCount += args.data.usedCount.increment;
          }
        }
      },
      async delete(args: { where: { id: string } }) {
        state.coupons = state.coupons.filter((c) => c.id !== args.where.id);
      },
    },

    order: {
      async findMany(args?: {
        where?: WhereObj;
        include?: WhereObj;
        select?: Record<string, unknown>;
      }) {
        const filtered = state.orders
          .filter((o) => {
            if (!args?.where) return true;
            if (args.where.userId && o.userId !== args.where.userId) return false;
            if (args.where.status) {
              if (typeof args.where.status === "string" && o.status !== args.where.status)
                return false;
              if (
                typeof args.where.status === "object" &&
                (args.where.status as { not?: string }).not === o.status
              )
                return false;
            }
            return true;
          })
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return filtered.map((o) => {
          if (args?.select) return pickSelect(o, args.select);
          return hydrateOrder(o, args?.include, state);
        });
      },
      async findFirst(args: {
        where: { id?: string; paymentIntentId?: string };
        include?: WhereObj;
      }) {
        const found = state.orders.find((o) =>
          args.where.id
            ? o.id === args.where.id
            : o.paymentIntentId === args.where.paymentIntentId
        );
        return found ? hydrateOrder(found, args.include, state) : null;
      },
      async findUnique(args: { where: { id: string }; include?: WhereObj }) {
        const found = state.orders.find((o) => o.id === args.where.id);
        return found ? hydrateOrder(found, args.include, state) : null;
      },
      async create(args: {
        data: Omit<DemoOrder, "id" | "createdAt" | "updatedAt" | "paymentId" | "paymentIntentId" | "trackingNumber"> & {
          items: { create: Array<{ bookId: string; quantity: number; priceAtPurchase: number }> };
        };
      }) {
        const now = new Date();
        const { items, ...rest } = args.data;
        const order: DemoOrder = {
          id: createId("ord"),
          ...rest,
          paymentIntentId: null,
          paymentId: null,
          trackingNumber: null,
          createdAt: now,
          updatedAt: now,
        };
        state.orders.unshift(order);
        for (const item of items.create) {
          state.orderItems.push({
            id: createId("oi"),
            orderId: order.id,
            bookId: item.bookId,
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
          });
        }
        return { ...order };
      },
      async update(args: {
        where: { id: string };
        data: Partial<DemoOrder>;
        include?: WhereObj;
      }) {
        const found = state.orders.find((o) => o.id === args.where.id);
        if (!found) throw new Error("Order not found");
        for (const [k, v] of Object.entries(args.data)) {
          if (v !== undefined) {
            (found as unknown as Record<string, unknown>)[k] = v;
          }
        }
        found.updatedAt = new Date();
        return hydrateOrder(found, args.include, state);
      },
      async updateMany(args: {
        where: { id?: string; paymentIntentId?: string; status?: DemoOrder["status"] };
        data: Partial<DemoOrder>;
      }) {
        for (const o of state.orders) {
          const matchesId = args.where.id
            ? o.id === args.where.id
            : o.paymentIntentId === args.where.paymentIntentId;
          const matchesStatus = args.where.status
            ? o.status === args.where.status
            : true;
          if (matchesId && matchesStatus) {
            Object.assign(o, args.data, { updatedAt: new Date() });
          }
        }
      },
    },

    orderItem: {
      async groupBy(args: { take?: number }) {
        const sums = new Map<string, number>();
        for (const oi of state.orderItems) {
          sums.set(oi.bookId, (sums.get(oi.bookId) || 0) + oi.quantity);
        }
        const rows = Array.from(sums.entries())
          .map(([bookId, qty]) => ({ bookId, _sum: { quantity: qty } }))
          .sort((a, b) => b._sum.quantity - a._sum.quantity);
        return args.take ? rows.slice(0, args.take) : rows;
      },
    },
  };

  return {
    ...models,
    async $transaction<T>(fn: (tx: typeof models) => Promise<T>): Promise<T> {
      return fn(models);
    },
  };
}
