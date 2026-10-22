import { describe, expect, test } from "bun:test";
import { sortDonations } from "./useDonationSorting";

describe("donation ordering", () => {
  test("archived donations appear after all active donations, keeping date order", () => {
    const list = [
      { id: "a", is_taken: false, title: "A" },
      { id: "b", is_taken: true, title: "B" },
      { id: "c", is_taken: false, title: "C" },
      { id: "d", is_taken: true, title: "D" },
    ];
    expect(sortDonations(list, null, null).map(d => d.id)).toEqual(["a", "c", "b", "d"]);
  });

  test("archived stay at the bottom even when sorting by a column", () => {
    const list = [
      { id: "z", is_taken: true, title: "Alpha" },
      { id: "y", is_taken: false, title: "Zulu" },
    ];
    expect(sortDonations(list, "title", "asc").map(d => d.id)).toEqual(["y", "z"]);
  });
});
