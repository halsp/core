import { Middleware, Request } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import { Body } from "@ipare/pipe";
import { ValidationSchema } from "class-validator";
import "@ipare/inject";
import "../src";
import { UseValidatorSchema, V } from "../src";

function testSchema(useSchema: boolean) {
  function runTest(func: boolean) {
    test(`schema test ${useSchema} ${func}}`, async () => {
      const schemaName = func ? () => "testSchema" : "testSchema";
      @UseValidatorSchema(schemaName as any)
      class TestDto {
        @V().IsInt()
        b1!: number;

        get b() {
          return this.b1;
        }
      }

      class TestMiddleware extends Middleware {
        @Body
        private readonly body!: TestDto;
        @Body("b1")
        private readonly b1!: string;

        async invoke(): Promise<void> {
          this.ctx.set("b1", this.b1);
          this.ctx.set("body", this.body);
        }
      }

      const testSchema: ValidationSchema = {
        name: "testSchema",
        properties: {
          b1: [
            {
              type: "isEmail",
            },
          ],
        },
      };

      const req = new Request().setBody({
        b1: "1",
      });
      const startup = new TestStartup()
        .setSkipThrow()
        .setContext(req)
        .useInject()
        .useValidator();
      if (useSchema) {
        startup.useValidationSchema(testSchema);
      }
      const { ctx } = await startup.add(TestMiddleware).run();
      expect(ctx.errorStack[0].message).toBe("b1 must be an integer number");
      expect(ctx.get("body")).toBeUndefined();
    });
  }
  runTest(true);
  runTest(false);
}

testSchema(true);
testSchema(false);
