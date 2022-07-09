import { isUndefined, ObjectConstructor } from "@sfajs/core";
import { PipeReqRecord, PIPE_RECORDS_METADATA } from "@sfajs/pipe";
import { OpenApiBuilder } from "openapi3-ts";
import { SwaggerOptions } from "../swagger-options";
import glob from "glob";
import { ensureModelSchema } from "./utils/model-schema";
import { getPipeRecordModelType } from "./utils/decorator";

export class ComponentParser {
  constructor(
    private readonly builder: OpenApiBuilder,
    private readonly options: SwaggerOptions
  ) {}

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

      const modelCls = getPipeRecordModelType(cls, record);
      if (!modelCls) continue;
      ensureModelSchema(this.builder, modelCls, record);
    }
  }
}
