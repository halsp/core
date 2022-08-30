import { METADATA } from "./constant";
import { ValidatorDecoratorReturnType } from "./validator-lib";

export type ValidateItem = {
  createTempObj?: (property: string, value: any) => object;
  name: string;
  validate?: (property: string, value: any) => Promise<boolean> | boolean;
  errorMessage?: string | ((property: string, value: any) => string);
};

export type RuleRecord = {
  validates: ValidateItem[];
  target: any;
  propertyKey?: symbol | string;
  paramIndex?: number;
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
  });

  return createDecorator(lib);
}

export function createCustomValidatorDecorator(
  lib: ValidatorDecoratorReturnType,
  validate: (property: string, value: any) => Promise<boolean> | boolean,
  methodName: string,
  errorMessage: string | ((property: string, value: any) => string)
): ValidatorDecoratorReturnType {
  lib.validates.push({
    validate,
    name: methodName,
    errorMessage,
  });

  return createDecorator(lib);
}

function createDecorator(lib: ValidatorDecoratorReturnType) {
  const decorator = function (
    target: any,
    propertyKey?: symbol | string,
    paramIndex?: number
  ) {
    target = target.prototype ?? target;

    const rules: RuleRecord[] = Reflect.getMetadata(METADATA, target) ?? [];
    rules.push({
      validates: lib.validates,
      target,
      propertyKey,
      paramIndex,
    });
    Reflect.defineMetadata(METADATA, rules, target);
  };
  Object.assign(decorator, lib);
  return decorator as any;
}
