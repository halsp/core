import { ClientPacket } from "@halsp/micro";
import net from "net";

export async function sendData(
  port: number,
  data: string | Uint8Array,
  waitReturn = true
) {
  let result: ClientPacket | undefined;
  await new Promise<void>((resolve) => {
    const socket = net.createConnection(port);
    if (waitReturn) {
      socket.on("data", (buffer) => {
        const str = buffer.toString("utf-8");
        const strs = str.split("#");
        expect(strs[0]).toBe(String(strs[1].length));
        result = JSON.parse(strs[1]);
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
): Promise<ClientPacket>;
export async function sendMessage(
  port: number,
  data: any,
  waitReturn = true
): Promise<ClientPacket | void> {
  const json = JSON.stringify({
    pattern: "test_pattern",
    id: waitReturn ? "123" : undefined,
    data,
  });
  const result = await sendData(port, `${json.length}#${json}`, waitReturn);
  if (!waitReturn) return;

  return result;
}
