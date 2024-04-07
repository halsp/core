import { createBadRequestError } from "../src/error";

describe("validate failed", () => {
  it("should create BadRequestException if env is http", async () => {
    process.env.HALSP_ENV = "http";
    const err = createBadRequestError("test");

    const { BadRequestException } = _require("@halsp/http");
    expect(err instanceof BadRequestException).toBeTruthy();
    expect(err.message).toBe("test");
  });

  it("should create BadRequestException if env is micro", async () => {
    process.env.HALSP_ENV = "micro";
    const err = createBadRequestError("test");

    const { MicroException } = _require("@halsp/micro");
    expect(err instanceof MicroException).toBeTruthy();
    expect(err.message).toBe("test");
  });

  it("should create BadRequestException if env is unknow", async () => {
    process.env.HALSP_ENV = "" as any;
    const err = createBadRequestError("test");

    expect(err instanceof Error).toBeTruthy();
    expect(err.message).toBe("test");
  });
});
