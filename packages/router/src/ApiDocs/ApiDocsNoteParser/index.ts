import ApiDocs from "..";
import { readFileSync } from "fs";
import ApiDocsNoteParserStruct from "./ApiDocsNoteParserStruct";
import ApiDocsInputParams from "../ApiDocsParam/ApiDocsInputParams";
import ApiDocsParam from "../ApiDocsParam";
import ApiDocsOutputParams from "../ApiDocsParam/ApiDocsOutputParams";
import ApiDocsStateCode from "../ApiDocsParam/ApiDocsStateCode";

export default class ApiDocsNoteParser {
  constructor(private readonly file: string) {}

  public get docs(): ApiDocs | undefined {
    const note = this.note;
    if (!note) return;
    const parserResult = this.parser(note, 1);
    if (!parserResult) return;

    return this.structsToDocs(parserResult);
  }

  private get note(): string | undefined {
    const content = readFileSync(this.file, "utf-8");
    const regs = /(\/\*\*[\s]*\*[\s]*)(@action)([\s\S]*?\*\/)/gi.exec(content);
    if (!regs || !regs.length) return;

    const note = regs[0]
      .replace(/^[\s]*\*[\s]*$/gm, "")
      .replace(/^[\s]*\*[\s]*/gm, "")
      .replace(/[\s]*\/[\s]*$/, "")
      .replace(/^[\s]*\/\*\*[\s]*/, "");
    return note;
  }

  private structsToDocs(structs: ApiDocsNoteParserStruct[]): ApiDocs {
    const result = <ApiDocs>{};
    structs.forEach((struct) => {
      switch (struct.title.toLowerCase()) {
        case "action":
          result.name = struct.subtitle;
          result.desc = struct.content;
          break;
        case "parts":
          if (struct.subtitle == "@auth") {
            result.parts = "@auth";
          } else if (struct.subtitle) {
            result.parts = struct.subtitle.split(" ");
          }
          break;
        case "input":
          const input = <ApiDocsInputParams>{};
          result.input = input;
          if (struct.subtitle) {
            result.input.desc = struct.subtitle;
          }
          if (struct.children) {
            struct.children.forEach((cStruct) => {
              switch (cStruct.title.toLowerCase()) {
                case "headers":
                  if (cStruct.children) {
                    input.headers = this.structsToParams(cStruct.children);
                  }
                  break;
                case "params":
                  if (cStruct.children) {
                    input.params = this.structsToParams(cStruct.children);
                  }
                  break;
                case "query":
                  if (cStruct.children) {
                    input.query = this.structsToParams(cStruct.children);
                  }
                  break;
                case "body":
                  if (
                    cStruct.subtitle &&
                    /^\{[\S]{1,}\}/.test(cStruct.subtitle)
                  ) {
                    input.body = this.structToParams(cStruct);
                  } else if (cStruct.children) {
                    input.body = this.structsToParams(cStruct.children);
                  }
                  break;
              }
            });
          }
          break;
        case "output":
          const output = <ApiDocsOutputParams>{};
          result.output = output;
          if (struct.subtitle) {
            result.output.desc = struct.subtitle;
          }
          if (struct.children) {
            struct.children.forEach((cStruct) => {
              switch (cStruct.title.toLowerCase()) {
                case "headers":
                  if (cStruct.children) {
                    output.headers = this.structsToParams(cStruct.children);
                  }
                  break;
                case "body":
                  if (cStruct.children) {
                    output.body = this.structsToParams(cStruct.children);
                  }
                  break;
                case "codes": {
                  if (cStruct.children) {
                    output.codes = this.structsToCodes(cStruct.children);
                  }
                }
              }
            });
          }
          break;
      }
    });
    return result;
  }

  private structsToCodes(
    structs: ApiDocsNoteParserStruct[]
  ): ApiDocsStateCode[] {
    const result = <ApiDocsStateCode[]>[];
    structs.forEach((struct) => {
      if (struct.title) {
        result.push({
          code: Number(struct.title),
          desc: struct.subtitle,
        });
      }
    });
    return result;
  }

  private structsToParams(structs: ApiDocsNoteParserStruct[]): ApiDocsParam[] {
    const result = <ApiDocsParam[]>[];
    structs.forEach((struct) => {
      result.push(this.structToParams(struct));
    });
    return result;
  }

  private structToParams(struct: ApiDocsNoteParserStruct): ApiDocsParam {
    let desc: undefined | string;
    let type: undefined | string;

    if (struct.subtitle && struct.subtitle.trim()) {
      const onlyTypeReg = /\{([\S]*)\}$/;
      const fullReg = /^\{([\S]{1,})\} ([\s\S]{1,})$/;
      if (onlyTypeReg.test(struct.subtitle)) {
        onlyTypeReg.exec(struct.subtitle);
        type = RegExp.$1;
      } else if (fullReg.test(struct.subtitle)) {
        fullReg.exec(struct.subtitle);
        type = RegExp.$1;
        desc = RegExp.$2;
      } else {
        desc = struct.subtitle;
      }
    }

    return {
      name: struct.title,
      type: type,
      desc: desc,
      children: struct.children
        ? this.structsToParams(struct.children)
        : undefined,
    };
  }

  private parser(
    note: string,
    deep: number
  ): ApiDocsNoteParserStruct[] | undefined {
    const reg = this.getRegExp(deep);
    const matchs = note.match(reg);
    if (!matchs || !matchs.length) return;
    const splits = note.split(reg);
    if (!splits || !splits.length) return;
    splits.splice(0, 1);
    if (matchs.length != splits.length) return;

    const result = [] as ApiDocsNoteParserStruct[];
    for (let i = 0; i < matchs.length; i++) {
      const header = matchs[i];
      let title: string;
      let subtitle: string;
      if (header.includes(" ")) {
        const headerStrs = header.split(" ");
        title = headerStrs[0];
        subtitle = header.replace(`${title} `, "");
      } else {
        title = header;
        subtitle = "";
      }
      title = this.removeProfix(title, deep);

      result.push({
        title: title,
        subtitle: subtitle,
        content: (splits[i] || "").trim(),
        children: splits[i] ? this.parser(splits[i], deep + 1) : undefined,
      });
    }
    return result;
  }

  private getRegExp(deep: number) {
    let chars = "";
    for (let i = 0; i < deep; i++) {
      chars += "@";
    }
    return RegExp(`^${chars}[^@].*$`, "gm");
  }

  private removeProfix(str: string, deep: number) {
    let chars = "";
    for (let i = 0; i < deep; i++) {
      chars += "@";
    }
    return str.replace(chars, "");
  }
}
