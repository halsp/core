import {
  HttpContext,
  isFunction,
  isObject,
  isString,
  ObjectConstructor,
} from "@sfajs/core";
import {
  CLASS_METADATA,
  DECORATOR_SCOPED_BAG,
  KEY_METADATA,
  MAP_BAG,
  PROPERTY_METADATA,
} from "./constant";
import { InjectType } from "./inject-type";
import "reflect-metadata";
import { InjectMap } from "./inject-map";
import { InjectKey } from "./inject-key";

type InjectTarget<T extends object = any> = T | ObjectConstructor<T>;

type InjectDecoratorRecordItem = {
  injectKey: ObjectConstructor | string;
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

  private injectConstructor!: ObjectConstructor<T>;
  private obj!: any;

  public async parse(): Promise<T> {
    const isConstructor = !isObject(this.target);
    this.injectConstructor = isConstructor
      ? (this.target as ObjectConstructor<T>)
      : (this.target.constructor as ObjectConstructor<T>);
    this.obj = isConstructor ? await this.createTargetObject() : this.target;

    const injectProps =
      (Reflect.getMetadata(
        PROPERTY_METADATA,
        this.injectConstructor.prototype
      ) as (string | symbol)[]) ?? [];
    for (const prop of injectProps) {
      this.obj[prop] = await this.getPropertyValue(prop);
    }

    const keyProps =
      (Reflect.getMetadata(
        KEY_METADATA,
        this.injectConstructor.prototype
      ) as InjectKey[]) ?? [];
    for (const prop of keyProps.filter(
      (item) => item.parameterIndex == undefined
    )) {
      this.obj[prop.property] = await this.getKeyPropValue(prop);
    }
    return this.obj;
  }

  private async getKeyPropValue(prop: InjectKey) {
    const injectMaps = this.ctx.bag<InjectMap[]>(MAP_BAG) ?? [];
    const existMap = injectMaps.filter(
      (map) => isString(map.anestor) && map.anestor == prop.key
    )[0];
    if (!existMap && prop.property) {
      return await this.getPropertyValue(prop.property);
    } else if (existMap) {
      return await this.getObjectFromExistMap(existMap, prop.key);
    } else {
      return undefined;
    }
  }

  private async getPropertyValue(property: string | symbol) {
    const constr = Reflect.getMetadata(
      "design:type",
      this.obj,
      property
    ) as ObjectConstructor<T>;
    if (isClass(constr)) {
      return await parseInject(this.ctx, constr);
    } else {
      return undefined;
    }
  }

  private async createTargetObject() {
    const target = this.target as ObjectConstructor<T>;
    const injectMaps = this.ctx.bag<InjectMap[]>(MAP_BAG) ?? [];
    const existMap = injectMaps.filter(
      (map) => isFunction(map.anestor) && map.anestor == target
    )[0];
    if (!existMap) {
      return await this.createObject(target);
    }

    return await this.getObjectFromExistMap(existMap, target);
  }

  private async getObjectFromExistMap(
    existMap: InjectMap,
    injectKey: ObjectConstructor | string
  ) {
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
        (item) => item.injectKey == injectKey
      )[0];
      if (existInject) {
        return existInject.value;
      } else {
        const obj = await this.createObject(existMap.target);
        records.push({
          injectKey: injectKey,
          value: obj,
        });
        return obj;
      }
    } else {
      return await this.createObject(existMap.target);
    }
  }

  async createObject<T extends object>(
    target: ObjectConstructor<T> | T | ((ctx: HttpContext) => T | Promise<T>)
  ): Promise<T> {
    if (isClass<T>(target)) {
      const providers: ObjectConstructor[] =
        Reflect.getMetadata(CLASS_METADATA, target) ?? [];
      const args: any[] = [];

      const keyProps =
        (Reflect.getMetadata(KEY_METADATA, target) as InjectKey[]) ?? [];
      for (const provider of providers) {
        const existParamInject = keyProps.filter(
          (prop) =>
            prop.parameterIndex != undefined &&
            prop.parameterIndex == providers.indexOf(provider)
        )[0];
        if (!!existParamInject) {
          args.push(await this.getKeyPropValue(existParamInject));
        } else if (isClass(provider)) {
          args.push(await parseInject(this.ctx, provider));
        } else {
          args.push(undefined);
        }
      }
      return new (target as ObjectConstructor<T>)(...args);
    } else if (isFunction(target) && typeof target != "object") {
      return await target(this.ctx);
    } else {
      return target as T;
    }
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
