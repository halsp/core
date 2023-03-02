import { Dict, ReadonlyDict } from "@halsp/common";

export type HeaderValue = string | string[];
export type NumericalHeaderValue = string | number | (number | string)[];
export type HeadersDict = Dict<HeaderValue>;
export type ReadonlyHeadersDict = ReadonlyDict<HeaderValue>;
export type NumericalHeadersDict = ReadonlyDict<NumericalHeaderValue>;
