import { Middleware } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import {
  addCustomValidator,
  V,
  ValidatorDecoratorReturnType,
  validatorMethods,
} from "../src";
import "@ipare/inject";
import { Body } from "@ipare/pipe";
import { isArray } from "class-validator";

declare module "../src" {
  interface ValidatorLib {
    CustomDecorator1: () => ValidatorDecoratorReturnType;
    CustomDecorator2: () => ValidatorDecoratorReturnType;
    CustomDecorator3: (
      arg1: string,
      arg2: number
    ) => ValidatorDecoratorReturnType;
  }
}

describe("custom", () => {
  it("should validate custom validation", async () => {
    addCustomValidator({
      validate: () => false,
      errorMessage: "error msg",
      name: "CustomDecorator1",
    });

    class TestMiddleware extends Middleware {
      @V().IsString().CustomDecorator1()
      @Body("abc")
      private readonly prop!: string;

      invoke(): void | Promise<void> {
        this.ok();
      }
    }

    const res = await new TestStartup()
      .skipThrow()
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .run();

    expect(res.status).toEqual(400);
    expect(res.body).toEqual({
      message: ["abc must be a string", "error msg"],
      status: 400,
    });
  });

  it("should validate custom validation for dto", async () => {
    addCustomValidator({
      validate: () => false,
      errorMessage: (value, property) => `${property}: error`,
      name: "CustomDecorator2",
    });

    class TestDto {
      @V().CustomDecorator2()
      private readonly prop!: string;
    }

    class TestMiddleware extends Middleware {
      @Body
      private readonly body!: TestDto;

      invoke(): void | Promise<void> {
        this.ok(this.body);
      }
    }

    const res = await new TestStartup()
      .skipThrow()
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .run();

    expect(res.body).toEqual({
      message: "prop: error",
      status: 400,
    });
    expect(res.status).toEqual(400);
  });

  it("should validate custom validation with args", async () => {
    addCustomValidator({
      validate: () => false,
      errorMessage: (value, property, args) =>
        `${property} ${value} ${args.join(",")}`,
      name: "CustomDecorator3",
    });

    class TestMiddleware extends Middleware {
      @V().CustomDecorator3("arg11", 22)
      @Body("abc")
      private readonly prop!: string;

      invoke(): void | Promise<void> {
        this.ok();
      }
    }

    const res = await new TestStartup()
      .skipThrow()
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .run();

    expect(res.status).toEqual(400);
    expect(res.body).toEqual({
      message: "abc undefined arg11,22",
      status: 400,
    });
  });
});

describe("methods", () => {
  it("should return validator methods", async () => {
    const methods = validatorMethods;
    expect(isArray(methods)).toBeTruthy();
    expect(methods.length > 0).toBeTruthy();
  });
});
