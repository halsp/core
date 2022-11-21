import { createBadRequestError } from "../../src/pipes/error";
import { BadRequestException } from "@ipare/http";
import { MicroException } from "@ipare/micro";

describe("parse failed", () => {
  it("should create BadRequestException if env is http", async () => {
    process.env.IPARE_ENV = "http";
    const err = createBadRequestError("test");

    expect(err instanceof BadRequestException).toBeTruthy();
    expect(err.message).toBe("test");
  });

  it("should create BadRequestException if env is micro", async () => {
    process.env.IPARE_ENV = "micro";
    const err = createBadRequestError("test");

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
