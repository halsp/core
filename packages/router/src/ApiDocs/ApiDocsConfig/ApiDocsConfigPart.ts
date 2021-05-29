import ApiDocsParam from "../ApiDocsParam";
import ApiDocsStateCode from "../ApiDocsParam/ApiDocsStateCode";

export default interface ApiDocsConfigPart {
  name?: string;
  inputHeaders?: ApiDocsParam[];
  outputHeaders?: ApiDocsParam[];
  params?: ApiDocsParam[];
  query?: ApiDocsParam[];
  codes?: ApiDocsStateCode[];
}
