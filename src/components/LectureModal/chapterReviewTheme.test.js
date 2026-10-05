import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import parser from "@babel/parser";

test("chapter review screen in LectureModal renders BottomActionBar in dark mode", () => {
  const source = readFileSync(
    new URL("./LectureModal.jsx", import.meta.url),
    "utf8"
  );
  const ast = parser.parse(source, { sourceType: "module", plugins: ["jsx"] });
  const nodes = [];
  function walk(node) {
    if (!node || typeof node !== "object") return;
    if (node.type) nodes.push(node);
    Object.values(node).forEach((val) => {
      if (Array.isArray(val)) val.forEach(walk);
      else if (val && typeof val === "object") walk(val);
    });
  }
  walk(ast);

  // Find BottomActionBar JSX element
  const bottomBarElement = nodes.find(
    (n) =>
      n.type === "JSXElement" &&
      n.openingElement?.name?.name === "BottomActionBar"
  );
  assert.ok(bottomBarElement, "BottomActionBar element should exist in LectureModal");

  // Check colorMode="dark" prop
  const colorModeAttr = bottomBarElement.openingElement.attributes.find(
    (attr) => attr.name?.name === "colorMode"
  );
  assert.ok(colorModeAttr, "BottomActionBar should have colorMode prop");
  assert.equal(
    colorModeAttr.value?.value,
    "dark",
    "BottomActionBar should be configured with colorMode='dark'"
  );

  // Check DarkMode wrapper
  const darkModeElement = nodes.find(
    (n) =>
      n.type === "JSXElement" &&
      n.openingElement?.name?.name === "DarkMode" &&
      nodes.some(
        (child) =>
          child.type === "JSXElement" &&
          child.openingElement?.name?.name === "BottomActionBar" &&
          child.start > n.start &&
          child.end < n.end
      )
  );
  assert.ok(
    darkModeElement,
    "BottomActionBar in LectureModal should be wrapped in DarkMode"
  );
});

test("BottomActionBar source supports colorMode prop and dark mode styling", () => {
  const source = readFileSync(
    new URL("../BottomActionBar/BottomActionBar.jsx", import.meta.url),
    "utf8"
  );
  assert.ok(
    source.includes("colorMode: colorModeProp"),
    "BottomActionBar should accept colorMode prop"
  );
  assert.ok(
    source.includes('effectiveColorMode === "dark"'),
    "BottomActionBar should check for effective dark mode"
  );
  assert.ok(
    source.includes('data-theme={effectiveColorMode}'),
    "BottomActionBar should set data-theme attribute"
  );
});
