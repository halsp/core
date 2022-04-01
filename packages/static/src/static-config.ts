interface Config extends Object {
  encoding?: BufferEncoding;
  method?: string | string[];
}

export interface StaticConfig extends Config {
  dir: string;
  prefix?: string;
  file404?: string | true;
}

export interface SingleStaticConfig extends Config {
  file: string;
  reqPath?: string;
}
