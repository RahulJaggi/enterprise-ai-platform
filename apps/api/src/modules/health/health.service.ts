import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthResponseDataDto } from '../../common/dto/health-response.dto';

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  getHealthStatus(): HealthResponseDataDto {
    return {
      status: 'ok',
      version: '0.1.0',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      timestamp: new Date().toISOString(),
    };
  }
}
