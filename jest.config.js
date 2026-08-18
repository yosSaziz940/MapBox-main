const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^mapbox-gl$": "<rootDir>/__mocks__/mapbox-gl.js",
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "lib/**/*.js",
    "components/**/*.js",
    "app/**/*.js",
    "!app/layout.js",
  ],
  coverageThreshold: {
    global: {
      lines: 70,
      functions: 70,
    },
  },
  coverageReporters: ["text", "lcov"],
};

module.exports = createJestConfig(customConfig);
