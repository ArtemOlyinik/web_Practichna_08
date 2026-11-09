import {
  MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AutoPartsModule } from './auto-parts/auto-parts.module.js';
import { HttpLoggingMiddleware } from './common/middleware/http-logger.middleware.js';
import { OrdersModule } from './orders/orders.module.js';
import { SharedModule } from './shared/shared.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'auto_parts',
      autoLoadEntities: true,
      synchronize: false,
      logging: ['error', 'warn'],
    }),
    AutoPartsModule,
    SharedModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLoggingMiddleware).forRoutes('{*splat}');
  }
}
