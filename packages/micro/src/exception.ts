import { ExceptionMessage, HalspException } from "@halsp/common";

export class MicroException extends HalspException {
  constructor(error?: string | ExceptionMessage) {
    super(error);
  }
}
