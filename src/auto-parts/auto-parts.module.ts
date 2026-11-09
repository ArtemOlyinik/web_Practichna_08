import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../shared/shared.module.js';
import { AutoPartsController } from './auto-parts.controller.js';
import { AutoPartsService } from './auto-parts.service.js';
import { CatalogController } from './catalog.controller.js';
import { CatalogService } from './catalog.service.js';
import { AutoPartEntity } from './entities/auto-part.entity.js';
import { CarModelEntity } from './entities/car-model.entity.js';
import { CompatibilityCodeEntity } from './entities/compatibility-code.entity.js';
import { SpecificationEntity } from './entities/specification.entity.js';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      AutoPartEntity,
      CarModelEntity,
      SpecificationEntity,
      CompatibilityCodeEntity,
    ]),
  ],
  controllers: [AutoPartsController, CatalogController],
  providers: [AutoPartsService, CatalogService],
  exports: [AutoPartsService],
})
export class AutoPartsModule {}
