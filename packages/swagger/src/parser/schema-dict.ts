import { isClass, ObjectConstructor } from "@ipare/core";
import {
  RuleRecord,
  ValidateItem,
  ValidatorDecoratorReturnType,
} from "@ipare/validator";
import {
  ContentObject,
  MediaTypeObject,
  OpenApiBuilder,
  OperationObject,
  ReferenceObject,
  ResponseObject,
  SchemaObject,
} from "openapi3-ts";
import {
  getNamedValidates,
  jsonTypes,
  lib,
  setComponentModelSchema,
} from "./utils";

export type ArrayItemType =
  | ObjectConstructor
  | SchemaObject
  | [ArrayItemType | ObjectConstructor | SchemaObject];

type SchemaDictOptionType = {
  optName?: string;
  func: (...args: any[]) => ValidatorDecoratorReturnType;
  type?: "true" | "false" | "array" | "value" | "custom";
  customValue?: any;
};

export type SchemaDictType =
  | SchemaDictOptionType
  | ((...args: any[]) => ValidatorDecoratorReturnType);

function dynamicSetValue(
  builder: OpenApiBuilder,
  target: any,
  rules: RuleRecord[],
  ...args: SchemaDictType[]
) {
  args.forEach((arg) => {
    let options: SchemaDictOptionType;
    if (typeof arg == "function") {
      options = {
        func: arg,
      };
    } else {
      options = arg;
    }

    let optName: string;
    if (options.optName) {
      optName = options.optName;
    } else {
      optName = options.func.name;
      optName = optName.replace(optName[0], optName[0].toLowerCase());
    }

    getNamedValidates(rules, options.func.name).forEach((v) => {
      if (options.type == "true") {
        target[optName] = true;
      } else if (options.type == "false") {
        target[optName] = false;
      } else if (options.type == "array") {
        target[optName] = v.args;
      } else if (options.type == "custom") {
        target[optName] = options.customValue;
      } else {
        target[optName] = v.args[0];
      }
    });
  });
}

export function setActionValue(
  builder: OpenApiBuilder,
  operation: OperationObject,
  rules: RuleRecord[]
) {
  dynamicSetValue(
    builder,
    operation,
    rules,
    {
      func: lib.Tags,
      type: "array",
    },
    lib.Description,
    lib.Summary,
    lib.ExternalDocs,
    lib.OperationId,
    lib.Deprecated,
    {
      func: lib.Deprecated,
      type: "true",
    },
    {
      func: lib.Security,
      type: "array",
    },
    {
      func: lib.Servers,
      type: "array",
    }
  );

  parseResponse(builder, operation, rules);
}

function parseResponse(
  builder: OpenApiBuilder,
  operation: OperationObject,
  rules: RuleRecord[]
) {
  const descriptionValidates = getNamedValidates(
    rules,
    lib.ResponseDescription.name
  );
  const descriptionDefValidates = descriptionValidates.filter(
    (item) => typeof item.args[0] != "number"
  );
  const headersValidates = getNamedValidates(rules, lib.ResponseHeaders.name);
  const headersDefValidates = headersValidates.filter(
    (item) => typeof item.args[0] != "number"
  );
  const contentValidates = getNamedValidates(rules, lib.Response.name);
  const contentDefValidates = contentValidates.filter(
    (item) => typeof item.args[0] != "number"
  );

  const responses = operation.responses;
  if (
    descriptionDefValidates.length ||
    headersDefValidates.length ||
    contentDefValidates.length
  ) {
    responses.default = createResponseObject(
      builder,
      rules,
      descriptionDefValidates,
      headersDefValidates,
      contentDefValidates
    );
  }

  const status: number[] = [];
  [...descriptionValidates, ...headersValidates, ...contentValidates].forEach(
    (v) => {
      const code = v.args[0];
      if (typeof code == "number" && !status.includes(code)) {
        status.push(code);
      }
    }
  );

  status.forEach((code) => {
    const descriptionCodeValidates = descriptionValidates.filter(
      (v) => v.args[0] == code
    );
    const headersCodeValidates = headersValidates.filter(
      (v) => v.args[0] == code
    );
    const contentCodeValidates = contentValidates.filter(
      (v) => v.args[0] == code
    );
    responses[code.toString()] = createResponseObject(
      builder,
      rules,
      descriptionCodeValidates,
      headersCodeValidates,
      contentCodeValidates
    );
  });

  if (!Object.keys(responses).length) {
    responses.default = {
      description: "",
    };
  }
}

function createResponseObject(
  builder: OpenApiBuilder,
  rules: RuleRecord[],
  descriptionValidates: ValidateItem[],
  headersValidates: ValidateItem[],
  contentValidates: ValidateItem[]
) {
  const responseObject: ResponseObject = {
    description: "",
  };
  descriptionValidates.forEach((v) => {
    responseObject.description =
      typeof v.args[0] == "number" ? v.args[1] : v.args[0];
  });
  headersValidates.forEach((v) => {
    responseObject.headers =
      typeof v.args[0] == "number" ? v.args[1] : v.args[0];
  });
  contentValidates.forEach((v) => {
    responseObject.content = createContentObject(builder, rules, v);
  });
  return responseObject;
}

