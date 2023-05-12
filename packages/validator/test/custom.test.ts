import { Middleware, Startup } from "@halsp/core";
import "@halsp/testing";
import {
  addCustomValidator,
  getCustomValidators,
  getRules,
  V,
  ValidatorDecoratorReturnType,
  validatorMethods,
} from "../src";
import "@halsp/inject";
import { Body } from "@halsp/pipe";
import { isArray } from "class-validator";

declare module "../src" {
  interface ValidatorLib {
    CustomDecorator1: () => ValidatorDecoratorReturnType;
    CustomDecorator2: () => ValidatorDecoratorReturnType;
    CustomDecorator3: (
      arg1: string,
      arg2: number
    ) => ValidatorDecoratorReturnType;
    NotExist: () => ValidatorDecoratorReturnType;
  }
}

describe("custom", () => {
  it("should add custom validator", async () => {
    addCustomValidator({
      validate: () => false,
      errorMessage: "",
      name: "testname",
    });
    const validators = getCustomValidators();
    expect(
      validators.filter((item) => item.name == "testname").length > 0
    ).toBeTruthy();
  });

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
        //
      }
    }

    await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(err.message).toBe("abc must be a string, error msg");
      })
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .test();
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
        this.ctx.set("body", this.body);
      }
    }

    await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(err.message).toBe("prop: error");
      })
      .expect((res) => {
        expect(res.ctx.get("body")).toBeUndefined();
      })
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .test();
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
        //
      }
    }

    await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(err.message).toBe("abc undefined arg11,22");
      })
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .test();
  });
});

describe("methods", () => {
  it("should return validator methods", async () => {
    const methods = validatorMethods;
    expect(isArray(methods)).toBeTruthy();
    expect(methods.length > 0).toBeTruthy();
  });
});

describe("Is", () => {
  it("should validate by Is decorator", async () => {
    class TestMiddleware extends Middleware {
      @V()
        .Is(() => false, `error1`)
        .Is(
          () => false,
          (v, p) => `${p} Is error2`
        )
        .Is(() => true, `not-error3`)
      @Body("abc")
      private readonly prop!: string;

      invoke(): void | Promise<void> {
        //
      }
    }

    await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(err.message).toBe("error1, abc Is error2");
      })
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .test();
  });
});

describe("proxy", () => {
  it("should create not-existed decorator", () => {
    class TestClass {
      @V().NotExist().IsString().NotExist()
      private readonly prop!: string;
    }

    expect(getRules(TestClass).length).toBe(1);
    expect(getRules(TestClass)[0].validates.length).toBe(3);
  });

  it("should not validate when use not-existed decorator", async () => {
    class TestMiddleware extends Middleware {
      @V().NotExist()
      @Body("abc")
      private readonly prop!: string;

      invoke(): void | Promise<void> {
        //
      }
    }

    await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(err).toBeUndefined();
      })
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .test();
  });
});

describe("extend", () => {
  it("should validated by extend decorator", async () => {
    class TestMiddleware extends Middleware {
      @V().Required()
      @Body("abc")
      private readonly prop!: string;

      invoke(): void | Promise<void> {
        //
      }
    }

    await new Startup()
      .keepThrow()
      .expectError((err) => {
        expect(err.message).toBe("abc should not be empty");
      })
      .useInject()
      .useValidator()
      .add(TestMiddleware)
      .test();
  });
});
