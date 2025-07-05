/* assets/js/main.js
 * -------------------------------------------------------------
 * ①  Builds navigation ToCs for this page and for other chapters
 * ②  Adds line‑numbers to every <pre class="ln"> code block
 * ---------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  /* --------------------------------------------------------
   * Config
   * ------------------------------------------------------ */
  const headingSelector = "main.content h2, main.content h3"; // headings to list
  const lnSelector = "pre.ln code"; // code blocks to number

  /* --------------------------------------------------------
   * Helpers
   * ------------------------------------------------------ */
  // Ensure heading has an id; slugify text if missing
  const ensureId = (el) => {
    if (!el.id) {
      el.id = el.textContent
        .trim()
        .toLowerCase()
        .replace(/[^\w]+/g, "-");
    }
    return el.id;
  };

  // Build a <ul> list of headings inside `doc`
  const buildList = (doc, ul, base = "") => {
    const frag = document.createDocumentFragment();
    doc.querySelectorAll(headingSelector).forEach((h) => {
      const li = document.createElement("li");
      li.className = h.tagName.toLowerCase(); // "h2" or "h3"

      const a = document.createElement("a");
      a.href = `${base}#${ensureId(h)}`;
      a.textContent = h.textContent;

      li.appendChild(a);
      frag.appendChild(li);
    });
    ul.appendChild(frag);
  };

  /* --------------------------------------------------------
   * 1 ▸ ToC for the current page  (data-src="self")
   * ------------------------------------------------------ */
  document
    .querySelectorAll('ul.toc-list[data-src="self"]')
    .forEach((ul) => buildList(document, ul));

  /* --------------------------------------------------------
   * 2 ▸ Lazy‑load ToCs for other chapters
   * ------------------------------------------------------ */
  document
    .querySelectorAll('ul.toc-list[data-src]:not([data-src="self"])')
    .forEach((ul) => {
      const details = ul.closest("details");
      const src = ul.dataset.src; // "04-paths-in-graphs.html"

      if (!details || !src) return;

      details.addEventListener(
        "toggle",
        async () => {
          if (!details.open || ul.childElementCount) return; // already loaded

          try {
            const html = await (await fetch(src)).text();
            const doc = new DOMParser().parseFromString(html, "text/html");
            buildList(doc, ul, src);
          } catch (err) {
            console.error("ToC fetch error:", err);
            ul.innerHTML = "<li><em>Unable to load ToC</em></li>";
          }
        },
        { once: true }
      ); // run only once
    });

  /* 3 ▸ Prism highlight + line numbers ------------------------- */
  document.querySelectorAll(lnSelector).forEach((code) => {
    if (code.dataset.numbered) return;

    /* a. raw, de‑indented text -------------------------------- */
    let txt = code.textContent.replace(/^\s*\n|\n\s*$/g, "");
    const indent = Math.min(
      ...txt
        .split("\n")
        .filter((l) => l.trim())
        .map((l) => l.match(/^[ \t]*/)[0].length)
    );
    if (indent)
      txt = txt
        .split("\n")
        .map((l) => l.slice(indent))
        .join("\n");

    /* b. syntax highlight via Prism ---------------------------- */
    const lang = (code.className.match(/language-(\w+)/) || [])[1] || "";
    const html =
      lang && Prism.languages[lang]
        ? Prism.highlight(txt, Prism.languages[lang], lang)
        : txt
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    /* c. wrap each line with number span ----------------------- */
    code.innerHTML = html
      .split("\n")
      .map(
        (l, i) =>
          `<span class="line"><span class="num">${i + 1}</span>${l}</span>`
      )
      .join("\n");

    code.dataset.numbered = "true";
  });
});
