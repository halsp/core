import { Action } from "@sfajs/router";
import { OperationObject, RequestBodyObject } from "openapi3-ts";
import { BaseParser } from "./base.parser";
import { isClass, ObjectConstructor } from "@sfajs/core";
import { PipeReqRecord } from "@sfajs/pipe";

const jsonTypes = [
  "application/json-patch+json",
  "application/json",
  "text/json",
  "application/*+json",
];

export class BodyParser extends BaseParser {
  constructor(
    private readonly optObj: OperationObject,
    private readonly action: ObjectConstructor<Action>,
    private readonly record: PipeReqRecord
  ) {
    super();
  }

  public parse() {
    const requestBody = (this.optObj.requestBody as RequestBodyObject) ?? {
      content: {},
    };
    this.optObj.requestBody = requestBody;
    for (const media of jsonTypes) {
      const modelType = this.getPipeRecordModelType(this.action, this.record);
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
