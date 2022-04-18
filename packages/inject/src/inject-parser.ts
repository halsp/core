import { HttpContext, isObject, ObjectConstructor } from "@sfajs/core";
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

function isClass<T extends object = any>(
  input: any
): input is ObjectConstructor<T> {
  return (
    typeof input == "function" &&
    /^class\s/.test(Function.prototype.toString.call(input))
  );
}

class InjectDecoratorParser<T extends object = any> {
  private static readonly singletonInject: InjectDecoratorRecordItem[] = [];

  constructor(
    private readonly ctx: HttpContext,
    private readonly target: InjectTarget<T>
  ) {}

  public async parse(): Promise<T> {
    const isConstructor = !isObject(this.target);
    const obj = isConstructor ? await this.createTargetObject() : this.target;
    const injectConstructor = isConstructor
      ? (this.target as ObjectConstructor<T>)
      : (this.target.constructor as ObjectConstructor<T>);

    const properties =
      (Reflect.getMetadata(PROPERTY_METADATA, injectConstructor.prototype) as (
        | string
        | symbol
      )[]) ?? [];
    for (const property of properties) {
      obj[property] = await this.getPropertyValue(obj, property);
    }
    return obj;
  }

  private async getPropertyValue(obj: any, property: string | symbol) {
    const constr = Reflect.getMetadata(
      "design:type",
      obj,
      property
    ) as ObjectConstructor<T>;
    return await parseInject(this.ctx, constr);
  }

  private async createTargetObject() {
    const target = this.target as ObjectConstructor<T>;
    const injectMaps = this.ctx.bag<InjectMap[]>(MAP_BAG) ?? [];
    const existMap = injectMaps.filter((map) => map.anestor == target)[0];
    if (!existMap) {
      return await createObject(this.ctx, target);
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
        const obj = await createObject(this.ctx, existMap.target);
        records.push({
          injectConstructor: target,
          value: obj,
        });
        return obj;
      }
    } else {
      return await createObject(this.ctx, existMap.target);
    }
  }
}

async function createObject<T extends object>(
  ctx: HttpContext,
  target: ObjectConstructor<T> | T | ((ctx: HttpContext) => T | Promise<T>)
): Promise<T> {
  if (typeof target == "object") {
    return target as T;
  } else if (isClass<T>(target)) {
    const providers: ObjectConstructor[] =
      Reflect.getMetadata(CLASS_METADATA, target) ?? [];
    const args: any[] = [];
    for (const provider of providers) {
      if (isClass(provider)) {
        args.push(await parseInject(ctx, provider));
      } else {
        args.push(undefined);
      }
    }
    return new (target as ObjectConstructor<T>)(...args);
  } else {
    return await target(ctx);
  }
}

export function isInjectClass<T extends object>(target: ObjectConstructor<T>) {
  return !!Reflect.getMetadata(CLASS_METADATA, target);
}

export async function parseInject<T extends object = any>(
  ctx: HttpContext,
  target: InjectTarget<T>
): Promise<T> {
  return await new InjectDecoratorParser<T>(ctx, target).parse();
}
