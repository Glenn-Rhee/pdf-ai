export interface ResponsePayload<T = unknown> {
  status: "success" | "failed";
  message: string;
  code: number;
  data: T;
}
