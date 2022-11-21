import { TestStartup } from "@ipare/testing";
import { EnvOptions } from "../src";
import "../src";

export async function getEnv(mode?: string, options?: EnvOptions) {
  process.chdir("test/envs");
  const startup = new TestStartup();
  if (mode) {
    process.env.NODE_ENV = mode;
  }

  try {
    const { ctx } = await startup
      .useEnv(options as any)
      .use((ctx) => {
        ctx.bag("env", process.env);
      })
      .run();
    return ctx.bag<typeof process.env>("env");
  } finally {
    process.chdir("../..");
  }
}
