const fs = require("fs");
const path = require("path");

const inputPath = path.join("content", "activity-log.txt");
const outputPath = path.join("content", "activities.json");

if (!fs.existsSync(inputPath)) {
  throw new Error(`Missing file: ${inputPath}`);
}

const lines = fs
  .readFileSync(inputPath, "utf8")
  .split(/\r?\n/);

const activities = [];
let currentDate = null;

for (const rawLine of lines) {
  const line = rawLine.trim();

  if (!line) {
    continue;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(line)) {
    currentDate = line;
    continue;
  }

  if (!currentDate) {
    console.warn(`Skipped line without a date: ${line}`);
    continue;
  }

  const match = line.match(/^\[([^\]|]+)(?:\s*\|\s*([^\]]+))?\]\s*(.+)$/);

  if (!match) {
    console.warn(`Skipped invalid activity line: ${line}`);
    continue;
  }

  const [, categoryRaw, projectRaw, text] = match;

  activities.push({
    date: currentDate,
    category: categoryRaw.trim().toLowerCase(),
    project: projectRaw ? projectRaw.trim() : "",
    text: text.trim()
  });
}

activities.sort((a, b) => {
  if (a.date !== b.date) {
    return b.date.localeCompare(a.date);
  }

  return a.category.localeCompare(b.category);
});

fs.writeFileSync(
  outputPath,
  JSON.stringify(activities, null, 2) + "\n"
);

console.log(`Built ${activities.length} activities.`);