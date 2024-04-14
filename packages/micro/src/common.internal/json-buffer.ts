export function parseJsonBuffer(buffer: Buffer) {
  const str = buffer.toString("utf-8");

  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}
