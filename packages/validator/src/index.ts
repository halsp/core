import { Context, Startup } from "@ipare/core";
import "@ipare/pipe";
import { GlobalPipeType } from "@ipare/pipe/dist/global-pipe-type";
import {
  registerSchema,
  ValidationSchema,
  ValidatorOptions,
} from "class-validator";
import { ValidatePipe } from "./validate.pipe";

export {
  V,
  getRules,
  UseValidatorOptions,
  UseValidatorSchema,
  ValidatorEnable,
} from "./decorators";
export { ValidateItem, RuleRecord } from "./create-decorator";
export {
  validatorMethods,
  ValidatorLib,
  CustomValidatorItem,
  ValidatorDecoratorReturnType,
  addCustomValidator,
  getCustomValidators,
} from "./validator-lib";

declare module "@ipare/core" {
  interface Startup {
    useValidator(): this;
    useValidator(validatorOptions: ValidatorOptions): this;
    useValidator(
      validatorOptions: (args: {
        ctx: Context;
        val: any;
        propertyType: any;
      }) => ValidatorOptions | Promise<ValidatorOptions>
    ): this;

    useValidationSchema(schema: ValidationSchema): this;
  }
}

Startup.prototype.useValidator = function (
  options?:
    | ValidatorOptions
    | ((args: {
        ctx: Context;
        val: any;
        propertyType: any;
      }) => ValidatorOptions | Promise<ValidatorOptions>)
) {
  return this.useGlobalPipe(GlobalPipeType.after, new ValidatePipe(options));
};

Startup.prototype.useValidationSchema = function (schema: ValidationSchema) {
  registerSchema(schema);
  return this;
};
