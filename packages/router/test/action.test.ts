import { HttpContext, Request, status } from "sfa";
import { Action } from "../src/index";

class Login extends Action {
  async invoke(): Promise<void> {
    const { account, password } = <Record<string, unknown>>this.ctx.req.body;

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

test("action test", async function () {
  const loginAction = new Login();
  const ctx = new HttpContext(
    new Request().setBody({
      account: "abc",
      password: "123456",
    })
  );
  ctx.res.status = status.StatusCodes.OK;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (loginAction as any).init(ctx, 0);

  await loginAction.invoke();
  expect(loginAction.ctx.res.status).toBe(status.StatusCodes.OK);

  loginAction.ctx.req.body.password = "12345";
  await loginAction.invoke();
  expect(loginAction.ctx.res.status).toBe(status.StatusCodes.BAD_REQUEST);

  loginAction.ctx.req.body.account = "12";
  await loginAction.invoke();
  expect(loginAction.ctx.res.status).toBe(status.StatusCodes.NOT_FOUND);
});
