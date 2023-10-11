import { createInject, Inject } from "@halsp/inject";
import * as ws from "ws";

export function WebSocket(
  target: any,
  propertyKey: string | symbol | undefined,
  parameterIndex?: number,
): void;
export function WebSocket(): PropertyDecorator & ParameterDecorator;
export function WebSocket(...args: any[]): any {
  if (args.length > 0) {
    return createInject(
      (ctx) => ctx.acceptWebSocket(),
      args[0],
      args[1],
      args[2],
    );
  } else {
    return Inject((ctx) => ctx.acceptWebSocket());
  }
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WebSocket extends ws.WebSocket {}
