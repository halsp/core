import { Startup } from "@halsp/core";
import { EnvOptions } from "./options";
import dotenv from "dotenv";
import path from "path";

declare module "@halsp/core" {
  interface Startup {
    useEnv(options?: EnvOptions): this;
  }
}

const usedMap = new WeakMap<Startup, dotenv.DotenvConfigOutput>();
Startup.prototype.useEnv = function (options: EnvOptions = {}): Startup {
  if (!usedMap.get(this)) {
    usedMap.set(
      this,
      dotenv.config({
        path: ".env",
      }),
    );
  }

  const fileNames = getFileNames();
  for (const fileName of fileNames) {
    dotenv.config({
      path: path.join(options.cwd ?? process.cwd(), fileName),
      debug: options.debug,
      encoding: options.encoding,
      override: options.override ?? true,
    });
  }

  return this;
};

function getFileNames() {
  const mode = process.env.NODE_ENV;
  if (mode == "development") {
    return [".env.development", ".env.dev"];
  }
  if (mode == "production") {
    return [".env.production", ".env.prod"];
  }
  return [`.env.${mode}`];
}

export { EnvOptions } from "./options";
export { cliConfigHook } from "./cli-config";
export { getVersion } from "./version";
