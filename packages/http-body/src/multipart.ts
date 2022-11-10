import formidable from "formidable";

export type MultipartBody =
  | { fields: formidable.Fields; files: formidable.Files }
  | undefined;
