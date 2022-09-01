import {
  HttpContext,
  isFunction,
  isObject,
  isString,
  isClass,
  ObjectConstructor,
  isUndefined,
} from "@ipare/core";
import {
  CUSTOM_METADATA,
  SCOPED_BAG,
  KEY_METADATA,
  MAP_BAG,
  PROPERTY_METADATA,
  TRANSIENT_BAG,
  SINGLETON_BAG,
  INITIALIZING_EXECUTED,
  INITIALIZED_EXECUTED,
} from "./constant";
import { InjectType } from "./inject-type";
import "reflect-metadata";
import { InjectMap, InjectCustom, InjectKey, IService } from "./interfaces";

type InjectTarget<T extends object = any> = T | ObjectConstructor<T>;

type InjectDecoratorRecordItem<T = any> = {
  injectKey: ObjectConstructor | string | ((...args: any[]) => T | Promise<T>);
  value: T;
};

class InjectDecoratorParser<T extends object = any> {
  constructor(private readonly ctx: HttpContext) {}

  private injectConstructor!: ObjectConstructor<T>;
  private obj!: any;

  public async parseTarget(target: InjectTarget<T>): Promise<T> {
    const isConstructor = !isObject(target);
    this.injectConstructor = isConstructor
      ? (target as ObjectConstructor<T>)
      : (target.constructor as ObjectConstructor<T>);
    this.obj = isConstructor ? await this.createTargetObject(target) : target;

    if (!isUndefined(this.obj)) {
      await this.injectObj();
    }
    return this.obj;
  }

  public async parseKey(key: string): Promise<T | undefined> {
    const existMap = this.getExistKeyMap(key);
    if (!existMap) return undefined;

    this.obj = await this.getObjectFromExistMap(
      existMap.target,
      existMap.type,
      key
    );
    if (!isUndefined(this.obj)) {
      this.injectConstructor = this.obj.constructor;
      await this.injectObj();
    }
    return this.obj;
  }

  public tryParseInject(target: string | ObjectConstructor<T>): T | undefined {
    const existMap = isString(target)
      ? this.getExistKeyMap(target)
      : this.getExistTargetMap(target);

    const { record } = this.getExistInjectRecord(
      existMap?.type ?? InjectType.Scoped,
      target
    );
    return record?.value;
  }

  public getTransientInstances(target: string | ObjectConstructor<T>): T[] {
    return this.getRecordsFromBag(TRANSIENT_BAG)
      .filter((item) => item.injectKey == target)
      .map((item) => item.value);
  }

  private async injectObj(): Promise<void> {
    if (this.obj[INITIALIZING_EXECUTED]) {
      return;
    }

    if (isObject(this.obj)) {
      Object.defineProperty(this.obj, INITIALIZING_EXECUTED, {
        enumerable: false,
        configurable: false,
        writable: false,
        value: true,
      });
    }

    const service = this.obj as IService;
    if (isFunction(service.initializing)) {
      await service.initializing(this.ctx);
    }

    const prototype = this.injectConstructor.prototype;
    const customProps: InjectCustom[] =
      Reflect.getMetadata(CUSTOM_METADATA, prototype) ?? [];
    for (const prop of customProps.filter(
      (item) => item.parameterIndex == undefined
    )) {
      if (this.obj[prop.property] == undefined) {
        this.obj[prop.property] = await this.getCustomPropValue(prop);
      }
    }

    const keyProps: InjectKey[] =
      Reflect.getMetadata(KEY_METADATA, prototype) ?? [];
    for (const prop of keyProps.filter(
      (item) => item.parameterIndex == undefined
    )) {
      if (this.obj[prop.property] == undefined) {
        this.obj[prop.property] = await this.getKeyPropValue(prop);
      }
    }

    const injectProps: (string | symbol)[] =
      Reflect.getMetadata(PROPERTY_METADATA, prototype) ?? [];
    for (const prop of injectProps) {
      if (this.obj[prop] == undefined) {
        this.obj[prop] = await this.getPropertyValue(prop);
      }
    }

    if (!this.obj[INITIALIZED_EXECUTED]) {
      if (isObject(this.obj)) {
        Object.defineProperty(this.obj, INITIALIZED_EXECUTED, {
          enumerable: false,
          configurable: false,
          writable: false,
          value: true,
        });
      }

      if (isFunction(service.initialized)) {
        await service.initialized(this.ctx);
      }
    }
  }

