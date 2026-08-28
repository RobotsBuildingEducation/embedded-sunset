import test from "node:test";
import assert from "node:assert/strict";

import {
  resolveAccountLanguage,
  resolveDefaultLanguage,
} from "./defaultLanguage.js";

test("defaults Mexico to Spanish", () => {
  assert.equal(
    resolveDefaultLanguage({ timeZone: "America/Mexico_City" }),
    "es",
  );
  assert.equal(
    resolveDefaultLanguage({ timeZone: "America/Ciudad_Juarez" }),
    "es",
  );
});

test("defaults other Spanish-speaking countries to Spanish", () => {
  for (const timeZone of [
    "Europe/Madrid",
    "America/Bogota",
    "America/Argentina/Buenos_Aires",
    "America/Santiago",
    "America/Santo_Domingo",
  ]) {
    assert.equal(resolveDefaultLanguage({ timeZone }), "es");
  }
});

test("defaults other time zones to English", () => {
  assert.equal(resolveDefaultLanguage({ timeZone: "America/New_York" }), "en");
  assert.equal(resolveDefaultLanguage({ timeZone: "Europe/London" }), "en");
  assert.equal(resolveDefaultLanguage(), "en");
});

test("keeps an existing language preference regardless of time zone", () => {
  assert.equal(
    resolveDefaultLanguage({
      storedLanguage: "en",
      timeZone: "America/Mexico_City",
    }),
    "en",
  );
  assert.equal(
    resolveDefaultLanguage({
      storedLanguage: "es",
      timeZone: "America/New_York",
    }),
    "es",
  );
});

test("restores the canonical account language before legacy values", () => {
  assert.equal(
    resolveAccountLanguage({
      accountLanguage: "es",
      legacyAccountLanguage: "en",
      localLanguage: "en",
    }),
    "es",
  );
});

test("falls back through legacy, local, and detected language values", () => {
  assert.equal(
    resolveAccountLanguage({ legacyAccountLanguage: "es" }),
    "es",
  );
  assert.equal(resolveAccountLanguage({ localLanguage: "es" }), "es");
  assert.equal(resolveAccountLanguage({ detectedLanguage: "es" }), "es");
  assert.equal(resolveAccountLanguage(), "en");
});
