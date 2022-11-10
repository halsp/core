import { NativeStartup } from "../src";
import request from "supertest";

test("dynamicListen", async () => {
  const startup = new NativeStartup();
  const { server, port } = await startup
    .use(async (ctx) => {
      const { server, port } = await new NativeStartup().dynamicListen(23334);
      server.close();
      ctx.ok(port);
    })
    .dynamicListen(23334);

  expect(startup.server).toBe(server);
  const res = await request(server).get("");
  expect(res.status).toBe(200);
  expect(port + 1).toBe(res.body);
  server.close();
});

test("dynamicListen path", async () => {
  const { server, port } = await new NativeStartup()
    .use(async (ctx) => {
      const { server, port } = await new NativeStartup().dynamicListen({
        port: 23334,
      });
      server.close();
      ctx.ok(port);
    })
    .dynamicListen({
      port: 23334,
    });
  const res = await request(server).get("");
  expect(res.status).toBe(200);
  expect(port + 1).toBe(res.body);
  server.close();
});

test("dynamicListen error", async () => {
  let error = false;
  try {
    const { server } = await new NativeStartup()
      .use((ctx) => {
        ctx.ok();
      })
      .dynamicListen(80, "github.com");
    server.close();
  } catch (err) {
    expect((err as any).code).toBe("EADDRNOTAVAIL");
    error = true;
  }
  expect(error).toBeTruthy();
});

test("dynamicListen empty", async () => {
  const { server } = await new NativeStartup()
    .use((ctx) => {
      ctx.ok();
    })
    .dynamicListen();
  server.close();
});

test("dynamicListen emit error", async () => {
  const { server } = await new NativeStartup()
    .use(async (ctx) => {
      ctx.ok();
    })
    .dynamicListen({
      port: 23334,
    });
  server.once("connection", () => {
    server.emit("error");
  });

  const res = await request(server).get("");
  expect(res.status).toBe(200);
  server.close();
});
