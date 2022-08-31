import { addCustomValidator, V, ValidatorDecoratorReturnType } from "../src";

declare module "../src" {
  interface ValidatorLib {
    CustomDecorator1: () => ValidatorDecoratorReturnType;
    CustomDecorator2: () => ValidatorDecoratorReturnType;
  }
}

describe("name", () => {
  addCustomValidator({
    validate: () => false,
    errorMessage: "",
    name: "CustomDecorator1",
  });

  const lib = V();

  it("should set decorator name", async () => {
    expect(lib.Contains.name).toBe("Contains");
  });

  it("should set extend decorator name", async () => {
    expect(lib.Required.name).toBe("Required");
  });

  it("should set custom decorator name", async () => {
    expect(lib.CustomDecorator1.name).toBe("CustomDecorator1");
  });

  it("should set not-existed decorator name", async () => {
    expect(lib.CustomDecorator2.name).toBe("CustomDecorator2");
  });
});
