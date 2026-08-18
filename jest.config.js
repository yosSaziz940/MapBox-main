const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^mapbox-gl$": "<rootDir>/__mocks__/mapbox-gl.js",
  },
};

module.exports = createJestConfig(customConfig);
