import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { HealthResponseDto } from './health-response.dto';

@Injectable()
export class HealthService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Checks application and database health.
   */
  async getHealth(): Promise<HealthResponseDto> {
    let db: 'connected' | 'error' = 'connected';

    try {
      await this.databaseService.executeOne('SELECT 1');
    } catch {
      db = 'error';
    }

    return {
      status: 'ok',
      db,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
