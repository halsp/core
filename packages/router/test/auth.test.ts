import linq = require("linq");
import global from "./global";
import "./UseTest";
import "../src";
import { Request, SimpleStartup } from "sfa";
import Authority from "../src/Authority";

test("router test login access", async function () {
  const result = await new SimpleStartup(
    new Request()
      .setData({
        account: "abc",
        password: "123456",
      })
      .setHeader("account", global.users[0].account)
      .setHeader("password", global.users[0].password)
      .setPath("/simple/loginAuth")
      .setMethod("POST")
  )
    .useTest()
    .useRouter<SimpleStartup>({
      authFunc: () => new Auth(),
    })
    .run();

  expect(result.status).toBe(200);
});

test("router test login not access", async function () {
  const result = await new SimpleStartup(
    new Request()
      .setHeader("account", global.users[0].account)
      .setHeader("password", global.users[0].password + "1")
      .setPath("/simple/loginAuth")
      .setMethod("POST")
  )
    .useTest()
    .useRouter<SimpleStartup>({
      authFunc: () => new Auth(),
    })
    .run();

  expect(result.status).toBe(403);
});

test("router test admin access", async function () {
  const result = await new SimpleStartup(
    new Request()
      .setHeader("account", global.users[1].account)
      .setHeader("password", global.users[1].password)
      .setPath("/simple/adminAuth")
      .setMethod("POST")
  )
    .useTest()
    .useRouter<SimpleStartup>({
      authFunc: () => new Auth(),
    })
    .run();

  expect(result.status).toBe(200);
});

test("router test admin not access", async function () {
  const result = await new SimpleStartup(
    new Request()
      .setHeader("account", global.users[0].account)
      .setHeader("password", global.users[0].password)
      .setPath("/simple/adminAuth")
      .setMethod("POST")
  )
    .useTest()
    .useRouter<SimpleStartup>({
      authFunc: () => new Auth(),
    })
    .run();

  expect(result.status).toBe(403);
});

class Auth extends Authority {
  async invoke(): Promise<void> {
    if (!this.roles || !this.roles.length) {
      await this.next();
      return;
    }

    if (
      (this.roles.includes("login") || this.roles.includes("admin")) &&
      !this.loginAuth()
    ) {
      this.forbidden("账号或密码错误");
      return;
    }

    if (this.roles.includes("admin") && !this.adminAuth()) {
      this.forbidden("不是管理员");
      return;
    }

    await this.next();
  }

  adminAuth() {
    const { account } = this.ctx.req.headers;
    return account == global.adminAccount;
  }

  loginAuth() {
    const { account, password } = this.ctx.req.headers;
    return (
      linq
        .from(global.users)
        .where(
          (u: Record<string, unknown>) =>
            u.account == account && u.password == password
        )
        .count() > 0
    );
  }
}
