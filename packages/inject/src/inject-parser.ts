import {
  HttpContext,
  isFunction,
  isObject,
  ObjectConstructor,
} from "@sfajs/core";
import {
  CLASS_METADATA,
  DECORATOR_SCOPED_BAG,
  MAP_BAG,
  PROPERTY_METADATA,
} from "./constant";
import { InjectType } from "./inject-type";
import "reflect-metadata";
import { InjectMap } from "./inject-map";

type InjectTarget<T extends object = any> = T | ObjectConstructor<T>;

type InjectDecoratorRecordItem = {
  injectConstructor: ObjectConstructor;
  value: any;
};

class InjectDecoratorParser<T extends object = any> {
  private static readonly singletonInject: InjectDecoratorRecordItem[] = [];

  constructor(
    private readonly ctx: HttpContext,
    private readonly target: InjectTarget<T>
  ) {
    const isConstructor = isFunction(this.target);
    this.injectConstructor = isConstructor
      ? (this.target as ObjectConstructor<T>)
      : (this.target.constructor as ObjectConstructor<T>);
    this.obj = isConstructor ? this.createTargetObject() : this.target;
  }

  private readonly obj: T;
  private readonly injectConstructor: ObjectConstructor<T>;

  public parse(): T {
    const properties =
      (Reflect.getMetadata(
        PROPERTY_METADATA,
        this.injectConstructor.prototype
      ) as (string | symbol)[]) ?? [];
    properties.forEach((property) => {
      this.obj[property] = this.getPropertyValue(property);
    });
    return this.obj;
  }

  private getPropertyValue(property: string | symbol) {
    const constr = Reflect.getMetadata(
      "design:type",
      this.obj,
      property
    ) as ObjectConstructor<T>;
    return parseInject(this.ctx, constr);
  }

  private createTargetObject() {
    const target = this.target as ObjectConstructor<T>;
    const injectMaps = this.ctx.bag<InjectMap[]>(MAP_BAG) ?? [];
    const existMap = injectMaps.filter((map) => map.anestor == target)[0];
    if (!existMap) {
      return createObject(this.ctx, target);
    }

    if (
      existMap.type == InjectType.Scoped ||
      existMap.type == InjectType.Singleton
    ) {
      let records: InjectDecoratorRecordItem[];
      if (existMap.type == InjectType.Scoped) {
        records =
          this.ctx.bag<InjectDecoratorRecordItem[]>(DECORATOR_SCOPED_BAG);
      } else {
        records = InjectDecoratorParser.singletonInject;
      }

      const existInject = records.filter(
        (item) => item.injectConstructor == target
      )[0];
      if (existInject) {
        return existInject.value;
      } else {
        const obj = createObject(this.ctx, existMap.target);
        records.push({
          injectConstructor: target,
          value: obj,
        });
        return obj;
      }
    } else {
      return createObject(this.ctx, existMap.target);
    }
  }
}

export function createObject<T extends object>(
  ctx: HttpContext,
  target: ObjectConstructor<T> | T
): T {
  if (isObject(target)) {
    return target as T;
  }

  const providers: ObjectConstructor[] =
    Reflect.getMetadata(CLASS_METADATA, target) ?? [];
  const args = providers.map((provider) => parseInject(ctx, provider));
  return new (target as ObjectConstructor<T>)(...args);
}

export function isInjectClass<T extends object>(target: ObjectConstructor<T>) {
  return !!Reflect.getMetadata(CLASS_METADATA, target);
}

export function parseInject<T extends object = any>(
  ctx: HttpContext,
  target: InjectTarget<T>
): T {
  return new InjectDecoratorParser<T>(ctx, target).parse();
}
