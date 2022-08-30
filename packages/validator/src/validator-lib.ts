import * as cv from "class-validator";
import {
  createClassValidatorDecorator,
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

type ValidatDecorators = {
  [K in typeof validatorMethods[number]]: ((
    ...args: any[]
  ) => PropertyDecorator & ParameterDecorator & ValidatDecorators) &
    typeof cv[K];
};

export type ValidatorLib = ValidatDecorators & { validates: ValidateItem[] };

export function createLib(): ValidatorLib {
  const lib = {
    validates: [] as ValidateItem[],
  } as ValidatorLib;

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

  return lib;
}
