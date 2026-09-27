import fs from "node:fs";
import path from "node:path";

const baseUrl = process.env.LOVABLE_URL;

if (!baseUrl) {
  console.error("Missing LOVABLE_URL");
  console.error(
    'Run with: LOVABLE_URL="https://your-project.lovable.app" node scripts/download-lovable-assets.mjs',
  );
  process.exit(1);
}

const assetsDir = path.resolve("src/assets");
const publicDir = path.resolve("public");

const manifests = fs
  .readdirSync(assetsDir)
  .filter((name) => name.endsWith(".asset.json"));

console.log(`Found ${manifests.length} Lovable asset manifests`);

for (const filename of manifests) {
  const manifestPath = path.join(assetsDir, filename);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  if (!manifest.url?.startsWith("/__l5e/assets-v1/")) {
    console.log(`Skipping ${filename}: unsupported URL`);
    continue;
  }

  const targetPath = path.join(publicDir, manifest.url);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });

  const sourceUrl = new URL(manifest.url, baseUrl).href;

  console.log(`Downloading ${sourceUrl}`);

  const response = await fetch(sourceUrl);

  if (!response.ok) {
    console.error(
      `FAILED ${filename}: ${response.status} ${response.statusText}`,
    );
    continue;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(targetPath, buffer);

  console.log(
    `Saved ${path.relative(process.cwd(), targetPath)} (${buffer.length} bytes)`,
  );
}

console.log("Done");
