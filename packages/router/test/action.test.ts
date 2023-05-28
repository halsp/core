import { Context, Dict, Request, Startup } from "@halsp/core";
import { StatusCodes, HttpMethods } from "@halsp/http";
import "@halsp/testing";
import { Action } from "../src";
import "./utils";

class Login extends Action {
  async invoke(): Promise<void> {
    const { account, password } = <Dict>this.ctx.req.body;

    if (account != "abc") {
      this.notFound("用户不存在");
      return;
    }
    if (password != "123456") {
      this.badRequest("密码错误");
      return;
    }

    this.ok("action ok");
  }
}

test("action test", async () => {
  const loginAction = new Login();
  const ctx = new Context(
    new Request().setBody({
      account: "abc",
      password: "123456",
    })
  );
  ctx.res.status = StatusCodes.OK;
  (loginAction as any).init(ctx, 0);

  await loginAction.invoke();
  expect(loginAction.ctx.res.status).toBe(StatusCodes.OK);

  loginAction.ctx.req.body.password = "12345";
  await loginAction.invoke();
  expect(loginAction.ctx.res.status).toBe(StatusCodes.BAD_REQUEST);

  loginAction.ctx.req.body.account = "12";
  await loginAction.invoke();
  expect(loginAction.ctx.res.status).toBe(StatusCodes.NOT_FOUND);
});

function runMultipleTest(
  path: string,
  method: string,
  status: number,
  body?: string
) {
  test(`multiple`, async () => {
    const result = await new Startup()
      .useHttp()
      .setContext(new Request().setPath(path).setMethod(method))
      .useTestRouter()
      .test();
    if (body) {
      expect(result.body).toBe(body);
    }
    expect(result.status).toBe(status);
  });
}

runMultipleTest("multiple", HttpMethods.get, 200, "multiple-default");
runMultipleTest("multiple", HttpMethods.post, 405);

runMultipleTest("multiple/test1", HttpMethods.get, 200, "multiple-test");
runMultipleTest("multiple/test1", HttpMethods.post, 405);

runMultipleTest("multiple/test2", HttpMethods.post, 200, "multiple-post");
runMultipleTest("multiple/test2", HttpMethods.get, 405);

runMultipleTest("multiple/test3/path", HttpMethods.put, 200, "multiple-path");
runMultipleTest("multiple/test2/path", HttpMethods.get, 404);
