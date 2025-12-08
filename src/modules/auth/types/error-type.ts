export interface ApiError {
  success: false;
  statusCode: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
}
