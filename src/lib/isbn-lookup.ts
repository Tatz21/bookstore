export interface IsbnBookMetadata {
  title: string;
  author: string;
  description: string;
  isbn10: string | null;
  isbn13: string | null;
  pages: number | null;
  publisher: string | null;
  publishedDate: string | null;
  language: string;
  coverImageUrl: string | null;
  categories: string[];
  source: "google_books" | "openlibrary";
}

export function cleanIsbn(raw: string): string {
  return raw.replace(/[^0-9Xx]/g, "").toUpperCase();
}

export function normalizeGoogleBooksResponse(
  data: Record<string, unknown>,
  queriedIsbn: string
): IsbnBookMetadata | null {
  const items = Array.isArray(data?.items) ? data.items : [];
  if (items.length === 0) return null;

  const info = (items[0] as { volumeInfo?: Record<string, unknown> })?.volumeInfo;
  if (!info || typeof info.title !== "string") return null;

  const identifiers = Array.isArray(info.industryIdentifiers)
    ? (info.industryIdentifiers as Array<{ type?: string; identifier?: string }>)
    : [];

  let isbn10: string | null = null;
  let isbn13: string | null = null;
  for (const id of identifiers) {
    if (id.type === "ISBN_10" && id.identifier) isbn10 = id.identifier;
    if (id.type === "ISBN_13" && id.identifier) isbn13 = id.identifier;
  }
  if (!isbn13 && queriedIsbn.length === 13) isbn13 = queriedIsbn;
  if (!isbn10 && queriedIsbn.length === 10) isbn10 = queriedIsbn;

  const imageLinks = (info.imageLinks || {}) as Record<string, string | undefined>;
  const rawCover =
    imageLinks.extraLarge ||
    imageLinks.large ||
    imageLinks.medium ||
    imageLinks.thumbnail ||
    imageLinks.smallThumbnail ||
    null;

  const coverImageUrl = rawCover
    ? rawCover.replace(/^http:\/\//i, "https://")
    : null;

  const authors = Array.isArray(info.authors)
    ? info.authors.filter((a): a is string => typeof a === "string")
    : [];

  const categories = Array.isArray(info.categories)
    ? info.categories.filter((c): c is string => typeof c === "string")
    : [];

  return {
    title: info.title,
    author: authors.join(", ") || "Unknown Author",
    description:
      typeof info.description === "string"
        ? info.description
        : "No synopsis available.",
    isbn10,
    isbn13,
    pages: typeof info.pageCount === "number" ? info.pageCount : null,
    publisher: typeof info.publisher === "string" ? info.publisher : null,
    publishedDate:
      typeof info.publishedDate === "string" ? info.publishedDate : null,
    language:
      typeof info.language === "string" && info.language.toLowerCase() === "en"
        ? "English"
        : typeof info.language === "string"
        ? info.language.toUpperCase()
        : "English",
    coverImageUrl,
    categories,
    source: "google_books",
  };
}

export function normalizeOpenLibraryResponse(
  data: Record<string, unknown>,
  queriedIsbn: string
): IsbnBookMetadata | null {
  const key = `ISBN:${queriedIsbn}`;
  const entry = data?.[key] as Record<string, unknown> | undefined;
  if (!entry || typeof entry.title !== "string") return null;

  const authors = Array.isArray(entry.authors)
    ? (entry.authors as Array<{ name?: string }>)
        .map((a) => a.name)
        .filter((n): n is string => Boolean(n))
    : [];

  const publishers = Array.isArray(entry.publishers)
    ? (entry.publishers as Array<{ name?: string }>)
        .map((p) => p.name)
        .filter((n): n is string => Boolean(n))
    : [];

  const cover = (entry.cover || {}) as Record<string, string | undefined>;
  const coverImageUrl = cover.large || cover.medium || cover.small || null;

  const subjects = Array.isArray(entry.subjects)
    ? (entry.subjects as Array<{ name?: string }>)
        .map((s) => s.name)
        .filter((n): n is string => Boolean(n))
    : [];

  const notes =
    typeof entry.notes === "string"
      ? entry.notes
      : typeof (entry.excerpts as Array<{ text?: string }> | undefined)?.[0]
          ?.text === "string"
      ? (entry.excerpts as Array<{ text?: string }>)[0].text!
      : `${entry.title} by ${authors.join(", ") || "Unknown Author"}.`;

  return {
    title: entry.title,
    author: authors.join(", ") || "Unknown Author",
    description: notes,
    isbn10: queriedIsbn.length === 10 ? queriedIsbn : null,
    isbn13: queriedIsbn.length === 13 ? queriedIsbn : null,
    pages:
      typeof entry.number_of_pages === "number" ? entry.number_of_pages : null,
    publisher: publishers[0] || null,
    publishedDate:
      typeof entry.publish_date === "string" ? entry.publish_date : null,
    language: "English",
    coverImageUrl,
    categories: subjects.slice(0, 3),
    source: "openlibrary",
  };
}

export async function lookupBookByIsbn(
  rawIsbn: string
): Promise<IsbnBookMetadata | null> {
  const isbn = cleanIsbn(rawIsbn);
  if (isbn.length !== 10 && isbn.length !== 13) {
    return null;
  }

  // Primary: Google Books API
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(
        isbn
      )}`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const json = (await res.json()) as Record<string, unknown>;
      const parsed = normalizeGoogleBooksResponse(json, isbn);
      if (parsed) return parsed;
    }
  } catch {
    // Fall through to OpenLibrary
  }

  // Fallback: OpenLibrary API
  try {
    const res = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${encodeURIComponent(
        isbn
      )}&format=json&jscmd=data`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const json = (await res.json()) as Record<string, unknown>;
      const parsed = normalizeOpenLibraryResponse(json, isbn);
      if (parsed) return parsed;
    }
  } catch {
    // Return null if both fail
  }

  return null;
}
