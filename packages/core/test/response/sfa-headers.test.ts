import { HeadersDict, HeaderHandler } from "../../src";

class CustomHeader extends HeaderHandler {
  constructor() {
    super(() => this.headers);
  }

  readonly headers: HeadersDict = {};
}

test("custom sfa headers", async () => {
  const header = new CustomHeader()
    .setHeader("h1", "1")
    .setHeaders({
      h2: "2",
      h3: 3,
    })
    .removeHeader("h2");

  expect(header.getHeader("h1")).toBe("1");
  expect(header.getHeader("h2")).toBeUndefined;
  expect(header.getHeader("h3")).toBe("3");
});
