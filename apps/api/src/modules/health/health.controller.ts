import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthResponseDataDto } from '../../common/dto/health-response.dto';
import { ApiResponseEnvelope } from '../../common/interfaces/api-response.interface';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Get System Health Status' })
  @ApiResponse({
    status: 200,
    description: 'System is healthy and operational',
    type: HealthResponseDataDto,
  })
  getHealth(): ApiResponseEnvelope<HealthResponseDataDto> {
    const data = this.healthService.getHealthStatus();
    return {
      success: true,
      data,
      error: null,
      timestamp: data.timestamp,
    };
  }
}
