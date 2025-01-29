import { createMapping } from '../../src/backend/mapping'
import { readFile } from "../../src/backend/runAll";

describe('create mapping', function() {

    let mapping;

    beforeAll( async () => {
        const html = readFile(`./src/html/templates/event/template.html`);

        if (html.length < 100) {
            throw new Error("HTML is too short")
        }
        
        mapping = await createMapping(html, "template");
    });

    test('color', () => {
        const colors = Object.values(mapping.color).map(c => c.oldColor);

        expect(colors.length).toBe(3);
        expect(colors).toContain("rgb(201, 255, 247)");
        expect(colors).toContain("rgb(7, 190, 0)");
        expect(colors).toContain("rgb(34, 30, 30)");
        
    });

    test('links', () => {
        const links = Object.values(mapping.links).map(link => link.oldLink)

        expect(links.length).toBe(1);
        expect(links[0]).toBe("https://www.force24.co.uk")
        
    });

      
    test('images',() => {
        const images = Object.values(mapping.images).map(image => image.oldImageLink)

        expect(images.length).toBe(2);
        expect(images).toContain("https://s3.eu-west-2.amazonaws.com/force24-assets/EmailTemplates/AccountTemplates/de796d11/52c7ee81/images/1712575426-3693fdeb.png?v=133825509661590979")
        expect(images).toContain("https://s3.eu-west-2.amazonaws.com/force24-assets/EmailTemplates/AccountTemplates/de796d11/52c7ee81/images/1712658397-bfa7ac89.png?v=133825509661590979")
        
    });

    test('4 fields',() => {
        const mappingKeys = Object.keys(mapping);

        expect(mappingKeys.length).toBe(3);
        expect(mappingKeys).toContain("links");
        expect(mappingKeys).toContain("color");
        expect(mappingKeys).toContain("images");
        
    });
});

