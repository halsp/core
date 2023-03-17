import { Context, isNil, isObject } from "@halsp/common";
import { MicroException } from "../exception";
import { MicroRequest } from "./request";
import { MicroResponse } from "./response";

export class MicroContext extends Context<MicroRequest, MicroResponse> {
  catchError(err: Error | any) {
    if (err instanceof MicroException) {
      this.res.setError(err.message);
    } else if (err instanceof Error) {
      this.catchError(new MicroException(err.message));
    } else if (isObject(err)) {
      this.catchError(new MicroException(err));
    } else {
      const error = (!isNil(err) && String(err)) || undefined;
      this.catchError(new MicroException(error));
    }

    super.catchError(err);
    return this;
  }
}

export * from "./request";
export * from "./response";
