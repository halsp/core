import { Middleware } from "sfa";

export default abstract class Authority extends Middleware {
  //#region will be set before doing
  public readonly roles!: Array<string>;
  //#endregion
}
