import { ServerStartup } from "../src";
import request from "supertest";

test("dynamicListen", async () => {
  const startup = new ServerStartup();
  const { server, port } = await startup
    .use(async (ctx) => {
      const { server, port } = await new ServerStartup().dynamicListen(2333);
      server.close();
      ctx.ok(port);
    })
    .dynamicListen(2333);

  expect(startup.server).toBe(server);
  const res = await request(server).get("");
  expect(res.status).toBe(200);
  expect((port as number) + 1).toBe(res.body);
  server.close();
});

test("dynamicListen path", async () => {
  const { server, port } = await new ServerStartup()
    .use(async (ctx) => {
      const { server, port } = await new ServerStartup().dynamicListen({
        port: 2333,
      });
      server.close();
      ctx.ok(port);
    })
    .dynamicListen({
      port: 2333,
    });
  const res = await request(server).get("");
  expect(res.status).toBe(200);
  expect((port as number) + 1).toBe(res.body);
  server.close();
});

test("dynamicListen error", async () => {
  let error = false;
  try {
    const { server } = await new ServerStartup()
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
  const { server } = await new ServerStartup()
    .use((ctx) => {
      ctx.ok();
    })
    .dynamicListen();
  server.close();
});

test("dynamicListen emit error", async () => {
  const { server } = await new ServerStartup()
    .use(async (ctx) => {
      ctx.ok();
    })
    .dynamicListen({
      port: 2333,
    });
  server.once("connection", () => {
    server.emit("error");
  });

  const res = await request(server).get("");
  expect(res.status).toBe(200);
  server.close();
});
