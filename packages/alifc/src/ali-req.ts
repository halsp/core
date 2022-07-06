import * as http from "http";

export type AliReq = {
  path: string;
  method: string;
  url: string;
  clientIP: string;
  headers: Record<string, string>;
  queries: Record<string, string>;
} & http.IncomingMessage;
