import type {} from "@halsp/cli";
import url from "url";

export async function safeImport<T = any>(name: string) {
  try {
    try {
      return _require(name) as T;
    } catch {
      try {
        return (await dynamicImport(name)) as T;
      } catch {
        return (await dynamicImport(url.pathToFileURL(name).toString())) as T;
      }
    }
  } catch {
    return null;
  }
}

const dynamicImport = new Function(
  "specifier",
  `return import(specifier);
  `,
) as <T = any>(specifier: string) => Promise<T>;
