import { Context } from "./context";

export interface Register {
  pattern: string;
  handler?: (ctx: Context) => Promise<void> | void;
}
