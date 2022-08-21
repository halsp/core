import cookie from "cookie";

export interface Options {
  serialize?: cookie.CookieSerializeOptions;
  parse?: cookie.CookieParseOptions;
}
