import ErrorMessage from "../../src/Response/ErrorMessage";
import HttpContext from "../../src/HttpContext";
import { Middleware, TestStartup } from "../../src";
import Request from "../../src/Request";
import { getReasonPhrase } from "http-status-codes";

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
  {
    method: "errRequest",
    code: 500,
  },
];

async function testBody(body?: unknown) {
  for (let i = 0; i < normalMethod.length; i++) {
    const methodItem = normalMethod[i];
    const res = await new TestStartup()
      .use(async (ctx) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ctx as any)[methodItem.method](body);
      })
      .run();

    expect(res.status).toBe(methodItem.code);
    expect(res.body).toBe(body);
  }
}

test(`test handler func`, async function () {
  await testBody();
  await testBody("body");
});

test(`http result created`, async function () {
  {
    const res = await new TestStartup()
      .use(async (ctx) => {
        ctx.created("loca");
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).init(new HttpContext(new Request()), 0);
    }
  }

  {
    const md = new Md(true);
    md.invoke();
    test(errorMsgTest, async function () {
      const result = md.ctx.res;
      expect(result.status).toBe(methodItem.code);
      expect((result.body as ErrorMessage).message).toBe(errorMsgTest);
    });
  }

  {
    const md = new Md(false);
    md.invoke();
    test(errorMsgTest, async function () {
      const result = md.ctx.res;
      expect(result.status).toBe(methodItem.code);
      expect((result.body as ErrorMessage).message).toBe(
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).init(new HttpContext(new Request()), 0);
  }

  async invoke(): Promise<void> {
    this.redirect(this.location, this.code);
  }
}
