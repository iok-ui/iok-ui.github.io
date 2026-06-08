const fs = require("fs");

const ICAL_URL = process.env.GOOGLE_CALENDAR_ICAL_URL;

if (!ICAL_URL) {
  throw new Error("Missing GOOGLE_CALENDAR_ICAL_URL");
}

function getType(title) {
  const text = title.toLowerCase();

  if (text.includes("office")) return "office";
  if (text.includes("wfh")) return "wfh";
  if (text.includes("conference")) return "conference";
  if (text.includes("holiday")) return "holiday";
  if (text.includes("sick")) return "sick";
  if (text.includes("personal")) return "personal";

  return "other";
}

function parseDate(value) {
  if (!value) return "";

  const raw = value.trim();

  if (/^\d{8}$/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }

  if (/^\d{8}T/.test(raw)) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  }

  return raw;
}

async function main() {
  const response = await fetch(ICAL_URL);
  const ics = await response.text();

  const blocks = ics.split("BEGIN:VEVENT").slice(1);

  const events = blocks.map(block => {
    const titleMatch = block.match(/SUMMARY:(.*)/);
    const startMatch = block.match(/DTSTART(?:;[^:]*)?:(.*)/);
    const endMatch = block.match(/DTEND(?:;[^:]*)?:(.*)/);

    const title = titleMatch ? titleMatch[1].trim() : "Untitled";
    const start = startMatch ? parseDate(startMatch[1]) : "";
    const end = endMatch ? parseDate(endMatch[1]) : start;

    return {
      title,
      start,
      end,
      type: getType(title)
    };
  }).filter(event => event.start);

  fs.mkdirSync("content", { recursive: true });
  fs.writeFileSync(
    "content/calendar.json",
    JSON.stringify(events, null, 2)
  );

  console.log(`Wrote ${events.length} events to content/calendar.json`);
}

main();