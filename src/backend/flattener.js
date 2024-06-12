import { JSDOM } from 'jsdom';
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
    }
    while (loop)

    return html;
}

function flattenLayer(html) {
    const dom = new JSDOM(html);
    const body = dom.window.document.body;

    const divElements = body.querySelectorAll('div');

    divElements.forEach((div) => {
        if (div.childElementCount === 1 && div.children[0].tagName === 'DIV' && div.attributes.length === 0) {
            const child = div.children[0].cloneNode(true);
            div.parentNode.replaceChild(child, div);
        }
    });

    return full ? dom.serialize() : body.innerHTML;
}