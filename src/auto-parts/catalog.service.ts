import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { CreateCarModelDto } from './dto/create-car-model.dto.js';
import type { CreateSpecificationDto } from './dto/create-specification.dto.js';
import { CarModelEntity } from './entities/car-model.entity.js';
import { SpecificationEntity } from './entities/specification.entity.js';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(CarModelEntity)
    private readonly carModelsRepo: Repository<CarModelEntity>,
    @InjectRepository(SpecificationEntity)
    private readonly specificationsRepo: Repository<SpecificationEntity>,
  ) {}

  findAllCarModels(): Promise<CarModelEntity[]> {
    return this.carModelsRepo.find({
      order: { brand: 'ASC', name: 'ASC' },
    });
  }

  createCarModel(dto: CreateCarModelDto): Promise<CarModelEntity> {
    const carModel = this.carModelsRepo.create({
      name: dto.name,
      brand: dto.brand,
      yearFrom: dto.yearFrom,
      yearTo: dto.yearTo ?? null,
    });
    return this.carModelsRepo.save(carModel);
  }

  findAllSpecifications(): Promise<SpecificationEntity[]> {
    return this.specificationsRepo.find({ order: { name: 'ASC' } });
  }

  createSpecification(dto: CreateSpecificationDto): Promise<SpecificationEntity> {
    const specification = this.specificationsRepo.create({
      name: dto.name,
      description: dto.description ?? null,
    });
    return this.specificationsRepo.save(specification);
  }

  async removeCarModel(id: string): Promise<void> {
    const result = await this.carModelsRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Модель авто з ID ${id} не знайдена`);
    }
  }
}
