import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RequestIdService } from '../shared/request-id.service.js';
import { AutoPartsService } from './auto-parts.service.js';
import { CreateAutoPartDto } from './dto/create-auto-part.dto.js';
import { CreateAutoPartTransactionalDto } from './dto/create-auto-part-transactional.dto.js';
import { PaginationQueryDto } from './dto/pagination-query.dto.js';
import { UpdateAutoPartDto } from './dto/update-auto-part.dto.js';
import { UpdateAutoPartTransactionalDto } from './dto/update-auto-part-transactional.dto.js';

@Controller('auto-parts')
export class AutoPartsController {
  private readonly logger = new Logger(AutoPartsController.name);

  constructor(
    private readonly autoPartsService: AutoPartsService,
    private readonly requestIdService: RequestIdService,
  ) {}

  private logRequest(method: string): void {
    this.logger.log(`${method} requestId=${this.requestIdService.getId()}`);
  }

  @Get()
  @Header('X-API-Version', '1.0')
  @Header('X-Service-Status', 'operational')
  findAll(@Query() query: PaginationQueryDto) {
    this.logRequest('GET /auto-parts');
    return this.autoPartsService.findAll(query);
  }

  @Post('transactional')
  @HttpCode(HttpStatus.CREATED)
  createTransactional(@Body() dto: CreateAutoPartTransactionalDto) {
    this.logRequest('POST /auto-parts/transactional');
    return this.autoPartsService.createTransactional(dto);
  }

  @Get(':id/aggregate')
  findAggregate(@Param('id') id: string) {
    return this.autoPartsService.findAggregate(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.autoPartsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAutoPartDto: CreateAutoPartDto) {
    this.logRequest('POST /auto-parts');
    return this.autoPartsService.create(createAutoPartDto);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.autoPartsService.restore(id);
  }

  @Put(':id/transactional')
  updateTransactional(
    @Param('id') id: string,
    @Body() dto: UpdateAutoPartTransactionalDto,
  ) {
    this.logRequest('PUT /auto-parts/:id/transactional');
    return this.autoPartsService.updateTransactional(id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAutoPartDto: UpdateAutoPartDto,
  ) {
    return this.autoPartsService.update(id, updateAutoPartDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.autoPartsService.remove(id);
  }
}
