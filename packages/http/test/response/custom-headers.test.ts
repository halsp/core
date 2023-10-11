import { HeadersDict, HeaderHandler, initHeaderHandler } from "../../src";

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class CustomHeader {
  constructor() {
    initHeaderHandler(
      this,
      () => this.headers,
      () => this.headers,
    );
  }

  readonly headers: HeadersDict = {};
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-unsafe-declaration-merging
interface CustomHeader extends HeaderHandler {}

test("custom halsp headers", async () => {
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
