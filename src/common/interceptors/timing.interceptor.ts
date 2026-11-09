import {
  Injectable,
  Logger,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { type Observable, tap } from 'rxjs';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TimingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now();
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - startedAt;
        response.setHeader('X-Response-Time', `${elapsed}ms`);
        this.logger.log(
          `[TIMING] ${request.method} ${request.originalUrl} ${elapsed}ms`,
        );
      }),
    );
  }
}
