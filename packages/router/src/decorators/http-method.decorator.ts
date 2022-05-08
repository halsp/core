import { HttpMethod } from "@sfajs/core";
import "reflect-metadata";
import { MethodItem } from "../action/method-item";
import { ACTION_METHOD_METADATA } from "../constant";

function setHttpMethodMetadata(target: any, method: HttpMethod, url?: string) {
  const methods: MethodItem[] =
    Reflect.getMetadata(ACTION_METHOD_METADATA, target) ?? [];
  methods.push({
    method: method,
    url: url ?? "",
  });
  Reflect.defineMetadata(ACTION_METHOD_METADATA, methods, target);
}

function createHttpMethodDecorator(
  method: HttpMethod,
  url?: string
): ClassDecorator;
function createHttpMethodDecorator(method: HttpMethod, target: any): void;
function createHttpMethodDecorator(
  method: HttpMethod,
  data?: any
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
  return createHttpMethodDecorator(HttpMethod.get, data);
}

export function HttpPost(url?: string): ClassDecorator;
export function HttpPost(target: any): void;
export function HttpPost(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator(HttpMethod.post, data);
}

export function HttpPatch(url?: string): ClassDecorator;
export function HttpPatch(target: any): void;
export function HttpPatch(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator(HttpMethod.patch, data);
}

export function HttpDelete(url?: string): ClassDecorator;
export function HttpDelete(target: any): void;
export function HttpDelete(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator(HttpMethod.delete, data);
}

export function HttpPut(url?: string): ClassDecorator;
export function HttpPut(target: any): void;
export function HttpPut(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator(HttpMethod.put, data);
}

export function HttpHead(url?: string): ClassDecorator;
export function HttpHead(target: any): void;
export function HttpHead(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator(HttpMethod.head, data);
}

export function HttpOptions(url?: string): ClassDecorator;
export function HttpOptions(target: any): void;
export function HttpOptions(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator(HttpMethod.options, data);
}

export function HttpConnect(url?: string): ClassDecorator;
export function HttpConnect(target: any): void;
export function HttpConnect(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator(HttpMethod.connect, data);
}

export function HttpTrace(url?: string): ClassDecorator;
export function HttpTrace(target: any): void;
export function HttpTrace(data?: any): ClassDecorator | void {
  return createHttpMethodDecorator(HttpMethod.trace, data);
}

export function HttpCustom(method: string, url?: string): ClassDecorator {
  return createHttpMethodDecorator(method, url);
}
