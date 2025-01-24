import { createMapping } from '../src/backend/mapping'
import { readFile } from "../src/backend/runAll";

describe('create mapping', function() {

    test('mapping',  async () => {

        const html = readFile(`./src/html/templates/event/template.html`);

        if (html.length < 100) {
            throw new Error("HTML is too short")
        }

        const mapping = await createMapping(html, "email");

        const backgrounds = Object.values(mapping.backgroundColors).map(color => color.oldBackground);

        expect(backgrounds).toContain("rgb(201, 255, 247)");
        expect(backgrounds).toContain("rgb(255, 255, 255)");
        
    });
      
});