  //#region parsePropValue
  private async getKeyPropValue(prop: InjectKey) {
    const existMap = this.getExistKeyMap(prop.key);
    let result: any;
    if (!!existMap) {
      result = await this.getObjectFromExistMap(
        existMap.target,
        existMap.type,
        prop.key
      );
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
          ? await prop.handler(this.obj ?? this.injectConstructor)
          : await prop.handler(this.ctx, this.obj ?? this.injectConstructor);
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
    const constr: ObjectConstructor<T> = Reflect.getMetadata(
      "design:type",
      this.obj,
      property
    );
    if (isClass(constr)) {
      return await parseInject(this.ctx, constr);
    } else {
      return undefined;
    }
  }
  //#endregion

  //#region createObject
  private async createTargetObject(target: ObjectConstructor<T>) {
    const existMap = this.getExistTargetMap(target);

    return await this.getObjectFromExistMap(
      existMap?.target ?? target,
      existMap?.type ?? InjectType.Scoped,
      target
    );
  }

  private async getObjectFromExistMap(
    target: ObjectConstructor<T>,
    type: InjectType,
    injectKey:
      | ObjectConstructor
      | string
      | ((ctx: HttpContext) => any | Promise<any>)
  ) {
    const { record, records } = this.getExistInjectRecord(type, injectKey);

    if (record) {
      return record.value;
    } else {
      const obj = await this.createObject(target);
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
      | ((...angs: any[]) => any | Promise<any>)
  ): {
    records: InjectDecoratorRecordItem[];
    record?: InjectDecoratorRecordItem;
  } {
    let records: InjectDecoratorRecordItem[];
    if (type == InjectType.Transient) {
      records = this.getRecordsFromBag(TRANSIENT_BAG);
    } else if (type == InjectType.Singleton) {
      records = this.getRecordsFromBag(SINGLETON_BAG);
    } else {
      records = this.getRecordsFromBag(SCOPED_BAG);
    }
    const existedRecord =
      type == InjectType.Transient
        ? undefined
        : records.filter((item) => item.injectKey == injectKey)[0];

    return {
      records: records,
      record: existedRecord,
    };
  }

  private getRecordsFromBag(bagName: string) {
    let records = this.ctx.bag<InjectDecoratorRecordItem[]>(bagName);
    if (!records) {
      records = [];
      this.ctx.bag(bagName, records);
    }
    return records;
  }

  private async createObject<T extends object>(
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
    target = target.prototype;
    // custom inject
    const customProps: InjectCustom[] =
      Reflect.getMetadata(CUSTOM_METADATA, target) ?? [];
    const existCustomInject = customProps.filter(
      (prop) => prop.parameterIndex != undefined && prop.parameterIndex == index
    )[0];
    if (!!existCustomInject) {
      return this.getCustomPropValue(existCustomInject);
    }

    // key inject
    const keyProps: InjectKey[] =
      Reflect.getMetadata(KEY_METADATA, target) ?? [];
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
  //#endregion

  private getConstructorArgsTypes<T extends object>(
    target: ObjectConstructor<T>
  ): ObjectConstructor[] {
    return Reflect.getMetadata("design:paramtypes", target) ?? [];
  }

  private getExistKeyMap(key: string) {
    const injectMaps = this.ctx.bag<InjectMap[]>(MAP_BAG) ?? [];
    return injectMaps.filter(
      (map) => isString(map.anestor) && map.anestor == key
    )[0];
  }

  private getExistTargetMap(target: ObjectConstructor<T>) {
    const injectMaps = this.ctx.bag<InjectMap[]>(MAP_BAG) ?? [];
    return injectMaps.filter(
      (map) => isFunction(map.anestor) && map.anestor == target
    )[0];
  }
}

export function isInjectClass<T extends object>(target: ObjectConstructor<T>) {
  return !!Reflect.getMetadata("design:paramtypes", target);
}

export async function parseInject<T extends object = any>(
  ctx: HttpContext,
  key: string
): Promise<T | undefined>;
export async function parseInject<T extends object = any>(
  ctx: HttpContext,
  target: InjectTarget<T>
): Promise<T>;
export async function parseInject<T extends object = any>(
  ctx: HttpContext,
  target: InjectTarget<T> | string
): Promise<T | undefined> {
  if (isString(target)) {
    return await new InjectDecoratorParser<T>(ctx).parseKey(target);
  } else {
    return await new InjectDecoratorParser<T>(ctx).parseTarget(target);
  }
}

export function tryParseInject<T extends object = any>(
  ctx: HttpContext,
  target: ObjectConstructor<T> | string
): T | undefined {
  return new InjectDecoratorParser<T>(ctx).tryParseInject(target);
}

export function getTransientInstances<T extends object = any>(
  ctx: HttpContext,
  target: ObjectConstructor<T> | string
): T[] {
  return new InjectDecoratorParser<T>(ctx).getTransientInstances(target);
}
