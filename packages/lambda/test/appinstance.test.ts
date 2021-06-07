import "../src";
import tcb = require("@cloudbase/node-sdk");
import SfaCloudbase from "../src";

test("default config", async function () {
  const startup = new SfaCloudbase({}, {}).useCloudbaseApp();
  await startup.run();

  expect(!!startup.ctx.bag<tcb.CloudBase>("CB_APP")).toBe(true);
  expect(!!startup.ctx.bag<tcb.Database.Db>("CB_DB")).toBe(true);
});

test("custom config", async function () {
  const startup = new SfaCloudbase({}, {}).useCloudbaseApp({
    env: "test",
  });
  await startup.run();

  expect(!!startup.ctx.bag<tcb.CloudBase>("CB_APP")).toBe(true);
  expect(!!startup.ctx.bag<tcb.Database.Db>("CB_DB")).toBe(true);
});
