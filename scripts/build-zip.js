const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

const root = path.join(__dirname, "..");
const about = JSON.parse(fs.readFileSync(path.join(root, "about.json"), "utf8"));

const include = ["about.json", "common", "javascripts", "locales", "assets", "settings.yml"].filter(
  (name) => fs.existsSync(path.join(root, name))
);

const outDir = path.join(root, "dist");
const outFile = path.join(outDir, `${about.name.toLowerCase().replace(/\s+/g, "-")}-${about.theme_version || "0.0.0"}.zip`);

fs.mkdirSync(outDir, { recursive: true });

const output = fs.createWriteStream(outFile);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  console.log(`Wrote ${path.relative(root, outFile)} (${archive.pointer()} bytes)`);
});

archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);

for (const name of include) {
  const fullPath = path.join(root, name);
  if (fs.statSync(fullPath).isDirectory()) {
    archive.directory(fullPath, name);
  } else {
    archive.file(fullPath, { name });
  }
}

archive.finalize();
