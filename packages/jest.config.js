const name = __dirname.replace(/\\/g, "/").replace(/^.*\//, "");

module.exports = {
  roots: ["<rootDir>/test"],
  testRegex: "test/(.+)\\.test\\.(jsx?|tsx?)$",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  displayName: name,
  verbose: true,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
};
