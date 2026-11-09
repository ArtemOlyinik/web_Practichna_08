import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CatalogService } from './catalog.service.js';
import { CreateCarModelDto } from './dto/create-car-model.dto.js';
import { CreateSpecificationDto } from './dto/create-specification.dto.js';

@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('car-models')
  findCarModels() {
    return this.catalogService.findAllCarModels();
  }

  @Delete('car-models/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCarModel(@Param('id') id: string): Promise<void> {
    await this.catalogService.removeCarModel(id);
  }

  @Post('car-models')
  @HttpCode(HttpStatus.CREATED)
  createCarModel(@Body() dto: CreateCarModelDto) {
    return this.catalogService.createCarModel(dto);
  }

  @Get('specifications')
  findSpecifications() {
    return this.catalogService.findAllSpecifications();
  }

  @Post('specifications')
  @HttpCode(HttpStatus.CREATED)
  createSpecification(@Body() dto: CreateSpecificationDto) {
    return this.catalogService.createSpecification(dto);
  }
}
