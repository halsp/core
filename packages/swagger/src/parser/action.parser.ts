import { ObjectConstructor } from "@sfajs/core";
import { PipeReqRecord, PIPE_RECORDS_METADATA } from "@sfajs/pipe";
import { Action } from "@sfajs/router";
import {
  MediaTypeObject,
  OperationObject,
  ParameterObject,
  RequestBodyObject,
  SchemaObject,
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
      });
    } else {
      this.updateModelProperties(record);
    }
  }

  private updateModelProperties(record: PipeReqRecord) {
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
      const content = requestBody.content[media] ?? {
        schema: {
          type: "object",
          properties: {},
        },
      };
      requestBody.content[media] = content;
      this.parseBodyMediaItem(content, record);
    }
  }

  private parseBodyMediaItem(
    mediaObject: MediaTypeObject,
    record: PipeReqRecord
  ) {
    const schema = mediaObject.schema as SchemaObject;
    const properties = schema.properties as {
      [propertyName: string]: SchemaObject;
    };
    const modelType = this.getPipeRecordModelType(this.action, record);
    if (record.property) {
      properties[record.property] = {
        type: this.typeToApiType(modelType),
      };
    } else {
      this.setSchemaProperties(modelType, properties);
    }
  }
}
