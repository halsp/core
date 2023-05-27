import { ClientPacket, ServerPacket } from "@halsp/micro-common";

export function parseTcpBuffer(
  buffer: Buffer,
  callback: (packet: ServerPacket | ClientPacket) => void
) {
  let stringBuffer = buffer.toString("utf-8");

  while (true) {
    const index = stringBuffer.indexOf("#");
    if (index < 0) {
      throw new Error("Error message format");
    }

    const lengthStr = stringBuffer.substring(0, index);
    const contentLength = parseInt(lengthStr);
    if (isNaN(contentLength)) {
      throw new Error(`Error length "${lengthStr}"`);
    }

    stringBuffer = stringBuffer.substring(index + 1);
    if (stringBuffer.length == contentLength) {
      callback(JSON.parse(stringBuffer));
      break;
    } else if (stringBuffer.length > contentLength) {
      const msg = stringBuffer.substring(0, contentLength);
      stringBuffer = stringBuffer.substring(contentLength);
      callback(JSON.parse(msg));
      continue;
    } else {
      throw new Error(
        `Required length "${contentLength}", bug actual length is "${stringBuffer.length}"`
      );
    }
  }
}
