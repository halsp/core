import type ws from "ws";
import type http from "http";

export interface Options {
  keepAliveTimeout?: number;
  allowedOrigins?: string[];

  backlog?: number | undefined;
  verifyClient?:
    | ws.VerifyClientCallbackAsync
    | ws.VerifyClientCallbackSync
    | undefined;
  handleProtocols?: (
    protocols: Set<string>,
    request: http.IncomingMessage
  ) => string | false;
  clientTracking?: boolean | undefined;
  perMessageDeflate?: boolean | ws.PerMessageDeflateOptions | undefined;
  maxPayload?: number | undefined;
  skipUTF8Validation?: boolean | undefined;
  WebSocket?: typeof ws.WebSocket;
}
