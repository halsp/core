import { Middleware, TestStartup } from "@sfajs/core";
import "../src";
import { Inject } from "../src";

class TestMiddleware extends Middleware {
  @Inject("KEY1")
  private readonly key1!: string;
  @Inject("KEY2")
  private readonly key2!: any;
  @Inject("KEY3")
  private readonly key3!: number; // number to bool
  @Inject("KEY4")
  private readonly key4!: any;

  async invoke(): Promise<void> {
    this.ok({
      key1: this.key1,
      key2: this.key2,
      key3: this.key3,
      key4: this.key4,
    });
  }
}

test(`inject key`, async function () {
  const res = await new TestStartup()
    .useInject()
    .inject("KEY1", 1)
    .inject("KEY2", "2")
    .inject("KEY3", true)
    .add(TestMiddleware)
    .run();

  expect(res.body).toEqual({
    key1: 1,
    key2: "2",
    key3: true,
    key4: undefined,
  });
  expect(res.status).toBe(200);
});

test(`inject key empty`, async function () {
  const res = await new TestStartup().useInject().add(TestMiddleware).run();

  expect(res.body).toEqual({
    key1: undefined,
    key2: undefined,
    key3: undefined,
    key4: undefined,
  });
  expect(res.status).toBe(200);
});
