export default interface ApiDocsNoteParserStruct {
  title: string;
  subtitle?: string;
  content?: string;
  children?: ApiDocsNoteParserStruct[];
}
