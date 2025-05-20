import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Get hello message',
    description: 'Returns a welcome message from the application',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the hello message',
    type: String,
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
