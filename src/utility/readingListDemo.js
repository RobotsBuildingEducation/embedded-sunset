const STORAGE_KEY = "landing-reading-list-id";
const ID_PATTERN = /^landing-reading-list-[a-f0-9-]{36}$/;
export const READING_LIST_DEMO_SOURCE = "landing-reading-list";

export function getReadingListDemoId(
  storage,
  createId = () => crypto.randomUUID(),
) {
  const existing = storage.getItem(STORAGE_KEY);
  if (existing && ID_PATTERN.test(existing)) return existing;
  const id = `landing-reading-list-${createId()}`;
  if (!ID_PATTERN.test(id)) throw new Error("Invalid reading list ID");
  storage.setItem(STORAGE_KEY, id);
  return id;
}

export function buildReadingListDemoData(titles, readBooks) {
  return {
    source: READING_LIST_DEMO_SOURCE,
    books: titles.map((title, index) => ({
      id: `book-${index + 1}`,
      title,
      read: readBooks[index] === true,
    })),
  };
}

export function getSavedReadingList(data) {
  if (data?.source !== READING_LIST_DEMO_SOURCE || !Array.isArray(data.books)) {
    return null;
  }
  const books = [1, 2, 3].map((index) =>
    data.books.find((book) => book?.id === `book-${index}`),
  );
  if (books.some((book) => typeof book?.read !== "boolean")) return null;
  return books.map((book) => book.read);
}
