interface Options extends Object {
  encoding?: BufferEncoding;
  method?: string | string[];
  strictMethod?: boolean;
  use404?: string | true;
  use405?: string | true;
}

export interface DirectoryOptions extends Options {
  dir: string;
  prefix?: string;
  exclude?: string | string[];
  listDir?: boolean;
  useIndex?: string | string[] | true;
  useExt?: string | string[] | true;
}

export interface FileOptions extends Options {
  file: string;
  reqPath?: string | string[];
}
