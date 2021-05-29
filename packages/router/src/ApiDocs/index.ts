import ApiDocsInputParams from "./ApiDocsParam/ApiDocsInputParams";
import ApiDocsOutputParams from "./ApiDocsParam/ApiDocsOutputParams";

export default interface ApiDocs {
  input?: ApiDocsInputParams;
  output?: ApiDocsOutputParams;
  desc?: string;
  name?: string;
  parts?: string[] | "@auth";
}
