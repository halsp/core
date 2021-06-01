import ErrorMessage from "../src/Response/ErrorMessage";
import StatusCode from "../src/Response/StatusCode";
import HttpContext from "../src/HttpContext";
import { Middleware } from "../src";
import Request from "../src/Request";

const normalMethod = [
  {
    method: "ok",
    code: 200,
  },
  {
    method: "accepted",
    code: 202,
  },
  {
    method: "noContent",
    code: 204,
  },
  {
    method: "partialContent",
    code: 206,
  },
  {
    method: "badRequest",
    code: 400,
  },
  {
    method: "unauthorized",
    code: 401,
  },
  {
    method: "forbidden",
    code: 403,
  },
  {
    method: "notFound",
    code: 404,
  },
  // {
  //   method: "methodNotAllowed",
  //   code: 405,
  // },
  {
    method: "errRequest",
    code: 500,
  },
];

for (let i = 0; i < normalMethod.length; i++) {
  const methodItem = normalMethod[i];
  class Md extends Middleware {
    async invoke(): Promise<void> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any)[methodItem.method]();
    }
    constructor() {
      super();
      this.init(new HttpContext(new Request()), 0);
    }
  }
  const md = new Md();
  md.invoke();
  test(`http result ${methodItem.method}`, async function () {
    const result = md.ctx.res;
    expect(result.status).toBe(methodItem.code);
  });
}

const msgMethods = [
  {
    method: "badRequestMsg",
    code: 400,
  },
  {
    method: "unauthorizedMsg",
    code: 401,
  },
  {
    method: "forbiddenMsg",
    code: 403,
  },
  {
    method: "notFoundMsg",
    code: 404,
  },
  {
    method: "errRequestMsg",
    code: 500,
  },
];
for (let i = 0; i < msgMethods.length; i++) {
  const methodItem = msgMethods[i];
  const errorMsgTest = `error message ${methodItem.method}`;

  class Md extends Middleware {
    async invoke(): Promise<void> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any)[methodItem.method]({
        message: errorMsgTest,
      });
    }
    constructor() {
      super();
      this.init(new HttpContext(new Request()), 0);
    }
  }

  const md = new Md();
  md.invoke();
  test(errorMsgTest, async function () {
    const result = md.ctx.res;
    expect(result.status).toBe(methodItem.code);
    expect((result.body as ErrorMessage).message).toBe(errorMsgTest);
  });
}

const redirectCodes = [301, 302, 303, 307, 308];
const location = "/test";
for (let i = 0; i < redirectCodes.length; i++) {
  const code = redirectCodes[i] as 301 | 302 | 303 | 307 | 308;
  test(`${code} redirect`, async function () {
    const md = new RedirectMd(code, location);
    await md.invoke();
    expect(md.ctx.res.status).toBe(code);
    expect(md.ctx.res.headers.location).toBe(location);
  });
}

class RedirectMd extends Middleware {
  constructor(readonly code: StatusCode, readonly location: string) {
    super();

    this.init(new HttpContext(new Request()), 0);
  }

  async invoke(): Promise<void> {
    this.redirect(this.location, this.code);
  }
}
