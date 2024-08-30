export interface Params {
  size: number | null;
  page: number | null;
  filter: any;
}

export interface IErrors {
  statusCode: number;
  message: string;
}
