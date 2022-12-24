interface Options extends Object {
  encoding?: BufferEncoding;
  method?: string | string[];
  file404?: string | true;
  file405?: string | true;
}

export interface DirectoryOptions extends Options {
  dir: string;
  prefix?: string;
  fileIndex?: string | true;
  exclude?: string | string[];
  listDir?: boolean;
}

export interface FileOptions extends Options {
  file: string;
  reqPath?: string;
}
