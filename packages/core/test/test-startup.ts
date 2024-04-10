import { Response, Startup } from "../src";

declare module "../src" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Startup {
    run(...args: any[]): Promise<Response>;
  }
}

Startup.prototype.run = async function (...args: any[]) {
  return await this["invoke"](...args);
};
