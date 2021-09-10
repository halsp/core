export default class MapItem {
  constructor(public readonly path: string) {}

  public get fileName(): string {
    return this.path.replace(/^.*\//, "");
  }
  public get fileNameWithoutExtension(): string {
    return this.fileName.replace(/\.[^\.]+$/, "");
  }
  public get actionName(): string {
    return this.fileName.replace(/\..*$/, "");
  }
  public get reqPath(): string {
    const pPath = this.path.substr(0, this.path.length - this.fileName.length);
    return (pPath + this.actionName).replace(/\/+$/, "");
  }
  public get methods(): string[] {
    return this.fileNameWithoutExtension
      .split(".")
      .filter((item) => !!item)
      .splice(this.fileNameWithoutExtension.startsWith(".") ? 0 : 1)
      .map((item) => item.toUpperCase());
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
