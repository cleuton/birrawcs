import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'nome-do-servico' },
  transports: [
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      options: { flags: 'w' } // sobrescreve o arquivo a cada execução
    }),
    new transports.File({
      filename: 'logs/combined.log',
      options: { flags: 'w' }
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

export default logger;
