import { HttpsStartup } from "../src";
import * as net from "net";

test("https", async () => {
  const server = new HttpsStartup().listen() as net.Server;
  expect(server).not.toBeUndefined();
  expect(server.listening).toBeTruthy();
  server.close();
});

test("https with config", async () => {
  const server = new HttpsStartup({}).listen() as net.Server;
  expect(server).not.toBeUndefined();
  expect(server.listening).toBeTruthy();
  server.close();
});
