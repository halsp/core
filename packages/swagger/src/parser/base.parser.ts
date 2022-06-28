import { ObjectConstructor } from "@sfajs/core";
import { PipeReqRecord, PipeReqType } from "@sfajs/pipe";
import { ParameterLocation, SchemaObject } from "openapi3-ts";
import { MODEL_PROPERTIES } from "../constant";
import { PropertyDecItem } from "../property-dec-item";

export abstract class BaseParser {
  protected getPipeRecordModelType(
    cls: ObjectConstructor,
    record: PipeReqRecord
  ) {
    let result: ObjectConstructor;
    if (record.parameterIndex) {
      const paramTypes = Reflect.getMetadata("design:paramtypes", cls) ?? [];
      result = paramTypes[record.parameterIndex];
    } else {
      result = Reflect.getMetadata(
        "design:type",
        cls.prototype,
        record.propertyKey
      );
    }
    return result;
  }

  protected getModelProperties(modelCls: ObjectConstructor): PropertyDecItem[] {
    return Reflect.getMetadata(MODEL_PROPERTIES, modelCls.prototype) ?? [];
  }

  protected setSchemaProperties(
    modelCls: ObjectConstructor,
    properties: Record<string, SchemaObject>
  ) {
    const modelProperties = this.getModelProperties(modelCls);
    for (const property of modelProperties) {
      const name = property.propertyKey?.toString();
      if (!name) continue;

      let propertyValue = properties[name];
      if (!propertyValue) {
        const propertyType = Reflect.getMetadata(
          "design:type",
          modelCls.prototype,
          property.propertyKey
        );
        propertyValue = {
          type: this.typeToApiType(propertyType),
        };
      }

      propertyValue[property.key] = property.value;
      properties[name] = propertyValue;
    }
    return properties;
  }

  protected typeToApiType(
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

  protected pipeTypeToDocType(pipeType: PipeReqType): ParameterLocation {
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
