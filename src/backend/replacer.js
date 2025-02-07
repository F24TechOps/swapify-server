import { extractId } from "./extractor.js";
import * as cheerio from "cheerio";
import { v4 as uuidv4 } from 'uuid';
import { isFullHtml } from "./checkHtml.js";

let full;

export function replaceId(html) {
    full = isFullHtml(html);
    const ids = new Set(...[extractId(html)]);
    return Array.from(ids).reduce(replaceIdsWithValues, html);
}

function replaceIdsWithValues (html, id) {
    const $ = cheerio.load(html);

    const f24IdElements = $('[data-f24-id]')
        .filter((_, element) => $(element).attr('data-f24-id') === id)
        .toArray();

    if (f24IdElements.length <= 1)
        return html;

    f24IdElements.forEach((element, idx) => {
        if (idx)
            $(element).attr('data-f24-id', uuidv4());
    });

    return full ? $.html() : $('body').html();
}