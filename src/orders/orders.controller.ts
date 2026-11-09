import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { RequestIdService } from '../shared/request-id.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly requestIdService: RequestIdService,
  ) {}

  @Get()
  findAll() {
    this.logger.log(`GET /orders requestId=${this.requestIdService.getId()}`);
    return this.ordersService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOrderDto: CreateOrderDto) {
    this.logger.log(
      `POST /orders requestId=${this.requestIdService.getId()}`,
    );
    return this.ordersService.createOrder(createOrderDto);
  }
}
