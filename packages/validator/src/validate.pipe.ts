import { BadRequestException, HttpContext, isPlainObject } from "@sfajs/core";
import { PipeTransform } from "@sfajs/pipe";
import { validate, ValidatorOptions } from "class-validator";
import { SCHAME_METADATA, ENABLE_METADATA, OPTIONS_METADATA } from "./constant";

export class ValidatePipe<T extends object = any, R extends T = any>
  implements PipeTransform<T, T | R>
{
  constructor(
    private readonly options?:
      | ValidatorOptions
      | ((
          ctx: HttpContext,
          val: any,
          propertyType: any
        ) => ValidatorOptions | Promise<ValidatorOptions>)
  ) {}

  async transform(value: T, ctx: HttpContext, propertyType: any) {
    if (!this.transformEnable(value)) {
      return value;
    }

    if (!(await this.getEnable(value, ctx))) {
      return value;
    }

    const options = await this.getOptions(value, ctx, propertyType);
    const schemaName = await this.getSchameName(value, ctx);

    const errs = await this.validate(value, schemaName, options);
    const msgs = errs
      .filter((item) => !!item.constraints)
      .map((item) => item.constraints as Record<string, string>)
      .map((cons) => cons[Object.keys(cons)[0]]);
    if (msgs.length) {
      throw new BadRequestException({
        message: msgs.length == 1 ? msgs[0] : msgs,
      });
    }

    return value;
  }

  private transformEnable(value: T): boolean {
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
      opts = await opts(ctx, value, propertyType);
    }

    let decOptions = Reflect.getMetadata(OPTIONS_METADATA, value);
    if (typeof decOptions == "function") {
      decOptions = await decOptions(ctx, value);
    }

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

  private async getSchameName(
    value: T,
    ctx: HttpContext
  ): Promise<string | undefined> {
    let decSchameName = Reflect.getMetadata(SCHAME_METADATA, value);
    if (typeof decSchameName == "function") {
      decSchameName = await decSchameName(ctx, value);
    }

    return decSchameName;
  }

  private async getEnable(value: T, ctx: HttpContext): Promise<boolean> {
    let enable = Reflect.getMetadata(ENABLE_METADATA, value);
    if (typeof enable == "function") {
      enable = await enable(ctx, value);
    }

    return enable != false;
  }
}
