import { StatusCodes } from "http-status-codes";
import { ResponseError } from "../../src";

test("response error", async function () {
  try {
    throw new ResponseError("error test");
  } catch (err) {
    expect(err.message).toBe("error test");
    expect(err.body).toEqual({});
    expect(err instanceof ResponseError).toBeTruthy();
    expect(err.status).toBe(500);
  }
});

test("response error", async function () {
  try {
    throw new ResponseError()
      .setStatus(StatusCodes.BAD_REQUEST)
      .setHeader("t1", "1")
      .setHeaders({
        t2: "2",
        t3: "3",
      })
      .setBody("test body");
  } catch (err) {
    const error = err as ResponseError;
    expect(error.body).toBe("test body");
    expect(error.status).toBe(400);
    expect(error.headers.t1).toBe("1");
    expect(error.headers.t2).toBe("2");
    expect(error.headers.t3).toBe("3");
    expect(error.headers.t4).toBe(undefined);
  }
});
