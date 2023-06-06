import { PipeItem } from "../pipes";
import { createDecorator } from "../pipes/create-decorator";

export function Query(
  property: string,
  ...pipes: PipeItem[]
): PropertyDecorator & ParameterDecorator;
export function Query(
  ...pipes: PipeItem[]
): PropertyDecorator & ParameterDecorator;
export function Query(target: any, propertyKey: string | symbol): void;
export function Query(
  target: any,
  propertyKey: string | symbol | undefined,
  parameterIndex: number
): void;
export function Query(...args: any[]): any {
  return createDecorator("query", args);
}

export function Body(
  property: string,
  ...pipes: PipeItem[]
): PropertyDecorator & ParameterDecorator;
export function Body(
  ...pipes: PipeItem[]
): PropertyDecorator & ParameterDecorator;
export function Body(target: any, propertyKey: string | symbol): void;
export function Body(
  target: any,
  propertyKey: string | symbol | undefined,
  parameterIndex: number
): void;
export function Body(...args: any[]): any {
  return createDecorator("body", args);
}

export function Param(
  property: string,
  ...pipes: PipeItem[]
): PropertyDecorator & ParameterDecorator;
export function Param(
  ...pipes: PipeItem[]
): PropertyDecorator & ParameterDecorator;
export function Param(target: any, propertyKey: string | symbol): void;
export function Param(
  target: any,
  propertyKey: string | symbol | undefined,
  parameterIndex: number
): void;
export function Param(...args: any[]): any {
  return createDecorator("param", args);
}

export function Header(
  property: string,
  ...pipes: PipeItem[]
): PropertyDecorator & ParameterDecorator;
export function Header(
  ...pipes: PipeItem[]
): PropertyDecorator & ParameterDecorator;
export function Header(target: any, propertyKey: string | symbol): void;
export function Header(
  target: any,
  propertyKey: string | symbol | undefined,
  parameterIndex: number
): void;
export function Header(...args: any[]): any {
  return createDecorator("header", args);
}
