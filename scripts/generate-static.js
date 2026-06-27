import fs from "fs";
import path from "path";

const publicDir = path.resolve(".output/public");
const assetsDir = path.resolve(".output/public/assets");

if (!fs.existsSync(publicDir)) {
  console.error(".output/public directory does not exist. Run npm run build first.");
  process.exit(1);
}

// Find CSS and JS entry files
const files = fs.readdirSync(assetsDir);
const jsFile = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));
const cssFile = files.find((f) => f.startsWith("styles-") && f.endsWith(".css"));

if (!jsFile || !cssFile) {
  console.error("Could not find index.js or styles.css in assets.");
  process.exit(1);
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Zia — Institutional Modern Finance</title>
  <link rel="stylesheet" href="./assets/${cssFile}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=JetBrains+Mono:wght@400;500&display=swap">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./assets/${jsFile}"></script>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, "index.html"), htmlContent);
fs.writeFileSync(path.join(publicDir, "404.html"), htmlContent);
console.log("Successfully generated index.html and 404.html in .output/public!");
