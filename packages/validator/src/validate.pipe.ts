import { Context, isObject, isUndefined } from "@halsp/core";
import { PipeTransform, TransformArgs } from "@halsp/pipe";
import { validate, ValidationError, ValidatorOptions } from "class-validator";
import { ENABLE_METADATA, OPTIONS_METADATA } from "./constant";
import { RuleRecord } from "./create-decorator";
import { getRules } from "./decorators";
import { createBadRequestError } from "./error";

export class ValidatePipe<T extends object = any, R extends T = any>
  implements PipeTransform<T, T | R>
{
  constructor(
    private readonly options?:
      | ValidatorOptions
      | ((args: {
          ctx: Context;
          val: any;
          propertyType: any;
        }) => ValidatorOptions | Promise<ValidatorOptions>),
  ) {}

  async transform(args: TransformArgs<T | R>) {
    const { value, ctx, propertyType } = args;

    const enable = await this.getMetadata<boolean>(
      ctx,
      value,
      ENABLE_METADATA,
      true,
    );
    if (!enable) {
      return value;
    }

    const options = await this.getOptions(value, ctx, propertyType);

    await this.validateParent(args, options);
    await this.validateModel(args, options);

    return value;
  }

  private async validateModel(
    args: TransformArgs<T | R>,
    options?: ValidatorOptions,
  ) {
    const { value, propertyType } = args;

    const errs: (ValidationError | string)[] = [];
    const rules = getRules(propertyType);
    for (const rule of rules) {
      const propertyErrs = await this.validateClassValidator(
        [rule],
        isUndefined(value) ? undefined : value[rule.propertyKey as string],
        rule.propertyKey as string,
        options,
      );
      errs.push(...propertyErrs);

      const customPropertyErrs = await this.validateCustomValidator(
        [rule],
        isUndefined(value) ? undefined : value[rule.propertyKey as string],
        rule.propertyKey as string,
      );
      errs.push(...customPropertyErrs);
    }

    const msgs = errs
      .filter((item) => typeof item == "string" || !!item.constraints)
      .map((item) =>
        typeof item == "string"
          ? item
          : (item.constraints as Record<string, string>),
      );
    await this.throwMsg(msgs);
  }

  private async validateParent(
    args: TransformArgs<T | R>,
    options?: ValidatorOptions,
  ) {
    const { parent, property, propertyKey, parameterIndex } = args;
    if (isUndefined(property)) {
      return;
    }

    const rules = getRules(parent, propertyKey ?? parameterIndex);
    const errs = await this.validateClassValidator(
      rules,
      args.value,
      property as string,
      options,
    );
    const msgs: (Record<string, string> | string)[] = errs
      .filter((item) => !!item.constraints)
      .map((item) => item.constraints as Record<string, string>);

    const customMsgs = await this.validateCustomValidator(
      rules,
      args.value,
      property as string,
    );
    msgs.push(...customMsgs);

    await this.throwMsg(msgs);
  }

  private async throwMsg(msgs: (Record<string, string> | string)[]) {
    const list: string[] = [];
    for (const msg of msgs) {
      if (typeof msg == "string") {
        list.push(msg);
      } else {
        for (const key in msg) {
          list.push(msg[key]);
        }
      }
    }

    if (list.length) {
      throw await createBadRequestError(list.length == 1 ? list[0] : list);
    }
  }

  private async validateClassValidator(
    rules: RuleRecord[],
    value: any,
    property: string,
    options?: ValidatorOptions,
  ) {
    const result: ValidationError[] = [];
    for (const rule of rules) {
      for (const validateItem of rule.validates) {
        if (validateItem.createTempObj) {
          const obj = validateItem.createTempObj(property, value);

          const msgs = await validate(obj, options);
          result.push(...msgs);
        }
      }
    }
    return result;
  }

  private async validateCustomValidator(
    rules: RuleRecord[],
    value: any,
    property: string,
  ) {
    const result: string[] = [];
    for (const rule of rules) {
      for (const validateItem of rule.validates.filter(
        (item) => !!item.validate,
      )) {
        if (validateItem.validate) {
          const validateResult = await validateItem.validate(
            value,
            property,
            validateItem.args as any[],
          );

          if (!validateResult) {
            if (typeof validateItem.errorMessage == "function") {
              result.push(
                validateItem.errorMessage(
                  value,
                  property,
                  validateItem.args as any[],
                ),
              );
            } else {
              result.push(validateItem.errorMessage as string);
            }
          }
        }
      }
    }
    return result;
  }

  private async getOptions(
    value: T,
    ctx: Context,
    propertyType: any,
  ): Promise<ValidatorOptions | undefined> {
    let opts = this.options;
    if (typeof opts == "function") {
      opts = await opts({
        ctx,
        propertyType,
        val: value,
      });
    }

    const decOptions = await this.getMetadata<ValidatorOptions | undefined>(
      ctx,
      value,
      OPTIONS_METADATA,
      undefined,
    );

    if (!opts && !decOptions) {
      return undefined;
    }
    if (!opts) {
      return decOptions;
    }
    if (!decOptions) {
      return opts;
    }
    return Object.assign({}, opts, decOptions);
  }

  private async getMetadata<T>(
    ctx: Context,
    value: any,
    key: string,
    def: T,
  ): Promise<T | undefined> {
    if (isUndefined(value) || !isObject(value)) return def;

    let metadataValue = Reflect.getMetadata(key, value);
    if (typeof metadataValue == "function") {
      metadataValue = await metadataValue({
        ctx,
        val: value,
      });
    }

    return metadataValue ?? def;
  }
}
