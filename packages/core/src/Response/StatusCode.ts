const enum StatusCode {
  ok = 200,
  created = 201,
  accepted = 202,
  noContent = 204,
  partialContent = 206,
  redirect301 = 301,
  redirect302 = 302,
  redirect303 = 303,
  redirect307 = 307,
  redirect308 = 308,
  badRequest = 400,
  unauthorized = 401,
  forbidden = 403,
  notFound = 404,
  methodNotAllowedMsg = 405,
  errRequest = 500,
}

export default StatusCode;
