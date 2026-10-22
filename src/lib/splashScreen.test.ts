import { describe, expect, test } from "bun:test";
import { shouldShowSplash } from "./splashScreen";

describe("signed-out welcome screen", () => {
  test("signed-out visitors see the splash before entering", () => {
    expect(shouldShowSplash(false, false)).toBe(true);
  });
  test("signed-in visitors bypass the splash", () => {
    expect(shouldShowSplash(true, false)).toBe(false);
  });
  test("entering allows signed-out visitors to browse", () => {
    expect(shouldShowSplash(false, true)).toBe(false);
  });
});