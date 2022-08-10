interface Options extends Object {
  encoding?: BufferEncoding;
  method?: string | string[];
}

export interface DirectoryOptions extends Options {
  dir: string;
  prefix?: string;
  file404?: string | true;
}

export interface FileOptions extends Options {
  file: string;
  reqPath?: string;
}
