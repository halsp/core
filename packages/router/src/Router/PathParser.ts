import { HttpMethod } from "sfa";

export default class PathParser {
  private readonly relativePath: string;
  private readonly relativePathWithoutExtension: string;
  constructor(relativePath: string) {
    this.relativePath = relativePath.replace(/\\/g, "/");

    const dotIndex = this.relativePath.lastIndexOf(".");
    this.relativePathWithoutExtension =
      dotIndex > 0 ? this.relativePath.substr(0, dotIndex) : this.relativePath;
  }

  public get fileName(): string {
    return this.getFileName(this.relativePath);
  }

  public get fileNameWithoutExtension(): string {
    return this.getFileName(this.relativePathWithoutExtension);
  }

  private getFileName(path: string) {
    const index = path.lastIndexOf("/");
    return path.substr(index + 1, path.length - index - 1);
  }

  public get httpMethod(): HttpMethod | undefined {
    const fnwe = this.fileNameWithoutExtension;
    return HttpMethod.matched(fnwe);
  }

  public get pathWithoutHttpMethod(): string {
    return this.getPathWithoutHttpMethod(this.relativePath);
  }

  public get pathWithoutHttpMethodAndExtension(): string {
    return this.getPathWithoutHttpMethod(this.relativePathWithoutExtension);
  }

  private getPathWithoutHttpMethod(path: string) {
    if (!this.httpMethod) return path;
    else {
      const index = path.lastIndexOf("/");
      return path.substr(0, index);
    }
  }
}
