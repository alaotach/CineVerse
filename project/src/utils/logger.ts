type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private readonly logEnabled: boolean;
  private readonly logLevel: number;
  private readonly logLevelMap: Record<LogLevel, number>;

  constructor() {
    // Enable logs based on environment variable, defaults to true in development
    this.logEnabled = import.meta.env.VITE_ENABLE_LOGS !== 'false' && import.meta.env.MODE !== 'production';
    
    // Set up log levels
    this.logLevelMap = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    // Get configured log level from environment, defaults to 'debug' in development, 'warn' in production
    const configuredLevel = (import.meta.env.VITE_LOG_LEVEL || (import.meta.env.MODE === 'production' ? 'warn' : 'debug')) as LogLevel;
    this.logLevel = this.logLevelMap[configuredLevel] || 0;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logEnabled && this.logLevelMap[level] >= this.logLevel;
  }

  private formatLog(level: LogLevel, message: string, ...data: any[]): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    // Different styling based on log level
    if (level === 'error') {
      console.error(`${prefix} ${message}`, ...data);
    } else if (level === 'warn') {
      console.warn(`${prefix} ${message}`, ...data);
    } else if (level === 'info') {
      console.info(`${prefix} ${message}`, ...data);
    } else {
      console.log(`${prefix} ${message}`, ...data);
    }
  }

  debug(message: string, ...data: any[]): void {
    if (this.shouldLog('debug')) {
      this.formatLog('debug', message, ...data);
    }
  }

  info(message: string, ...data: any[]): void {
    if (this.shouldLog('info')) {
      this.formatLog('info', message, ...data);
    }
  }

  warn(message: string, ...data: any[]): void {
    if (this.shouldLog('warn')) {
      this.formatLog('warn', message, ...data);
    }
  }

  error(message: string, ...data: any[]): void {
    if (this.shouldLog('error')) {
      this.formatLog('error', message, ...data);
    }
  }
}

export const logger = new Logger();
