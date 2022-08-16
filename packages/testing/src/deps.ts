export function getDepFunc<T = any>(depName: string, funcName: string): T {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const d = require(depName);
  return d[funcName] as T;
}
