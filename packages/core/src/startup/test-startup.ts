import { Startup } from "./startup";
import { HttpContext, SfaRequest, SfaResponse } from "../context";
import { SfaConfigOptions } from "../sfa-config";

export class TestStartup extends Startup {
  readonly #req?: SfaRequest;
  constructor();
  constructor(req: SfaRequest);
  constructor(options: SfaConfigOptions);
  constructor(req: SfaRequest, options: SfaConfigOptions);
  constructor(arg1?: any, arg2?: any) {
    let req: SfaRequest | undefined = undefined;
    let options: SfaConfigOptions | undefined = undefined;
    if (arg2 != undefined) {
      req = arg1;
      options = arg2;
    } else if (arg1 != undefined) {
      if (arg1 instanceof SfaRequest) {
        req = arg1;
      } else {
        options = arg1;
      }
    }

    super(options);
    this.#req = req;
  }

  async run(req?: SfaRequest): Promise<SfaResponse> {
    return await super.invoke(
      new HttpContext(req ?? this.#req ?? new SfaRequest())
    );
  }
}
