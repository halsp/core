import { isString, Startup } from "@ipare/core";
import dotenv from "dotenv";
import path from "path";
import { BASE_USED } from "./constant";
import { EnvOptions, isModelOptions } from "./options";

export function useEnv<T extends Startup>(
  startup: T,
  options?: EnvOptions | string
): T {
  if (!startup[BASE_USED]) {
    startup[BASE_USED] = dotenv.config({
      path: ".env",
    });
  }

  if (isString(options)) {
    process.env.NODE_ENV = options;
    const fileNames = getFileNames(options);
    for (const fileName of fileNames) {
      dotenv.config({
        path: fileName,
        override: true,
      });
    }
  } else if (isModelOptions(options)) {
    process.env.NODE_ENV = options.mode;
    const fileNames = getFileNames(options.mode);
    for (const fileName of fileNames) {
      dotenv.config({
        path: options.cwd ? path.join(options.cwd, fileName) : fileName,
        debug: options.debug,
        encoding: options.encoding,
        override: options.override,
      });
    }
  } else {
    dotenv.config(options);
  }
  return startup;
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
