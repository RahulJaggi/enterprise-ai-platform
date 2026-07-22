import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { SYSTEM_CONSTANTS } from '../constants/system.constants';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                },
              }
            : undefined,
        customProps: (req) => ({
          correlationId: req.headers[SYSTEM_CONSTANTS.HEADER_CORRELATION_ID],
        }),
      },
    }),
  ],
})
export class LoggerModule {}
