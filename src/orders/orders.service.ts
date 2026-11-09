import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  type OnModuleInit,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AutoPartsService } from '../auto-parts/auto-parts.service.js';
import {
  STORE_CONFIG,
  type StoreConfig,
} from '../shared/config/app-config.provider.js';
import {
  FEE_CALCULATOR,
  type FeeCalculator,
} from '../shared/config/fee-calculator.provider.js';
import { RequestIdService } from '../shared/request-id.service.js';
import type { CreateOrderDto } from './dto/create-order.dto.js';
import type { Order } from './order.entity.js';

const ordersStore: Order[] = [];
let initialized = false;

@Injectable()
export class OrdersService implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly autoPartsService: AutoPartsService,
    @Inject(FEE_CALCULATOR) private readonly feeCalculator: FeeCalculator,
    @Inject(STORE_CONFIG) private readonly config: StoreConfig,
    private readonly requestIdService: RequestIdService,
  ) {}

  onModuleInit(): void {
    if (!initialized) {
      initialized = true;
      this.logger.log(
        `Сервіс замовлень готовий до прийому замовлень. Магазин: ${this.config.storeName}`,
      );
    }
  }

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    if (!Number.isInteger(dto.quantity) || dto.quantity <= 0) {
      throw new BadRequestException(
        'Кількість має бути додатним цілим числом',
      );
    }

    const product = await this.autoPartsService.findOne(dto.productId);
    const totalAmount = Math.round(product.price * dto.quantity * 100) / 100;
    const taxAmount = this.feeCalculator.calculateTax(totalAmount);

    const order: Order = {
      id: randomUUID(),
      productId: product.id,
      productTitle: product.title,
      quantity: dto.quantity,
      unitPrice: product.price,
      totalAmount,
      taxAmount,
      totalWithTax: Math.round((totalAmount + taxAmount) * 100) / 100,
      createdAt: new Date(),
    };

    ordersStore.push(order);

    this.logger.log(
      `Створено замовлення ${order.id} на ${order.totalWithTax} ${this.config.defaultCurrency}, requestId=${this.requestIdService.getId()}`,
    );

    return order;
  }

  findAll(): Order[] {
    return [...ordersStore];
  }

  getRequestId(): string {
    return this.requestIdService.getId();
  }
}
