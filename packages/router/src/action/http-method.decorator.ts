import "reflect-metadata";
import { MethodItem } from "./method-item";
import { ACTION_METHOD_METADATA } from "../constant";

function setHttpMethodMetadata(target: any, method: string, url?: string) {
  const methods: MethodItem[] =
    Reflect.getMetadata(ACTION_METHOD_METADATA, target.prototype) ?? [];
  Reflect.defineMetadata(
    ACTION_METHOD_METADATA,
    [
      ...methods,
      {
        method: method,
        url: url ?? "",
      },
    ],
    target.prototype,
  );
}

function createHttpMethodDecorator(
  method: string,
  url?: string,
): ClassDecorator;
function createHttpMethodDecorator(method: string, target: any): void;
function createHttpMethodDecorator(
  method: string,
  data?: any,
): ClassDecorator | undefined {
  if (typeof data == "function") {
    setHttpMethodMetadata(data, method);
  } else {
    return function (target: any) {
      setHttpMethodMetadata(target, method, data);
    };
  }
}

export function HttpGet(url?: string): ClassDecorator;
export function HttpGet(target: any): void;
export function HttpGet(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator("GET", data);
}

export function HttpPost(url?: string): ClassDecorator;
export function HttpPost(target: any): void;
export function HttpPost(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator("POST", data);
}

export function HttpPatch(url?: string): ClassDecorator;
export function HttpPatch(target: any): void;
export function HttpPatch(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator("PATCH", data);
}

export function HttpDelete(url?: string): ClassDecorator;
export function HttpDelete(target: any): void;
export function HttpDelete(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator("DELETE", data);
}

export function HttpPut(url?: string): ClassDecorator;
export function HttpPut(target: any): void;
export function HttpPut(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator("PUT", data);
}

export function HttpHead(url?: string): ClassDecorator;
export function HttpHead(target: any): void;
export function HttpHead(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator("HEAD", data);
}

export function HttpOptions(url?: string): ClassDecorator;
export function HttpOptions(target: any): void;
export function HttpOptions(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator("OPTIONS", data);
}

export function HttpConnect(url?: string): ClassDecorator;
export function HttpConnect(target: any): void;
export function HttpConnect(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator("CONNECT", data);
}

export function HttpTrace(url?: string): ClassDecorator;
export function HttpTrace(target: any): void;
export function HttpTrace(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator("TRACE", data);
}

export function HttpMove(url?: string): ClassDecorator;
export function HttpMove(target: any): void;
export function HttpMove(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator("MOVE", data);
}

export function HttpCopy(url?: string): ClassDecorator;
export function HttpCopy(target: any): void;
export function HttpCopy(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator("COPY", data);
}

export function HttpLink(url?: string): ClassDecorator;
export function HttpLink(target: any): void;
export function HttpLink(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator("LINK", data);
}

export function HttpUnlink(url?: string): ClassDecorator;
export function HttpUnlink(target: any): void;
export function HttpUnlink(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator("UNLINK", data);
}

export function HttpWrapped(url?: string): ClassDecorator;
export function HttpWrapped(target: any): void;
export function HttpWrapped(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator("WRAPPED", data);
}

export function HttpCustom(method: string, url?: string): ClassDecorator {
  return createHttpMethodDecorator(method, url);
}
