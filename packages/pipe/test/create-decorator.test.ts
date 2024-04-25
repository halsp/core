import { createReqDecorator } from "../src/decorators/create-req-decorator";

class TestClass {
  //
}

test("create decorator", async () => {
  const decorator = createReqDecorator("query", ["propertyKey"]);
  expect(typeof decorator).toBe("function");
});

test("without property", async () => {
  const decorator = createReqDecorator("query", [TestClass, undefined, 0]);
  expect(decorator).toBeUndefined();
});
