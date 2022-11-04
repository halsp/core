import { Dict, ReadonlyDict } from "@ipare/core";
import { StatusCodes } from "http-status-codes";
import { ResultHandler, HeaderHandler } from "./context";
import { ReadonlyHeadersDict } from "./types";

export {
  StatusCodes,
  getStatusCode,
  ReasonPhrases,
  getReasonPhrase,
} from "http-status-codes";

export {
  HttpException,
  BadGatewayException,
  GoneException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  ImATeapotException,
  BadRequestException,
  MisdirectedException,
  UnauthorizedException,
  NotAcceptableException,
  GatewayTimeoutException,
  NotImplementedException,
  RequestTimeoutException,
  RequestTooLongException,
  MethodNotAllowedException,
  PreconditionFailedException,
  ServiceUnavailableException,
  UnprocessableEntityException,
  InternalServerErrorException,
  UnsupportedMediaTypeException,
  HttpVersionNotSupportedException,
} from "./exceptions";

export {
  QueryDict,
  HeadersDict,
  ReadonlyQueryDict,
  ReadonlyHeadersDict,
  NumericalHeadersDict,
  HeaderValue,
  NumericalHeaderValue,
} from "./types";

export { HttpStartup } from "./startup";

export {
  initHeaderHandler,
  initResultHandler,
  HeaderHandler,
  ResultHandler,
} from "./context";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    export interface ProcessEnv {
      IS_IPARE_HTTP: "true";
    }
  }
}

declare module "@ipare/core" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Context extends ResultHandler {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Middleware extends ResultHandler {}

  interface Request extends HeaderHandler {
    get headers(): ReadonlyHeadersDict;

    get overrideMethod(): string | undefined;
    get method(): string;
    setMethod(method: string): this;

    get query(): ReadonlyDict<string>;
    setQuery(key: string, value: string): this;
    setQuery(query: Dict<string>): this;
  }

  interface Response extends ResultHandler {
    get isSuccess(): boolean;
    get headers(): ReadonlyHeadersDict;

    get status(): number;
    set status(val: number);
    setStatus(status: StatusCodes): this;
  }
}
