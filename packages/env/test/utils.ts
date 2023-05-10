import "@halsp/testing";
import { EnvOptions } from "../src";
import "../src";
import { Startup } from "@halsp/core";

export async function getEnv(mode?: string, options?: EnvOptions) {
  process.chdir("test/envs");
  const startup = new Startup();
  if (mode) {
    process.env.NODE_ENV = mode;
  }

  try {
    const { ctx } = await startup
      .useEnv(options as any)
      .use((ctx) => {
        ctx.set("env", process.env);
      })
      .test();
    return ctx.get<typeof process.env>("env");
  } finally {
    process.chdir("../..");
  }
}
