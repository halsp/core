import { Dict, ReadonlyDict } from "@ipare/core";

export type HeaderValue = string | string[];
export type NumericalHeaderValue = string | number | (number | string)[];
export type HeadersDict = Dict<HeaderValue>;
export type ReadonlyHeadersDict = ReadonlyDict<HeaderValue>;
export type NumericalHeadersDict = ReadonlyDict<NumericalHeaderValue>;

export type QueryDict = Dict<string>;
export type ReadonlyQueryDict = ReadonlyDict<string>;
