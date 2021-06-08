import PathParser from "../src/Router/PathParser";
test("path parser", async function () {
  const pathParser = new PathParser("./test/controllers/get.ts");
  expect(pathParser.fileName).toBe("get.ts");
  expect(pathParser.pathWithoutHttpMethod).toBe("./test/controllers");
});

test("single path", async function () {
  const pathParser = new PathParser("test");
  expect(pathParser.fileName).toBe("test");
  expect(pathParser.pathWithoutHttpMethod).toBe("test");
});
