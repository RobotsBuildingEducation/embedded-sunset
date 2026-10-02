// Usage: node scripts/syncAchievementFeature.mjs /absolute/path/to/other/app [--check]
// Copies only the shared achievement feature. Host adapters stay local.
import { readdir, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = process.argv[2];
if (!target || !path.isAbsolute(target) || path.resolve(target) === root) throw new Error("Provide the other app's absolute root.");
const check = process.argv.includes("--check");
const files = (await readdir(path.join(root, "src/achievements"))).filter(name => /\.(js|jsx|css|md)$/.test(name) && !["hostOrb.js", "OrbRenderer.jsx", "hostPersistence.js"].includes(name) && !name.startsWith("__"));
if (!check) await mkdir(path.join(target, "src/achievements"), {recursive:true});
// These obsolete behavior definitions were removed from the shared feature.
const retiredFiles = ["challenges.js", "challengeCopy.js", "singularCopy.js"];
const targetFiles = await readdir(path.join(target, "src/achievements"));
for (const file of retiredFiles) {
  if (!targetFiles.includes(file)) continue;
  if (check) throw new Error(`Retired achievement file remains: ${file}`);
  await rm(path.join(target, "src/achievements", file));
}
for (const file of files) {
  const content = await readFile(path.join(root,"src/achievements",file));
  const destination = path.join(target,"src/achievements",file);
  if (check) {
    if (!content.equals(await readFile(destination))) throw new Error(`Shared achievement file differs: ${file}`);
  } else await writeFile(destination,content);
}
console.log(`${check ? "Verified" : "Mirrored"} ${files.length} shared achievement files.`);
