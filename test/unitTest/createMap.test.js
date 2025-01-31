import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/backend/mapping.js', () => ({
  createMapping: jest.fn(() => 'mocked result'),
}));

const { generateMapping } = await import('../../src/backend/createMap.js');
const { createMapping } = await import('../../src/backend/mapping.js');

describe("generate mapping", () => {
    test("should call createMapping and return mocked result", async () => {
        const mapping = await generateMapping("templates", "force22");

        console.log(mapping);

        expect(createMapping).toHaveBeenCalled();
    });
});