function createContentObject(
  builder: OpenApiBuilder,
  rules: RuleRecord[],
  validate: ValidateItem
) {
  const contentTypeValidates = getNamedValidates(
    rules,
    lib.ResponseContentTypes.name
  );
  const contentTypes: string[] = [];
  if (contentTypeValidates.length) {
    contentTypeValidates.forEach((validate) => {
      contentTypes.push(...validate.args);
    });
  }
  if (!contentTypes.length) {
    contentTypes.push(...jsonTypes);
  }

  const schemaValue: ObjectConstructor | SchemaObject =
    typeof validate.args[0] == "number" ? validate.args[1] : validate.args[0];
  const contentObject: ContentObject = {};
  for (const contentType of contentTypes) {
    contentObject[contentType] = {};
    const contentTypeObj = contentObject[contentType] as MediaTypeObject;

    if (isClass(schemaValue)) {
      setComponentModelSchema(builder, schemaValue);
      contentTypeObj.schema = {
        $ref: `#/components/schemas/${schemaValue.name}`,
      } as ReferenceObject;
    } else {
      contentTypeObj.schema = schemaValue;
    }
  }

  return contentObject;
}

export function setSchemaValue(
  builder: OpenApiBuilder,
  target: SchemaObject,
  rules: RuleRecord[]
) {
  dynamicSetValue(
    builder,
    target,
    rules,
    {
      func: lib.IsNotEmpty,
      optName: "nullable",
      type: "false",
    },
    {
      func: lib.IsEmpty,
      optName: "nullable",
      type: "true",
    },
    lib.Discriminator,
    {
      func: lib.ReadOnly,
      type: "true",
    },
    {
      func: lib.WriteOnly,
      type: "true",
    },
    lib.Xml,
    lib.ExternalDocs,
    lib.Example,
    {
      func: lib.Examples,
      type: "array",
    },
    lib.Deprecated,
    {
      func: lib.IsInt,
      type: "custom",
      optName: "type",
      customValue: "integer",
    },
    {
      func: lib.IsInt,
      type: "custom",
      optName: "format",
      customValue: "int32",
    },
    {
      func: lib.IsDate,
      type: "custom",
      optName: "format",
      customValue: "date",
    },
    {
      func: lib.IsNumber,
      type: "custom",
      optName: "type",
      customValue: "number",
    },
    {
      func: lib.IsString,
      type: "custom",
      optName: "type",
      customValue: "string",
    },
    {
      func: lib.IsBoolean,
      type: "custom",
      optName: "type",
      customValue: "boolean",
    },
    {
      func: lib.IsObject,
      type: "custom",
      optName: "type",
      customValue: "object",
    },
    {
      func: lib.IsEmpty,
      type: "custom",
      optName: "type",
      customValue: "null",
    },
    lib.Description,
    lib.Default,
    lib.Title,
    {
      func: lib.Max,
      optName: "maximum",
    },
    {
      func: lib.Min,
      optName: "mininum",
    },
    lib.MinLength,
    lib.MaxLength,
    {
      func: lib.Matches,
      optName: "pattern",
    },
    {
      func: lib.ArrayMaxSize,
      optName: "maxItems",
    },
    {
      func: lib.ArrayMinSize,
      optName: "minItems",
    },
    {
      func: lib.ArrayUnique,
      optName: "uniqueItems",
      type: "true",
    },
    lib.MinProperties,
    lib.MaxProperties,
    {
      func: lib.Required,
      optName: "nullable",
      type: "false",
    },
    {
      func: lib.IsNotEmpty,
      optName: "required",
      type: "true",
    },
    {
      func: lib.Enum,
      type: "array",
    },
    lib.Format
  );
}

export function setParamValue(
  builder: OpenApiBuilder,
  target: object,
  rules: RuleRecord[]
) {
  dynamicSetValue(
    builder,
    target,
    rules,
    lib.Description,
    {
      func: lib.Required,
      type: "true",
    },
    {
      func: lib.IsNotEmpty,
      type: "true",
    },
    {
      func: lib.Deprecated,
      type: "true",
    },
    {
      func: lib.IsOptional,
      optName: "allowEmptyValue",
      type: "true",
    },
    lib.Style,
    {
      func: lib.Explode,
      type: "true",
    },
    {
      func: lib.AllowReserved,
      type: "true",
    },
    lib.Examples,
    lib.Example
  );
}

export function setRequestBodyValue(
  builder: OpenApiBuilder,
  target: object,
  rules: RuleRecord[]
) {
  dynamicSetValue(builder, target, rules, lib.Description, {
    func: lib.Required,
    type: "true",
  });
}
