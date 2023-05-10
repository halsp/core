import { Request, Response } from "@halsp/core";

const idMap = new WeakMap<Request, string>();
Object.defineProperty(Request.prototype, "id", {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!idMap.has(this)) {
      idMap.set(this, "");
    }
    return idMap.get(this);
  },
});
Request.prototype.setId = function (id: string) {
  idMap.set(this, id);
  return this;
};
Request.prototype.setPayload = function (val: any) {
  return this.setBody(val);
};

Object.defineProperty(Request.prototype, "pattern", {
  configurable: true,
  enumerable: true,
  get: function () {
    const req = this as Request;
    return req.path;
  },
});

Object.defineProperty(Request.prototype, "payload", {
  configurable: true,
  enumerable: true,
  get: function () {
    const req = this as Request;
    return req.body;
  },
});

const errorMap = new WeakMap<Response, string | undefined>();
Object.defineProperty(Response.prototype, "error", {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!errorMap.has(this)) {
      errorMap.set(this, undefined);
    }
    return errorMap.get(this);
  },
  set: function (val) {
    errorMap.set(this, val);
  },
});
Response.prototype.setError = function (error?: string) {
  this.error = error;
  return this;
};
Response.prototype.setPayload = function (val: any) {
  this.payload = val;
  return this;
};
Object.defineProperty(Response.prototype, "payload", {
  configurable: true,
  enumerable: true,
  get: function () {
    const req = this as Response;
    return req.body;
  },
  set: function (val) {
    const req = this as Response;
    req.body = val;
  },
});
