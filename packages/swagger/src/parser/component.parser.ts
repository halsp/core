import { isUndefined, ObjectConstructor } from "@sfajs/core";
import { PipeReqRecord, PIPE_RECORDS_METADATA } from "@sfajs/pipe";
import { ComponentsObject, OpenApiBuilder, SchemaObject } from "openapi3-ts";
import { SwaggerOptions } from "../swagger-options";
import { BaseParser } from "./base.parser";
import glob from "glob";

export class ComponentParser extends BaseParser {
  constructor(
    private readonly builder: OpenApiBuilder,
    private readonly options: SwaggerOptions
  ) {
    super();
  }

  public parse() {
    const paths = glob.sync("**/*.@(t|j)s", {
      cwd: this.options.modelCwd ?? process.cwd(),
      ignore: [
        "node_modules/**/*",
        "**/*.d.ts",
        ...(this.options.modelIgnore ?? []),
      ],
      absolute: true,
    });
    for (const p of paths) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const module = require(p);
        for (const cls in module) {
          this.parseModule(module[cls]);
        }
      } catch {}
    }
  }

  private parseModule(cls: ObjectConstructor) {
    if (typeof cls != "function") {
      return;
    }
    this.parsePipeReqRecords(cls);
  }

  private parsePipeReqRecords(cls: ObjectConstructor) {
    const pipeReqRecords: PipeReqRecord[] =
      Reflect.getMetadata(PIPE_RECORDS_METADATA, cls.prototype) ?? [];
    for (const record of pipeReqRecords) {
      if (!isUndefined(record.property)) {
        continue;
      }

      const modelType = this.getPipeRecordModelType(cls, record);
      if (!modelType) continue;

      let schema = this.getExistSchema(modelType.name);
      if (!schema) {
        schema = {
          type: "object",
          properties: {},
        };
        this.builder.addSchema(modelType.name, schema);
      }

      const properties = schema.properties as {
        [propertyName: string]: SchemaObject;
      };
      this.setSchemaProperties(modelType, properties);
    }
  }

  private getExistSchema(name: string) {
    const components = this.builder.getSpec().components as ComponentsObject;
    const schemas = components.schemas as Record<string, SchemaObject>;
    return schemas[name] as SchemaObject;
  }
}
