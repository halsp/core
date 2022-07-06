export type AliRes = {
  statusCode: number;
  headers: Record<string, string>;
  setStatusCode: (code: number) => void;
  setHeader: (key: string, val: string) => void;
  deleteHeader: (key: string) => void;
  hasHeader: (key: string) => boolean;
  send: (val: string | Buffer) => void;
};
