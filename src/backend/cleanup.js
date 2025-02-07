import { isFullHtml } from "./checkHtml.js";
import * as cheerio from "cheerio";
import { getBackgrounds } from "./extractor.js";

export function cleanHtml(html, type) {
    const full = isFullHtml(html);
    const $ = cheerio.load(html);

    const allElements = getBackgrounds($, type);
    allElements.each((_, element) => {
        if ($(element).attr("data-background-updated") === "true")
            $(element).attr("data-background-updated", "false");
    });

    return full ? $.html() : $("body").html();
}
