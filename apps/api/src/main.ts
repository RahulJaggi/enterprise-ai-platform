import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { SYSTEM_CONSTANTS } from './common/constants/system.constants';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use Pino Logger
  app.useLogger(app.get(Logger));

  // Increase body parser limits for large RAG document vector payloads (up to 50MB)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Security & Middleware
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Enable Graceful Shutdown Hooks
  app.enableShutdownHooks();

  // Global Prefix
  app.setGlobalPrefix(SYSTEM_CONSTANTS.API_PREFIX);

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger Documentation Setup
  const configService = app.get(ConfigService);
  const swaggerConfig = new DocumentBuilder()
    .setTitle(SYSTEM_CONSTANTS.APP_NAME)
    .setDescription('Production-Grade Enterprise AI Platform API Gateway')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(SYSTEM_CONSTANTS.SWAGGER_PATH, app, document);

  const port = configService.get<number>('PORT', SYSTEM_CONSTANTS.DEFAULT_PORT);
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`🚀 ${SYSTEM_CONSTANTS.APP_NAME} running on port ${port}`);
  logger.log(
    `📚 OpenAPI Specs available at http://localhost:${port}/${SYSTEM_CONSTANTS.SWAGGER_PATH}`,
  );
}

void bootstrap();
