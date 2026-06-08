import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get('REDIS_PASSWORD', '');
    const db = this.configService.get<number>('REDIS_DB', 0);

    try {
      this.client = new Redis({
        host,
        port,
        password: password || undefined,
        db,
        retryStrategy: (times) => {
          if (times > 5) {
            this.logger.error('Redis connection failed after 5 retries');
            return null;
          }
          return Math.min(times * 1000, 3000);
        },
      });

      this.client.on('connect', () => {
        this.logger.log('Redis connected successfully');
      });

      this.client.on('error', (err) => {
        this.logger.error(`Redis error: ${err.message}`);
      });
    } catch (error) {
      this.logger.warn(`Redis initialization failed: ${error.message}. Running in-memory fallback mode.`);
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.quit();
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.warn(`Redis get failed for key ${key}: ${error.message}`);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    if (!this.client) return false;
    try {
      if (ttl) {
        await this.client.set(key, value, 'EX', ttl);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      this.logger.warn(`Redis set failed for key ${key}: ${error.message}`);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      this.logger.warn(`Redis del failed for key ${key}: ${error.message}`);
      return false;
    }
  }

  async incr(key: string, amount: number = 1): Promise<number | null> {
    if (!this.client) return null;
    try {
      return await this.client.incrby(key, amount);
    } catch (error) {
      this.logger.warn(`Redis incr failed for key ${key}: ${error.message}`);
      return null;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      this.logger.warn(`Redis expire failed for key ${key}: ${error.message}`);
      return false;
    }
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    if (!this.client) return null;
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      this.logger.warn(`Redis hgetall failed for key ${key}: ${error.message}`);
      return null;
    }
  }

  async hset(key: string, field: string, value: string): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.hset(key, field, value);
      return true;
    } catch (error) {
      this.logger.warn(`Redis hset failed for key ${key}: ${error.message}`);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) return false;
    try {
      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      this.logger.warn(`Redis exists failed for key ${key}: ${error.message}`);
      return false;
    }
  }

  getClient(): Redis | null {
    return this.client;
  }
}
