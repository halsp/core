import * as fs from "fs";

export async function readStream(
  stream: fs.ReadStream,
  output?: BufferEncoding,
) {
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    stream.on("data", (chunk) => {
      const encoding = stream.readableEncoding ?? undefined;
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
      } else {
        chunks.push(Buffer.from(chunk, encoding));
      }
    });
    stream.on("end", () => {
      resolve();
    });
    stream.on("error", (err) => {
      reject(err);
    });
  });
  return Buffer.concat(chunks).toString(output);
}
