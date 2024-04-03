beforeEach(() => {
  process.chdir(__dirname);

  global._require = require;
});
