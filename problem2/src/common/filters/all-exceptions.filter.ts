import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { match, P } from 'ts-pattern';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    const { status, error } = match(exception)
      .with(P.instanceOf(HttpException), (e) => {
        const body = e.getResponse();
        const error =
          typeof body === 'object' && body !== null && 'message' in body
            ? (body as { message: unknown }).message
            : body;
        return { status: e.getStatus(), error };
      })
      .with(P.instanceOf(Error), (e) => ({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: e.message as unknown,
      }))
      .otherwise(() => ({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal server error' as unknown,
      }));

    response.status(status).json({ statusCode: status, error });
  }
}
