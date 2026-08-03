// Fetches busy dates from each stay's Airbnb iCal feed and writes them
// to data/availability.json. Run manually with `node scripts/update-availability.js`,
// or let the scheduled GitHub Actions workflow run it automatically.
//
// This replaces what reddings_ical_pkg used to do inside the database:
// same iCal parsing logic (VEVENT / DTSTART / DTEND), just running here
// instead of on an APEX server, with the result committed as a plain file.

const fs = require('fs');
const path = require('path');

const ICAL_URLS = {
  warren: 'https://www.airbnb.co.uk/calendar/ical/633927008813716756.ics?t=966be81c80f14c53a51ed277628d3b5c',
  burrow: 'https://www.airbnb.co.uk/calendar/ical/633845339100515691.ics?t=eb65a14765ac40b6ad25c6920cb9c3d5',
  farmhouse: 'https://www.airbnb.co.uk/calendar/ical/52180369.ics?t=1f9bbac7c25b4785b19422c970aa6803',
};

function parseBusyDates(icsText) {
  const lines = icsText.split(/\r?\n/);
  const busy = [];
  let inEvent = false;
  let dtstart = null;
  let dtend = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith('BEGIN:VEVENT')) {
      inEvent = true;
      dtstart = null;
      dtend = null;
    } else if (line.startsWith('END:VEVENT') && inEvent) {
      if (dtstart && dtend) {
        busy.push({ start: dtstart, end: dtend });
      }
      inEvent = false;
    } else if (inEvent && line.startsWith('DTSTART')) {
      const m = line.match(/(\d{8})/);
      if (m) dtstart = m[1];
    } else if (inEvent && line.startsWith('DTEND')) {
      const m = line.match(/(\d{8})/);
      if (m) dtend = m[1];
    }
  }

  return busy;
}

async function fetchBusyDates(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const text = await res.text();
    return parseBusyDates(text);
  } catch (err) {
    console.error('Failed to fetch/parse', url, err.message);
    return [];
  }
}

async function main() {
  const result = {};
  for (const [stay, url] of Object.entries(ICAL_URLS)) {
    result[stay] = await fetchBusyDates(url);
    console.log(`${stay}: ${result[stay].length} busy period(s)`);
  }

  const outPath = path.join(__dirname, '..', 'data', 'availability.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');
  console.log('Wrote', outPath);
}

main();
