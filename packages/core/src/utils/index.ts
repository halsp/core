import isPlainObj from "./isPlainObj";
import { Dict, ReadonlyDict } from "@sfajs/header";

export type QueryDict = Dict<string>;
export type ReadonlyQueryDict = ReadonlyDict<string>;

export { isPlainObj };
