import { PipeReqRecord } from "@sfajs/pipe";
import { Action } from "@sfajs/router";
import { OperationObject, ParameterObject } from "openapi3-ts";
import { ObjectConstructor } from "@sfajs/core";
import { pipeTypeToDocType } from "./utils/doc-types";
import { BaseParser } from "./base.parser";

export class ParameterParser extends BaseParser {
  constructor(
    private readonly optObj: OperationObject,
    private readonly action: ObjectConstructor<Action>,
    private readonly record: PipeReqRecord
  ) {
    super();
  }

  public parse() {
    const params = this.optObj.parameters as ParameterObject[];
    if (this.record.property) {
      params.push({
        name: this.record.property,
        in: pipeTypeToDocType(this.record.type),
        required: this.record.type == "param",
      });
    } else {
      this.updateParameterModelProperties();
    }
  }

  private updateParameterModelProperties() {
    const modelType = this.getPipeRecordModelType(this.action, this.record);
    const params = this.optObj.parameters as ParameterObject[];

    const modelProperties = this.getModelProperties(modelType);
    for (const property of modelProperties) {
      const name = property.propertyKey?.toString();
      if (!name) continue;

      const existParameter = params
        .map((p) => p as ParameterObject)
        .filter((p) => p.name == name)[0];
      const parameter = existParameter ?? {
        name,
        in: pipeTypeToDocType(this.record.type),
        required: this.record.type == "param",
      };
      parameter[property.key] = property.value;

      if (!existParameter) {
        params.push(parameter);
      }
    }
  }
}
