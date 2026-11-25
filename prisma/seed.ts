import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Folio & Spine bookstore database...");

  const adminPassword = await bcrypt.hash("admin1234", 10);
  const customerPassword = await bcrypt.hash("reader1234", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@folioandspine.com" },
    update: {},
    create: {
      name: "Aarav Mehta (Store Owner)",
      email: "admin@folioandspine.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const reader = await prisma.user.upsert({
    where: { email: "reader@folioandspine.com" },
    update: {},
    create: {
      name: "Priya Nair",
      email: "reader@folioandspine.com",
      passwordHash: customerPassword,
      role: "CUSTOMER",
    },
  });

  await prisma.address.upsert({
    where: { id: "seed-address-1" },
    update: {},
    create: {
      id: "seed-address-1",
      userId: reader.id,
      fullName: "Priya Nair",
      phone: "+91 9876543210",
      line1: "42 Indiranagar 100 Feet Road",
      line2: "Apt 4B, Maple Court",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560038",
      country: "India",
      isDefault: true,
    },
  });

  const categoriesData = [
    {
      name: "Literary Fiction",
      slug: "literary-fiction",
      description: "Award-winning contemporary and classic novels.",
    },
    {
      name: "Technology & Design",
      slug: "technology-design",
      description: "Software engineering, architecture, and craft.",
    },
    {
      name: "Science & Cosmos",
      slug: "science-cosmos",
      description: "Physics, biology, and the natural world.",
    },
    {
      name: "Business & Strategy",
      slug: "business-strategy",
      description: "Entrepreneurship, economics, and leadership.",
    },
    {
      name: "History & Biography",
      slug: "history-biography",
      description: "Lives, empires, and pivotal human stories.",
    },
    {
      name: "Philosophy & Craft",
      slug: "philosophy-craft",
      description: "Essays, mindfulness, and deep thinking.",
    },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    categories[cat.slug] = record.id;
  }

  const booksData = [
    {
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
      coverImageUrl:
        "https://covers.openlibrary.org/b/isbn/9781449373320-L.jpg",
      format: "PAPERBACK" as const,
      language: "English",
      pages: 616,
      publisher: "O'Reilly Media",
      publishedDate: "2017-04-18",
      categorySlug: "technology-design",
      isFeatured: true,
    },
    {
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
      coverImageUrl:
        "https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg",
      format: "HARDCOVER" as const,
      language: "English",
      pages: 352,
      publisher: "Addison-Wesley Professional",
      publishedDate: "2019-09-13",
      categorySlug: "technology-design",
      isFeatured: true,
    },
    {
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
      stockQuantity: 3, // Low stock alert demo
      weightGrams: 460,
      coverImageUrl:
        "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg",
      format: "PAPERBACK" as const,
      language: "English",
      pages: 896,
      publisher: "Ace Books",
      publishedDate: "1990-09-01",
      categorySlug: "literary-fiction",
      isFeatured: true,
    },
    {
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
      coverImageUrl:
        "https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg",
      format: "HARDCOVER" as const,
      language: "English",
      pages: 496,
      publisher: "Ballantine Books",
      publishedDate: "2021-05-04",
      categorySlug: "literary-fiction",
      isFeatured: true,
    },
    {
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
      coverImageUrl:
        "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
      format: "PAPERBACK" as const,
      language: "English",
      pages: 464,
      publisher: "Harper",
      publishedDate: "2015-02-10",
      categorySlug: "history-biography",
      isFeatured: true,
    },
    {
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
      stockQuantity: 2, // Low stock alert demo
      weightGrams: 390,
      coverImageUrl:
        "https://covers.openlibrary.org/b/isbn/9780465050659-L.jpg",
      format: "PAPERBACK" as const,
      language: "English",
      pages: 368,
      publisher: "Basic Books",
      publishedDate: "2013-11-05",
      categorySlug: "technology-design",
      isFeatured: false,
    },
    {
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
      coverImageUrl:
        "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
      format: "HARDCOVER" as const,
      language: "English",
      pages: 320,
      publisher: "Avery",
      publishedDate: "2018-10-16",
      categorySlug: "philosophy-craft",
      isFeatured: true,
    },
    {
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
      coverImageUrl:
        "https://covers.openlibrary.org/b/isbn/9780345539434-L.jpg",
      format: "PAPERBACK" as const,
      language: "English",
      pages: 432,
      publisher: "Ballantine Books",
      publishedDate: "2013-12-10",
      categorySlug: "science-cosmos",
      isFeatured: false,
    },
    {
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
      stockQuantity: 4, // Low stock alert demo
      weightGrams: 310,
      coverImageUrl:
        "https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg",
      format: "HARDCOVER" as const,
      language: "English",
      pages: 224,
      publisher: "Crown Business",
      publishedDate: "2014-09-16",
      categorySlug: "business-strategy",
      isFeatured: false,
    },
    {
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
      coverImageUrl:
        "https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg",
      format: "PAPERBACK" as const,
      language: "English",
      pages: 499,
      publisher: "Farrar, Straus and Giroux",
      publishedDate: "2013-04-02",
      categorySlug: "philosophy-craft",
      isFeatured: false,
    },
    {
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
      coverImageUrl:
        "https://covers.openlibrary.org/b/isbn/9780134494166-L.jpg",
      format: "EBOOK" as const,
      language: "English",
      pages: 432,
      publisher: "Prentice Hall",
      publishedDate: "2017-09-20",
      categorySlug: "technology-design",
      isFeatured: false,
    },
    {
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
      coverImageUrl:
        "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg",
      format: "PAPERBACK" as const,
      language: "English",
      pages: 256,
      publisher: "Harriman House",
      publishedDate: "2020-09-08",
      categorySlug: "business-strategy",
      isFeatured: true,
    },
  ];

  const createdBooks: Array<{ id: string; price: number; discountPrice: number | null }> = [];
  for (const b of booksData) {
    const { categorySlug, ...rest } = b;
    const book = await prisma.book.upsert({
      where: { slug: rest.slug },
      update: {
        ...rest,
        categoryId: categories[categorySlug],
      },
      create: {
        ...rest,
        categoryId: categories[categorySlug],
        ratingAvg: 4.8,
        reviewCount: 1,
      },
    });
    createdBooks.push({
      id: book.id,
      price: book.price,
      discountPrice: book.discountPrice,
    });
  }

  // Seed initial reviews from reader
  for (const book of createdBooks.slice(0, 6)) {
    await prisma.review.upsert({
      where: {
        bookId_userId: {
          bookId: book.id,
          userId: reader.id,
        },
      },
      update: {},
      create: {
        bookId: book.id,
        userId: reader.id,
        rating: 5,
        comment:
          "Beautiful edition, crisp print quality, and arrived carefully packaged. Essential reading!",
      },
    });
  }

  // Seed promo coupons
  await prisma.coupon.upsert({
    where: { code: "READ10" },
    update: {},
    create: {
      code: "READ10",
      discountType: "PERCENT",
      discountValue: 10,
      minOrderAmount: 500,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "WELCOME150" },
    update: {},
    create: {
      code: "WELCOME150",
      discountType: "FIXED",
      discountValue: 150,
      minOrderAmount: 800,
      isActive: true,
    },
  });

  // Seed one historical paid/shipped order so Admin Analytics & Order Fulfillment have immediate data
  await prisma.order.upsert({
    where: { orderNumber: "FS-261124-DEMO1" },
    update: {},
    create: {
      orderNumber: "FS-261124-DEMO1",
      userId: reader.id,
      subtotal: 2048,
      discountAmount: 204.8,
      shippingAmount: 0,
      totalAmount: 1843.2,
      couponCode: "READ10",
      status: "SHIPPED",
      paymentProvider: "mock",
      paymentId: "mock_pay_seed_001",
      trackingNumber: "BD-99281746IN",
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
      items: {
        create: [
          {
            bookId: createdBooks[0].id,
            quantity: 1,
            priceAtPurchase: createdBooks[0].discountPrice ?? createdBooks[0].price,
          },
          {
            bookId: createdBooks[2].id,
            quantity: 1,
            priceAtPurchase: createdBooks[2].discountPrice ?? createdBooks[2].price,
          },
        ],
      },
    },
  });

  console.log(
    `Seeded ${categoriesData.length} categories, ${booksData.length} books, 2 coupons, and demo accounts (${admin.email}, ${reader.email}).`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
