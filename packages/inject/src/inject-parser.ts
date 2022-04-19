import {
  HttpContext,
  isFunction,
  isObject,
  isString,
  isClass,
  ObjectConstructor,
} from "@sfajs/core";
import {
  CLASS_METADATA,
  CUSTOM_METADATA,
  DECORATOR_SCOPED_BAG,
  KEY_METADATA,
  MAP_BAG,
  PROPERTY_METADATA,
} from "./constant";
import { InjectType } from "./inject-type";
import "reflect-metadata";
import { InjectMap, InjectCustom, InjectKey } from "./interfaces";

type InjectTarget<T extends object = any> = T | ObjectConstructor<T>;

type InjectDecoratorRecordItem = {
  injectKey:
    | ObjectConstructor
    | string
    | ((ctx: HttpContext) => any | Promise<any>);
  value: any;
};

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

    const customProps =
      (Reflect.getMetadata(
        CUSTOM_METADATA,
        this.injectConstructor.prototype
      ) as InjectCustom[]) ?? [];
    for (const prop of customProps.filter(
      (item) => item.parameterIndex == undefined
    )) {
      if (this.obj[prop.property] == undefined) {
        this.obj[prop.property] = await this.getCustomPropValue(prop);
      }
    }

    const keyProps =
      (Reflect.getMetadata(
        KEY_METADATA,
        this.injectConstructor.prototype
      ) as InjectKey[]) ?? [];
    for (const prop of keyProps.filter(
      (item) => item.parameterIndex == undefined
    )) {
      if (this.obj[prop.property] == undefined) {
        this.obj[prop.property] = await this.getKeyPropValue(prop);
      }
    }

    const injectProps =
      (Reflect.getMetadata(
        PROPERTY_METADATA,
        this.injectConstructor.prototype
      ) as (string | symbol)[]) ?? [];
    for (const prop of injectProps) {
      if (this.obj[prop] == undefined) {
        this.obj[prop] = await this.getPropertyValue(prop);
      }
    }

    return this.obj;
  }

  private async getKeyPropValue(prop: InjectKey) {
    const injectMaps = this.ctx.bag<InjectMap[]>(MAP_BAG) ?? [];
    const existMap = injectMaps.filter(
      (map) => isString(map.anestor) && map.anestor == prop.key
    )[0];

    let result: any;
    if (!!existMap) {
      result = await this.getObjectFromExistMap(existMap, prop.key);
    } else if (!!prop.property) {
      result = await this.getPropertyValue(prop.property);
    } else if (!!prop.parameterIndex) {
      const argTypes = this.getConstructorArgsTypes(this.injectConstructor);
      const constr = argTypes[prop.parameterIndex];
      if (constr && isClass(constr)) {
        result = await parseInject(this.ctx, constr);
      }
    }

    return this.parsePropValue(result);
  }

  private async getCustomPropValue(prop: InjectCustom) {
    const { record, records } = this.getExistInjectRecord(
      prop.type ?? InjectType.Scoped,
      prop.handler
    );

    let result: any;
    if (record) {
      result = record.value;
    } else {
      result =
        prop.type == InjectType.Singleton
          ? await prop.handler()
          : await prop.handler(this.ctx);
      records.push({
        injectKey: prop.handler,
        value: result,
      });
    }

    return this.parsePropValue(result);
  }

  private async parsePropValue(value: any) {
    if (
      value &&
      ((isObject(value) && !Array.isArray(value)) || isClass(value))
    ) {
      return await parseInject(this.ctx, value);
    } else {
      return value;
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
    injectKey:
      | ObjectConstructor
      | string
      | ((ctx: HttpContext) => any | Promise<any>)
  ) {
    const { record, records } = this.getExistInjectRecord(
      existMap.type,
      injectKey
    );

    if (record) {
      return record.value;
    } else {
      const obj = await this.createObject(existMap.target);
      records.push({
        injectKey: injectKey,
        value: obj,
      });
      return obj;
    }
  }

  private getExistInjectRecord(
    type: InjectType,
    injectKey:
      | ObjectConstructor
      | string
      | ((ctx: HttpContext) => any | Promise<any>)
  ): {
    records: InjectDecoratorRecordItem[];
    record: InjectDecoratorRecordItem;
  } {
    let records: InjectDecoratorRecordItem[];
    if (type == InjectType.Scoped) {
      records = this.ctx.bag<InjectDecoratorRecordItem[]>(DECORATOR_SCOPED_BAG);
    } else if (type == InjectType.Singleton) {
      records = InjectDecoratorParser.singletonInject;
    } else {
      records = [];
    }

    return {
      records: records,
      record: records.filter((item) => item.injectKey == injectKey)[0],
    };
  }

  async createObject<T extends object>(
    target: ObjectConstructor<T> | T | ((ctx: HttpContext) => T | Promise<T>)
  ): Promise<T> {
    if (isClass<T>(target)) {
      const argTypes = this.getConstructorArgsTypes(target);
      const args: any[] = [];
      let index = 0;
      for (const argType of argTypes) {
        args.push(await this.createConstructorArg(target, argType, index));
        index++;
      }
      return new target(...args);
    } else if (isFunction(target) && typeof target != "object") {
      return await target(this.ctx);
    } else {
      return target as T;
    }
  }

  private async createConstructorArg<T extends object>(
    target: ObjectConstructor<T>,
    arg: ObjectConstructor,
    index: number
  ) {
    // custom inject
    const customProps =
      (Reflect.getMetadata(CUSTOM_METADATA, target) as InjectCustom[]) ?? [];
    const existCustomInject = customProps.filter(
      (prop) => prop.parameterIndex != undefined && prop.parameterIndex == index
    )[0];
    if (!!existCustomInject) {
      return this.getCustomPropValue(existCustomInject);
    }

    // key inject
    const keyProps =
      (Reflect.getMetadata(KEY_METADATA, target) as InjectKey[]) ?? [];
    const existParamInject = keyProps.filter(
      (prop) => prop.parameterIndex != undefined && prop.parameterIndex == index
    )[0];
    if (!!existParamInject) {
      return this.getKeyPropValue(existParamInject);
    }

    // ordinary inject
    if (isClass(arg)) {
      return await parseInject(this.ctx, arg);
    } else {
      return undefined;
    }
  }

  getConstructorArgsTypes<T extends object>(
    target: ObjectConstructor<T>
  ): ObjectConstructor[] {
    return Reflect.getMetadata(CLASS_METADATA, target) ?? [];
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
