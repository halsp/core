import { MicroTcpStartup } from "../src";
import { sendMessage } from "./utils";

test("dynamicListen", async () => {
  const startup = new MicroTcpStartup({
    port: 23345,
  });
  const { server, port } = await startup
    .use(async (ctx) => {
      const { server, port } = await new MicroTcpStartup({
        port: 23345,
      }).dynamicListen();
      server.close();
      ctx.res.setBody(port);
    })
    .dynamicListen();

  expect(startup.server).toBe(server);
  const res = await sendMessage(port, true);
  expect(res.status).toBeUndefined();
  expect(port + 1).toBe(res.data);
  server.close();
});

test("dynamicListen error", async () => {
  let error = false;
  try {
    const { server } = await new MicroTcpStartup({
      port: 80,
      host: "github.com",
    }).dynamicListen();
    server.close();
  } catch (err) {
    expect((err as any).code).toBe("EADDRNOTAVAIL");
    error = true;
  }
  expect(error).toBeTruthy();
});

test("dynamicListen emit error", async () => {
  const { server, port } = await new MicroTcpStartup({
    port: 23334,
  })
    .use(async (ctx) => {
      ctx.res.setBody("ok");
    })
    .dynamicListen();
  server.once("connection", () => {
    server.emit("error");
  });

  const res = await sendMessage(port, true);
  expect(res.data).toBe("ok");
  server.close();
});
