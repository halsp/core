import { Request, Response } from "@ipare/core";
import { TestMicroStartup } from "../src/micro";
import { TestMicroTcpClient, TestMicroTcpStartup } from "../src/micro-tcp";

describe("micro response.expect", () => {
  it("should expect body", async () => {
    new Response()
      .setBody({
        a: 1,
      })
      .expect(undefined, {
        a: 1,
      });
  });
});

describe("micro startup", () => {
  it("default body is undefined", async () => {
    await new TestMicroStartup().expect((res) => {
      res.expect(undefined);
    });
  });

  it("should set res.body ok", async () => {
    await new TestMicroStartup()
      .use((ctx) => {
        ctx.res.setBody("ok");
      })
      .expect((res) => {
        res.expect((res) => {
          expect(res.body).toBe("ok");
        });
      });
  });

  it("shound set res.body if skip throw error", async () => {
    await new TestMicroStartup()
      .setSkipThrow()
      .setContext(new Request())
      .use(() => {
        throw new Error("err");
      })
      .expect((res) => {
        expect(res.body).toBeUndefined();
        expect(res.error).toBe("err");
      });
  });

  it("should throw error", async () => {
    const startup = new TestMicroStartup().use(() => {
      throw new Error("err");
    });

    let err = false;
    try {
      await startup.run();
    } catch {
      err = true;
    }
    expect(err).toBeTruthy();
  });
});

describe("micro tcp startup", () => {
  it("should send message and return boolean value", async () => {
    const startup = new TestMicroTcpStartup({
      port: 23334,
    }).use((ctx) => {
      ctx.res.setBody(ctx.req.body);
    });
    const { port } = await startup.dynamicListen();

    const client = new TestMicroTcpClient({
      port,
    });
    await client.connect();
    const result = await client.send("", true);
    await startup.close();
    client.dispose();

    expect(result.data).toBe(true);
  });
});
