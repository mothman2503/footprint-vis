// utils/parser.js

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

    // Extract timestamp from following text
    let timestamp = '';
    let seenLink = false;
    for (let node of div.childNodes) {
      if (!seenLink && node === a) {
        seenLink = true;
        continue;
      }
      if (seenLink && node.nodeType === Node.TEXT_NODE) {
        const t = node.nodeValue.trim();
        if (t) {
          timestamp = t;
          break;
        }
      }
    }

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
      query,
      timestamp,
      coords: { lat, lon },
    });
  });

  return records;
}
