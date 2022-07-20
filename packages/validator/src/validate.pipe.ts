import {
  BadRequestException,
  HttpContext,
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

    if (!(await this.getEnable(value, ctx))) {
      return value;
    }

    const options = await this.getOptions(value, ctx, propertyType);
    const schemaName = await this.getSchameName(value, ctx);

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

    let decOptions = Reflect.getMetadata(OPTIONS_METADATA, value.constructor);
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
    let decSchameName = Reflect.getMetadata(SCHAME_METADATA, value.constructor);
    if (typeof decSchameName == "function") {
      decSchameName = await decSchameName(ctx, value);
    }

    return decSchameName;
  }

  private async getEnable(value: T, ctx: HttpContext): Promise<boolean> {
    let enable = Reflect.getMetadata(ENABLE_METADATA, value.constructor);
    if (typeof enable == "function") {
      enable = await enable(ctx, value);
    }

    return enable != false;
  }
}
