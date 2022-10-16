import { MicroTcpStartup } from "./src";

(async () => {
  const { port } = await new MicroTcpStartup().dynamicListen();
  console.log(`listen: http://localhost:${port}`);
})();
