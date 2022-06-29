import { isClass, ObjectConstructor } from "@sfajs/core";
import { PipeReqRecord, PIPE_RECORDS_METADATA } from "@sfajs/pipe";
import { Action } from "@sfajs/router";
import {
  OperationObject,
  ParameterObject,
  RequestBodyObject,
} from "openapi3-ts";
import { BaseParser } from "./base.parser";

const jsonTypes = [
  "application/json-patch+json",
  "application/json",
  "text/json",
  "application/*+json",
];

export class ActionParser extends BaseParser {
  constructor(
    private readonly optObj: OperationObject,
    private readonly action: ObjectConstructor<Action>
  ) {
    super();
  }

  public parse() {
    const pipeReqRecords: PipeReqRecord[] =
      Reflect.getMetadata(PIPE_RECORDS_METADATA, this.action.prototype) ?? [];

    for (const record of pipeReqRecords) {
      if (record.type == "body") {
        this.parseBody(record);
      } else {
        this.parseParameters(record);
      }
    }
  }

  private parseParameters(record: PipeReqRecord) {
    const params = this.optObj.parameters as ParameterObject[];
    if (record.property) {
      params.push({
        name: record.property,
        in: this.pipeTypeToDocType(record.type),
        required: record.type == "param",
      });
    } else {
      this.updateParameterModelProperties(record);
    }
  }

  private updateParameterModelProperties(record: PipeReqRecord) {
    const modelType = this.getPipeRecordModelType(this.action, record);
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
        in: this.pipeTypeToDocType(record.type),
        required: record.type == "param",
      };
      parameter[property.key] = property.value;

      if (!existParameter) {
        params.push(parameter);
      }
    }
  }

  private parseBody(record: PipeReqRecord) {
    const requestBody = (this.optObj.requestBody as RequestBodyObject) ?? {
      content: {},
    };
    this.optObj.requestBody = requestBody;
    for (const media of jsonTypes) {
      const modelType = this.getPipeRecordModelType(this.action, record);
      if (isClass(modelType)) {
        requestBody.content[media] = {
          schema: {
            $ref: `#/components/schemas/${modelType.name}`,
          },
        };
      }
    }
  }
}
