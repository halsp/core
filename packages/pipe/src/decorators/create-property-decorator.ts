import "reflect-metadata";
import { addPipeRecord } from "../pipe-req-record";
import { PipeReqType } from "../pipe-req-type";

export function createPropertyDecorator(type: PipeReqType, args: any[]) {
  if (typeof args[0] == "string") {
    // property params
    const pipes = args.slice(1, args.length);
    return function (target: any, propertyKey: string | symbol) {
      addPipeRecord(type, pipes, target, propertyKey, undefined, args[0]);
    };
  } else if (typeof args[1] == "string") {
    const target = args[0];
    addPipeRecord(type, [], target, args[1]);
  } else {
    const pipes = args;
    return function (target: any, propertyKey: string | symbol) {
      addPipeRecord(type, pipes, target, propertyKey, undefined, undefined);
    };
  }
}
