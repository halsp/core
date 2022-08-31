import { isClass } from "@ipare/core";
import { RuleRecord, ValidatorDecoratorReturnType } from "@ipare/validator";
import { OpenApiBuilder, ReferenceObject, SchemaObject } from "openapi3-ts";
import { getNamedValidates, lib, setComponentModelSchema } from "./utils";

type SchemaDictOptionType = {
  optName?: string;
  func: (...args: any[]) => ValidatorDecoratorReturnType;
  type?: "true" | "false" | "array" | "value" | "schema" | "custom";
  customValue?: any;
};

export type SchemaDictType =
  | SchemaDictOptionType
  | ((...args: any[]) => ValidatorDecoratorReturnType);

function dynamicSetValue(
  builder: OpenApiBuilder,
  target: object,
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
      const args = v.args ?? [];
      if (options.type == "true") {
        target[optName] = true;
      } else if (options.type == "false") {
        target[optName] = false;
      } else if (options.type == "array") {
        target[optName] = args;
      } else if (options.type == "schema") {
        const schemaValue = args[0];
        if (isClass(schemaValue)) {
          setComponentModelSchema(builder, schemaValue);
          target[optName] = {
            $ref: `#/components/schemas/${schemaValue.name}`,
          } as ReferenceObject;
        } else {
          target[optName] = schemaValue;
        }
      } else if (options.type == "custom") {
        target[optName] = options.customValue;
      } else {
        target[optName] = args[0];
      }
    });
  });
}

export function setActionValue(
  builder: OpenApiBuilder,
  target: object,
  rules: RuleRecord[]
) {
  dynamicSetValue(
    builder,
    target,
    rules,
    {
      func: lib.Tags,
      type: "array",
    },
    lib.Description,
    lib.Summary,
    lib.ExternalDocs,
    lib.OperationId,
    lib.Callbacks,
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
    lib.Type,
    lib.Format,
    {
      func: lib.Items,
      type: "schema",
    },
    {
      func: lib.Items,
      optName: "type",
      type: "custom",
      customValue: "array",
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
    }
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
