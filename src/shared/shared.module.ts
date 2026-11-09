import { Module } from '@nestjs/common';
import { SlugService } from './slug.service.js';
import { RequestIdService } from './request-id.service.js';
import { STORE_CONFIG, storeConfig } from './config/app-config.provider.js';
import {
  FEE_CALCULATOR,
  feeCalculatorProvider,
} from './config/fee-calculator.provider.js';

@Module({
  providers: [
    SlugService,
    RequestIdService,
    {
      provide: STORE_CONFIG,
      useValue: storeConfig,
    },
    feeCalculatorProvider,
  ],
  exports: [SlugService, RequestIdService, STORE_CONFIG, FEE_CALCULATOR],
})
export class SharedModule {}
