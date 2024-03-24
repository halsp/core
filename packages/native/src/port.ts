import net from "net";

export async function getAvailablePort(
  host?: string,
  port = 9504,
  max?: number,
) {
  const checkPort = (port: number) => {
    return new Promise<void>((resolve, reject) => {
      const server = net.createServer();
      server.unref();
      server.on("error", reject);

      server.listen(port, host, () => {
        server.close(() => {
          resolve();
        });
      });
    });
  };
  for (let i = port; i <= (max ?? port + 100); i++) {
    try {
      await checkPort(i);
      return i;
    } catch {}
  }
}
