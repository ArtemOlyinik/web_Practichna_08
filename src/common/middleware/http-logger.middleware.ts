import { Injectable, Logger, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const startedAt = Date.now();
    const { method, originalUrl, ip } = req;

    res.on('finish', () => {
      const latency = Date.now() - startedAt;
      this.logger.log(
        `[HTTP] ${method} ${originalUrl} ${res.statusCode} +${latency}ms ip=${ip ?? 'unknown'}`,
      );
    });

    next();
  }
}
