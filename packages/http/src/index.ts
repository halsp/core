import { Dict, ReadonlyDict } from "@halsp/core";
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
  HeadersDict,
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

declare module "@halsp/core" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Middleware extends ResultHandler, HeaderHandler {}

  interface Request extends HeaderHandler {
    get headers(): ReadonlyHeadersDict;

    get overrideMethod(): string | undefined;
    get method(): string;
    setMethod(method: string): this;

    get query(): ReadonlyDict<string>;
    setQuery(key: string, value: string): this;
    setQuery(query: Dict<string>): this;
  }

  interface Response extends ResultHandler, HeaderHandler {
    get isSuccess(): boolean;
    get headers(): ReadonlyHeadersDict;

    get status(): number;
    set status(val: number);
    setStatus(status: StatusCodes): this;
  }
}
