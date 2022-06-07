interface Options extends Object {
  encoding?: BufferEncoding;
  method?: string | string[];
}

export interface StaticOptions extends Options {
  dir: string;
  prefix?: string;
  file404?: string | true;
}

export interface SingleStaticOptions extends Options {
  file: string;
  reqPath?: string;
}
