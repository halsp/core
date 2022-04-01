import "../src";
import tcb = require("@cloudbase/node-sdk");
import { SfaCloudbase } from "../src";
import { HttpContext } from "@sfajs/core";

test("default config", async function () {
  let context!: HttpContext;
  await new SfaCloudbase()
    .useCloudbaseApp()
    .use(async (ctx) => {
      context = ctx;
    })
    .run({}, {});
  expect(!!context.bag<tcb.CloudBase>("CB_APP")).toBeTruthy();
  expect(!!context.bag<tcb.Database.Db>("CB_DB")).toBeTruthy();
});

test("custom config", async function () {
  let context!: HttpContext;
  await new SfaCloudbase()
    .useCloudbaseApp({
      env: "test",
    })
    .use(async (ctx) => {
      context = ctx;
    })
    .run({}, {});
  expect(!!context.bag<tcb.CloudBase>("CB_APP")).toBeTruthy();
  expect(!!context.bag<tcb.Database.Db>("CB_DB")).toBeTruthy();
});
