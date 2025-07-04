// assets/js/main.js
document.addEventListener('DOMContentLoaded', () => {
  /* --------------------------------------------------------
   * Config
   * ------------------------------------------------------ */
  const headingSelector = 'main.content h2, main.content h3';   // which headings go into the ToC

  /* --------------------------------------------------------
   * Helpers
   * ------------------------------------------------------ */
  // Ensure a heading has an id (slugified text if none)
  function ensureId(el) {
    if (!el.id) {
      el.id = el.textContent
        .trim()
        .toLowerCase()
        .replace(/[^\w]+/g, '-');
    }
    return el.id;
  }

  // Build a <ul> listing headings found in `doc`
  // Optional baseHref lets us link into *other* pages.
  function buildList(doc, ul, baseHref = '') {
    const frag = document.createDocumentFragment();

    doc.querySelectorAll(headingSelector).forEach(h => {
      const id = ensureId(h);

      const li = document.createElement('li');
      li.className = h.tagName.toLowerCase();          // "h2" or "h3"

      const a  = document.createElement('a');
      a.href   = `${baseHref}#${id}`;
      a.textContent = h.textContent;

      li.appendChild(a);
      frag.appendChild(li);
    });

    ul.appendChild(frag);
  }

  /* --------------------------------------------------------
   * 1.  Build ToC for the current page  (data-src="self")
   * ------------------------------------------------------ */
  document.querySelectorAll('ul.toc-list[data-src="self"]')
    .forEach(ul => buildList(document, ul));

  /* --------------------------------------------------------
   * 2.  Lazy‑load ToCs for *other* chapters
   * ------------------------------------------------------ */
  document
    .querySelectorAll('ul.toc-list[data-src]:not([data-src="self"])')
    .forEach(ul => {
      const details = ul.closest('details');
      if (!details) return;                  // safety guard
      const src = ul.dataset.src;            // e.g. "04-paths-in-graphs.html"
      if (!src) return;

      details.addEventListener('toggle', async () => {
        if (!details.open || ul.childElementCount) return;  // already loaded or not open

        try {
          const res = await fetch(src);
          if (!res.ok) throw new Error(res.statusText);
          const text = await res.text();
          const doc  = new DOMParser().parseFromString(text, 'text/html');

          // Build list; links need the page name as prefix
          buildList(doc, ul, src);
        } catch (err) {
          console.error('ToC fetch error:', err);
          ul.innerHTML = '<li><em>Unable to load ToC</em></li>';
        }
      }, { once: true });                   // run only on first open
    });
});