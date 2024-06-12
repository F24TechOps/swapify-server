import { isFullHtml } from "./checkHtml.js";
import { JSDOM } from 'jsdom';
import { getBackgrounds } from "./extractor.js";

export function cleanHtml(html, type) {
    const full = isFullHtml(html);
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const allElements = getBackgrounds(document, type);
    Array.from(allElements).map((element) => {
        if (element.getAttribute("data-background-updated") === "true")
            element.setAttribute("data-background-updated", "false")
    });

    return full ? dom.serialize() : document.body.innerHTML;
}