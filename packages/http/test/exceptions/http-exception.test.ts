import {
  HttpException,
  StatusCodes,
  getReasonPhrase,
  BadRequestException,
  BadGatewayException,
  ConflictException,
  ForbiddenException,
  GatewayTimeoutException,
  GoneException,
  HttpVersionNotSupportedException,
  ImATeapotException,
  InternalServerErrorException,
  MethodNotAllowedException,
  MisdirectedException,
  NotAcceptableException,
  NotFoundException,
  NotImplementedException,
  PreconditionFailedException,
  RequestTimeoutException,
  RequestTooLongException,
  ServiceUnavailableException,
  UnauthorizedException,
  UnprocessableEntityException,
  UnsupportedMediaTypeException,
  createContext,
} from "../../src";

test("base http exception", () => {
  const ex = new HttpException(StatusCodes.BAD_REQUEST).setHeaders((header) =>
    header.setHeader("h1", "1").setHeader("h2", "2")
  );
  expect(ex.error).toBeUndefined();
  expect(ex.message).toBe(getReasonPhrase(StatusCodes.BAD_REQUEST));

  const ctx = createContext().catchError(ex);
  expect(ctx.res.headers["h1"]).toBe("1");
  expect(ctx.res.headers["h2"]).toBe("2");
  expect(ctx.res.status).toBe(StatusCodes.BAD_REQUEST);
  expect(ctx.res.body).toEqual({
    message: getReasonPhrase(StatusCodes.BAD_REQUEST),
    status: StatusCodes.BAD_REQUEST,
  });
});

test("http exception string error", () => {
  const ex = new HttpException(StatusCodes.BAD_REQUEST, "err");
  expect(ex.error).toBe("err");
  expect(ex.message).toBe("err");

  const ctx = createContext().catchError(ex);
  expect(ctx.res.body).toEqual({
    message: "err",
    status: StatusCodes.BAD_REQUEST,
  });
});

test("http exception object error", () => {
  const ex = new HttpException(StatusCodes.BAD_REQUEST, {
    a: 1,
  });
  expect(ex.error).toEqual({ a: 1 });
  expect(ex.message).toBe(getReasonPhrase(StatusCodes.BAD_REQUEST));

  const ctx = createContext().catchError(ex);
  expect(ctx.res.body).toEqual({
    message: getReasonPhrase(StatusCodes.BAD_REQUEST),
    status: StatusCodes.BAD_REQUEST,
    a: 1,
  });
});

test("http exception object error with message", () => {
  const ex = new HttpException(StatusCodes.BAD_REQUEST, {
    message: "err",
  });
  expect(ex.error).toEqual({ message: "err" });
  expect(ex.message).toBe("err");
});

const exceptions = [
  {
    constructor: BadGatewayException,
    status: StatusCodes.BAD_GATEWAY,
  },
  {
    constructor: BadRequestException,
    status: StatusCodes.BAD_REQUEST,
  },
  {
    constructor: ConflictException,
    status: StatusCodes.CONFLICT,
  },
  {
    constructor: ForbiddenException,
    status: StatusCodes.FORBIDDEN,
  },
  {
    constructor: GatewayTimeoutException,
    status: StatusCodes.GATEWAY_TIMEOUT,
  },
  {
    constructor: GoneException,
    status: StatusCodes.GONE,
  },
  {
    constructor: HttpVersionNotSupportedException,
    status: StatusCodes.HTTP_VERSION_NOT_SUPPORTED,
  },
  {
    constructor: ImATeapotException,
    status: StatusCodes.IM_A_TEAPOT,
  },
  {
    constructor: InternalServerErrorException,
    status: StatusCodes.INTERNAL_SERVER_ERROR,
  },
  {
    constructor: MethodNotAllowedException,
    status: StatusCodes.METHOD_NOT_ALLOWED,
  },
  {
    constructor: MisdirectedException,
    status: StatusCodes.MISDIRECTED_REQUEST,
  },
  {
    constructor: NotAcceptableException,
    status: StatusCodes.NOT_ACCEPTABLE,
  },
  {
    constructor: NotFoundException,
    status: StatusCodes.NOT_FOUND,
  },
  {
    constructor: NotImplementedException,
    status: StatusCodes.NOT_IMPLEMENTED,
  },
  {
    constructor: PreconditionFailedException,
    status: StatusCodes.PRECONDITION_FAILED,
  },
  {
    constructor: RequestTimeoutException,
    status: StatusCodes.REQUEST_TIMEOUT,
  },
  {
    constructor: RequestTooLongException,
    status: StatusCodes.REQUEST_TOO_LONG,
  },
  {
    constructor: ServiceUnavailableException,
    status: StatusCodes.SERVICE_UNAVAILABLE,
  },
  {
    constructor: UnauthorizedException,
    status: StatusCodes.UNAUTHORIZED,
  },
  {
    constructor: UnprocessableEntityException,
    status: StatusCodes.UNPROCESSABLE_ENTITY,
  },
  {
    constructor: UnsupportedMediaTypeException,
    status: StatusCodes.UNSUPPORTED_MEDIA_TYPE,
  },
];

test("base extended exceptions", () => {
  exceptions.forEach((exception) => {
    const ex = new exception.constructor();
    expect(ex.status).toBe(exception.status);
    expect(ex.error).toBeUndefined();
    expect(ex.message).toBe(getReasonPhrase(exception.status));
  });
});

test("extended exceptions with string error", () => {
  exceptions.forEach((exception) => {
    const ex = new exception.constructor("err");
    expect(ex.status).toBe(exception.status);
    expect(ex.error).toBe("err");
    expect(ex.message).toBe("err");
  });
});

test("extended exceptions with object error", () => {
  exceptions.forEach((exception) => {
    const ex = new exception.constructor({
      a: 1,
    });
    expect(ex.status).toBe(exception.status);
    expect(ex.error).toEqual({ a: 1 });
    expect(ex.message).toBe(getReasonPhrase(exception.status));
  });
});
