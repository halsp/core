import { addPipeRecord } from "@ipare/pipe/dist/pipe-req-record";
import "reflect-metadata";

function TestPipeDec(target: any, propertyKey: symbol | string) {
  addPipeRecord("header", [], target, propertyKey, 0);
}

export function func() {
  return 0;
}

export const num = 0;

export class TestClass {
  @TestPipeDec
  testProp: any;
}
