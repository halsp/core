import net from "net";

export async function sendData(
  port: number,
  data: string | Uint8Array,
  waitReturn = true
) {
  let result = "";
  await new Promise<void>((resolve) => {
    const socket = net.createConnection(port);
    if (waitReturn) {
      socket.on("data", (buffer) => {
        result = buffer.toString("utf-8");
        resolve();
      });
    }
    socket.on("connect", () => {
      socket.write(data);
      socket.end();
      if (!waitReturn) {
        resolve();
      }
    });
  });
  return result;
}

export async function sendMessage(
  port: number,
  data: any,
  waitReturn: false
): Promise<void>;
export async function sendMessage(
  port: number,
  data: any,
  waitReturn?: true
): Promise<{
  id: string;
  body: any;
  error: any;
  status: string;
}>;
export async function sendMessage(port: number, data: any, waitReturn = true) {
  const json = JSON.stringify({
    pattern: "p",
    id: waitReturn ? "123" : undefined,
    data,
  });
  const str = await sendData(port, `${json.length}#${json}`, waitReturn);
  if (!waitReturn) return;

  const strs = str.split("#");
  expect(strs[0]).toBe(String(strs[1].length));
  return JSON.parse(strs[1]);
}
