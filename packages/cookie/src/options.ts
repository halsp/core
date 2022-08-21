import { CookieParseOptions, CookieSerializeOptions } from "cookie";

export interface Options {
  serialize?: CookieSerializeOptions;
  parse?: CookieParseOptions;
}
