// Error envelope returned by the PayForm API for non-2xx responses.
// Known codes: 30000 (DB constraint), 30001 (Field Validation), 30002 (JWT/auth).
export interface FieldError {
  message: string;
  path: string[];
  type: string;
}

export interface ApiErrorBody {
  error: {
    code: number;
    message: string;
    fields?: FieldError[];
  };
}
