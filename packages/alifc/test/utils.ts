import "../src";
import { AliReq, AliRes } from "../src";
import * as http from "http";
import { Socket } from "net";

export function newAliReq(): AliReq {
  const result = new http.IncomingMessage(new Socket()) as AliReq;
  Object.assign(result, {
    path: "",
    method: "",
    headers: {} as Record<string, string>,
    queries: {} as Record<string, string>,
    url: "",
    clientIP: "",
  });
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function newAliRes(): AliRes & { _body: any } {
  const aliRes = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _body: undefined as any,
    statusCode: 404,
    headers: {} as Record<string, string>,
    setStatusCode: (code: number) => {
      aliRes.statusCode = code;
    },
    setHeader: (key: string, val: string) => {
      aliRes.headers[key] = val;
    },
    deleteHeader: (key: string) => {
      delete aliRes.headers[key];
    },
    hasHeader: (key: string) => {
      return Object.keys(aliRes.headers).includes(key);
    },
    send: (val: string | Buffer) => {
      aliRes._body = val;
    },
  };
  return aliRes;
}
