export default class MapItem {
  constructor(public readonly path: string) {}

  private get fileName(): string {
    return this.path.replace(/^.*\//, "");
  }
  public get reqPath(): string {
    const actionName = this.fileName.replace(/\..*$/, "").replace(/^_$/, "");
    const pPath = this.path.substr(0, this.path.length - this.fileName.length);
    return (pPath + actionName).replace(/\/+$/, "");
  }
  public get methods(): string[] {
    return this.fileName
      .replace(/\.[^\.]+$/, "")
      .split(".")
      .splice(this.fileName.startsWith("_") ? 0 : 1)
      .filter((item) => !!item)
      .map((item) => item.toUpperCase());
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
