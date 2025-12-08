import { HttpException } from '@nestjs/common';

export class AppError extends HttpException {
  constructor(
    status: number,
    message: string,
    error: string,
    path: string
  ) {
    super(
      {
        statusCode: status,
        message,
        error,
        path,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}
