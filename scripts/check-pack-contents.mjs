// Fails if `npm pack` would publish anything other than the build output and
// the standard metadata files (no sources, tests or config).
import { execFileSync } from "node:child_process";

const ALWAYS_ALLOWED = new Set(["package.json", "README.md", "LICENSE"]);
const FORBIDDEN_IN_DIST = [
  /\.test\.[cm]?[jt]s(\.map)?$/,
  /\.spec\.[cm]?[jt]s(\.map)?$/,
];

const [{ files }] = JSON.parse(
  execFileSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
    encoding: "utf8",
  }),
);

const unexpected = files
  .map((file) => file.path)
  .filter((path) => {
    if (ALWAYS_ALLOWED.has(path)) return false;
    if (!path.startsWith("dist/")) return true;
    return FORBIDDEN_IN_DIST.some((pattern) => pattern.test(path));
  });

if (unexpected.length > 0) {
  console.error("Package would publish unintended files:");
  for (const path of unexpected) console.error(`  ${path}`);
  process.exit(1);
}

console.log(`Pack contents OK (${files.length} files).`);
