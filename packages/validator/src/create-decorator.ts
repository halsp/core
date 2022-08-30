import { METADATA } from "./constant";
import { ValidatorLib } from "./validator-lib";

export type ValidateItem = {
  createTempObj: (property: string, value: any) => object;
  name: string;
};

export type RuleRecord = {
  validates: ValidateItem[];
  target: any;
  propertyKey?: symbol | string;
  paramIndex?: number;
};

export function createClassValidatorDecorator(
  lib: ValidatorLib,
  validator: () => PropertyDecorator,
  methodName: string
): PropertyDecorator & ParameterDecorator & ValidatorLib {
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
