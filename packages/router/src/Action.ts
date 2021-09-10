import { Middleware } from "sfa";

export default abstract class Action extends Middleware {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public readonly metadata: Record<string, any> = {};
}
