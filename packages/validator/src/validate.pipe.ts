import {
  BadRequestException,
  HttpContext,
  isObject,
  isPlainObject,
  isUndefined,
} from "@ipare/core";
import { PipeTransform, TransformArgs } from "@ipare/pipe";
import { validate, ValidatorOptions } from "class-validator";
import { SCHAME_METADATA, ENABLE_METADATA, OPTIONS_METADATA } from "./constant";

export class ValidatePipe<T extends object = any, R extends T = any>
  implements PipeTransform<T, T | R>
{
  constructor(
    private readonly options?:
      | ValidatorOptions
      | ((args: {
          ctx: HttpContext;
          val: any;
          propertyType: any;
        }) => ValidatorOptions | Promise<ValidatorOptions>)
  ) {}

  async transform(args: TransformArgs<T | R>) {
    const { value, ctx, propertyType } = args;

    if (!this.transformParentEnable(args) && !this.transformModelEnable(args)) {
      return value;
    }

    const enable = await this.getMetadata<boolean>(
      ctx,
      value,
      ENABLE_METADATA,
      true
    );
    if (!enable) {
      return value;
    }

    const options = await this.getOptions(value, ctx, propertyType);

    const schemaName = await this.getMetadata<string | undefined>(
      ctx,
      value,
      SCHAME_METADATA,
      undefined
    );

    await this.validateParent(args, schemaName, options);
    await this.validateModel(args, schemaName, options);

    return value;
  }

  private async validateModel(
    args: TransformArgs<T | R>,
    schemaName?: string,
    options?: ValidatorOptions
  ) {
    const { value } = args;
    if (!this.transformModelEnable(args)) {
      return;
    }

    const errs = await this.validate(value, schemaName, options);
    const msgs = errs
      .filter((item) => !!item.constraints)
      .map((item) => item.constraints as Record<string, string>);
    this.throwMsg(msgs);
  }

  private async validateParent(
    args: TransformArgs<T | R>,
    schemaName?: string,
    options?: ValidatorOptions
  ) {
    const { parent, propertyKey } = args;
    if (!this.transformParentEnable(args)) {
      return;
    }

    const errs = await this.validate(parent, schemaName, options);
    const msgs = errs
      .filter((item) => !!item.constraints)
      .filter((item) => item.property == propertyKey)
      .map((item) => item.constraints as Record<string, string>);
    this.throwMsg(msgs);
  }

  private throwMsg(msgs: Record<string, string>[]) {
    const list: string[] = [];
    for (const msg of msgs) {
      for (const key in msg) {
        list.push(msg[key]);
      }
    }

    if (list.length) {
      throw new BadRequestException({
        message: list.length == 1 ? list[0] : list,
      });
    }
  }

  private transformParentEnable(args: TransformArgs<T | R>): boolean {
    const { property } = args;
    return !isUndefined(property);
    // return (
    //   typeof parent == "object" &&
    //   !Array.isArray(parent) &&
    //   !isPlainObject(parent)
    // );
  }

  private transformModelEnable(args: TransformArgs<T | R>): boolean {
    const { value } = args;
    return (
      typeof value == "object" && !Array.isArray(value) && !isPlainObject(value)
    );
  }

  private async validate(
    value: any,
    schemaName?: string,
    options?: ValidatorOptions
  ) {
    if (schemaName) {
      return await validate(schemaName, value, options);
    } else {
      return await validate(value, options);
    }
  }

  private async getOptions(
    value: T,
    ctx: HttpContext,
    propertyType: any
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
      undefined
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
    ctx: HttpContext,
    value: any,
    key: string,
    def: T
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
