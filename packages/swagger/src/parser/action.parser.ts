import { ObjectConstructor } from "@sfajs/core";
import { PipeReqRecord, PipeReqType, PIPE_RECORDS_METADATA } from "@sfajs/pipe";
import { Action } from "@sfajs/router";
import {
  ContentObject,
  MediaTypeObject,
  OperationObject,
  ParameterLocation,
  ParameterObject,
  RequestBodyObject,
  SchemaObject,
} from "openapi3-ts";
import { MODEL_PROPERTIES } from "../constant";
import { PropertyDecItem } from "../property-dec-item";

const jsonTypes = [
  "application/json-patch+json",
  "application/json",
  "text/json",
  "application/*+json",
];

export class ActionParser {
  constructor(
    private readonly optObj: OperationObject,
    private readonly action: ObjectConstructor<Action>
  ) {}

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

  private getPipeRecordPropertyType(record: PipeReqRecord) {
    let result: ObjectConstructor;
    if (record.parameterIndex) {
      const paramTypes =
        Reflect.getMetadata("design:paramtypes", this.action) ?? [];
      result = paramTypes[record.parameterIndex];
    } else {
      result = Reflect.getMetadata(
        "design:type",
        this.action.prototype,
        record.propertyKey
      );
    }
    return result;
  }

  private getModelProperties(modelType: ObjectConstructor): PropertyDecItem[] {
    return Reflect.getMetadata(MODEL_PROPERTIES, modelType.prototype) ?? [];
  }

  private updateModelProperties(record: PipeReqRecord) {
    const modelType = this.getPipeRecordPropertyType(record);
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
    const modelType = this.getPipeRecordPropertyType(record);
    if (record.property) {
      properties[record.property] = {
        type: this.typeToApiType(modelType),
      };
    } else {
      const modelProperties = this.getModelProperties(modelType);
      for (const property of modelProperties) {
        const name = property.propertyKey?.toString();
        if (!name) continue;

        let propertyValue = properties[name];
        if (!propertyValue) {
          const propertyType = Reflect.getMetadata(
            "design:type",
            modelType.prototype,
            property.propertyKey
          );
          propertyValue = {
            type: this.typeToApiType(propertyType),
          };
        }

        propertyValue[property.key] = property.value;
        properties[name] = propertyValue;
      }
    }
  }

  private typeToApiType(
    type?: any
  ):
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "integer"
    | "null"
    | "array"
    | undefined {
    if (type == String) {
      return "string";
    } else if (type == Number) {
      return "number";
    } else if (type == BigInt) {
      return "integer";
    } else if (type == Boolean) {
      return "boolean";
    } else if (type == Array) {
      return "array";
    } else if (!type) {
      return "null";
    } else {
      return "object";
    }
  }

  private pipeTypeToDocType(pipeType: PipeReqType): ParameterLocation {
    switch (pipeType) {
      case "header":
        return "header";
      case "query":
        return "query";
      default:
        return "path";
    }
  }
}
