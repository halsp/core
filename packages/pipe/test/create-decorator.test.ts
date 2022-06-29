import { createDecorator } from "../src/pipes/create-decorator";

class TestClass {
  //
}

test("create decorator", async () => {
  const decorator = createDecorator("query", ["propertyKey"]);
  expect(typeof decorator).toBe("function");
});

test("without property", async () => {
  const decorator = createDecorator("query", [TestClass, undefined, 0]);
  expect(decorator).toBeUndefined();
});
