declare interface HttpErrorMessage {
  message?: string;
  documentation_url?: string;

  [key: string]: unknown;
}

export default HttpErrorMessage;
