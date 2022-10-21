import { ExceptionMessage, IpareException } from "@ipare/core";

export class MicroException extends IpareException {
  constructor(error?: string | ExceptionMessage) {
    super(error);
  }
}
