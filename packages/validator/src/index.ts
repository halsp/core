import { HttpContext, Startup } from "@ipare/core";
import "@ipare/pipe";
import { GlobalPipeType } from "@ipare/pipe/dist/global-pipe-type";
import {
  registerSchema,
  ValidationSchema,
  ValidatorOptions,
} from "class-validator";
import { ValidatePipe } from "./validate.pipe";

export {
  UseValidatorOptions,
  UseValidatorSchema,
  ValidatorEnable,
} from "./decorators/index";

declare module "@ipare/core" {
  interface Startup {
    useValidator(): this;
    useValidator(validatorOptions: ValidatorOptions): this;
    useValidator(
      validatorOptions: (
        ctx: HttpContext,
        val: any,
        propertyType: any
      ) => ValidatorOptions | Promise<ValidatorOptions>
    ): this;

    useValidationSchema(schema: ValidationSchema): this;
  }
}

Startup.prototype.useValidator = function (
  options?:
    | ValidatorOptions
    | ((
        ctx: HttpContext,
        val: any,
        propertyType: any
      ) => ValidatorOptions | Promise<ValidatorOptions>)
): Startup {
  return this.useGlobalPipe(GlobalPipeType.after, new ValidatePipe(options));
};

Startup.prototype.useValidationSchema = function (
  schema: ValidationSchema
): Startup {
  registerSchema(schema);
  return this;
};
