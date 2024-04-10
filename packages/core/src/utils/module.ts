import type {} from "@halsp/cli";

export async function safeImport(name: string) {
  try {
    try {
      return await import(name);
    } catch {
      return _require(name);
    }
  } catch {
    return null;
  }
}
