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

export interface ValidatorLib {
  validates: ValidateItem[];
  Is: (
    validate: (value: any, property: string) => Promise<boolean> | boolean,
    errorMessage: string | ((value: any, property: string) => string)
  ) => ValidatorDecoratorReturnType;
}

type ValidatorDecorators = {
  [K in typeof validatorMethods[number]]: ((
    ...args: any[]
  ) => ValidatorDecoratorReturnType) &
    typeof cv[K];
};

export type ValidatorDecoratorReturnType = PropertyDecorator &
  ParameterDecorator &
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

export function addCustomValidator(validator: CustomValidatorItem) {
  customValidator.push(validator);
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
    lib[methodName] = method;
  });

  customValidator.forEach((validator) => {
    lib[validator.name] = (...args: any[]) =>
      createCustomValidatorDecorator(lib, validator, args);
  });
  lib.Is = (
    validate: CustomValidatorFunc,
    errorMessage: string | CustomValidatorMessageFunc
  ) =>
    createCustomValidatorDecorator(
      lib,
      {
        validate,
        errorMessage,
        name: "Is",
      },
      []
    );

  return lib;
}
