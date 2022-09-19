import { StatusCodes, Request, Context, Dict, HttpMethod } from "@ipare/core";
import { TestStartup } from "@ipare/testing";
import { Action } from "../src";
import "./global";

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
    const result = await new TestStartup()
      .setRequest(new Request().setPath(path).setMethod(method))
      .useTestRouter()
      .run();
    if (body) {
      expect(result.body).toBe(body);
    }
    expect(result.status).toBe(status);
  });
}

runMultipleTest("multiple", HttpMethod.get, 200, "multiple-default");
runMultipleTest("multiple", HttpMethod.post, 405);

runMultipleTest("multiple/test1", HttpMethod.get, 200, "multiple-test");
runMultipleTest("multiple/test1", HttpMethod.post, 405);

runMultipleTest("multiple/test2", HttpMethod.post, 200, "multiple-post");
runMultipleTest("multiple/test2", HttpMethod.get, 405);

runMultipleTest("multiple/test3/path", HttpMethod.put, 200, "multiple-path");
runMultipleTest("multiple/test2/path", HttpMethod.get, 404);
