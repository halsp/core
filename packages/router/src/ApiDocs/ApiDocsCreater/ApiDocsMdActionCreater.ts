import ApiDocs from "..";
import PathParser from "../../Router/PathParser";
import ApiDocsConfig from "../ApiDocsConfig";
import ApiDocsParam from "../ApiDocsParam";
import ApiDocsIOParams from "../ApiDocsParam/ApiDocsIOParams";
import ApiDocsStateCode from "../ApiDocsParam/ApiDocsStateCode";
import ApiDocsConfigPart from "../ApiDocsConfig/ApiDocsConfigPart";
import Action from "../../Action";

export default class ApiDocsMdActionCreater {
  constructor(
    private readonly rPath: string,
    private readonly docs: ApiDocs,
    private readonly config: ApiDocsConfig,
    private readonly action: Action
  ) {}

  public get result(): string {
    let result = this.getTitle();
    result += "\n\n";
    result += this.getDesc();
    result += "\n\n";

    if (this.docs.input) {
      result += this.getInputParams();
      result += "\n\n";
    }

    if (this.docs.output) {
      result += this.getOutputParams();
    }

    return result.trimEnd();
  }

  private get partConfigs(): ApiDocsConfigPart[] {
    if (!this.config || !this.config.parts) return [];
    return this.config.parts;
  }

  private getTitle(): string {
    const pathParser = new PathParser(this.rPath);
    const httpMethod = pathParser.httpMethod;

    let result = `## `;
    result += `${httpMethod ? httpMethod : "ANY"}`;
    result += ` `;
    if (this.docs.name) {
      result += `${this.docs.name}`;
      result += `\n\n> `;
    }

    let pwhmae = pathParser.pathWithoutHttpMethodAndExtension;
    pwhmae = pwhmae.replace(/\/\^/, "/:");
    pwhmae = pwhmae.replace(/^\^/, ":");
    result += `/${pwhmae}`;
    return result;
  }

  private getDesc() {
    if (!this.docs.desc) return "";
    let result = "### Desc \n\n";
    result += this.docs.desc || "Empty";
    return result;
  }

  private getInputParams(): string {
    if (!this.docs.input) return "";
    let result = "### Input\n\n";

    if (this.docs.input.desc) {
      result += this.docs.input.desc;
      result += "\n\n";
    }

    const bpResult = this.getBaseParams(
      this.docs.input,
      this.getBasePartParams("inputHeaders")
    );
    if (bpResult) {
      result += bpResult;
      result += "\n\n";
    }

    const params = <ApiDocsParam[]>[];
    params.push(...(this.getBasePartParams("params") || <ApiDocsParam[]>[]));
    params.push(...(this.docs.input.params || <ApiDocsParam[]>[]));
    if (params && params.length) {
      result += "#### Params\n\n";
      result += this.getParams(params);
      result += "\n\n";
    }

    const query = <ApiDocsParam[]>[];
    query.push(...(this.getBasePartParams("query") || <ApiDocsParam[]>[]));
    query.push(...(this.docs.input.query || <ApiDocsParam[]>[]));
    if (query && query.length) {
      result += "#### Query\n\n";
      result += this.getParams(query);
      result += "\n\n";
    }

    return result.trimEnd();
  }

  private getOutputParams(): string {
    if (!this.docs.output) return "";
    let result = "### Output\n\n";

    if (this.docs.output.desc) {
      result += this.docs.output.desc;
      result += "\n\n";
    }

    const codes = <ApiDocsStateCode[]>[];
    codes.push(
      ...(<ApiDocsStateCode[]>this.getBasePartParams("codes") ||
        <ApiDocsStateCode[]>[])
    );
    codes.push(...(this.docs.output.codes || <ApiDocsStateCode[]>[]));
    if (codes && codes.length) {
      result += `#### Status Code\n\n`;
      for (let i = 0; i < codes.length; i++) {
        const code = codes[i];
        result += `- ${code.code}`;
        if (code.desc) {
          result += `: ${code.desc}`;
        }
        result += "\n";
      }
      result += "\n";
    }

    const bpResult = this.getBaseParams(
      this.docs.output,
      this.getBasePartParams("outputHeaders")
    );
    if (bpResult) {
      result += bpResult;
    }

    return result.trimEnd();
  }

  private getBasePartParams(
    prop: "inputHeaders" | "query" | "outputHeaders" | "params" | "codes"
  ): (ApiDocsParam | ApiDocsStateCode)[] {
    const partConfigs = this.partConfigs;
    const result = <(ApiDocsParam | ApiDocsStateCode)[]>[];
    if (
      this.docs.parts == "@auth" ||
      (!this.docs.parts && this.config.partsFromAuth)
    ) {
      if (this.action.roles && this.action.roles.length) {
        this.docs.parts = (<string[]>[]).concat(this.action.roles);
      }
    }
    if (this.docs.parts && Array.isArray(this.docs.parts)) {
      this.docs.parts.forEach((part) => {
        const mcs = partConfigs.filter((config) => config.name == part);
        mcs.forEach((mcsItem) => {
          if (mcsItem[prop]) {
            result.push(
              ...(mcsItem[prop] as (ApiDocsParam | ApiDocsStateCode)[])
            );
          }
        });
      });
    }
    return result;
  }

  private getBaseParams(params: ApiDocsIOParams, baseHeaders?: ApiDocsParam[]) {
    let result = "";

    const headers = <ApiDocsParam[]>[];
    headers.push(...(baseHeaders || <ApiDocsParam[]>[]));
    headers.push(...(params.headers || <ApiDocsParam[]>[]));
    if (headers && headers.length) {
      result += "#### Headers\n\n";
      result += this.getParams(headers);
      result += "\n\n";
    }

    if (params.body) {
      result += "#### Body\n\n";
      if (Array.isArray(params.body)) {
        result += this.getParams(params.body);
      } else {
        result += this.getParam(params.body);
      }
      result += "\n\n";
    }

    return result.trimEnd();
  }

  private getParams(params: ApiDocsParam[]) {
    let result = "";
    for (let i = 1; i <= params.length; i++) {
      result += this.getParam(params[i - 1], 0, i);
      result += "\n";
    }
    return result.trimEnd();
  }

  private getParam(param: ApiDocsParam, depth = 0, index?: number): string {
    if (index && !param.name) return "";

    let result = this.padLeft(depth);

    const nextDepth = index ? depth + 1 : depth;
    if (index) {
      result += index;
      result += ". ";
      result += param.name;
      result += "\n";
    }

    if (param.type) {
      result += this.padLeft(nextDepth);
      result += "- Type: ";
      result += param.type;
      result += "\n";
    }

    if (param.desc) {
      result += this.padLeft(nextDepth);
      result += "- Desc: ";
      result += param.desc;
      result += "\n";
    }

    if (param.children) {
      result += this.padLeft(nextDepth);
      result += "- Children:";
      result += "\n";

      for (let i = 1; i <= param.children.length; i++) {
        result += this.getParam(param.children[i - 1], nextDepth, i);
        result += "\n";
      }
    }

    return result.trimEnd();
  }

  private padLeft(depth: number) {
    let result = "";
    for (let i = 0; i < depth; i++) {
      result += "   ";
    }
    return result;
  }
}
