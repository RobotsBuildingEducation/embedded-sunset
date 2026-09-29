import test from "node:test";
import assert from "node:assert/strict";
import { COLOR_PALETTES, SWATCH_COLORS, getNextColor } from "./palettePresets.js";

test("palettePresets contains expected palettes with valid hex colors", () => {
  assert.ok(COLOR_PALETTES.sunset);
  assert.ok(COLOR_PALETTES.ocean);
  assert.ok(COLOR_PALETTES.cyber);
  assert.ok(COLOR_PALETTES.forest);
  assert.ok(COLOR_PALETTES.pastel);
  assert.ok(COLOR_PALETTES.slate);

  // Each palette should have at least 5 colors
  Object.values(COLOR_PALETTES).forEach((palette) => {
    assert.ok(palette.colors.length >= 5);
    palette.colors.forEach((color) => {
      assert.match(color, /^#[0-9A-Fa-f]{6}$/);
    });
  });

  // Swatches should be non-empty and valid hex
  assert.ok(SWATCH_COLORS.length >= 20);
  SWATCH_COLORS.forEach((color) => {
    assert.match(color, /^#[0-9A-Fa-f]{6}$/);
  });
});

test("getNextColor correctly cycles through palette colors", () => {
  const sunsetLen = COLOR_PALETTES.sunset.colors.length;
  const col0 = getNextColor(0, "sunset");
  const colWrapped = getNextColor(sunsetLen, "sunset");
  assert.equal(col0, COLOR_PALETTES.sunset.colors[0]);
  assert.equal(colWrapped, col0);
});

test("calculates row percentages and totals accurately", () => {
  const rows = [
    { id: "1", name: "Alpha", value: "300", color: "#FF0000" },
    { id: "2", name: "Beta", value: "200", color: "#00FF00" },
    { id: "3", name: "Gamma", value: "500", color: "#0000FF" },
    { id: "4", name: "Invalid", value: "-50", color: "#000000" },
  ];

  const validRows = rows
    .map((r) => ({
      ...r,
      numericValue: Math.max(0, parseFloat(r.value) || 0),
    }))
    .filter((r) => r.numericValue > 0);

  const total = validRows.reduce((acc, r) => acc + r.numericValue, 0);
  assert.equal(total, 1000);

  const percentages = validRows.map((r) => (r.numericValue / total) * 100);
  assert.deepEqual(percentages, [30, 20, 50]);
  assert.equal(
    percentages.reduce((a, b) => a + b, 0),
    100
  );
});
