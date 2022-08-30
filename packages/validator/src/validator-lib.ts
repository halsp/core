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

export type CustomValidatorItem = {
  name: string;
  validate: (property: string, value: any) => Promise<boolean> | boolean;
  errorMessage: string | ((property: string, value: any) => string);
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
    lib[validator.name] = () =>
      createCustomValidatorDecorator(
        lib,
        validator.validate,
        validator.name,
        validator.errorMessage
      );
  });

  return lib;
}
