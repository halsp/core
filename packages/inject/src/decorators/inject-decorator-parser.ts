import { HttpContext, isFunction, ObjectConstructor } from "@sfajs/core";
import {
  DECORATOR_SCOPED_BAG,
  MAP_BAG,
  METADATA,
} from "../constant";
import { InjectDecoratorRecordItem } from "./inject-decorator-record-item";
import { InjectTypes } from "../inject-types";
import "reflect-metadata";
import { InjectMap } from "../inject-map";

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
    const properties =
      (Reflect.getMetadata(
        METADATA,
        this.injectConstructor.prototype
      ) as (string | symbol)[]) ?? [];
    properties.forEach((property) => {
      this.setProperty(property);
    });
    return this.obj;
  }

  private setProperty(property: string | symbol) {
    this.obj[property] = this.getPropertyValue(property);
  }

  private getPropertyValue(property: string | symbol) {
    const constr = Reflect.getMetadata(
      "design:type",
      this.obj,
      property
    ) as ObjectConstructor<T>;

    const obj = this.createObjectByConstructor(constr);
    return new InjectDecoratorParser(this.ctx, obj).parse();
  }

  private createObjectByConstructor(constr: ObjectConstructor<T>): any {
    const injectMaps = this.ctx.bag<InjectMap[]>(MAP_BAG) ?? [];
    const existMap = injectMaps.filter((map) => map.anestor == constr)[0];
    if (!existMap) {
      return new constr();
    }

    if (
      existMap.type == InjectTypes.Scoped ||
      existMap.type == InjectTypes.Singleton
    ) {
      let records: InjectDecoratorRecordItem[];
      if (existMap.type == InjectTypes.Scoped) {
        records = this.ctx.bag<InjectDecoratorRecordItem[]>(
          DECORATOR_SCOPED_BAG
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
        const obj = this.createPropertyObject(existMap.target);
        records.push({
          injectConstructor: this.injectConstructor,
          value: obj,
        });
        return obj;
      }
    } else {
      return this.createPropertyObject(existMap.target);
    }
  }

  private createPropertyObject(constr: ObjectConstructor<T>): any {
    return new InjectDecoratorParser(this.ctx, new constr()).parse();
  }
}
