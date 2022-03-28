import { Dict, Middleware } from "@sfajs/core";

export default abstract class Action extends Middleware {
  public readonly metadata: Dict = {};
}
