import { Middleware } from "sfa";
import ApiDocs from "./ApiDocs";

export default abstract class Action extends Middleware {
  constructor(public readonly roles: Array<string> = new Array<string>()) {
    super();
  }

  //#region will be set before doing
  readonly realPath!: string;
  //#endregion

  /** docs of action */
  docs?: ApiDocs;
}
