declare interface ErrorMessage {
  message?: string;
  documentation_url?: string;

  [key: string]: unknown;
}

export default ErrorMessage;
