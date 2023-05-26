import { METADATA } from "./constant";
import {
  CustomValidatorItem,
  libToProxy,
  ValidatorDecoratorReturnType,
} from "./validator-lib";

export type ValidateItem = {
  createTempObj?: (property: string, value: any) => object;
  name: string;
  args: any[];
} & Partial<CustomValidatorItem>;

export type RuleRecord = {
  validates: ValidateItem[];
  target: any;
  propertyKey?: symbol | string;
  parameterIndex?: number;
};

export function createClassValidatorDecorator(
  lib: ValidatorDecoratorReturnType,
  validator: () => PropertyDecorator,
  methodName: string
): ValidatorDecoratorReturnType {
  lib.validates.push({
    createTempObj: (property: string, value: any) => {
      function TestClass() {
        //
      }
      TestClass.prototype[property] = value;
      validator()(TestClass.prototype, property);
      return new TestClass();
    },
    name: methodName,
    args: [],
  });

  return createDecorator(lib);
}

export function createCustomValidatorDecorator(
  lib: ValidatorDecoratorReturnType,
  validator: CustomValidatorItem,
  args: any[]
): ValidatorDecoratorReturnType {
  lib.validates.push({
    ...validator,
    args,
  });

  return createDecorator(lib);
}

export function createDecorator(lib: ValidatorDecoratorReturnType) {
  const decorator = function (
    target: any,
    propertyKey?: symbol | string,
    parameterIndex?: number
  ) {
    if (!target) {
      // for @V()
      return createDecorator(lib);
    }

    target = target.prototype ?? target;

    const rules: RuleRecord[] = Reflect.getMetadata(METADATA, target) ?? [];
    Reflect.defineMetadata(
      METADATA,
      [
        ...rules,
        {
          validates: lib.validates,
          target,
          propertyKey,
          parameterIndex,
        },
      ],
      target
    );
  };
  Object.assign(decorator, lib);
  return libToProxy(decorator as any);
}
