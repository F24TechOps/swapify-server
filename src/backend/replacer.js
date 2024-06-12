import { extractId } from "./extractor.js";
import { JSDOM } from 'jsdom';
import { v4 as uuidv4 } from 'uuid';
import { isFullHtml } from "./checkHtml.js";

let full;

export function replaceId(html) {
    full = isFullHtml(html);
    const ids = new Set(...[extractId(html)]);
    return Array.from(ids).reduce(replaceIdsWithValues, html);
}

function replaceIdsWithValues (html, id) {
    const dom = new JSDOM(html);
    const body = dom.window.document.body;

    const f24IdElements = Array.from(body.querySelectorAll('[data-f24-id]'))
        .filter((element) => element.getAttribute('data-f24-id') === id);

    if (f24IdElements.length <= 1)
        return html;

    f24IdElements.forEach((element, idx) => {
        if (idx)
            element.setAttribute('data-f24-id', uuidv4())
    });

    return full ? dom.serialize() : body.innerHTML;
}