import test from "node:test";
import assert from "node:assert/strict";
import {
  buildReadingListDemoData,
  getReadingListDemoId,
  getSavedReadingList,
} from "./readingListDemo.js";

const UUID = "b3c31b7e-10ae-4e4f-8ea1-9cb0bfa6e9d2";
const storage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
  };
};

test("a browser keeps its own document ID across reloads", () => {
  const browserStorage = storage();
  const id = getReadingListDemoId(browserStorage, () => UUID);
  assert.equal(id, `landing-reading-list-${UUID}`);
  assert.equal(
    getReadingListDemoId(browserStorage, () => {
      throw new Error("Should reuse ID");
    }),
    id,
  );
  assert.notEqual(
    getReadingListDemoId(
      storage(),
      () => "b3c31b7e-10ae-4e4f-8ea1-9cb0bfa6e9d3",
    ),
    id,
  );
});

test("saved progress restores by book ID, independent of language and array order", () => {
  const data = buildReadingListDemoData(
    ["Book", "Article", "Chapter"],
    [true, false, true],
  );
  data.books.reverse();
  assert.deepEqual(getSavedReadingList(data), [true, false, true]);
  assert.equal(data.books.find((book) => book.id === "book-1").title, "Book");
});

test("unrelated experiment records and incomplete progress do not replace the list", () => {
  assert.equal(getSavedReadingList({ text: "Guestbook entry" }), null);
  const data = buildReadingListDemoData(
    ["Book", "Article", "Chapter"],
    [false, true, false],
  );
  data.books.pop();
  assert.equal(getSavedReadingList(data), null);
  const browserStorage = storage();
  browserStorage.setItem("landing-reading-list-id", "another-experiment");
  assert.equal(
    getReadingListDemoId(browserStorage, () => UUID),
    `landing-reading-list-${UUID}`,
  );
});
