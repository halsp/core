import { createBadRequestError } from "../../src/pipes/error";
import { BadRequestException } from "@halsp/http";
import { MicroException } from "@halsp/micro";

describe("parse failed", () => {
  it("should create BadRequestException if env is http", async () => {
    process.env.HALSP_ENV = "http";
    const err = await createBadRequestError("test");

    expect(err instanceof BadRequestException).toBeTruthy();
    expect(err.message).toBe("test");
  });

  it("should create BadRequestException if env is micro", async () => {
    process.env.HALSP_ENV = "micro";
    const err = await createBadRequestError("test");

    expect(err instanceof MicroException).toBeTruthy();
    expect(err.message).toBe("test");
  });

  it("should create BadRequestException if env is unknow", async () => {
    process.env.HALSP_ENV = "" as any;
    const err = await createBadRequestError("test");

    expect(err instanceof Error).toBeTruthy();
    expect(err.message).toBe("test");
  });
});
