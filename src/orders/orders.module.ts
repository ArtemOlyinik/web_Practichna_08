import { Module } from '@nestjs/common';
import { AutoPartsModule } from '../auto-parts/auto-parts.module.js';
import { SharedModule } from '../shared/shared.module.js';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';

@Module({
  imports: [AutoPartsModule, SharedModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
