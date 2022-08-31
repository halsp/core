import {
  RuleRecord,
  ValidateItem,
  ValidatorDecoratorReturnType,
  ValidatorLib,
} from "@ipare/validator";
import { SchemaObject } from "openapi3-ts";

export type SchemaDictType =
  | {
      optName?: string;
      func: (...args: any[]) => ValidatorDecoratorReturnType;
      type?: "boolean" | "array" | "value";
    }
  | ((...args: any[]) => ValidatorDecoratorReturnType);

function dynamicSetValue(
  target: object,
  rules: RuleRecord[],
  ...args: (
    | {
        optName?: string;
        func: (...args: any[]) => ValidatorDecoratorReturnType;
        type?: "boolean" | "array" | "value";
      }
    | ((...args: any[]) => ValidatorDecoratorReturnType)
  )[]
) {
  args.forEach((arg) => {
    let options: {
      optName?: string;
      func: (...args: any[]) => ValidatorDecoratorReturnType;
      type?: "boolean" | "array" | "value";
    };
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
      if (options.type == "boolean") {
        target[optName] = true;
      } else if (options.type == "array") {
        target[optName] = v.args ?? [];
      } else {
        target[optName] = (v.args ?? [])[0];
      }
    });
  });
}

export function setActionValue(
  lib: ValidatorLib,
  target: object,
  rules: RuleRecord[]
) {
  dynamicSetValue(
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
      type: "boolean",
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
  lib: ValidatorDecoratorReturnType,
  target: SchemaObject,
  rules: RuleRecord[]
) {
  dynamicSetValue(
    target,
    rules,
    {
      func: lib.Nullable,
      type: "boolean",
    },
    lib.Discriminator,
    {
      func: lib.ReadOnly,
      type: "boolean",
    },
    {
      func: lib.WriteOnly,
      type: "boolean",
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
    lib.Items,
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
      type: "boolean",
    },
    lib.MinProperties,
    lib.MaxProperties,
    {
      func: lib.Required,
      type: "boolean",
    },
    {
      func: lib.Enum,
      type: "array",
    }
  );
}

export function setParamValue(
  lib: ValidatorLib,
  target: object,
  rules: RuleRecord[]
) {
  dynamicSetValue(
    target,
    rules,
    lib.Description,
    {
      func: lib.Required,
      type: "boolean",
    },
    {
      func: lib.Deprecated,
      type: "boolean",
    },
    {
      func: lib.AllowEmptyValue,
      type: "boolean",
    },
    lib.Style,
    {
      func: lib.Explode,
      type: "boolean",
    },
    {
      func: lib.AllowReserved,
      type: "boolean",
    },
    lib.Examples,
    lib.Example
  );
}

export function setRequestBodyValue(
  lib: ValidatorLib,
  target: object,
  rules: RuleRecord[]
) {
  dynamicSetValue(target, rules, lib.Description, {
    func: lib.Required,
    type: "boolean",
  });
}

export function getNamedValidates(rules: RuleRecord[], name: string) {
  const validates: ValidateItem[] = [];
  rules.forEach((r) => {
    validates.push(...r.validates.filter((v) => v.name == name));
  });
  return validates;
}
