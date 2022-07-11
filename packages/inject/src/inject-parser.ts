import {
  HttpContext,
  isFunction,
  isObject,
  isString,
  isClass,
  ObjectConstructor,
} from "@ipare/core";
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
    | ((...args: any[]) => any | Promise<any>);
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

    return this.obj;
  }

  //#region parsePropValue
  private async getKeyPropValue(prop: InjectKey) {
    const injectMaps = this.ctx.bag<InjectMap[]>(MAP_BAG) ?? [];
    const existMap = injectMaps.filter(
      (map) => isString(map.anestor) && map.anestor == prop.key
    )[0];

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
          ? await prop.handler(this.obj)
          : await prop.handler(this.ctx, this.obj);
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
  private async createTargetObject() {
    const target = this.target as ObjectConstructor<T>;
    const injectMaps = this.ctx.bag<InjectMap[]>(MAP_BAG) ?? [];
    const existMap = injectMaps.filter(
      (map) => isFunction(map.anestor) && map.anestor == target
    )[0];

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
    record: InjectDecoratorRecordItem;
  } {
    let records: InjectDecoratorRecordItem[];
    if (type == InjectType.Transient) {
      records = [];
    } else if (type == InjectType.Singleton) {
      records = InjectDecoratorParser.singletonInject;
    } else {
      records = this.getScopedRecords();
    }

    return {
      records: records,
      record: records.filter((item) => item.injectKey == injectKey)[0],
    };
  }

  private getScopedRecords() {
    let records =
      this.ctx.bag<InjectDecoratorRecordItem[]>(DECORATOR_SCOPED_BAG);
    if (!records) {
      records = [];
      this.ctx.bag(DECORATOR_SCOPED_BAG, records);
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
    return Reflect.getMetadata(CLASS_METADATA, target.prototype) ?? [];
  }
}

export function isInjectClass<T extends object>(target: ObjectConstructor<T>) {
  return !!Reflect.getMetadata(CLASS_METADATA, target.prototype);
}

export async function parseInject<T extends object = any>(
  ctx: HttpContext,
  target: InjectTarget<T>
): Promise<T> {
  return await new InjectDecoratorParser<T>(ctx, target).parse();
}
