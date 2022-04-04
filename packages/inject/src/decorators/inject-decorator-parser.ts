import { HttpContext, isFunction, ObjectConstructor } from "@sfajs/core";
import { INJECT_DECORATOR_SCOPED_BAG, INJECT_METADATA } from "../constant";
import { InjectDecoratorRecordItem } from "./inject-decorator-record-item";
import { InjectDecoratorValue } from "./inject-decorator-value";
import { InjectDecoratorTypes } from "./inject-decorator-types";
import "reflect-metadata";

export type InjectType<T extends object = any> = T | ObjectConstructor<T>;

export class InjectDecoratorParser<T extends object = any> {
  constructor(
    private readonly ctx: HttpContext,
    private readonly target: InjectType<T>
  ) {
    const isConstructor = isFunction(this.target);
    this.injectConstructor = isConstructor
      ? (this.target as ObjectConstructor<T>)
      : ((this.target as T).constructor as ObjectConstructor<T>);
    this.obj = isConstructor
      ? new (this.target as ObjectConstructor<T>)()
      : (this.target as T);
  }

  private static readonly singletonInject: InjectDecoratorRecordItem[] = [];

  private readonly obj: T;
  private readonly injectConstructor: ObjectConstructor<T>;

  public parse(): T {
    const decs =
      (Reflect.getMetadata(
        INJECT_METADATA,
        this.injectConstructor.prototype
      ) as InjectDecoratorValue[]) ?? [];
    decs.forEach((dec) => {
      this.setProperty(dec);
    });
    return this.obj;
  }

  private setProperty(dec: InjectDecoratorValue) {
    this.obj[dec.propertyKey] = this.getPropertyValue(dec);
  }

  private getPropertyValue(dec: InjectDecoratorValue) {
    const constr = Reflect.getMetadata(
      "design:type",
      this.obj,
      dec.propertyKey
    ) as ObjectConstructor<T>;

    if (
      dec.type == InjectDecoratorTypes.Scoped ||
      dec.type == InjectDecoratorTypes.Singleton
    ) {
      let records: InjectDecoratorRecordItem[];
      if (dec.type == InjectDecoratorTypes.Scoped) {
        records = this.ctx.bag<InjectDecoratorRecordItem[]>(
          INJECT_DECORATOR_SCOPED_BAG
        );
      } else {
        records = InjectDecoratorParser.singletonInject;
      }

      const existInject = records.filter(
        (item) => item.injectConstructor == this.injectConstructor
      )[0];
      if (existInject) {
        return existInject.value;
      } else {
        const obj = this.createObject(constr);
        records.push({
          injectConstructor: this.injectConstructor,
          value: obj,
        });
        return obj;
      }
    } else {
      return this.createObject(constr);
    }
  }

  private createObject(constr: ObjectConstructor<T>): any {
    return new InjectDecoratorParser(this.ctx, new constr()).parse();
  }
}
