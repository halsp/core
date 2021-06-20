import { Middleware } from "sfa";

export default abstract class Action extends Middleware {
  constructor(public readonly roles: string[] = []) {
    super();
  }
}
