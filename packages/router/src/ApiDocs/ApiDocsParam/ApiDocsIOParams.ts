import ApiDocsParam from ".";

export default interface ApiDocsIOParams {
  headers?: ApiDocsParam[];
  body?: ApiDocsParam | ApiDocsParam[];
  desc?: string;
}
