import { describe, expect, it } from "vitest";
import {
  cleanIsbn,
  normalizeGoogleBooksResponse,
  normalizeOpenLibraryResponse,
} from "./isbn-lookup";

describe("ISBN lookup normalizers", () => {
  it("cleans hyphens and spaces from ISBNs", () => {
    expect(cleanIsbn("978-0-14-312774-1")).toBe("9780143127741");
    expect(cleanIsbn("0-306-40615-x")).toBe("030640615X");
  });

  it("normalizes Google Books response", () => {
    const meta = normalizeGoogleBooksResponse(
      {
        items: [
          {
            volumeInfo: {
              title: "Sapiens",
              authors: ["Yuval Noah Harari"],
              description: "A brief history of humankind.",
              pageCount: 464,
              publisher: "Harper",
              publishedDate: "2015",
              language: "en",
              industryIdentifiers: [
                { type: "ISBN_10", identifier: "0062316095" },
                { type: "ISBN_13", identifier: "9780062316097" },
              ],
              imageLinks: {
                thumbnail: "http://books.google.com/cover.jpg",
              },
            },
          },
        ],
      },
      "9780062316097"
    );

    expect(meta).not.toBeNull();
    expect(meta?.title).toBe("Sapiens");
    expect(meta?.coverImageUrl).toBe("https://books.google.com/cover.jpg");
    expect(meta?.language).toBe("English");
    expect(meta?.source).toBe("google_books");
  });

  it("normalizes OpenLibrary response", () => {
    const meta = normalizeOpenLibraryResponse(
      {
        "ISBN:9780143127741": {
          title: "The Body Keeps the Score",
          authors: [{ name: "Bessel van der Kolk" }],
          publishers: [{ name: "Penguin" }],
          number_of_pages: 464,
          publish_date: "2015",
          cover: { large: "https://covers.openlibrary.org/b/id/123-L.jpg" },
        },
      },
      "9780143127741"
    );

    expect(meta).not.toBeNull();
    expect(meta?.author).toBe("Bessel van der Kolk");
    expect(meta?.source).toBe("openlibrary");
  });
});
