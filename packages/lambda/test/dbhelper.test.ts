import "../src";
import Dbhelper from "../src/Dbhelper";
import SfaCloudbase from "../src";

test("dbhelper", async function () {
  const startup = new SfaCloudbase({}, {}).useCloudbaseDbhelper();
  await startup.run();

  expect(!!startup.ctx.bag<Dbhelper>("CB_DBHELPER")).toBeTruthy();
  expect(
    startup.ctx.bag<Dbhelper>("CB_DBHELPER") instanceof Dbhelper
  ).toBeTruthy();
});

test("dbhelper getPageList", async function () {
  await testPageList(
    {
      queryStringParameters: {
        page: "2",
        limit: "8",
      },
    },
    2,
    8
  );
  await testPageList(
    {
      body: {
        page: "2",
        limit: "8",
      },
    },
    2,
    8
  );
  await testPageList(
    {
      queryStringParameters: {
        page: "2",
        pageSize: "8",
      },
    },
    2,
    8
  );
  await testPageList(
    {
      body: {
        page: 2,
        pageSize: 8,
      },
    },
    2,
    8
  );
  await testPageList({}, 1, 20);
});

async function testPageList(
  event: Record<string, unknown>,
  page: number,
  limit: number
) {
  const startup = new SfaCloudbase(event, {}).useCloudbaseDbhelper();
  await startup.run();
  const dbhelper = startup.ctx.bag<Dbhelper>("CB_DBHELPER");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((dbhelper as any).pageQuery).toEqual({
    page: page,
    limit: limit,
  });
}
