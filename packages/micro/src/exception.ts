import { ExceptionMessage, HalspException } from "@halsp/core";

export class MicroException extends HalspException {
  constructor(error?: string | ExceptionMessage) {
    super(error);
  }
}
