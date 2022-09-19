import { ServerStartup } from "../src";
import * as net from "net";

test("https", async () => {
  const server = new ServerStartup({ https: true }).listen() as net.Server;
  expect(server).not.toBeUndefined();
  expect(server.listening).toBeTruthy();
  server.close();
});
