import * as cheerio from "cheerio";
import { isFullHtml } from "./checkHtml.js";

let full;

export function flatten(html) {
    let loop = true;
    let bodyLen = null;

    full = isFullHtml(html);

    do {
        html = flattenLayer(html);
        loop = html.length !== bodyLen;
        bodyLen = html.length;
    } while (loop);

    return html;
}

function flattenLayer(html) {
    const $ = cheerio.load(html);

    const divElements = $('div').toArray();

    divElements.forEach((div) => {
        const $div = $(div);
        const children = $div.children();

        if (children.length === 1 && children[0].tagName === 'div' && !$div.attr()) {
            const child = $(children[0]).clone();
            $div.replaceWith(child);
        }
    });

    return full ? $.html() : $('body').html();
}