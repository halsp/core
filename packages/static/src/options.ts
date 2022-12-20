interface Options extends Object {
  encoding?: BufferEncoding;
  method?: string | string[];
  use405?: boolean;
}

export interface DirectoryOptions extends Options {
  dir: string;
  prefix?: string;
  file404?: string | true;
  fileIndex?: string | true;
}

export interface FileOptions extends Options {
  file: string;
  reqPath?: string;
}
