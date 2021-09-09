import "../src";
import Dbhelper from "../src/Dbhelper";
import SfaCloudbase from "../src";
import { HttpContext } from "sfa";
import { Dict } from "@sfajs/header";

test("dbhelper", async function () {
  let context!: HttpContext;
  await new SfaCloudbase()
    .useCloudbaseDbhelper()
    .use(async (ctx) => {
      context = ctx;
    })
    .run({}, {});

  expect(!!context.bag<Dbhelper>("CB_DBHELPER")).toBeTruthy();
  expect(context.bag<Dbhelper>("CB_DBHELPER") instanceof Dbhelper).toBeTruthy();
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

async function testPageList(event: Dict<unknown>, page: number, limit: number) {
  let context!: HttpContext;
  await new SfaCloudbase()
    .useCloudbaseDbhelper()
    .use(async (ctx) => {
      context = ctx;
    })
    .run(event, {});
  const dbhelper = context.bag<Dbhelper>("CB_DBHELPER");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expect((dbhelper as any).pageQuery).toEqual({
    page: page,
    limit: limit,
  });
}
