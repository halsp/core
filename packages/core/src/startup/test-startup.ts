import { Startup } from "./startup";
import { HttpContext, SfaRequest, SfaResponse } from "../context";

export class TestStartup extends Startup {
  readonly #req?: SfaRequest;
  constructor();
  constructor(req: SfaRequest);
  constructor(root: string);
  constructor(req: SfaRequest, root: any);
  constructor(arg1?: any, arg2?: any) {
    let req: SfaRequest | undefined = undefined;
    let root: string | undefined = undefined;
    if (arg2 != undefined) {
      req = arg1;
      root = arg2;
    } else if (arg1 != undefined) {
      if (typeof arg1 == "string") {
        root = arg1;
      } else {
        req = arg1;
      }
    }

    TestStartup["CUSTOM_CONFIG_ROOT"] = root;
    super();
    this.#req = req;
  }

  async run(req?: SfaRequest): Promise<SfaResponse> {
    return await super.invoke(
      new HttpContext(req ?? this.#req ?? new SfaRequest())
    );
  }
}
