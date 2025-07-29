export interface ErrorDetail {
  type: string;
  loc: string[];
  msg: string;
  input: any;
}

export interface ErrorResponse {
  detail: ErrorDetail[];
}
