const { getPackages } = require("./scripts/get-packages");

module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
        "typo"
      ],
    ],
    "scope-enum": [2, "always", ["release", ...getPackages()]],
  },
};
