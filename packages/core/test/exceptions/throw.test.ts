import {
  BadRequestException,
  ForbiddenException,
  getReasonPhrase,
  StatusCodes,
} from "../../src";
import { TestStartup } from "../test-startup";

test("throw base error", async function () {
  const startup = new TestStartup();
  startup.use(async () => {
    throw new Error("msg");
  });
  const res = await startup.run();
  expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  expect(res.body).toEqual({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: "msg",
  });
});

test("throw base error with empty message", async function () {
  const startup = new TestStartup();
  startup.use(async () => {
    throw new Error();
  });
  const res = await startup.run();
  expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  expect(res.body).toEqual({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
  });
});

test("throw error", async function () {
  const startup = new TestStartup();
  startup.use(async () => {
    throw new BadRequestException("msg");
  });
  const res = await startup.run();
  expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  expect(res.body).toEqual({
    status: StatusCodes.BAD_REQUEST,
    message: "msg",
  });
});

function testPipeline(breakthrough?: boolean) {
  const title = `throw pipeline exception${
    breakthrough != false ? " with breakthrough" : ""
  }`;
  test(title, async function () {
    const startup = new TestStartup();
    startup
      .use(async (ctx, next) => {
        ctx.res.setHeader("h1", "1");
        await next();
        ctx.res.setHeader("h3", "3");
      })
      .use(async (ctx) => {
        ctx.res.setHeader("h2", "2");
        throw new ForbiddenException("msg").setBreakthrough(breakthrough);
      });
    const res = await startup.run();
    expect(res.status).toBe(StatusCodes.FORBIDDEN);
    expect(res.body).toEqual({
      status: StatusCodes.FORBIDDEN,
      message: "msg",
    });
    expect(res.headers["h1"]).toBe("1");
    expect(res.headers["h2"]).toBe("2");
    if (breakthrough != false) {
      expect(res.headers["h3"]).toBeUndefined();
    } else {
      expect(res.headers["h3"]).toBe("3");
    }
  });
}

testPipeline(true);
testPipeline(false);
testPipeline(undefined);

test("throw default error", async function () {
  const startup = new TestStartup();
  startup.use(async () => {
    throw {};
  });
  const res = await startup.run();
  expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  expect(res.body).toEqual({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
  });
});

test("throw string error", async function () {
  const startup = new TestStartup();
  startup.use(async () => {
    throw "aaa";
  });
  const res = await startup.run();
  expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  expect(res.body).toEqual({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: "aaa",
  });
});

test("throw number error", async function () {
  const startup = new TestStartup();
  startup.use(async () => {
    throw 123;
  });
  const res = await startup.run();
  expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  expect(res.body).toEqual({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: "123",
  });
});

test("throw object error", async function () {
  const startup = new TestStartup();
  startup.use(async () => {
    throw { a: 1, message: "err" };
  });
  const res = await startup.run();
  expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  expect(res.body).toEqual({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: "err",
    a: 1,
  });
});

test("throw null error", async function () {
  const startup = new TestStartup();
  startup.use(async () => {
    throw null;
  });
  const res = await startup.run();
  expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  expect(res.body).toEqual({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR),
  });
});

test("throw boolean error", async function () {
  const startup = new TestStartup();
  startup.use(async () => {
    throw false;
  });
  const res = await startup.run();
  expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  expect(res.body).toEqual({
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: "false",
  });
});
