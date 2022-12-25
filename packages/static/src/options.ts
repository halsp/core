interface Options extends Object {
  encoding?: BufferEncoding;
  method?: string | string[];
  file404?: string | true;
  file405?: string | true;
  generic405?: boolean;
}

export interface DirectoryOptions extends Options {
  dir: string;
  prefix?: string;
  exclude?: string | string[];
  listDir?: boolean;
  fileIndex?: string | true;
}

export interface FileOptions extends Options {
  file: string;
  reqPath?: string | string[];
}
