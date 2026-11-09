import { Injectable, Scope } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

@Injectable({ scope: Scope.REQUEST })
export class RequestIdService {
  private readonly id = randomUUID();

  getId(): string {
    return this.id;
  }
}
