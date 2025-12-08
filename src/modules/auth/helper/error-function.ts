import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorResponse: any;

    if (exception instanceof HttpException) {
      // extract custom error (like your createApiError)
      errorResponse = exception.getResponse();
    } else {
      // fallback if error is unexpected OR not HttpException
      errorResponse = {
        statusCode: status,
        message: 'Internal server error',
        error: 'UnexpectedError',
        path: request.url,
        timestamp: new Date().toISOString()
      };
    }

    response.status(status).json(errorResponse);
  }
}
