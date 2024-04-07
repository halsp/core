beforeEach(() => {
  process.chdir(__dirname);
});

beforeAll(() => {
  global._require = require;
});
