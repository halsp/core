import { isString, Startup } from "@ipare/core";
import dotenv from "dotenv";
import path from "path";
import { BASE_USED } from "./constant";
import { EnvOptions } from "./options";

export function useEnv(
  startup: Startup,
  options: EnvOptions | string
): Startup {
  if (!startup[BASE_USED]) {
    startup[BASE_USED] = dotenv.config({
      path: ".env",
    });
  }

  if (isString(options)) {
    initEnv({ mode: options });
  } else {
    initEnv(options);
  }
  return startup;
}

function initEnv(options: EnvOptions) {
  const mode = options.mode || process.env.NODE_ENV || "production";
  process.env.NODE_ENV = mode;
  const fileNames = getFileNames(mode);
  for (const fileName of fileNames) {
    dotenv.config({
      path: options.cwd ? path.join(options.cwd, fileName) : fileName,
      debug: options.debug,
      encoding: options.encoding,
      override: options.override,
    });
  }
}

function getFileNames(mode: string) {
  if (mode == "development") {
    return [".env.development", ".env.dev"];
  }
  if (mode == "production") {
    return [".env.production", ".env.prod"];
  }
  return [`.env.${mode}`];
}
