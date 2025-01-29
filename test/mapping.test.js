import { createMapping } from '../src/backend/mapping'
import { readFile } from "../src/backend/runAll";

describe('create mapping', function() {

    test('background',  async () => {

        const html = readFile(`./src/html/templates/event/template.html`);

        if (html.length < 100) {
            throw new Error("HTML is too short")
        }
        
        const mapping = await createMapping(html, "email");
        const backgrounds = Object.values(mapping.backgroundColors).map(color => color.oldBackground);

        expect(backgrounds).toContain("rgb(201, 255, 247)");
        expect(backgrounds).toContain("rgb(255, 255, 255)");
        
    });

    test('links', async () => {

        const html = readFile(`./src/html/templates/event/template.html`);

        const mapping = await createMapping(html, "email");
        const links = Object.values(mapping.links).map(link => link.oldLink)

        expect(links.length).toBe(1);
        expect(links[0]).toBe("https://www.force24.co.uk")
        
    });

    test('text', async () => {

        const html = readFile(`./src/html/templates/event/template.html`);

        const mapping = await createMapping(html, "email");
        const text = Object.values(mapping.fontColor).map(text => text.oldFontColor)

        expect(text.length).toBe(2);
        expect(text).toContain("rgb(7, 190, 0)");
        expect(text).toContain("rgb(34, 30, 30)");
    });
      
    test('images', async () => {

        const html = readFile(`./src/html/templates/event/template.html`);

        const mapping = await createMapping(html, "email");
        const images = Object.values(mapping.images).map(image => image.oldImageLink)

        expect(images.length).toBe(2);
        expect(images).toContain("https://s3.eu-west-2.amazonaws.com/force24-assets/EmailTemplates/AccountTemplates/de796d11/52c7ee81/images/1712575426-3693fdeb.png?v=133825509661590979")
        expect(images).toContain("https://s3.eu-west-2.amazonaws.com/force24-assets/EmailTemplates/AccountTemplates/de796d11/52c7ee81/images/1712658397-bfa7ac89.png?v=133825509661590979")
        
    });

    test('4 fields', async () => {

        const html = readFile(`./src/html/templates/event/template.html`);

        const mapping = await createMapping(html, "email");
        const mappingKeys = Object.keys(mapping);

        expect(mappingKeys.length).toBe(4);
        expect(mappingKeys).toContain("links");
        expect(mappingKeys).toContain("backgroundColors");
        expect(mappingKeys).toContain("fontColor");
        expect(mappingKeys).toContain("images");
        
    });
});

