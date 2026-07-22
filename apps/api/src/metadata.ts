 
export default async () => {
  const t = {
    ['./common/dto/api-response.dto']: await import('./common/dto/api-response.dto'),
  };
  return {
    '@nestjs/swagger': {
      models: [
        [
          import('./common/dto/health-response.dto'),
          {
            HealthResponseDataDto: {
              status: { required: true, type: () => String },
              version: { required: true, type: () => String },
              environment: { required: true, type: () => String },
              timestamp: { required: true, type: () => String },
            },
          },
        ],
        [
          import('./common/dto/api-response.dto'),
          {
            ApiErrorDetailDto: {
              code: { required: true, type: () => String },
              message: { required: true, type: () => String },
              traceId: { required: false, type: () => String },
            },
            ApiResponseEnvelopeDto: {
              success: { required: true, type: () => Boolean },
              data: { required: true, nullable: true },
              error: {
                required: true,
                type: () => t['./common/dto/api-response.dto'].ApiErrorDetailDto,
                nullable: true,
              },
              timestamp: { required: true, type: () => String },
            },
          },
        ],
      ],
      controllers: [
        [import('./modules/health/health.controller'), { HealthController: { getHealth: {} } }],
      ],
    },
  };
};
