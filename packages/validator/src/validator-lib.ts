import * as cv from "class-validator";
import {
  createClassValidatorDecorator,
  createCustomValidatorDecorator,
  ValidateItem,
} from "./create-decorator";

export const validatorMethods = [
  // Common validation decorators
  "IsDefined",
  "IsOptional",
  "Equals",
  "NotEquals",
  "IsEmpty",
  "IsNotEmpty",
  "IsIn",
  "IsNotIn",
  // Type validation decorators
  "IsBoolean",
  "IsDate",
  "IsString",
  "IsNumber",
  "IsInt",
  "IsArray",
  "IsEnum",
  // Number validation decorators
  "IsDivisibleBy",
  "IsPositive",
  "IsNegative",
  "Min",
  "Max",
  // Date validation decorators
  "MinDate",
  "MaxDate",
  // String-type validation decorators
  "IsBooleanString",
  "IsDateString",
  "IsNumberString",
  // String validation decorators
  "Contains",
  "NotContains",
  "IsAlpha",
  "IsAlphanumeric",
  "IsDecimal",
  "IsAscii",
  "IsBase32",
  "IsBase64",
  "IsIBAN",
  "IsBIC",
  "IsByteLength",
  "IsCreditCard",
  "IsCurrency",
  "IsEthereumAddress",
  "IsBtcAddress",
  "IsDataURI",
  "IsEmail",
  "IsFQDN",
  "IsFullWidth",
  "IsHalfWidth",
  "IsVariableWidth",
  "IsHexColor",
  "IsHSL",
  "IsRgbColor",
  "IsIdentityCard",
  "IsPassportNumber",
  "IsPostalCode",
  "IsHexadecimal",
  "IsOctal",
  "IsMACAddress",
  "IsIP",
  "IsPort",
  "IsISBN",
  "IsEAN",
  "IsISIN",
  "IsISO8601",
  "IsJSON",
  "IsJWT",
  "IsObject",
  "IsNotEmptyObject",
  "IsLowercase",
  "IsLatLong",
  "IsLatitude",
  "IsLongitude",
  "IsMobilePhone",
  "IsISO31661Alpha2",
  "IsISO31661Alpha3",
  "IsLocale",
  "IsPhoneNumber",
  "IsMongoId",
  "IsMultibyte",
  "IsNumberString",
  "IsSurrogatePair",
  "IsUrl",
  "IsMagnetURI",
  "IsUUID",
  "IsFirebasePushId",
  "IsUppercase",
  "Length",
  "MinLength",
  "MaxLength",
  "Matches",
  "IsMilitaryTime",
  "IsHash",
  "IsMimeType",
  "IsSemVer",
  "IsISSN",
  "IsISRC",
  "IsRFC3339",
  // Array validation decorators
  "ArrayContains",
  "ArrayNotContains",
  "ArrayNotEmpty",
  "ArrayMinSize",
  "ArrayMaxSize",
  "ArrayUnique",
  // Object validation decorators
  "IsInstance",
  // Other decorators
  "Allow",
] as const;

const extendMap = {
  Required: "IsNotEmpty",
} as const;

export interface ValidatorLib {
  validates: ValidateItem[];
  Is: (
    validate: (value: any, property: string) => Promise<boolean> | boolean,
    errorMessage: string | ((value: any, property: string) => string)
  ) => ValidatorDecoratorReturnType;
}

type ValidatorDecorators = {
  [K in (typeof validatorMethods)[number]]: ((
    ...args: Parameters<(typeof cv)[K]>
  ) => ValidatorDecoratorReturnType) &
    (typeof cv)[K];
} & {
  [K in keyof typeof extendMap]: ((
    ...args: Parameters<(typeof cv)[(typeof extendMap)[K]]>
  ) => ValidatorDecoratorReturnType) &
    (typeof cv)[(typeof extendMap)[K]];
};

export type ValidatorDecoratorReturnType = PropertyDecorator &
  ParameterDecorator &
  ClassDecorator &
  ValidatorDecorators &
  ValidatorLib;

export type CustomValidatorFunc = (
  value: any,
  property: string,
  args: any[]
) => Promise<boolean> | boolean;
export type CustomValidatorMessageFunc = (
  value: any,
  property: string,
  args: any[]
) => string;

export type CustomValidatorItem = {
  name: string;
  validate: CustomValidatorFunc;
  errorMessage: string | CustomValidatorMessageFunc;
};
const customValidator: CustomValidatorItem[] = [];

export function getCustomValidators() {
  return customValidator;
}
export function addCustomValidator(validator: CustomValidatorItem) {
  if (!customValidator.filter((v) => v.name == validator.name).length) {
    customValidator.push(validator);
  }
}

export function createLib(): ValidatorDecoratorReturnType {
  const lib = {
    validates: [] as ValidateItem[],
  } as ValidatorDecoratorReturnType;

  validatorMethods.forEach((methodName) => {
    const cvMethod = cv[methodName] as (...args: any[]) => PropertyDecorator;
    const method = (...args: []) => {
      return createClassValidatorDecorator(
        lib,
        () => cvMethod(...args),
        methodName
      );
    };
    Object.defineProperty(method, "name", {
      get: () => methodName,
    });
    lib[methodName] = method;
  });

  for (const key in extendMap) {
    const cvName = extendMap[key];
    const extendName = key;
    const cvMethod = cv[cvName] as (...args: any[]) => PropertyDecorator;
    const method = (...args: []) => {
      return createClassValidatorDecorator(
        lib,
        () => cvMethod(...args),
        extendName
      );
    };
    Object.defineProperty(method, "name", {
      get: () => extendName,
    });
    lib[extendName] = method;
  }

  customValidator.forEach((validator) => {
    const func = (...args: any[]) =>
      createCustomValidatorDecorator(lib, validator, args);
    Object.defineProperty(func, "name", {
      get: () => validator.name,
    });

    if (!(validator.name in lib)) {
      lib[validator.name] = func;
    }
  });

  lib.Is = function Is(
    validate: CustomValidatorFunc,
    errorMessage: string | CustomValidatorMessageFunc
  ) {
    return createCustomValidatorDecorator(
      lib,
      {
        validate,
        errorMessage,
        name: "Is",
      },
      []
    );
  };

  return libToProxy(lib);
}

export function libToProxy(lib: ValidatorDecoratorReturnType) {
  return new Proxy(lib, {
    get: (target, p) => {
      if (p in target) {
        return target[p];
      } else {
        const func = (...args: any[]) =>
          createCustomValidatorDecorator(
            target,
            {
              validate: () => true,
              name: p as string,
              errorMessage: "",
            },
            args
          );
        Object.defineProperty(func, "name", {
          get: () => p,
        });
        return func;
      }
    },
  });
}
