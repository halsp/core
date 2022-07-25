module.exports = {
  testRegex: "<rootDir>/packages/*/test/(.+)\\.test\\.(jsx?|tsx?)$",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  collectCoverageFrom: ["packages/*/src/**/*.ts"],
  collectCoverage: true,
};
