import { getAvailablePort } from "../src";
import net from "net";

describe("port", () => {
  it("should get available port", async () => {
    const port = await getAvailablePort();
    expect(port).toBe(9504);
  });

  it("should get available port when port is used", async () => {
    const server = net.createServer();
    server.listen(9602, "127.0.0.1");

    const port = await getAvailablePort("127.0.0.1", 9602);
    server.close();
    expect(port).toBe(9603);
  });

  it("should get available port error", async () => {
    const server = net.createServer();
    server.listen(9604, "127.0.0.1");

    const port = await getAvailablePort("127.0.0.1", 9604, 9604);
    server.close();
    expect(port).toBeUndefined();
  });
});
