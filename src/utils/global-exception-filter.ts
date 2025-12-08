import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception.getStatus();

    const errorResponse = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      message:
        (errorResponse as any).message || exception.message || 'Error occurred',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
