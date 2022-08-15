import { Request } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import "../src";
import { Action, getActionMetadata } from "../src";
import "./global";

test("custom metadata", async () => {
  const result = await new TestStartup()
    .setRequest(new Request().setPath("/metadata/custom").setMethod("GET"))
    .useTestRouter()
    .run();
  expect(result.body).toEqual({
    get: {
      custom: "11",
      admin: true,
    },
    custom: "11",
    admin: true,
  });
  expect(result.status).toBe(200);
});

test("set metadata", async () => {
  const result = await new TestStartup()
    .setRequest(
      new Request().setPath("/metadata/set-metadata").setMethod("GET")
    )
    .useTestRouter()
    .run();
  expect(result.body).toEqual({
    object: {
      m1: 1,
      m2: 2,
      m3: 3,
    },
    constructor: {
      m1: 1,
      m2: 2,
      m3: 3,
    },
    m1: 1,
  });
  expect(result.status).toBe(200);
});

class TestAction extends Action {
  invoke() {
    this.ok();
  }
}
test("get not exist metadata", async () => {
  expect(getActionMetadata(TestAction, "not-exist")).toBeUndefined();
});
