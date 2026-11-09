import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  In,
  type EntityManager,
  type Repository,
} from 'typeorm';
import type { CreateAutoPartDto } from './dto/create-auto-part.dto.js';
import type { CreateAutoPartTransactionalDto } from './dto/create-auto-part-transactional.dto.js';
import type { PaginationQueryDto } from './dto/pagination-query.dto.js';
import type { UpdateAutoPartDto } from './dto/update-auto-part.dto.js';
import type { UpdateAutoPartTransactionalDto } from './dto/update-auto-part-transactional.dto.js';
import { AutoPartEntity } from './entities/auto-part.entity.js';
import { CarModelEntity } from './entities/car-model.entity.js';
import { CompatibilityCodeEntity } from './entities/compatibility-code.entity.js';
import { SpecificationEntity } from './entities/specification.entity.js';

export interface PaginatedAutoParts {
  data: AutoPartEntity[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable()
export class AutoPartsService {
  constructor(
    @InjectRepository(AutoPartEntity)
    private readonly autoPartsRepo: Repository<AutoPartEntity>,
    @InjectRepository(CarModelEntity)
    private readonly carModelsRepo: Repository<CarModelEntity>,
    @InjectRepository(SpecificationEntity)
    private readonly specificationsRepo: Repository<SpecificationEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedAutoParts> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();
    const specification = query.specification?.trim();

    const qb = this.autoPartsRepo
      .createQueryBuilder('part')
      .leftJoinAndSelect('part.carModel', 'carModel')
      .orderBy('part.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (specification) {
      qb.innerJoinAndSelect(
        'part.specifications',
        'specification',
        'specification.name ILIKE :specification',
        { specification: `%${specification}%` },
      ).distinct(true);
    } else {
      qb.leftJoinAndSelect('part.specifications', 'specification');
    }

    if (search) {
      qb.andWhere('part.title ILIKE :search', { search: `%${search}%` });
    }

    if (query.carModel) {
      qb.andWhere(
        '(carModel.brand ILIKE :carModel OR carModel.name ILIKE :carModel)',
        { carModel: `%${query.carModel}%` },
      );
    }

    if (query.minPrice !== undefined) {
      qb.andWhere('part.price >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice !== undefined) {
      qb.andWhere('part.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<AutoPartEntity> {
    const item = await this.autoPartsRepo.findOne({
      where: { id },
      relations: {
        carModel: true,
        specifications: true,
        compatibilityCode: true,
      },
    });
    if (!item) {
      throw new NotFoundException(`Сутність з ID ${id} не знайдена`);
    }
    return item;
  }

  /**
   * Вибірка повного агрегата: одночасно 1:M (carModel), M:N (specifications)
   * та 1:1 (compatibilityCode) через QueryBuilder.
   */
  async findAggregate(id: string): Promise<AutoPartEntity> {
    const item = await this.autoPartsRepo
      .createQueryBuilder('part')
      .leftJoinAndSelect('part.carModel', 'carModel')
      .leftJoinAndSelect('part.specifications', 'specification')
      .leftJoinAndSelect('part.compatibilityCode', 'compatibilityCode')
      .where('part.id = :id', { id })
      .getOne();

    if (!item) {
      throw new NotFoundException(`Сутність з ID ${id} не знайдена`);
    }
    return item;
  }

  async create(dto: CreateAutoPartDto): Promise<AutoPartEntity> {
    const carModel = await this.getCarModel(dto.carModelId);
    const specifications = await this.resolveSpecifications(
      dto.specificationNames,
    );

    const item = this.autoPartsRepo.create({
      title: dto.title,
      price: dto.price,
      oemCode: dto.oemCode,
      condition: dto.condition,
      carModel,
      specifications,
    });
    const saved = await this.autoPartsRepo.save(item);
    return this.findOne(saved.id);
  }

  async update(
    id: string,
    dto: UpdateAutoPartDto,
  ): Promise<AutoPartEntity> {
    const item = await this.autoPartsRepo.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Сутність з ID ${id} не знайдена`);
    }

    const { carModelId, specificationNames, ...fields } = dto;
    Object.assign(item, fields);

    if (carModelId) {
      item.carModel = await this.getCarModel(carModelId);
    }

    if (specificationNames) {
      item.specifications = await this.resolveSpecifications(
        specificationNames,
      );
    }

    await this.autoPartsRepo.save(item);
    return this.findOne(id);
  }

  /**
   * Атомарне створення запчастини разом із 1:1-кодом сумісності та
   * списком M:N-характеристик в одній транзакції.
   */
  async createTransactional(
    dto: CreateAutoPartTransactionalDto,
  ): Promise<AutoPartEntity> {
    return this.dataSource.transaction(async (manager) => {
      const carModel = await manager.findOneBy(CarModelEntity, {
        id: dto.carModelId,
      });
      if (!carModel) {
        throw new NotFoundException(
          `Модель авто з ID ${dto.carModelId} не знайдена`,
        );
      }

      if (dto.price < 100) {
        throw new BadRequestException(
          'Ціна автозапчастини не може бути меншою за 100 грн. Транзакцію відкочено.',
        );
      }

      const part = manager.create(AutoPartEntity, {
        title: dto.title,
        price: dto.price,
        oemCode: dto.oemCode,
        condition: dto.condition,
        carModel,
      });
      const savedPart = await manager.save(part);

      if (dto.compatibilityCode) {
        const code = manager.create(CompatibilityCodeEntity, {
          code: dto.compatibilityCode.code,
          manufacturer: dto.compatibilityCode.manufacturer,
          isInterchangeable:
            dto.compatibilityCode.isInterchangeable ?? false,
          notes: dto.compatibilityCode.notes ?? null,
          autoPart: savedPart,
        });
        savedPart.compatibilityCode = await manager.save(code);
      }

      savedPart.specifications = await this.resolveSpecifications(
        dto.specificationNames,
        manager,
      );
      await manager.save(savedPart);

      if (dto.simulateFailure) {
        throw new BadRequestException(
          'Штучний збій бізнес-логіки після збереження даних. Транзакцію відкочено.',
        );
      }

      return this.loadAggregate(manager, savedPart.id);
    });
  }

  /**
   * Повне оновлення агрегата в межах однієї транзакції.
   */
  async updateTransactional(
    id: string,
    dto: UpdateAutoPartTransactionalDto,
  ): Promise<AutoPartEntity> {
    return this.dataSource.transaction(async (manager) => {
      const part = await manager.findOne(AutoPartEntity, {
        where: { id },
        relations: {
          carModel: true,
          specifications: true,
          compatibilityCode: true,
        },
      });
      if (!part) {
        throw new NotFoundException(`Сутність з ID ${id} не знайдена`);
      }

      const {
        carModelId,
        specificationNames,
        compatibilityCode,
        simulateFailure,
        ...fields
      } = dto;
      Object.assign(part, fields);

      if (carModelId) {
        const carModel = await manager.findOneBy(CarModelEntity, {
          id: carModelId,
        });
        if (!carModel) {
          throw new NotFoundException(
            `Модель авто з ID ${carModelId} не знайдена`,
          );
        }
        part.carModel = carModel;
      }

      if (compatibilityCode) {
        if (part.compatibilityCode) {
          Object.assign(part.compatibilityCode, compatibilityCode);
        } else {
          part.compatibilityCode = manager.create(CompatibilityCodeEntity, {
            code: compatibilityCode.code,
            manufacturer: compatibilityCode.manufacturer,
            isInterchangeable: compatibilityCode.isInterchangeable ?? false,
            notes: compatibilityCode.notes ?? null,
            autoPart: part,
          });
        }
      }

      if (specificationNames) {
        part.specifications = await this.resolveSpecifications(
          specificationNames,
          manager,
        );
      }

      await manager.save(part);

      if (simulateFailure) {
        throw new BadRequestException(
          'Штучний збій бізнес-логіки після збереження даних. Транзакцію відкочено.',
        );
      }

      return this.loadAggregate(manager, part.id);
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.autoPartsRepo.softDelete(id);
  }

  async restore(id: string): Promise<AutoPartEntity> {
    const result = await this.autoPartsRepo.restore(id);
    if (!result.affected) {
      throw new NotFoundException(`Сутність з ID ${id} не знайдена`);
    }
    return this.findOne(id);
  }

  private async loadAggregate(
    manager: EntityManager,
    id: string,
  ): Promise<AutoPartEntity> {
    const item = await manager.findOne(AutoPartEntity, {
      where: { id },
      relations: {
        carModel: true,
        specifications: true,
        compatibilityCode: true,
      },
    });
    if (!item) {
      throw new NotFoundException(`Сутність з ID ${id} не знайдена`);
    }
    return item;
  }

  private async getCarModel(id: string): Promise<CarModelEntity> {
    const carModel = await this.carModelsRepo.findOneBy({ id });
    if (!carModel) {
      throw new NotFoundException(`Модель авто з ID ${id} не знайдена`);
    }
    return carModel;
  }

  /**
   * Знаходить наявні вузли/агрегати за назвою та створює відсутні.
   * Нові сутності зберігаються каскадно разом із запчастиною (cascade: true).
   */
  private async resolveSpecifications(
    names?: string[],
    manager: EntityManager = this.dataSource.manager,
  ): Promise<SpecificationEntity[]> {
    if (!names?.length) {
      return [];
    }

    const unique = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
    if (!unique.length) {
      return [];
    }

    const repo = manager.getRepository(SpecificationEntity);
    const existing = await repo.find({ where: { name: In(unique) } });
    const byName = new Map(existing.map((item) => [item.name, item]));

    return unique.map(
      (name) => byName.get(name) ?? repo.create({ name }),
    );
  }
}
