import { HttpServerStartup } from "../src";
import * as net from "net";

test("https", async () => {
  const server = new HttpServerStartup({ https: true }).listen() as net.Server;
  expect(server).not.toBeUndefined();
  expect(server.listening).toBeTruthy();
  server.close();
});
