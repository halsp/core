import { createBadRequestError } from "../src/error";

describe("validate failed", () => {
  it("should create BadRequestException if env is http", async () => {
    process.env.IS_IPARE_HTTP = "true";
    process.env.IS_IPARE_MICRO = "" as any;
    const err = createBadRequestError("test");

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { BadRequestException } = require("@ipare/http");
    expect(err instanceof BadRequestException).toBeTruthy();
    expect(err.message).toBe("test");
  });

  it("should create BadRequestException if env is micro", async () => {
    process.env.IS_IPARE_HTTP = "" as any;
    process.env.IS_IPARE_MICRO = "true";
    const err = createBadRequestError("test");

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { MicroException } = require("@ipare/micro");
    expect(err instanceof MicroException).toBeTruthy();
    expect(err.message).toBe("test");
  });

  it("should create BadRequestException if env is unknow", async () => {
    process.env.IS_IPARE_HTTP = "" as any;
    process.env.IS_IPARE_MICRO = "" as any;
    const err = createBadRequestError("test");

    expect(err instanceof Error).toBeTruthy();
    expect(err.message).toBe("test");
  });
});
