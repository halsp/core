import {
  Middleware,
  HttpContext,
  SfaRequest,
  getReasonPhrase,
} from "../../src";
import { TestStartup } from "../test-startup";

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
    method: "partialContent",
    code: 206,
  },
  {
    method: "badRequest",
    code: 400,
    error: true,
  },
  {
    method: "unauthorized",
    code: 401,
    error: true,
  },
  {
    method: "forbidden",
    code: 403,
    error: true,
  },
  {
    method: "notFound",
    code: 404,
    error: true,
  },
  {
    method: "methodNotAllowed",
    code: 405,
    error: true,
  },
  {
    method: "notAcceptable",
    code: 406,
    error: true,
  },
  {
    method: "requestTimeout",
    code: 408,
    error: true,
  },
  {
    method: "conflict",
    code: 409,
    error: true,
  },
  {
    method: "gone",
    code: 410,
    error: true,
  },
  {
    method: "preconditionFailed",
    code: 412,
    error: true,
  },
  {
    method: "requestTooLong",
    code: 413,
    error: true,
  },
  {
    method: "unsupportedMediaType",
    code: 415,
    error: true,
  },
  {
    method: "imATeapot",
    code: 418,
    error: true,
  },
  {
    method: "misdirected",
    code: 421,
    error: true,
  },
  {
    method: "unprocessableEntity",
    code: 422,
    error: true,
  },
  {
    method: "unprocessableEntity",
    code: 422,
    error: true,
  },
  {
    method: "internalServerError",
    code: 500,
    error: true,
  },
  {
    method: "notImplemented",
    code: 501,
    error: true,
  },
  {
    method: "badGateway",
    code: 502,
    error: true,
  },
  {
    method: "serviceUnavailable",
    code: 503,
    error: true,
  },
  {
    method: "gatewayTimeout",
    code: 504,
    error: true,
  },
  {
    method: "httpVersionNotSupported",
    code: 505,
    error: true,
  },
];

async function testBody(body?: unknown) {
  for (let i = 0; i < normalMethod.length; i++) {
    const methodItem = normalMethod[i];
    const res = await new TestStartup()
      .use(async (ctx) => {
        (ctx as any)[methodItem.method](body);
      })
      .run();

    expect(res.status).toBe(methodItem.code);
    if (methodItem.error && methodItem.method.endsWith("Msg")) {
      expect(res.body).toEqual({
        message: body ?? getReasonPhrase(methodItem.code),
        status: methodItem.code,
      });
    } else {
      expect(res.body).toBe(body);
    }
  }
}

test(`test handler func without body`, async function () {
  await testBody();
});

test(`test handler func with body`, async function () {
  await testBody("body");
});

test(`error message`, async function () {
  {
    const res = await new TestStartup()
      .use(async (ctx) => {
        ctx.res.badRequestMsg("err");
      })
      .run();
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "err",
      status: 400,
    });
  }
});

test(`http result created`, async function () {
  {
    const res = await new TestStartup()
      .use(async (ctx) => {
        ctx.res.created("loca");
      })
      .run();
    expect(res.status).toBe(201);
    expect(res.getHeader("location")).toBe("loca");
  }
  {
    const res = await new TestStartup()
      .use(async (ctx) => {
        ctx.created("loca", "body");
      })
      .run();
    expect(res.status).toBe(201);
    expect(res.body).toBe("body");
    expect(res.getHeader("location")).toBe("loca");
  }
});

test(`http result noContent`, async function () {
  const res = await new TestStartup()
    .use(async (ctx) => {
      ctx.noContent();
    })
    .run();
  expect(res.status).toBe(204);
  expect(res.body).toBe(undefined);
});

const msgMethods = normalMethod
  .filter((method) => method.error == true)
  .map((m) => {
    const obj = Object.assign({}, m);
    obj.method = obj.method + "Msg";
    return obj;
  });
for (let i = 0; i < msgMethods.length; i++) {
  const methodItem = msgMethods[i];
  const errorMsgTest = `error message ${methodItem.method}`;

  class Md extends Middleware {
    async invoke(): Promise<void> {
      (this as any)[methodItem.method](
        this.existMsg
          ? {
              message: errorMsgTest,
            }
          : undefined
      );
    }
    constructor(private existMsg: boolean) {
      super();
      (this as any).init(new HttpContext(new SfaRequest()), 0);
    }
  }

  {
    const md = new Md(true);
    md.invoke();
    test(errorMsgTest, async function () {
      const result = md.ctx.res;
      expect(result.status).toBe(methodItem.code);
      expect((result.body as any).message).toBe(errorMsgTest);
    });
  }

  {
    const md = new Md(false);
    md.invoke();
    test(errorMsgTest, async function () {
      const result = md.ctx.res;
      expect(result.status).toBe(methodItem.code);
      expect((result.body as any).message).toBe(
        getReasonPhrase(methodItem.code)
      );
    });
  }
}

const redirectCodes = [301, 302, 303, 307, 308, undefined];
const location = "/test";
for (let i = 0; i < redirectCodes.length; i++) {
  const code = redirectCodes[i] as 301 | 302 | 303 | 307 | 308 | undefined;
  test(`${code} redirect`, async function () {
    const md = new RedirectMd(code, location);
    await md.invoke();
    expect(md.ctx.res.status).toBe(code || 302);
    expect(md.ctx.res.getHeader("location")).toBe(location);
  });
}

class RedirectMd extends Middleware {
  constructor(readonly code: number | undefined, readonly location: string) {
    super();

    (this as any).init(new HttpContext(new SfaRequest()), 0);
  }

  async invoke(): Promise<void> {
    this.redirect(this.location, this.code);
  }
}
