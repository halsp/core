import { PipeReqRecord, PIPE_RECORDS_METADATA } from "@sfajs/pipe";
import "reflect-metadata";

function TestPipeDec(target: any, propertyKey: symbol | string) {
  Reflect.defineMetadata(
    PIPE_RECORDS_METADATA,
    [
      {
        parameterIndex: 0,
        pipes: [],
        propertyKey,
        type: "header",
      } as PipeReqRecord,
    ],
    target
  );
  console.log(
    "TestPipeDec",
    target,
    Reflect.getMetadata(PIPE_RECORDS_METADATA, target)
  );
}

export function func() {
  return 0;
}

export const num = 0;

export class TestClass {
  @TestPipeDec
  testProp: any;
}
