// assets/js/main.js
document.addEventListener("DOMContentLoaded", () => {
    const content = document.querySelector("main.content");
    const tocList = document.getElementById("toc-list");
    if (!content || !tocList) return;

    // grab all h2 & h3
    content.querySelectorAll("h2, h3").forEach((heading) => {
        // ensure each heading has an id
        if (!heading.id) {
            heading.id = heading.textContent
                .trim()
                .toLowerCase()
                .replace(/[^\w]+/g, "-");
        }

        // build TOC entry
        const li = document.createElement("li");
        li.className = heading.tagName.toLowerCase(); // "h2" or "h3"
        const a = document.createElement("a");
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;
        li.appendChild(a);
        tocList.appendChild(li);
    });
});