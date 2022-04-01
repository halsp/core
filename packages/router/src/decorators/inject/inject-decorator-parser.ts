import { HttpContext, isFunction } from "@sfajs/core";
import { INJECT_DECORATOR_SCOPED_BAG, INJECT_METADATA } from "../../constant";
import linq from "linq";
import { InjectDecoratorRecordItem } from "./inject-decorator-record-item";
import { InjectDecoratorValue } from "./inject-decorator-value";
import { InjectDecoratorTypes } from "./inject-decorator-types";

export type InjectConstructor<T extends object = any> = {
  new (...args: any[]): T;
};
export type InjectType<T extends object = any> = T | InjectConstructor<T>;

export class InjectDecoratorParser<T extends object = any> {
  constructor(
    private readonly ctx: HttpContext,
    private readonly target: InjectType<T>
  ) {
    const isConstructor = isFunction(this.target);
    this.injectConstructor = isConstructor
      ? (this.target as InjectConstructor)
      : ((this.target as T).constructor as InjectConstructor);
    this.obj = isConstructor
      ? new (this.target as InjectConstructor)()
      : (this.target as T);
  }

  private static readonly singletonInject: InjectDecoratorRecordItem[] = [];

  private readonly obj: T;
  private readonly injectConstructor: InjectConstructor<T>;

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
    ) as InjectConstructor<T>;

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

      const existInject = linq
        .from(records)
        .firstOrDefault(
          (item) => item.injectConstructor == this.injectConstructor
        );
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

  private createObject(constr: InjectConstructor<T>): any {
    return new InjectDecoratorParser(this.ctx, new constr()).parse();
  }
}
