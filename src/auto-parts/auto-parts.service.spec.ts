import { NotFoundException } from '@nestjs/common';
import type { DataSource, Repository } from 'typeorm';
import { AutoPartsService } from './auto-parts.service.js';
import type { AutoPartEntity } from './entities/auto-part.entity.js';

describe('AutoPartsService', () => {
  const buildService = (
    autoPartsRepo: Partial<Repository<AutoPartEntity>>,
  ): AutoPartsService =>
    new AutoPartsService(
      autoPartsRepo as Repository<AutoPartEntity>,
      {} as never,
      {} as never,
      { manager: {} } as DataSource,
    );

  it('повертає сторінку даних і метадані пагінації', async () => {
    const data = [{ id: 'part-1' }] as AutoPartEntity[];
    const qb = {
      leftJoinAndSelect: vi.fn().mockReturnThis(),
      innerJoinAndSelect: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      distinct: vi.fn().mockReturnThis(),
      getManyAndCount: vi.fn().mockResolvedValue([data, 3]),
    };
    const service = buildService({
      createQueryBuilder: vi.fn().mockReturnValue(qb),
    });

    const result = await service.findAll({ page: 2, limit: 2 });

    expect(result).toEqual({ data, total: 3, page: 2, totalPages: 2 });
    expect(qb.skip).toHaveBeenCalledWith(2);
    expect(qb.take).toHaveBeenCalledWith(2);
  });

  it('фільтрує за характеристикою через innerJoinAndSelect', async () => {
    const qb = {
      leftJoinAndSelect: vi.fn().mockReturnThis(),
      innerJoinAndSelect: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      take: vi.fn().mockReturnThis(),
      distinct: vi.fn().mockReturnThis(),
      getManyAndCount: vi.fn().mockResolvedValue([[], 0]),
    };
    const service = buildService({
      createQueryBuilder: vi.fn().mockReturnValue(qb),
    });

    await service.findAll({ page: 1, limit: 10, specification: 'Підвіска' });

    expect(qb.innerJoinAndSelect).toHaveBeenCalledWith(
      'part.specifications',
      'specification',
      'specification.name ILIKE :specification',
      { specification: '%Підвіска%' },
    );
    expect(qb.distinct).toHaveBeenCalledWith(true);
  });

  it('кидає NotFoundException, якщо запчастину не знайдено', async () => {
    const service = buildService({
      findOne: vi.fn().mockResolvedValue(null),
    });

    await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
