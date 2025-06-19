import { IAB_CATEGORIES } from "../constants/iabCategories";
import { DateTime } from 'luxon';

export function parseActivityHtml(htmlText) {
  const doc = new DOMParser().parseFromString(htmlText, 'text/html');

  const searchDivs = Array.from(
    doc.querySelectorAll('div.content-cell.mdl-typography--body-1')
  ).filter(div => div.textContent.includes('Searched for\u00A0'));

  const captionDivs = Array.from(
    doc.querySelectorAll('div.content-cell.mdl-typography--caption')
  );

  const records = [];

  searchDivs.forEach((div, i) => {
    const a = div.querySelector('a');
    const query = a?.textContent.trim() || '';

    // Extract timestamp from text nodes after the <a> tag
    let timestampRaw = '';
    let seenLink = false;
    for (let node of div.childNodes) {
      if (!seenLink && node === a) {
        seenLink = true;
        continue;
      }
      if (seenLink && node.nodeType === Node.TEXT_NODE) {
        const t = node.nodeValue.trim();
        if (t) {
          timestampRaw = t;
          break;
        }
      }
    }

    // Parse and normalize timestamp by stripping TZ abbrev
    let timestamp = null;
    if (timestampRaw) {
      const cleaned = timestampRaw
        .replace(/\s+/g, ' ')            // collapse all whitespace to normal space
        .replace(/\s[A-Z]{2,4}$/, '');   // remove trailing TZ abbreviation

      const dt = DateTime.fromFormat(cleaned, "LLL d, yyyy, h:mm:ss a");
      if (dt.isValid) timestamp = dt.toISO();
      else {
        console.warn('Failed to parse timestamp:', timestampRaw);
        timestamp = null;
      }
    }

    const uncategorized = IAB_CATEGORIES.find(cat => cat.id === 'IAB24');
    const category = uncategorized;


    // Extract map coordinates if available
    const caption = captionDivs[i];
    let lat = '', lon = '';
    if (caption) {
      const mapA = caption.querySelector('a[href*="maps"]');
      if (mapA) {
        const url = new URL(mapA.href);
        const center = url.searchParams.get('center');
        if (center) {
          [lat, lon] = center.split(',');
        }
      }
    }

    records.push({
      id: undefined, // ensures IndexedDB will generate a fresh one
      category,
      query,
      timestamp,
      coords: { lat, lon },
    });

  });

  return records;
}
