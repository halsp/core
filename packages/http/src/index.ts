import { ResultHandler, initContext } from "./context";

export {
  StatusCodes,
  getStatusCode,
  ReasonPhrases,
  getReasonPhrase,
} from "http-status-codes";

export { HttpMethod } from "./http-method";

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
}

initContext();
