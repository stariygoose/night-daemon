import winston, { createLogger, format } from "winston";

export interface ILogger {
  info(message: string): void;
  debug(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export class Logger implements ILogger {
  private readonly _logger: winston.Logger;

  constructor() {
    this._logger = this.setupLogger();
  }

  public warn(message: string): void {
    this._logger.warn(message);
  }

  public error(message: string): void {
    this._logger.error(message);
  }

  public debug(message: string): void {
    this._logger.debug(message);
  }

  public info(message: string): void {
    this._logger.info(message);
  }

  private getLoggerLevel(): string {
    return process.env.LOG_LEVEL || "info";
  }

  private logFormat = format.printf(({ level, message, timestamp }) => {
    return `|${timestamp}| [${level}]: ${message}`;
  });

  private setupLogger(): winston.Logger {
    return createLogger({
      level: this.getLoggerLevel(),
      format: format.combine(
        format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
        this.logFormat
      ),
      transports: [
        new winston.transports.Console({
          format: format.combine(
            format.colorize(),
            format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
            this.logFormat
          ),
        }),
          new winston.transports.File({
        filename: "logs/app.log",
        format: format.combine(
          format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
          this.logFormat
        )
      }),
      ],
    });
  }
}
