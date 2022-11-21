import { createBadRequestError } from "../src/error";

describe("validate failed", () => {
  it("should create BadRequestException if env is http", async () => {
    process.env.IPARE_ENV = "http";
    const err = createBadRequestError("test");

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { BadRequestException } = require("@ipare/http");
    expect(err instanceof BadRequestException).toBeTruthy();
    expect(err.message).toBe("test");
  });

  it("should create BadRequestException if env is micro", async () => {
    process.env.IPARE_ENV = "micro";
    const err = createBadRequestError("test");

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MicroException } = require("@ipare/micro");
    expect(err instanceof MicroException).toBeTruthy();
    expect(err.message).toBe("test");
  });

  it("should create BadRequestException if env is unknow", async () => {
    process.env.IPARE_ENV = "" as any;
    const err = createBadRequestError("test");

    expect(err instanceof Error).toBeTruthy();
    expect(err.message).toBe("test");
  });
});
