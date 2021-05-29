import ApiDocsIOParams from "./ApiDocsIOParams";
import ApiDocsStateCode from "./ApiDocsStateCode";

export default interface ApiDocsOutputParams extends ApiDocsIOParams {
  codes?: ApiDocsStateCode[];
}
