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
  createMapping: jest.fn(() => 'mocked result'),
}));

jest.unstable_mockModule('../../src/backend/readFolders.js', () => ({
  listFolders: jest.fn(() => ["foo", "bar", "baz"]),
  readFromFile: jest.fn(() => fakeHTML)
}));

const { generateMapping } = await import('../../src/backend/createMap.js');
const { createMapping } = await import('../../src/backend/mapping.js');
const { listFolders } = await import('../../src/backend/readFolders.js');

describe("generate mapping", () => {
    test("should call createMapping and return mocked result", async () => {
        await generateMapping("templates", "force22");

        expect(createMapping).toHaveBeenCalled();
        expect(listFolders).toHaveBeenCalled();

        expect(createMapping).toHaveBeenCalledWith((body + body + body).trim(), "templates");
    });
});
