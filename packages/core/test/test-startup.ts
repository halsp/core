import { Response, Startup } from "../src";

declare module "../src" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Startup {
    run(...args: any[]): Promise<Response>;
  }
}

const initMap = new WeakMap<Startup, boolean>();
Startup.prototype.run = async function (...args: any[]) {
  if (!initMap.has(this)) {
    initMap.set(this, true);
    await this["initialize"]();
  }
  return await this["invoke"](...args);
};
