export default interface ApiDocsParam {
  name?: string;
  type?: string;
  desc?: string;
  children?: ApiDocsParam[];
}
