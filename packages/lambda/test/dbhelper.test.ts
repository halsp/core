import "../src";
import Dbhelper from "../src/Dbhelper";
import SfaCloudbase from "../src";

test("dbhelper", async function () {
  const startup = new SfaCloudbase({}, {}).useCloudbaseDbhelper();
  await startup.run();

  expect(!!startup.ctx.bag<Dbhelper>("CB_DBHELPER")).toBe(true);
});
