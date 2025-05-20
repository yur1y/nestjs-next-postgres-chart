/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Controller, Get, Post, Query, Logger } from '@nestjs/common';
import { EmissionsService } from './emissions.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('emissions')
@Controller('emissions')
export class EmissionsController {
  private readonly logger = new Logger(EmissionsController.name);

  constructor(private readonly emissionsService: EmissionsService) {}

  @Get('deviations')
  @ApiOperation({ summary: 'Get quarterly deviations' })
  @ApiResponse({
    status: 200,
    description: 'Returns quarterly deviations for all vessels',
  })
  getDeviations(@Query('year') year: string) {
    return this.emissionsService.getQuarterlyDeviations(parseInt(year));
  }

  @Post('import')
  @ApiOperation({ summary: 'Import vessel data' })
  @ApiResponse({ status: 201, description: 'Data imported successfully' })
  @ApiResponse({ status: 500, description: 'Import failed' })
  async importData() {
    this.logger.log('Starting data import...');
    return await this.emissionsService.importData();
  }

  @Get('deviations-dummy')
  @ApiOperation({ summary: 'Get quarterly deviations dummy' })
  @ApiResponse({
    status: 200,
    description: 'Returns dummy quarterly deviations for all vessels',
  })
  getDeviationsDummy(@Query('year') year: string) {
    return this.emissionsService.getQuarterlyDeviationsDummy(parseInt(year));
  }
}
