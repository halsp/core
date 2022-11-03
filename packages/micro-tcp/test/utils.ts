import net from "net";

export async function sendData(port: number, data: string | Uint8Array) {
  let result = "";
  await new Promise<void>((resolve) => {
    const socket = net.createConnection(port);
    socket.on("data", (buffer) => {
      result = buffer.toString("utf-8");
      resolve();
    });
    socket.on("connect", () => {
      socket.write(data);
      socket.end();
    });
  });
  return result;
}

export async function sendMessage(port: number, data: any) {
  const json = JSON.stringify({
    pattern: "p",
    id: "123",
    data,
  });
  const str = await sendData(port, `${json.length}#${json}`);
  const strs = str.split("#");
  expect(strs[0]).toBe(String(strs[1].length));
  return JSON.parse(strs[1]) as {
    id: string;
    body: any;
    error: any;
    status: string;
  };
}
