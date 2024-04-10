import type {} from "@halsp/cli";
import url from "url";

export async function safeImport<T = any>(name: string) {
  try {
    try {
      return (await import(name)) as T;
    } catch {
      try {
        return (await import(url.pathToFileURL(name).toString())) as T;
      } catch {
        return _require(name) as T;
      }
    }
  } catch {
    return null;
  }
}
