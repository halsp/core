import ApiDocsConfigPart from "./ApiDocsConfigPart";

export default interface ApiDocsConfig {
  output: string;
  parts?: ApiDocsConfigPart[];
  partsFromAuth?: boolean;
  title?: string;
  subtitle?: string;
}
