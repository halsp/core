const fs = require("fs");
const path = require("path");

const getPackages = (cwd = process.cwd()) => {
  return fs
    .readdirSync(path.join(cwd, "packages"))
    .filter((item) =>
      fs.statSync(path.join(cwd, "packages", item)).isDirectory()
    )
    .filter((item) =>
      fs.existsSync(path.join(cwd, "packages", item, "package.json"))
    );
};

module.exports = { getPackages };
