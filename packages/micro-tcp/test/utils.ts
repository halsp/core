import net from "net";

export async function sendMessage(port: number, data: any) {
  let result: any;
  await new Promise<void>((resolve) => {
    const socket = net.createConnection(port);
    socket.on("data", (buffer) => {
      const str = buffer.toString("utf-8");
      const strs = str.split("#");
      expect(strs[0]).toBe(String(strs[1].length));
      result = JSON.parse(strs[1]);
      resolve();
    });
    socket.on("connect", () => {
      const json = JSON.stringify({
        pattern: "p",
        id: "123",
        data,
      });
      socket.write(`${json.length}#${json}`);
      socket.end();
    });
  });
  return result as { id: string; body: any; error: any; status: string };
}
