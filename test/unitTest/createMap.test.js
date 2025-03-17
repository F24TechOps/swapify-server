import { expect, jest } from '@jest/globals';

const body = `<header>
    <h1>Welcome to My Web Page</h1>
</header>
<main>
    <p class="custom-class">This is a paragraph with the custom class applied.</p>
</main>`

const fakeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Basic HTML Example</title>
    <style>
        .custom-class {
            color: blue;
            font-size: 20px;
            font-weight: bold;
        }
    </style>
</head>
<body>${body}</body>
</html>
`;

jest.unstable_mockModule('../../src/backend/mapping.js', () => ({
    createMapping: jest.fn(() => {
      return {
          "links": {
            "Link0": {
              "oldLink": "https://www.force24.co.uk",
              "newLink": null
            }
          },
          "images": {
            "ImageLink0": {
              "oldImageLink": "https://s3.eu-west-2.amazonaws.com/force24-assets/EmailTemplates/AccountTemplates/de796d11/815660aa/images/1712575426-3693fdeb.png?v=133825523640680588",
              "newImageLink": null
            }
          },
          "color": {
            "Color0": {
              "oldColor": "rgb(201, 255, 247)",
              "newColor": null
            },
            "Color1": {
              "oldColor": "rgb(7, 190, 0)",
              "newColor": null
            },
            "Color2": {
              "oldColor": "rgb(34, 30, 30)",
              "newColor": null
            }
          }
        }
    }),
  }));
  
jest.unstable_mockModule('../../src/backend/readFolders.js', () => ({
    listFolders: jest.fn(() => ["foo", "bar", "baz"]),
    readFromFile: jest.fn(() => fakeHTML)
  }));
  


const { generateNewMapping } = await import('../../src/backend/createMap.js');
const { createMapping } = await import('../../src/backend/mapping.js');
const { listFolders } = await import('../../src/backend/readFolders.js');


describe.skip("generate mapping", () => {
    test("should call createMapping and return mocked result", async () => {
        await generateNewMapping("templates");

        expect(createMapping).toHaveBeenCalled();
        expect(listFolders).toHaveBeenCalled();

        //expect(createMapping).toHaveBeenCalledWith((body + body + body).trim(), "templates");
    });
});


